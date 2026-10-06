import { useEffect, useReducer, useRef, useState } from 'react'
import { entryId, type QuizEntry } from '@shared/quiz'
import { t, type Lang } from '../../app/i18n'
import { QuestionView } from './QuestionView'
import { QuizSummary } from './QuizSummary'
import { initQuiz, quizReducer, type AnswerRecord, type QuizMode } from './quizReducer'

interface Props {
  entries: QuizEntry[]
  mode: QuizMode
  lang: Lang
  onAnswer(record: AnswerRecord): void
  onFinish(records: AnswerRecord[]): void
  /** Pace target in seconds for Part 5 questions. Omit to hide the timer. */
  paceSeconds?: number
  now?: () => number
}

function Elapsed({ since, limit, lang, now }: { since: number; limit: number; lang: Lang; now: () => number }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const s = Math.floor((now() - since) / 1000)
  return <span className={s > limit ? 'pace slow' : 'pace'}>{t(lang, 'seconds', { s })}</span>
}

export function QuizRunner({ entries, mode, lang, onAnswer, onFinish, paceSeconds, now = Date.now }: Props) {
  const [state, dispatch] = useReducer(quizReducer, undefined, () => initQuiz(entries, mode, now()))
  const reported = useRef(0)
  const finished = useRef(false)

  useEffect(() => {
    while (reported.current < state.records.length) {
      onAnswer(state.records[reported.current])
      reported.current++
    }
  }, [state.records, onAnswer])

  useEffect(() => {
    if (state.done && state.entries.length > 0 && !finished.current) {
      finished.current = true
      onFinish(state.records)
    }
  }, [state.done, state.records, state.entries.length, onFinish])

  if (state.entries.length === 0) return <p className="muted">{t(lang, 'quizEmpty')}</p>
  if (state.done) {
    return <QuizSummary entries={state.entries} records={state.records} lang={lang} showReview={mode === 'deferred'} />
  }

  const entry = state.entries[state.index]
  const isLast = state.index + 1 === state.entries.length
  return (
    <div className="quiz">
      <div className="quiz-head">
        <span>{t(lang, 'quizQuestionOf', { i: state.index + 1, n: state.entries.length })}</span>
        {paceSeconds !== undefined && entry.kind === 'p5' && (
          <Elapsed key={state.shownAt} since={state.shownAt} limit={paceSeconds} lang={lang} now={now} />
        )}
      </div>
      <QuestionView
        key={entryId(entry)}
        entry={entry}
        lang={lang}
        selected={state.selected}
        reveal={mode === 'instant' && state.selected !== null}
        onChoose={(choice) => dispatch({ type: 'answer', choice, now: now() })}
      />
      {mode === 'instant' && state.selected !== null && (
        <button type="button" className="primary" onClick={() => dispatch({ type: 'next', now: now() })}>
          {isLast ? t(lang, 'quizFinish') : t(lang, 'quizNext')}
        </button>
      )}
    </div>
  )
}
