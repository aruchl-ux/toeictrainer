import { useCallback, useState } from 'react'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { resolveIds, shuffle, shuffleChoices } from '@shared/quiz'
import { useApp, useT } from '../../app/AppContext'
import { RestShapes } from '../../app/Ink'
import { QuizRunner } from '../grammar/QuizRunner'
import { useRecordAnswer } from '../grammar/useRecordAnswer'

export function ReviewScreen() {
  const { bank, progress } = useApp()
  const { lang, t } = useT()
  // Shuffle once, then freeze the queue when the screen opens so answering does not reshuffle it mid-session.
  const [entries] = useState(() => shuffleChoices(shuffle(resolveIds(bank, dueIds(progress.leitner, localDate())))))
  const onAnswer = useRecordAnswer()
  const onFinish = useCallback(() => {}, [])

  return (
    <section className="quiz-screen">
      <header className="quiz-title">
        <h1>{t('reviewTitle')}</h1>
      </header>
      {entries.length === 0 ? (
        <div className="rest">
          <RestShapes />
          <p>{t('reviewNothing')}</p>
        </div>
      ) : (
        <QuizRunner entries={entries} mode="instant" lang={lang} onAnswer={onAnswer} onFinish={onFinish} />
      )}
    </section>
  )
}
