import { mkdtempSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { buildItems, makeNumberer, splitBatch, verdictFlag } from '../../scripts/lib/import/build'
import type { RawItem } from '../../scripts/lib/import/normalize'
import { blindPrompt, solvePrompt } from '../../scripts/lib/import/prompts'
import { readLedger, saveLedger, writeBuilt } from '../../scripts/lib/import/store'

const raw = (over: Partial<RawItem> = {}): RawItem => ({
  stem: 'All visitors must ____ in at the desk.',
  choices: ['sign', 'signing', 'to sign', 'signs'],
  source: [{ file: 'UNIT_2.pdf', page: 4, no: 3 }],
  ...over
})
const solved = (over = {}) => ({
  index: 0,
  answer: 0,
  topic: 'modals' as const,
  difficulty: 2,
  trap: 'modal + base verb',
  explain_en: 'After the modal must, use the base verb sign.',
  explain_th: 'หลัง must ต้องใช้กริยารูปเดิม sign',
  problem: '',
  ...over
})

describe('makeNumberer', () => {
  it('continues after the highest used id per topic', () => {
    const next = makeNumberer(['p5x-modals-0003', 'p5x-modals-0001', 'p5x-word-form-0009', 'p5-modals-0050'])
    expect(next('modals')).toBe('p5x-modals-0004')
    expect(next('modals')).toBe('p5x-modals-0005')
    expect(next('word-form')).toBe('p5x-word-form-0010')
    expect(next('determiners')).toBe('p5x-determiners-0001')
  })
})

describe('verdictFlag', () => {
  it('approves only when the blind re-check agrees and is confident', () => {
    expect(verdictFlag(raw(), solved(), { index: 0, answer: 0, confident: true })).toBeNull()
    expect(verdictFlag(raw(), solved(), { index: 0, answer: 2, confident: true })).toBe(
      're-check chose "to sign", solver chose "sign"'
    )
    expect(verdictFlag(raw(), solved(), { index: 0, answer: 0, confident: false })).toBe('re-check not confident')
    expect(verdictFlag(raw(), solved(), undefined)).toBe('not re-checked')
    expect(verdictFlag(raw(), solved({ problem: 'two answers fit' }), { index: 0, answer: 0, confident: true })).toBe(
      'solver: two answers fit'
    )
  })
})

describe('verdictFlag explanation checks', () => {
  const agree = { index: 0, answer: 0, confident: true }
  it('flags an English explanation that never names the answer', () => {
    expect(verdictFlag(raw(), solved({ explain_en: 'A base verb follows the modal here.' }), agree)).toBe(
      'explanation does not mention the answer'
    )
  })
  it('matches the answer case-insensitively', () => {
    expect(verdictFlag(raw(), solved({ explain_en: 'After must, SIGN is the base form.' }), agree)).toBeNull()
  })
  it('flags positional wording in either explanation or the trap', () => {
    const why = 'explanation refers to a choice by position'
    expect(verdictFlag(raw(), solved({ explain_en: 'Option A (sign) is the base verb after must.' }), agree)).toBe(why)
    expect(verdictFlag(raw(), solved({ explain_th: 'ตัวเลือก A คือ sign' }), agree)).toBe(why)
    expect(verdictFlag(raw(), solved({ trap: 'the first choice is a trap' }), agree)).toBe(why)
  })
})

describe('splitBatch', () => {
  const b = (n: number) => Array.from({ length: n }, (_, i) => raw({ stem: `Stem ${i} ____.` }))
  it('halves the batch and remaps todo positions', () => {
    const [x, y] = splitBatch({ batch: b(5), todo: [0, 3, 4] })
    expect(x.batch.map((r) => r.stem)).toEqual(['Stem 0 ____.', 'Stem 1 ____.', 'Stem 2 ____.'])
    expect(x.todo).toEqual([0])
    expect(y.batch).toHaveLength(2)
    expect(y.todo).toEqual([0, 1])
  })
  it('drops a half with nothing left to do', () => {
    expect(splitBatch({ batch: b(4), todo: [3] }).map((h) => h.todo)).toEqual([[1]])
  })
})

describe('buildItems', () => {
  it('approves agreed items and flags the rest as drafts', () => {
    const batch = [raw(), raw({ stem: 'Staff should ____ early.', choices: ['leave', 'leaving', 'left', 'leaves'] })]
    const out = buildItems(
      batch,
      [solved(), solved({ index: 1 })],
      [
        { index: 0, answer: 0, confident: true },
        { index: 1, answer: 1, confident: true }
      ],
      makeNumberer([])
    )
    expect(out.errors).toEqual([])
    expect(out.approved.map((i) => [i.id, i.status, i.source])).toEqual([
      ['p5x-modals-0001', 'approved', [{ file: 'UNIT_2.pdf', page: 4, no: 3 }]]
    ])
    expect(out.flagged.map((i) => [i.id, i.status, i.flag])).toEqual([
      ['p5x-modals-0002', 'draft', 're-check chose "leaving", solver chose "leave"']
    ])
  })

  it('clamps difficulty and reports items the schema rejects', () => {
    const out = buildItems(
      [raw(), raw()],
      [solved({ difficulty: 9 }), solved({ index: 1, answer: 7 })],
      [
        { index: 0, answer: 0, confident: true },
        { index: 1, answer: 7, confident: true }
      ],
      makeNumberer([])
    )
    expect(out.approved[0].difficulty).toBe(5)
    expect(out.errors).toHaveLength(1)
  })
})

describe('prompts', () => {
  it('sends items without answers to the blind check', () => {
    const p = blindPrompt([{ index: 0, stem: 'We ____ it.', choices: ['a', 'b', 'c', 'd'] }])
    expect(p.user).toContain('We ____ it.')
    expect(p.user).not.toContain('answer')
  })
  it('lists every Part 5 topic for the solver', () => {
    expect(solvePrompt([]).system).toMatch(/noun-clauses/)
    expect(solvePrompt([]).system).toMatch(/word-choice/)
  })
})

describe('store', () => {
  it('appends approved items per topic, flagged items to one draft file, and keeps a ledger', () => {
    const out = mkdtempSync(join(tmpdir(), 'toeic-store-'))
    const built = buildItems(
      [raw(), raw({ stem: 'Staff should ____ early.' })],
      [solved(), solved({ index: 1 })],
      [
        { index: 0, answer: 0, confident: true },
        { index: 1, answer: 0, confident: false }
      ],
      makeNumberer([])
    )
    writeBuilt(out, built, 'import-x.json')
    writeBuilt(out, { approved: [{ ...built.approved[0], id: 'p5x-modals-0003' }], flagged: [], errors: [] }, 'import-x.json')
    const approved = JSON.parse(readFileSync(join(out, 'grammar/part5/modals.json'), 'utf8'))
    expect(approved.map((i: { id: string }) => i.id)).toEqual(['p5x-modals-0001', 'p5x-modals-0003'])
    expect(JSON.parse(readFileSync(join(out, 'drafts/import-x.json'), 'utf8'))).toHaveLength(1)

    const ledgerFile = join(out, 'ledger.json')
    expect(readLedger(ledgerFile)).toEqual({})
    saveLedger(ledgerFile, { k: 'p5x-modals-0001' })
    expect(readLedger(ledgerFile)).toEqual({ k: 'p5x-modals-0001' })
  })
})
