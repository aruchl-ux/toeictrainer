import { describe, expect, it } from 'vitest'
import type { ContentBank } from '@shared/types'
import {
  blankId,
  entryFields,
  entryId,
  entryPart,
  flattenPart7,
  flattenSet,
  pickMixedTest,
  pickTopicDrill,
  resolveIds,
  shuffle,
  shuffleChoices
} from '@shared/quiz'
import { makePart5, makePart6, makePart7 } from '../fixtures/items'

const rng = () => {
  let i = 0
  return () => (i++ * 0.37) % 1
}

describe('shuffle', () => {
  it('keeps every element and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input, rng())
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('pickTopicDrill', () => {
  it('returns at most n Part 5 items of the topic', () => {
    const bank: ContentBank = {
      part5: [
        ...Array.from({ length: 12 }, () => makePart5()),
        makePart5({ id: 'p5-prepositions-0001', topic: 'prepositions' })
      ],
      part6: [],
      part7: []
    }
    const entries = pickTopicDrill(bank, 'word-form', 10, rng())
    expect(entries).toHaveLength(10)
    expect(entries.every((e) => e.kind === 'p5' && e.item.topic === 'word-form')).toBe(true)
  })
})

describe('Part 6 entries', () => {
  it('flattens a set into four blank entries with stable ids', () => {
    const set = makePart6({ id: 'p6-0001' })
    const entries = flattenSet(set)
    expect(entries.map(entryId)).toEqual(['p6-0001#1', 'p6-0001#2', 'p6-0001#3', 'p6-0001#4'])
    expect(blankId('p6-0001', 0)).toBe('p6-0001#1')
  })
  it('reads fields from the blank', () => {
    const set = makePart6()
    const fields = entryFields({ kind: 'p6', set, blank: 1 })
    expect(fields.topic).toBe('sentence-insertion')
    expect(fields.answer).toBe(2)
  })
})

describe('pickMixedTest', () => {
  it('puts Part 5 entries first, then all blanks of the chosen sets', () => {
    const bank: ContentBank = { part5: [makePart5(), makePart5(), makePart5()], part6: [makePart6()], part7: [] }
    const entries = pickMixedTest(bank, rng())
    expect(entries).toHaveLength(7)
    expect(entries.slice(0, 3).every((e) => e.kind === 'p5')).toBe(true)
    expect(entries.slice(3).every((e) => e.kind === 'p6')).toBe(true)
  })
})

describe('resolveIds', () => {
  it('maps Part 5 ids and Part 6 blank ids, skipping unknown ids', () => {
    const p5 = makePart5({ id: 'p5-word-form-0099' })
    const set = makePart6({ id: 'p6-0042' })
    const bank: ContentBank = { part5: [p5], part6: [set], part7: [] }
    const entries = resolveIds(bank, ['p6-0042#3', 'missing', 'p5-word-form-0099'])
    expect(entries.map(entryId)).toEqual(['p6-0042#3', 'p5-word-form-0099'])
  })
})

describe('shuffleChoices', () => {
  it('reorders choices and moves the answer index with the correct choice', () => {
    const item = makePart5({ choices: ['a', 'b', 'c', 'd'], answer: 1 })
    const seen = new Set<string>()
    for (let seed = 0; seed < 20; seed++) {
      let i = seed
      const r = () => ((i++ * 0.61803) % 1)
      const [entry] = shuffleChoices([{ kind: 'p5', item }], r)
      const f = entryFields(entry)
      expect([...f.choices].sort()).toEqual(['a', 'b', 'c', 'd'])
      expect(f.choices[f.answer]).toBe('b')
      seen.add(f.choices.join(''))
    }
    expect(seen.size).toBeGreaterThan(1)
    expect(item.choices).toEqual(['a', 'b', 'c', 'd'])
  })

  it('keeps entry ids so progress and review scheduling are unaffected', () => {
    const set = makePart6({ id: 'p6-0007' })
    const entries = shuffleChoices(flattenSet(set), rng())
    expect(entries.map(entryId)).toEqual(['p6-0007#1', 'p6-0007#2', 'p6-0007#3', 'p6-0007#4'])
    for (const e of entries) {
      const src = set.blanks[(e as { blank: number }).blank]
      const f = entryFields(e)
      expect(f.choices[f.answer]).toBe(src.choices[src.answer])
    }
  })
})

describe('pickers shuffle choices', () => {
  it('topic drill and mixed test entries carry a choice order', () => {
    const bank: ContentBank = { part5: [makePart5(), makePart5()], part6: [makePart6()], part7: [] }
    for (const e of [...pickTopicDrill(bank, 'word-form', 10, rng()), ...pickMixedTest(bank, rng())]) {
      expect(e.order).toBeDefined()
      const f = entryFields(e)
      expect(f.choices[f.answer]).toBeDefined()
    }
  })
})

describe('Part 7 entries', () => {
  it('flattens a set into one entry per question with q-ids', () => {
    const set = makePart7({ id: 'p7-0042' })
    const entries = flattenPart7(set)
    expect(entries.map(entryId)).toEqual(['p7-0042#q1', 'p7-0042#q2'])
    expect(entries.every((e) => entryPart(e) === 'p7')).toBe(true)
  })

  it('reads fields from the question, using its type as the topic', () => {
    const set = makePart7()
    const f = entryFields({ kind: 'p7', set, q: 1 })
    expect(f.topic).toBe('inference')
    expect(f.trap).toBe('')
    expect(f.choices[f.answer]).toBe('Cleaning')
  })

  it('resolves p7 ids and shuffles their choices safely', () => {
    const set = makePart7({ id: 'p7-0007' })
    const bank: ContentBank = { part5: [], part6: [], part7: [set] }
    const [entry] = shuffleChoices(resolveIds(bank, ['p7-0007#q2', 'p7-0007#q9']), rng())
    expect(entryId(entry)).toBe('p7-0007#q2')
    const f = entryFields(entry)
    expect(f.choices[f.answer]).toBe('Cleaning')
  })

  it('keeps insertion-question choices in marker order', () => {
    const set = makePart7({ id: 'p7-0050' })
    set.questions[1] = { ...set.questions[1], type: 'insertion', choices: ['[1]', '[2]', '[3]', '[4]'], answer: 2 }
    for (let seed = 0; seed < 10; seed++) {
      let i = seed
      const r = () => ((i++ * 0.61803) % 1)
      const [, ins] = shuffleChoices(flattenPart7(set), r)
      expect(entryFields(ins).choices).toEqual(['[1]', '[2]', '[3]', '[4]'])
      expect(entryFields(ins).answer).toBe(2)
    }
  })
})
