import { describe, expect, it } from 'vitest'
import { emptyProgress, Progress, type GrammarAttempt } from '@shared/types'
import { applyFinishedTest, applyGrammarAttempt, applyMixedTest, applyReadingAttempt, setActiveTest } from '@shared/progress'

const attempt = (over: Partial<GrammarAttempt> = {}): GrammarAttempt => ({
  itemId: 'p5-word-form-0001',
  topic: 'word-form',
  correct: false,
  ms: 12000,
  at: '2026-10-05T03:00:00.000Z',
  ...over
})

describe('applyGrammarAttempt', () => {
  it('appends the attempt and schedules a wrong answer', () => {
    const before = emptyProgress()
    const after = applyGrammarAttempt(before, attempt(), '2026-10-05')
    expect(after.grammarAttempts).toHaveLength(1)
    expect(after.leitner['p5-word-form-0001']).toEqual({ box: 1, due: '2026-10-06' })
    expect(before.grammarAttempts).toHaveLength(0)
    expect(before.leitner).toEqual({})
  })
  it('does not add a card for a first-time correct answer', () => {
    const after = applyGrammarAttempt(emptyProgress(), attempt({ correct: true }), '2026-10-05')
    expect(after.leitner).toEqual({})
  })
  it('promotes an existing card on a correct answer', () => {
    const p = { ...emptyProgress(), leitner: { 'p5-word-form-0001': { box: 1, due: '2026-10-05' } } }
    const after = applyGrammarAttempt(p, attempt({ correct: true }), '2026-10-05')
    expect(after.leitner['p5-word-form-0001']).toEqual({ box: 2, due: '2026-10-08' })
  })
})

describe('applyMixedTest', () => {
  it('appends the result', () => {
    const r = { at: '2026-10-05T03:00:00.000Z', correct: 20, total: 34, ms: 600000 }
    expect(applyMixedTest(emptyProgress(), r).mixedTests).toEqual([r])
  })
})

const ra = { itemId: 'p7-0001#q2', qtype: 'inference' as const, correct: false, ms: 30000, at: 'x' }

describe('reading progress', () => {
  it('records a reading attempt and schedules a wrong answer for review', () => {
    const p = applyReadingAttempt(emptyProgress(), ra, '2026-10-06')
    expect(p.readingAttempts).toHaveLength(1)
    expect(p.leitner['p7-0001#q2']).toEqual({ box: 1, due: '2026-10-07' })
  })

  it('stores and clears the active test', () => {
    const active = { length: 'half' as const, ids: ['a'], orders: [[0, 1, 2, 3]], answers: {}, flags: [], index: 0, elapsedMs: 5000 }
    expect(setActiveTest(emptyProgress(), active).activeReadingTest).toEqual(active)
    expect(setActiveTest(setActiveTest(emptyProgress(), active), null).activeReadingTest).toBeNull()
  })

  it('applies a finished test: result, all attempts, and clears the active test', () => {
    const active = { length: 'half' as const, ids: ['a'], orders: [[0, 1, 2, 3]], answers: {}, flags: [], index: 0, elapsedMs: 1 }
    const start = setActiveTest(emptyProgress(), active)
    const result = { length: 'half' as const, parts: { p5: { correct: 1, total: 2 }, p6: { correct: 0, total: 0 }, p7: { correct: 0, total: 1 } }, ms: 1000, at: 'x' }
    const grammar = [{ itemId: 'p5-word-form-0001', topic: 'word-form' as const, correct: false, ms: 1, at: 'x' }]
    const p = applyFinishedTest(start, { result, grammar, reading: [ra] }, '2026-10-06')
    expect(p.readingTests).toEqual([result])
    expect(p.grammarAttempts).toHaveLength(1)
    expect(p.readingAttempts).toHaveLength(1)
    expect(Object.keys(p.leitner).sort()).toEqual(['p5-word-form-0001', 'p7-0001#q2'])
    expect(p.activeReadingTest).toBeNull()
  })

  it('loads an old progress file without the new fields', () => {
    const old = Progress.parse({ version: 1, grammarAttempts: [], leitner: {}, mixedTests: [] })
    expect(old.readingAttempts).toEqual([])
    expect(old.readingTests).toEqual([])
    expect(old.activeReadingTest).toBeNull()
  })
})
