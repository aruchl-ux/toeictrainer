import { describe, expect, it } from 'vitest'
import type { GrammarAttempt, GrammarTopic, MixedTestResult } from '@shared/types'
import { estimateBand, topicStats, weakestTopics, type TopicStat, latestBand } from '@shared/scoring'
import { estimateReadingBand } from '@shared/reading'
import { emptyProgress } from '@shared/types'

const att = (topic: GrammarTopic, correct: boolean, ms = 10000): GrammarAttempt => ({
  itemId: `${topic}-x`,
  topic,
  correct,
  ms,
  at: '2026-10-05T00:00:00.000Z'
})

describe('topicStats', () => {
  it('uses only the last 20 attempts per topic', () => {
    const attempts = [
      ...Array.from({ length: 5 }, () => att('word-form', false)),
      ...Array.from({ length: 20 }, () => att('word-form', true))
    ]
    expect(topicStats(attempts)).toEqual([{ topic: 'word-form', count: 20, accuracy: 1, avgMs: 10000 }])
  })
  it('computes accuracy and average time per topic, sorted by topic', () => {
    const stats = topicStats([
      att('prepositions', true, 10000),
      att('prepositions', false, 20000),
      att('conditionals', true, 5000)
    ])
    expect(stats).toEqual([
      { topic: 'conditionals', count: 1, accuracy: 1, avgMs: 5000 },
      { topic: 'prepositions', count: 2, accuracy: 0.5, avgMs: 15000 }
    ])
  })
})

describe('weakestTopics', () => {
  const s = (topic: GrammarTopic, accuracy: number, avgMs: number, count = 10): TopicStat => ({
    topic,
    count,
    accuracy,
    avgMs
  })
  it('ignores topics with too few attempts and sorts by accuracy then slowness', () => {
    const stats = [
      s('word-form', 0.9, 10000),
      s('prepositions', 0.5, 10000),
      s('conditionals', 0.5, 20000),
      s('inversion', 0.1, 10000, 3),
      s('pronouns', 0.7, 10000)
    ]
    expect(weakestTopics(stats)).toEqual(['conditionals', 'prepositions', 'pronouns'])
  })
})

it('computes stats for Part 7 question types', () => {
  const stats = topicStats([
    { topic: 'inference', correct: false, ms: 1000 },
    { topic: 'inference', correct: true, ms: 3000 }
  ])
  expect(stats).toEqual([{ topic: 'inference', count: 2, accuracy: 0.5, avgMs: 2000 }])
})

it('averages time over timed attempts only and falls back to 0', () => {
  expect(topicStats([att('word-form', true, 0), att('word-form', true, 8000)])).toEqual([
    { topic: 'word-form', count: 2, accuracy: 1, avgMs: 8000 }
  ])
  expect(topicStats([att('word-form', true, 0)])[0].avgMs).toBe(0)
})

describe('estimateBand', () => {
  const t = (correct: number, total: number): MixedTestResult => ({
    at: '2026-10-05T00:00:00.000Z',
    correct,
    total,
    ms: 1
  })
  it('returns null with no mixed tests', () => {
    expect(estimateBand([])).toBeNull()
  })
  it('uses the last three tests only', () => {
    expect(estimateBand([t(0, 10), t(9, 10), t(9, 10), t(9, 10)])).toEqual({ low: 400, high: 450 })
  })
  it('maps band boundaries', () => {
    expect(estimateBand([t(95, 100)])).toEqual({ low: 450, high: 495 })
    expect(estimateBand([t(50, 100)])).toEqual({ low: 230, high: 300 })
    expect(estimateBand([t(49, 100)])).toEqual({ low: 5, high: 230 })
  })
})

it('estimates a Reading band from part scores', () => {
  const perfect = { p5: { correct: 30, total: 30 }, p6: { correct: 16, total: 16 }, p7: { correct: 54, total: 54 } }
  expect(estimateReadingBand(perfect)).toEqual({ low: 460, high: 495 })
  expect(estimateReadingBand({ p5: { correct: 0, total: 0 }, p6: { correct: 0, total: 0 }, p7: { correct: 0, total: 0 } })).toBeNull()
})

it('prefers the latest Reading test over mixed tests', () => {
  const p = emptyProgress()
  p.mixedTests = [{ at: 'a', correct: 34, total: 34, ms: 1 }]
  expect(latestBand(p)?.source).toBe('mixed')
  p.readingTests = [{ length: 'half', parts: { p5: { correct: 5, total: 15 }, p6: { correct: 2, total: 8 }, p7: { correct: 8, total: 27 } }, ms: 1, at: 'b' }]
  expect(latestBand(p)?.source).toBe('test')
})
