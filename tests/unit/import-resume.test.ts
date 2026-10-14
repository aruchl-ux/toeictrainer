import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { buildSubset, makeNumberer, planBatches } from '../../scripts/lib/import/build'
import { isRunFatal } from '../../scripts/lib/import/errors'
import { dedupeKey, type RawItem } from '../../scripts/lib/import/normalize'
import { packIds, writeBuilt } from '../../scripts/lib/import/store'

const raw = (n: number): RawItem => ({
  stem: `Question number ${n} needs a ____ here.`,
  choices: ['a', 'b', 'c', 'd'],
  source: [{ file: 'U.pdf', page: 1, no: n }]
})
const solved = (index: number, over: { answer?: number; topic?: 'modals' | 'word-form' } = {}) => ({
  index,
  answer: over.answer ?? 0,
  topic: over.topic ?? ('modals' as const),
  difficulty: 2,
  trap: 't',
  explain_en: 'because',
  explain_th: 'เพราะ',
  point: { key: 'must + V1', th: 'หลัง must ใช้กริยารูปเดิม', en: 'base verb after must', wrong: [] },
  problem: ''
})
const blind = (index: number, answer = 0) => ({
  index,
  answer,
  confident: true
})

describe('planBatches', () => {
  const raws = [1, 2, 3, 4, 5].map(raw)
  it('keeps full batches and lists only unfinished positions (ledger hit on item 5 empties the last batch)', () => {
    const ledger = { [dedupeKey(raws[4])]: 'invalid: x' }
    const plan = planBatches(raws, 2, ledger)
    expect(plan.map((p) => [p.batch.length, p.todo])).toEqual([
      [2, [0, 1]],
      [2, [0, 1]]
    ])
  })
  it('drops fully finished batches', () => {
    const ledger = Object.fromEntries(raws.slice(0, 2).map((r) => [dedupeKey(r), 'p5x-modals-0001']))
    expect(planBatches(raws, 2, ledger)).toHaveLength(2)
  })
})

describe('buildSubset', () => {
  it('pairs each kept item with its own solver answer, topic and re-check', () => {
    const batch = [raw(1), raw(2), raw(3)]
    const sol = [
      solved(0, { answer: 0, topic: 'modals' }),
      solved(1, { answer: 1, topic: 'word-form' }),
      solved(2, { answer: 2, topic: 'modals' })
    ]
    const chk = [blind(0, 0), blind(1, 1), blind(2, 3)]
    const b = buildSubset(batch, sol, chk, [0, 2], makeNumberer([]))
    expect(b.approved.map((i) => [i.id, i.stem, i.answer])).toEqual([['p5x-modals-0001', batch[0].stem, 0]])
    expect(b.flagged.map((i) => [i.id, i.stem, i.answer, i.flag])).toEqual([
      ['p5x-modals-0002', batch[2].stem, 2, 're-check chose "d", solver chose "c"']
    ])
    const c = buildSubset(batch, sol, chk, [1, 2], makeNumberer([]))
    expect(c.approved.map((i) => [i.topic, i.stem, i.answer])).toEqual([['word-form', batch[1].stem, 1]])
    expect(c.flagged.map((i) => [i.topic, i.stem, i.answer])).toEqual([['modals', batch[2].stem, 2]])
  })
  it('ignores non-id ledger values when numbering', () => {
    const next = makeNumberer(['invalid: p5x-modals-0099 broken', 'p5x-modals-0002'])
    expect(next('modals')).toBe('p5x-modals-0003')
  })
})

describe('isRunFatal', () => {
  it('stops on credential, billing and permission errors only', () => {
    for (const status of [401, 402, 403]) expect(isRunFatal({ status })).toBe(true)
    expect(
      isRunFatal(new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set.'))
    ).toBe(true)
    expect(isRunFatal(new Error('Your credit balance is too low to access the Anthropic API.'))).toBe(true)
    for (const e of [{ status: 429 }, { status: 500 }, new Error('x'), null]) expect(isRunFatal(e)).toBe(false)
  })
})

describe('private pack on disk', () => {
  it('packIds reads topic files and drafts; missing folders are none', () => {
    const root = mkdtempSync(join(tmpdir(), 'pack-'))
    expect(packIds(root)).toEqual([])
    mkdirSync(join(root, 'grammar', 'part5'), { recursive: true })
    mkdirSync(join(root, 'drafts'))
    writeFileSync(join(root, 'grammar', 'part5', 'modals.json'), JSON.stringify([{ id: 'p5x-modals-0001' }]))
    writeFileSync(join(root, 'drafts', 'd.json'), JSON.stringify([{ id: 'p5x-word-form-0004' }]))
    expect(packIds(root).sort()).toEqual(['p5x-modals-0001', 'p5x-word-form-0004'])
  })
  it('writeBuilt throws on a corrupt target before writing anything', () => {
    const root = mkdtempSync(join(tmpdir(), 'pack-'))
    mkdirSync(join(root, 'grammar', 'part5'), { recursive: true })
    writeFileSync(join(root, 'grammar', 'part5', 'word-form.json'), '{not json')
    const next = makeNumberer([])
    const a = buildSubset([raw(1)], [solved(0)], [blind(0)], [0], next)
    const f = buildSubset([raw(2)], [{ ...solved(0), topic: 'word-form' as const }], [blind(0)], [0], next)
    const built = {
      approved: [...a.approved, ...f.approved],
      flagged: [],
      errors: []
    }
    expect(() => writeBuilt(root, built, 'd.json')).toThrow()
    expect(existsSync(join(root, 'grammar', 'part5', 'modals.json'))).toBe(false)
    expect(readFileSync(join(root, 'grammar', 'part5', 'word-form.json'), 'utf8')).toBe('{not json')
  })
})
