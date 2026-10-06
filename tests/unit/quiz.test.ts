import { describe, expect, it } from 'vitest'
import type { ContentBank } from '@shared/types'
import {
  blankId,
  entryFields,
  entryId,
  flattenSet,
  pickMixedTest,
  pickTopicDrill,
  resolveIds,
  shuffle
} from '@shared/quiz'
import { makePart5, makePart6 } from '../fixtures/items'

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
      part6: []
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
    const bank: ContentBank = { part5: [makePart5(), makePart5(), makePart5()], part6: [makePart6()] }
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
    const bank: ContentBank = { part5: [p5], part6: [set] }
    const entries = resolveIds(bank, ['p6-0042#3', 'missing', 'p5-word-form-0099'])
    expect(entries.map(entryId)).toEqual(['p6-0042#3', 'p5-word-form-0099'])
  })
})
