import { describe, expect, it } from 'vitest'
import { BLUEPRINT, availableCounts, buildReadingTest, restoreReadingTest, DURATION_MS, initTest, scoreTest, testReducer, toActive } from '@shared/reading'
import { entryId, entryPart, entryFields } from '@shared/quiz'
import type { ContentBank } from '@shared/types'
import { makePart5, makePart6, makePart7 } from '../fixtures/items'

const doubleSet = () => {
  const s = makePart7({ format: 'double' })
  s.docs = [s.docs[0], { kind: 'email', title: 'Email: x', body: 'The office will reopen on Monday after cleaning.' }]
  const base = s.questions[0]
  s.questions = [base, base, base, base, { ...base, type: 'cross-reference', evidence: [{ doc: 0, quote: 'reopen on Monday' }, { doc: 1, quote: 'after cleaning' }] }]
  return s
}
const bigBank = (): ContentBank => ({
  part5: Array.from({ length: 40 }, () => makePart5()),
  part6: Array.from({ length: 6 }, () => makePart6()),
  part7: [...Array.from({ length: 12 }, () => makePart7()), doubleSet(), doubleSet(), doubleSet()]
})

describe('buildReadingTest', () => {
  it('follows the half blueprint and part order', () => {
    const entries = buildReadingTest(bigBank(), 'half', () => 0.3)
    const parts = entries.map(entryPart)
    expect(parts.filter((p) => p === 'p5')).toHaveLength(BLUEPRINT.half.p5)
    expect(parts.filter((p) => p === 'p6')).toHaveLength(BLUEPRINT.half.p6 * 4)
    expect(parts.join(',')).toMatch(/^(p5,)+(p6,)+(p7,?)+$/)
    expect(entries.every((e) => e.order !== undefined)).toBe(true)
  })

  it('uses what exists when the bank is short', () => {
    const bank: ContentBank = { part5: [makePart5()], part6: [], part7: [] }
    expect(buildReadingTest(bank, 'full')).toHaveLength(1)
    expect(availableCounts(bank, 'full')).toEqual({ p5: 1, p6: 0, single: 0, double: 0, triple: 0 })
  })
})

describe('restoreReadingTest', () => {
  it('rebuilds the same entries and choice orders from saved ids', () => {
    const bank = bigBank()
    const entries = buildReadingTest(bank, 'half', () => 0.7)
    const saved = { length: 'half' as const, ids: entries.map(entryId), orders: entries.map((e) => e.order!), answers: {}, flags: [], index: 3, elapsedMs: 1000 }
    const restored = restoreReadingTest(bank, saved)!
    expect(restored.map(entryId)).toEqual(saved.ids)
    expect(restored.map((e) => e.order)).toEqual(saved.orders)
  })
  it('returns null when an item no longer exists', () => {
    const saved = { length: 'half' as const, ids: ['p5-word-form-9999'], orders: [[0, 1, 2, 3]], answers: {}, flags: [], index: 0, elapsedMs: 0 }
    expect(restoreReadingTest(bigBank(), saved)).toBeNull()
  })
})

const small = () => buildReadingTest({ part5: [makePart5(), makePart5()], part6: [], part7: [makePart7()] }, 'half', () => 0.4)

describe('testReducer', () => {
  it('answers, changes an answer, moves, jumps and flags', () => {
    let s = initTest(small(), 'half')
    s = testReducer(s, { type: 'answer', choice: 1 })
    s = testReducer(s, { type: 'answer', choice: 2 })
    expect(s.answers[entryId(s.entries[0])]).toBe(2)
    s = testReducer(s, { type: 'next' })
    expect(s.index).toBe(1)
    s = testReducer(s, { type: 'prev' })
    s = testReducer(s, { type: 'prev' })
    expect(s.index).toBe(0)
    s = testReducer(s, { type: 'jump', index: 3 })
    expect(s.index).toBe(3)
    s = testReducer(s, { type: 'flag' })
    expect(s.flags).toEqual([entryId(s.entries[3])])
    s = testReducer(s, { type: 'flag' })
    expect(s.flags).toEqual([])
  })

  it('submits on timeout and ignores actions after submit', () => {
    let s = initTest(small(), 'half')
    s = testReducer(s, { type: 'tick', ms: DURATION_MS.half - 1 })
    expect(s.done).toBe(false)
    s = testReducer(s, { type: 'tick', ms: 5 })
    expect(s.done).toBe(true)
    expect(s.elapsedMs).toBe(DURATION_MS.half)
    expect(testReducer(s, { type: 'answer', choice: 0 })).toBe(s)
  })

  it('resumes from saved state and round-trips through toActive', () => {
    const entries = small()
    const s0 = initTest(entries, 'half', { answers: { [entryId(entries[1])]: 3 }, flags: [], index: 1, elapsedMs: 60_000 })
    expect(s0.index).toBe(1)
    expect(toActive(s0)).toMatchObject({ length: 'half', index: 1, elapsedMs: 60_000, ids: entries.map(entryId) })
  })

  it('scores by part', () => {
    let s = initTest(small(), 'half')
    const correct = entryFields(s.entries[0]).answer
    s = testReducer(s, { type: 'answer', choice: correct })
    const parts = scoreTest(s)
    expect(parts.p5).toEqual({ correct: 1, total: 2 })
    expect(parts.p6).toEqual({ correct: 0, total: 0 })
    expect(parts.p7.total).toBe(2)
  })
})
