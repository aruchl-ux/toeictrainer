import { entryFields, entryId, type QuizEntry } from '@shared/quiz'
import type { GrammarAttempt, GrammarTopic } from '@shared/types'

export type QuizMode = 'instant' | 'deferred'

export interface AnswerRecord {
  entryId: string
  topic: GrammarTopic
  choice: number
  correct: boolean
  ms: number
}

export interface QuizState {
  entries: QuizEntry[]
  index: number
  selected: number | null
  shownAt: number
  records: AnswerRecord[]
  mode: QuizMode
  done: boolean
}

export type QuizAction = { type: 'answer'; choice: number; now: number } | { type: 'next'; now: number }

export function initQuiz(entries: QuizEntry[], mode: QuizMode, now: number): QuizState {
  return { entries, index: 0, selected: null, shownAt: now, records: [], mode, done: entries.length === 0 }
}

function advance(s: QuizState, now: number): QuizState {
  const index = s.index + 1
  if (index >= s.entries.length) return { ...s, selected: null, done: true }
  return { ...s, index, selected: null, shownAt: now }
}

export function quizReducer(s: QuizState, a: QuizAction): QuizState {
  if (s.done) return s
  if (a.type === 'answer') {
    if (s.selected !== null) return s
    const entry = s.entries[s.index]
    const f = entryFields(entry)
    const record: AnswerRecord = {
      entryId: entryId(entry),
      topic: f.topic,
      choice: a.choice,
      correct: a.choice === f.answer,
      ms: Math.max(0, a.now - s.shownAt)
    }
    const next = { ...s, records: [...s.records, record] }
    return s.mode === 'deferred' ? advance(next, a.now) : { ...next, selected: a.choice }
  }
  if (s.mode === 'deferred' || s.selected === null) return s
  return advance(s, a.now)
}

export function toAttempt(r: AnswerRecord, at: string): GrammarAttempt {
  return { itemId: r.entryId, topic: r.topic, correct: r.correct, ms: r.ms, at }
}
