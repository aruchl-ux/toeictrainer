import { useEffect, useReducer, useRef, useState } from 'react'
import type { QuizEntry } from '@shared/quiz'
import { t, type Lang } from '../../app/i18n'
import { ArrowIcon } from '../../app/Ink'
import { isTypingTarget, QuestionView, questionViewKey } from './QuestionView'
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
  const slow = s > limit
  return (
    <span className={slow ? 'pace slow' : 'pace'}>
      <span className="pace-clock" aria-hidden="true">
        <span style={{ transform: `rotate(${Math.min(s / limit, 1) * 360}deg)` }} />
      </span>
      <span className="num">{t(lang, 'seconds', { s })}</span>
      {slow && <span className="pace-over">/ {t(lang, 'seconds', { s: limit })}</span>}
    </span>
  )
}

/** One tick per question: answered, current, ahead. Instant mode also shows right/wrong. */
function Ticks({ total, index, records, showResult }: { total: number; index: number; records: AnswerRecord[]; showResult: boolean }) {
  return (
    <ol className="ticks" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const r = records[i]
        const cls = r ? (showResult ? (r.correct ? 'tick ok' : 'tick bad') : 'tick done') : i === index ? 'tick now' : 'tick'
        return <li key={i} className={cls} />
      })}
    </ol>
  )
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

  const canAdvance = mode === 'instant' && state.selected !== null && !state.done
  useEffect(() => {
    if (!canAdvance) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return
      e.preventDefault()
      dispatch({ type: 'next', now: now() })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canAdvance, now])

  if (state.entries.length === 0) return <p className="muted empty-note">{t(lang, 'quizEmpty')}</p>
  if (state.done) {
    return <QuizSummary entries={state.entries} records={state.records} lang={lang} showReview={mode === 'deferred'} />
  }

  const entry = state.entries[state.index]
  const isLast = state.index + 1 === state.entries.length
  return (
    <div className="quiz">
      <div className="quiz-head">
        <span className="quiz-count num">{t(lang, 'quizQuestionOf', { i: state.index + 1, n: state.entries.length })}</span>
        <Ticks total={state.entries.length} index={state.index} records={state.records} showResult={mode === 'instant'} />
        {paceSeconds !== undefined && entry.kind === 'p5' && (
          <Elapsed key={state.shownAt} since={state.shownAt} limit={paceSeconds} lang={lang} now={now} />
        )}
      </div>
      <QuestionView
        key={questionViewKey(entry)}
        entry={entry}
        lang={lang}
        selected={state.selected}
        reveal={mode === 'instant' && state.selected !== null}
        onChoose={(choice) => dispatch({ type: 'answer', choice, now: now() })}
      />
      <div className="quiz-foot">
        <span className="keys-hint">{t(lang, mode === 'instant' ? 'quizKeysHint' : 'quizKeysHintTest')}</span>
        {canAdvance && (
          <button type="button" className="primary" onClick={() => dispatch({ type: 'next', now: now() })}>
            {isLast ? t(lang, 'quizFinish') : t(lang, 'quizNext')}
            <ArrowIcon />
          </button>
        )}
      </div>
    </div>
  )
}
