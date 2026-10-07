import type { MixedTestResult, Skill, Progress } from './types'
import { estimateReadingBand } from './reading'

export interface TopicStat {
  topic: Skill
  count: number
  accuracy: number
  avgMs: number
}

export const STATS_WINDOW = 20

type SkillAttempt = { topic: Skill; correct: boolean; ms: number }

export function topicStats(attempts: SkillAttempt[]): TopicStat[] {
  const byTopic = new Map<Skill, SkillAttempt[]>()
  for (const a of attempts) {
    const list = byTopic.get(a.topic) ?? []
    list.push(a)
    byTopic.set(a.topic, list)
  }
  return [...byTopic.entries()]
    .map(([topic, list]) => {
      const recent = list.slice(-STATS_WINDOW)
      const correct = recent.filter((a) => a.correct).length
      // Untimed attempts (ms 0, from the free-navigation reading test) must not drag the average down.
      const timed = recent.filter((a) => a.ms > 0)
      const totalMs = timed.reduce((sum, a) => sum + a.ms, 0)
      return {
        topic,
        count: recent.length,
        accuracy: correct / recent.length,
        avgMs: timed.length ? Math.round(totalMs / timed.length) : 0
      }
    })
    .sort((a, b) => a.topic.localeCompare(b.topic))
}

export function weakestTopics(stats: TopicStat[], n = 3, minCount = 5): Skill[] {
  return stats
    .filter((s) => s.count >= minCount)
    .sort((a, b) => a.accuracy - b.accuracy || b.avgMs - a.avgMs)
    .slice(0, n)
    .map((s) => s.topic)
}

export interface Band {
  low: number
  high: number
}

const BANDS: { min: number; band: Band }[] = [
  { min: 0.95, band: { low: 450, high: 495 } },
  { min: 0.85, band: { low: 400, high: 450 } },
  { min: 0.75, band: { low: 350, high: 400 } },
  { min: 0.65, band: { low: 300, high: 350 } },
  { min: 0.5, band: { low: 230, high: 300 } },
  { min: 0, band: { low: 5, high: 230 } }
]

export function estimateBand(tests: MixedTestResult[]): Band | null {
  const recent = tests.slice(-3)
  if (recent.length === 0) return null
  const correct = recent.reduce((sum, t) => sum + t.correct, 0)
  const total = recent.reduce((sum, t) => sum + t.total, 0)
  const accuracy = correct / total
  return BANDS.find((b) => accuracy >= b.min)!.band
}

export function latestBand(p: Progress): { band: Band; source: 'test' | 'mixed' } | null {
  const last = p.readingTests[p.readingTests.length - 1]
  const fromTest = last ? estimateReadingBand(last.parts) : null
  if (fromTest) return { band: fromTest, source: 'test' }
  const fromMixed = estimateBand(p.mixedTests)
  return fromMixed ? { band: fromMixed, source: 'mixed' } : null
}
