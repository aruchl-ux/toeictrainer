import { useCallback, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { pickTopicDrill } from '@shared/quiz'
import { Part5Topic } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { QuizRunner } from './QuizRunner'
import { useRecordAnswer } from './useRecordAnswer'

export function DrillScreen() {
  const parsed = Part5Topic.safeParse(useParams().topic)
  const topicId = parsed.success ? parsed.data : null
  const { bank } = useApp()
  const { lang, t, topic } = useT()
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)

  const entries = useMemo(
    () => (topicId ? pickTopicDrill(bank, topicId, 10) : []),
    // `run` is a dependency on purpose: bumping it reshuffles a fresh drill.
    [bank, topicId, run]
  )
  const onAnswer = useRecordAnswer()
  const onFinish = useCallback(() => setDone(true), [])

  if (!topicId) return <Navigate to="/topics" replace />
  return (
    <section>
      <h1>{topic(topicId)}</h1>
      <QuizRunner
        key={`${topicId}-${run}`}
        entries={entries}
        mode="instant"
        lang={lang}
        onAnswer={onAnswer}
        onFinish={onFinish}
        paceSeconds={20}
      />
      {done && (
        <button
          type="button"
          onClick={() => {
            setDone(false)
            setRun((r) => r + 1)
          }}
        >
          {t('quizAgain')}
        </button>
      )}
    </section>
  )
}
