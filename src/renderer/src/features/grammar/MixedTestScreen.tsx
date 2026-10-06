import { useCallback, useRef, useState } from 'react'
import { pickMixedTest, type QuizEntry } from '@shared/quiz'
import { useApp, useT } from '../../app/AppContext'
import { QuizRunner } from './QuizRunner'
import type { AnswerRecord } from './quizReducer'
import { useRecordAnswer } from './useRecordAnswer'

const P5_COUNT = 30
const P6_COUNT = 4

export function MixedTestScreen() {
  const { bank, recordMixedTest } = useApp()
  const { lang, t } = useT()
  const [entries, setEntries] = useState<QuizEntry[] | null>(null)
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)
  const startedAt = useRef(0)

  const start = () => {
    startedAt.current = Date.now()
    setDone(false)
    setEntries(pickMixedTest(bank, Math.random, P5_COUNT, P6_COUNT))
    setRun((r) => r + 1)
  }
  const onAnswer = useRecordAnswer()
  const onFinish = useCallback(
    (records: AnswerRecord[]) => {
      setDone(true)
      void recordMixedTest({
        at: new Date().toISOString(),
        correct: records.filter((r) => r.correct).length,
        total: records.length,
        ms: Date.now() - startedAt.current
      })
    },
    [recordMixedTest]
  )

  return (
    <section>
      <h1>{t('mixedTitle')}</h1>
      {entries === null ? (
        <div className="card">
          <p>{t('mixedIntro', { p5: P5_COUNT, p6: P6_COUNT })}</p>
          <button type="button" className="primary" onClick={start}>
            {t('mixedStart')}
          </button>
        </div>
      ) : (
        <>
          <QuizRunner
            key={run}
            entries={entries}
            mode="deferred"
            lang={lang}
            onAnswer={onAnswer}
            onFinish={onFinish}
            paceSeconds={20}
          />
          {done && (
            <button type="button" onClick={start}>
              {t('quizAgain')}
            </button>
          )}
        </>
      )}
    </section>
  )
}
