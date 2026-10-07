import { describe, expect, it } from 'vitest'
import type { QuizEntry } from '@shared/quiz'
import { DEFERRED_DEBOUNCE_MS, initQuiz, quizReducer, toAttempt, toReadingAttempt } from '@renderer/features/grammar/quizReducer'
import { makePart5 } from '../../fixtures/items'

const entries: QuizEntry[] = [
  { kind: 'p5', item: makePart5({ answer: 1 }) },
  { kind: 'p5', item: makePart5({ answer: 2 }) }
]

describe('quizReducer (instant)', () => {
  it('records an answer with time and reveals it', () => {
    const s = quizReducer(initQuiz(entries, 'instant', 1000), { type: 'answer', choice: 1, now: 4000 })
    expect(s.selected).toBe(1)
    expect(s.records).toEqual([
      { entryId: entries[0].kind === 'p5' ? entries[0].item.id : '', topic: 'word-form', choice: 1, correct: true, ms: 3000 }
    ])
  })
  it('ignores a second answer to the same question', () => {
    let s = quizReducer(initQuiz(entries, 'instant', 0), { type: 'answer', choice: 0, now: 1 })
    s = quizReducer(s, { type: 'answer', choice: 1, now: 2 })
    expect(s.records).toHaveLength(1)
    expect(s.records[0].correct).toBe(false)
  })
  it('ignores next before answering', () => {
    const s0 = initQuiz(entries, 'instant', 0)
    expect(quizReducer(s0, { type: 'next', now: 5 })).toBe(s0)
  })
  it('advances, resets the timer, and finishes after the last question', () => {
    let s = quizReducer(initQuiz(entries, 'instant', 0), { type: 'answer', choice: 1, now: 1 })
    s = quizReducer(s, { type: 'next', now: 500 })
    expect(s.index).toBe(1)
    expect(s.selected).toBeNull()
    expect(s.shownAt).toBe(500)
    s = quizReducer(s, { type: 'answer', choice: 2, now: 600 })
    s = quizReducer(s, { type: 'next', now: 700 })
    expect(s.done).toBe(true)
  })
})

describe('quizReducer (deferred)', () => {
  it('advances immediately after each answer and finishes', () => {
    let s = quizReducer(initQuiz(entries, 'deferred', 0), { type: 'answer', choice: 1, now: 1000 })
    expect(s.index).toBe(1)
    expect(s.selected).toBeNull()
    s = quizReducer(s, { type: 'answer', choice: 0, now: 2000 })
    expect(s.done).toBe(true)
    expect(s.records.map((r) => r.correct)).toEqual([true, false])
  })
  it('ignores an answer arriving within the debounce window (double-click)', () => {
    let s = quizReducer(initQuiz(entries, 'deferred', 0), { type: 'answer', choice: 1, now: 1000 })
    const after = quizReducer(s, { type: 'answer', choice: 0, now: 1000 + DEFERRED_DEBOUNCE_MS - 1 })
    expect(after).toBe(s)
    s = quizReducer(s, { type: 'answer', choice: 0, now: 1000 + DEFERRED_DEBOUNCE_MS })
    expect(s.done).toBe(true)
    expect(s.records).toHaveLength(2)
  })
})

describe('initQuiz and toAttempt', () => {
  it('marks an empty quiz as done', () => {
    expect(initQuiz([], 'instant', 0).done).toBe(true)
  })
  it('converts a record into a grammar attempt', () => {
    expect(
      toAttempt({ entryId: 'p6-0001#2', topic: 'transitions', choice: 0, correct: true, ms: 5 }, 'T')
    ).toEqual({ itemId: 'p6-0001#2', topic: 'transitions', correct: true, ms: 5, at: 'T' })
  })
})

describe('toReadingAttempt', () => {
  it('converts a Part 7 answer record into a reading attempt', () => {
    const r = { entryId: 'p7-0001#q2', topic: 'inference' as const, choice: 1, correct: true, ms: 4000 }
    expect(toReadingAttempt(r, 'T')).toEqual({ itemId: 'p7-0001#q2', qtype: 'inference', correct: true, ms: 4000, at: 'T' })
  })
})
