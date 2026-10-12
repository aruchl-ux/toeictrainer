import { describe, expect, it } from 'vitest'
import { CHEAT_SHEETS, exampleParts, formulaParts } from '../../src/shared/cheatsheet'
import { PART5_TOPICS } from '../../src/shared/types'

const sheets = PART5_TOPICS.map((tp) => CHEAT_SHEETS[tp])
const entries = sheets.flatMap((s) => s.entries)

describe('formulaParts', () => {
  it('splits on + and tags subject, verb, slot and literal words', () => {
    expect(formulaParts('S + have/has + V3 + Obj')).toEqual([
      { text: 'S', kind: 'subject' },
      { text: 'have/has', kind: 'word' },
      { text: 'V3', kind: 'verb' },
      { text: 'Obj', kind: 'slot' }
    ])
  })

  it('treats V variants and to-infinitives as verbs', () => {
    expect(formulaParts('V(s/es) + V-ing + to V1 + be V-ed').map((p) => p.kind)).toEqual(['verb', 'verb', 'verb', 'word'])
  })

  it('treats ", " and "; " as clause breaks', () => {
    expect(formulaParts('S + V; however, S + V')).toEqual([
      { text: 'S', kind: 'subject' },
      { text: 'V', kind: 'verb' },
      { text: ';', kind: 'punct' },
      { text: 'however', kind: 'word' },
      { text: ',', kind: 'punct' },
      { text: 'S', kind: 'subject' },
      { text: 'V', kind: 'verb' }
    ])
  })

  it('keeps optional parts in brackets as their slot kind', () => {
    expect(formulaParts('(Adv) + Adj + N')).toEqual([
      { text: '(Adv)', kind: 'slot' },
      { text: 'Adj', kind: 'slot' },
      { text: 'N', kind: 'slot' }
    ])
  })
})

describe('exampleParts', () => {
  it('marks the {{…}} part as a hit', () => {
    expect(exampleParts('She {{checks}} her email.')).toEqual([
      { text: 'She ', hit: false },
      { text: 'checks', hit: true },
      { text: ' her email.', hit: false }
    ])
  })
})

describe('CHEAT_SHEETS content', () => {
  it('has a sheet with entries for every Part 5 topic', () => {
    for (const tp of PART5_TOPICS) {
      expect(CHEAT_SHEETS[tp]?.topic, tp).toBe(tp)
      expect(CHEAT_SHEETS[tp].entries.length, tp).toBeGreaterThan(0)
    }
  })

  it('uses unique kebab-case ids', () => {
    const ids = entries.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('fills every Thai and English field', () => {
    for (const s of sheets) {
      expect(s.intro.en.trim(), s.topic).not.toBe('')
      expect(s.intro.th.trim(), s.topic).not.toBe('')
    }
    for (const e of entries) {
      for (const f of [e.name, e.use, e.example]) {
        expect(f.en.trim(), e.id).not.toBe('')
        expect(f.th.trim(), e.id).not.toBe('')
      }
    }
  })

  it('has 1–3 formula lines whose parts are known slots or lowercase literals', () => {
    for (const e of entries) {
      expect(e.formula.length, e.id).toBeGreaterThanOrEqual(1)
      expect(e.formula.length, e.id).toBeLessThanOrEqual(3)
      for (const line of e.formula) {
        for (const p of formulaParts(line)) {
          expect(p.text.trim(), `${e.id}: "${line}"`).not.toBe('')
          if (p.kind === 'word') expect(p.text, `${e.id}: "${line}"`).not.toMatch(/^[A-Z]/)
        }
      }
    }
  })

  it('marks exactly one highlighted part in each English example and none in Thai', () => {
    for (const e of entries) {
      expect(exampleParts(e.example.en).filter((p) => p.hit), e.id).toHaveLength(1)
      expect(e.example.th, e.id).not.toContain('{{')
    }
  })

  it('has no empty clue words', () => {
    for (const e of entries) for (const c of e.clues ?? []) expect(c.trim(), e.id).not.toBe('')
  })

  it('gives every listed word a meaning in both languages, once per entry', () => {
    for (const e of entries) {
      const ws = (e.words ?? []).map((w) => w.w)
      expect(new Set(ws).size, e.id).toBe(ws.length)
      for (const w of e.words ?? []) {
        expect(w.w.trim(), e.id).not.toBe('')
        expect(w.en.trim(), `${e.id}: ${w.w}`).not.toBe('')
        expect(w.th.trim(), `${e.id}: ${w.w}`).not.toBe('')
      }
    }
  })

  it('explains every linking word used in a conj-vs-prep formula', () => {
    for (const e of CHEAT_SHEETS['conj-vs-prep'].entries) {
      // A pair like "both … and" explains both of its halves.
      const listed = new Set((e.words ?? []).flatMap((w) => w.w.split(' … ')))
      const used = e.formula.flatMap((line) =>
        formulaParts(line)
          .filter((p) => p.kind === 'word')
          .flatMap((p) => p.text.split('/'))
      )
      for (const w of used) expect(listed.has(w), `${e.id}: "${w}" has no meaning`).toBe(true)
    }
  })
})
