import { useCallback, useState } from 'react'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { resolveIds } from '@shared/quiz'
import { useApp, useT } from '../../app/AppContext'
import { QuizRunner } from '../grammar/QuizRunner'
import { useRecordAnswer } from '../grammar/useRecordAnswer'

export function ReviewScreen() {
  const { bank, progress } = useApp()
  const { lang, t } = useT()
  // Freeze the queue when the screen opens so answering does not reshuffle it mid-session.
  const [entries] = useState(() => resolveIds(bank, dueIds(progress.leitner, localDate())))
  const onAnswer = useRecordAnswer()
  const onFinish = useCallback(() => {}, [])

  return (
    <section>
      <h1>{t('reviewTitle')}</h1>
      {entries.length === 0 ? (
        <p className="muted">{t('reviewNothing')}</p>
      ) : (
        <QuizRunner entries={entries} mode="instant" lang={lang} onAnswer={onAnswer} onFinish={onFinish} />
      )}
    </section>
  )
}
