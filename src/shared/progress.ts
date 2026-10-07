import { schedule } from './leitner'
import type {
  ActiveReadingTest,
  FinishReadingTest,
  GrammarAttempt,
  MixedTestResult,
  Progress,
  ReadingAttempt
} from './types'

function scheduleId(leitner: Progress['leitner'], id: string, correct: boolean, today: string): Progress['leitner'] {
  const next = schedule(leitner[id], correct, today)
  return next ? { ...leitner, [id]: next } : leitner
}

export function applyGrammarAttempt(p: Progress, a: GrammarAttempt, today: string): Progress {
  return { ...p, grammarAttempts: [...p.grammarAttempts, a], leitner: scheduleId(p.leitner, a.itemId, a.correct, today) }
}

export function applyMixedTest(p: Progress, r: MixedTestResult): Progress {
  return { ...p, mixedTests: [...p.mixedTests, r] }
}

export function applyReadingAttempt(p: Progress, a: ReadingAttempt, today: string): Progress {
  return { ...p, readingAttempts: [...p.readingAttempts, a], leitner: scheduleId(p.leitner, a.itemId, a.correct, today) }
}

export function setActiveTest(p: Progress, t: ActiveReadingTest | null): Progress {
  return { ...p, activeReadingTest: t }
}

export function applyFinishedTest(p: Progress, f: FinishReadingTest, today: string): Progress {
  let leitner = p.leitner
  for (const a of [...f.grammar, ...f.reading]) leitner = scheduleId(leitner, a.itemId, a.correct, today)
  return {
    ...p,
    grammarAttempts: [...p.grammarAttempts, ...f.grammar],
    readingAttempts: [...p.readingAttempts, ...f.reading],
    readingTests: [...p.readingTests, f.result],
    leitner,
    activeReadingTest: null
  }
}
