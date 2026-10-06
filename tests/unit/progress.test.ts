import { describe, expect, it } from 'vitest'
import { emptyProgress, type GrammarAttempt } from '@shared/types'
import { applyGrammarAttempt, applyMixedTest } from '@shared/progress'

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
