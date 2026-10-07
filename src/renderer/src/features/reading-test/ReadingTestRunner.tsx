import { useEffect, useReducer, useRef, useState } from 'react'
import { entryId, type QuizEntry } from '@shared/quiz'
import { initTest, testReducer, toActive, type TestState } from '@shared/reading'
import type { ActiveReadingTest, TestLength } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon } from '../../app/Ink'
import { QuestionView, questionViewKey } from '../grammar/QuestionView'
import { QuestionMap } from './QuestionMap'
import { TestTimer } from './TestTimer'

interface Props {
  entries: QuizEntry[]
  length: TestLength
  saved?: Pick<ActiveReadingTest, 'answers' | 'flags' | 'index' | 'elapsedMs'>
  onDone(state: TestState): void
}

const SAVE_EVERY_MS = 5000
const MAX_TICK_MS = 5000

export function ReadingTestRunner({ entries, length, saved, onDone }: Props) {
  const { saveActiveTest } = useApp()
  const { lang, t } = useT()
  const [s, dispatch] = useReducer(testReducer, undefined, () => initTest(entries, length, saved))
  const [confirming, setConfirming] = useState(false)
  const latest = useRef(s)
  latest.current = s
  const finished = useRef(false)

  // Clock: advances only while this screen is mounted (pauses when the app is closed).
  useEffect(() => {
    let last = Date.now()
    let sinceSave = 0
    const id = setInterval(() => {
      const now = Date.now()
      // Cap each step: after a system sleep the wall clock jumps, but the learner was not working.
      const ms = Math.min(Math.max(0, now - last), MAX_TICK_MS)
      last = now
      dispatch({ type: 'tick', ms })
      sinceSave += ms
      if (sinceSave >= SAVE_EVERY_MS) {
        sinceSave = 0
        if (!latest.current.done) void saveActiveTest(toActive(latest.current))
      }
    }, 1000)
    return () => {
      clearInterval(id)
      if (!latest.current.done) void saveActiveTest(toActive(latest.current))
    }
  }, [saveActiveTest])

  // Save on every answer, flag or move.
  useEffect(() => {
    if (!s.done) void saveActiveTest(toActive(s))
  }, [s.answers, s.flags, s.index]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (s.done && !finished.current) {
      finished.current = true
      onDone(s)
    }
  }, [s, onDone])

  if (s.entries.length === 0) return null
  const entry = s.entries[s.index]
  const id = entryId(entry)
  const unanswered = s.entries.filter((e) => s.answers[entryId(e)] === undefined).length

  return (
    <div className="test quiz">
      <div className="test-bar">
        <TestTimer remainingMs={s.durationMs - s.elapsedMs} lang={lang} />
        <QuestionMap entries={s.entries} answers={s.answers} flags={s.flags} index={s.index} lang={lang} onJump={(i) => dispatch({ type: 'jump', index: i })} />
      </div>
      <p className="quiz-count num">{t('quizQuestionOf', { i: s.index + 1, n: s.entries.length })}</p>
      <QuestionView
        key={questionViewKey(entry)}
        entry={entry}
        lang={lang}
        selected={s.answers[id] ?? null}
        reveal={false}
        locked={false}
        onChoose={(choice) => dispatch({ type: 'answer', choice })}
      />
      <div className="quiz-foot test-foot">
        <div className="actions">
          <button type="button" onClick={() => dispatch({ type: 'prev' })} disabled={s.index === 0}>
            {t('testPrev')}
          </button>
          <button type="button" onClick={() => dispatch({ type: 'flag' })} aria-pressed={s.flags.includes(id)}>
            {t(s.flags.includes(id) ? 'testUnflag' : 'testFlag')}
          </button>
          <button type="button" onClick={() => dispatch({ type: 'next' })} disabled={s.index === s.entries.length - 1}>
            {t('testNext')}
            <ArrowIcon />
          </button>
        </div>
        {confirming ? (
          <div className="confirm-bar" role="alert">
            <span>{t('testConfirm', { n: unanswered })}</span>
            <button type="button" className="primary" onClick={() => dispatch({ type: 'submit' })}>
              {t('testConfirmYes')}
            </button>
            <button type="button" onClick={() => setConfirming(false)}>
              {t('testConfirmNo')}
            </button>
          </div>
        ) : (
          <button type="button" className="primary" onClick={() => (unanswered > 0 ? setConfirming(true) : dispatch({ type: 'submit' }))}>
            {t('testSubmit')}
          </button>
        )}
      </div>
    </div>
  )
}
