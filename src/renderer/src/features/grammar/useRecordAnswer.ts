import { useCallback } from 'react'
import { useApp } from '../../app/AppContext'
import { toAttempt, type AnswerRecord } from './quizReducer'

export function useRecordAnswer(): (r: AnswerRecord) => void {
  const { recordGrammar } = useApp()
  return useCallback(
    (r: AnswerRecord) => void recordGrammar(toAttempt(r, new Date().toISOString())),
    [recordGrammar]
  )
}
