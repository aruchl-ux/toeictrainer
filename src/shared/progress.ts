import { schedule } from './leitner'
import type { GrammarAttempt, MixedTestResult, Progress } from './types'

export function applyGrammarAttempt(p: Progress, a: GrammarAttempt, today: string): Progress {
  const next = schedule(p.leitner[a.itemId], a.correct, today)
  const leitner = { ...p.leitner }
  if (next) leitner[a.itemId] = next
  return { ...p, grammarAttempts: [...p.grammarAttempts, a], leitner }
}

export function applyMixedTest(p: Progress, r: MixedTestResult): Progress {
  return { ...p, mixedTests: [...p.mixedTests, r] }
}
