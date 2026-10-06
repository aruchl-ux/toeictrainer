import type { GrammarAttempt, GrammarTopic, MixedTestResult } from './types'

export interface TopicStat {
  topic: GrammarTopic
  count: number
  accuracy: number
  avgMs: number
}

export const STATS_WINDOW = 20

export function topicStats(attempts: GrammarAttempt[]): TopicStat[] {
  const byTopic = new Map<GrammarTopic, GrammarAttempt[]>()
  for (const a of attempts) {
    const list = byTopic.get(a.topic) ?? []
    list.push(a)
    byTopic.set(a.topic, list)
  }
  return [...byTopic.entries()]
    .map(([topic, list]) => {
      const recent = list.slice(-STATS_WINDOW)
      const correct = recent.filter((a) => a.correct).length
      const totalMs = recent.reduce((sum, a) => sum + a.ms, 0)
      return {
        topic,
        count: recent.length,
        accuracy: correct / recent.length,
        avgMs: Math.round(totalMs / recent.length)
      }
    })
    .sort((a, b) => a.topic.localeCompare(b.topic))
}

export function weakestTopics(stats: TopicStat[], n = 3, minCount = 5): GrammarTopic[] {
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
