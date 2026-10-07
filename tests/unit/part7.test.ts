import { describe, expect, it } from 'vitest'
import { Part7Set } from '@shared/types'
import { makePart7 } from '../fixtures/items'

const doc = (body: string, kind: 'email' | 'chat' | 'schedule' = 'email') => ({ kind, title: `${kind}: x`, body })
const q = (over: Record<string, unknown> = {}): any => ({
  type: 'detail' as const,
  prompt: 'What is true?',
  difficulty: 3,
  choices: ['a', 'b', 'c', 'd'],
  answer: 0,
  evidence: [{ doc: 0, quote: 'alpha beta' }],
  explain: { en: 'Because of alpha beta.', th: 'เพราะ alpha beta' },
  ...over
})

describe('Part7Set schema', () => {
  it('accepts the fixture', () => {
    expect(Part7Set.safeParse(makePart7()).success).toBe(true)
  })

  it('rejects a doc count that does not match the format', () => {
    const r = Part7Set.safeParse(makePart7({ format: 'double' }))
    expect(r.success).toBe(false)
  })

  it('rejects an evidence quote missing from its doc', () => {
    const set = makePart7()
    set.questions[0].evidence = [{ doc: 0, quote: 'not in the text' }]
    expect(Part7Set.safeParse(set).success).toBe(false)
  })

  it('requires 5 questions and a two-doc cross-reference for double sets', () => {
    const docs = [doc('alpha beta gamma'), doc('delta epsilon alpha beta')]
    const five = [q(), q(), q(), q(), q()]
    expect(Part7Set.safeParse(makePart7({ format: 'double', docs, questions: five })).success).toBe(false)
    const withCross = [
      ...five.slice(0, 4),
      q({ type: 'cross-reference', evidence: [{ doc: 0, quote: 'gamma' }, { doc: 1, quote: 'delta' }] })
    ]
    expect(Part7Set.safeParse(makePart7({ format: 'double', docs, questions: withCross })).success).toBe(true)
    expect(Part7Set.safeParse(makePart7({ format: 'double', docs, questions: withCross.slice(0, 4) })).success).toBe(false)
  })

  it('requires insertion markers [1]-[4] for an insertion question', () => {
    const bad = makePart7({ questions: [q(), q({ type: 'insertion' })] })
    bad.docs = [doc('alpha beta text')]
    expect(Part7Set.safeParse(bad).success).toBe(false)
    const good = makePart7({ questions: [q(), q({ type: 'insertion' })] })
    good.docs = [doc('[1] alpha beta [2] text [3] more [4] end')]
    expect(Part7Set.safeParse(good).success).toBe(true)
  })

  it('requires a chat doc for an intent question', () => {
    const set = makePart7({ docs: [doc('alpha beta')], questions: [q(), q({ type: 'intent' })] })
    expect(Part7Set.safeParse(set).success).toBe(false)
    set.docs = [doc('Ana (9:01): alpha beta', 'chat')]
    expect(Part7Set.safeParse(set).success).toBe(true)
  })
})
