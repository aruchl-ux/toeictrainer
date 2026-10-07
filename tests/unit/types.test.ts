import { describe, expect, it } from 'vitest'
import { Part5Item, Part6Set, Progress, Settings, formatIssues } from '@shared/types'
import { makePart5, makePart6 } from '../fixtures/items'

describe('Part5Item', () => {
  it('accepts a valid item', () => {
    expect(Part5Item.safeParse(makePart5()).success).toBe(true)
  })
  it('rejects an item with three choices', () => {
    expect(Part5Item.safeParse(makePart5({ choices: ['a', 'b', 'c'] })).success).toBe(false)
  })
  it('rejects a stem without a blank', () => {
    expect(Part5Item.safeParse(makePart5({ stem: 'No blank here.' })).success).toBe(false)
  })
  it('rejects a Part 6 only topic', () => {
    expect(Part5Item.safeParse(makePart5({ topic: 'transitions' as never })).success).toBe(false)
  })
  it('rejects a malformed id', () => {
    expect(Part5Item.safeParse(makePart5({ id: 'q1' })).success).toBe(false)
  })
})

describe('Part6Set', () => {
  it('accepts a valid set', () => {
    expect(Part6Set.safeParse(makePart6()).success).toBe(true)
  })
  it('rejects a passage missing a blank marker', () => {
    const r = Part6Set.safeParse(makePart6({ passage: 'One {{1}} two {{2}} three {{3}}.' }))
    expect(r.success).toBe(false)
    if (!r.success) expect(formatIssues(r.error)).toContain('{{4}}')
  })
  it('requires exactly one sentence-insertion blank', () => {
    const set = makePart6()
    set.blanks[2] = { ...set.blanks[2], topic: 'sentence-insertion' }
    const r = Part6Set.safeParse(set)
    expect(r.success).toBe(false)
    if (!r.success) expect(formatIssues(r.error)).toContain('sentence-insertion')
  })
})

describe('Progress and Settings', () => {
  it('fills progress defaults', () => {
    expect(Progress.parse({ version: 1 })).toEqual({
      version: 1,
      grammarAttempts: [],
      leitner: {},
      mixedTests: [],
      readingAttempts: [],
      readingTests: [],
      activeReadingTest: null
    })
  })
  it('defaults language to Thai', () => {
    expect(Settings.parse({})).toEqual({ language: 'th' })
  })
})

describe('Progress activeReadingTest', () => {
  it('drops a malformed saved test without losing the rest of the progress', () => {
    const attempt = { itemId: 'p5-word-form-0001', topic: 'word-form', correct: true, ms: 1000, at: '2026-10-06T00:00:00.000Z' }
    const r = Progress.safeParse({ version: 1, grammarAttempts: [attempt], activeReadingTest: { length: 'half', ids: 'broken' } })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.activeReadingTest).toBeNull()
      expect(r.data.grammarAttempts).toHaveLength(1)
    }
  })
})

