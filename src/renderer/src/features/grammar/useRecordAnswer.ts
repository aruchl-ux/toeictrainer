import { useCallback } from 'react'
import { isPart7Id } from '@shared/quiz'
import { useApp } from '../../app/AppContext'
import { isGrammarTopic } from '../../app/i18n'
import { toAttempt, toReadingAttempt, type AnswerRecord } from './quizReducer'

export function useRecordAnswer(): (r: AnswerRecord) => void {
  const { recordGrammar, recordReading } = useApp()
  return useCallback(
    (r: AnswerRecord) => {
      const at = new Date().toISOString()
      if (isPart7Id(r.entryId)) void recordReading(toReadingAttempt(r, at))
      else if (isGrammarTopic(r.topic)) void recordGrammar(toAttempt({ ...r, topic: r.topic }, at))
    },
    [recordGrammar, recordReading]
  )
}
