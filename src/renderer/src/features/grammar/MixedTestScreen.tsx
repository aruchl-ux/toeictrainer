import { useCallback, useRef, useState } from 'react'
import { pickMixedTest, type QuizEntry } from '@shared/quiz'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon, PosterShapes } from '../../app/Ink'
import { RecentTests } from '../home/RecentTests'
import { QuizRunner } from './QuizRunner'
import type { AnswerRecord } from './quizReducer'
import { useRecordAnswer } from './useRecordAnswer'

export const P5_COUNT = 30
export const P6_COUNT = 4

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
    <section className={entries === null ? 'mixed' : 'quiz-screen'}>
      {entries === null ? (
        <div className="mixed-intro">
          <PosterShapes />
          <h1 className="poster-head">
            <span className="ink-blue">{t('mixedTitle')}</span>
          </h1>
          <p className="poster-lead">{t('mixedIntro', { p5: P5_COUNT, p6: P6_COUNT })}</p>
          <button type="button" className="primary" onClick={start}>
            {t('mixedStart')}
            <ArrowIcon />
          </button>
          <section className="mixed-recent" aria-labelledby="mixed-recent">
            <h2 id="mixed-recent" className="panel-title">
              {t('homeRecent')}
            </h2>
            <RecentTests />
          </section>
        </div>
      ) : (
        <>
          <header className="quiz-title">
            <h1>{t('mixedTitle')}</h1>
          </header>
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
            <button type="button" className="again" onClick={start}>
              {t('quizAgain')}
            </button>
          )}
        </>
      )}
    </section>
  )
}
