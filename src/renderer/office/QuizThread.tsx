import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { entryFields, type QuizEntry } from '@shared/quiz'
import { initQuiz, quizReducer, type AnswerRecord, type QuizMode } from '@renderer/features/grammar/quizReducer'
import { useRecordAnswer } from '@renderer/features/grammar/useRecordAnswer'
import type { Command } from './commands'
import { focusComposer } from './Composer'
import { DocPane } from './DocPane'
import { AlertIcon } from './icons'
import { AgentMsg, answerIndex, Options, PastRow, secs, Stem, UserMsg, Verdict } from './Task'
import { Thread } from './Thread'
import { useO } from './strings'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  entries: QuizEntry[]
  mode: QuizMode
  crumbs: string[]
  /** The agent's opening message. */
  intro?: ReactNode
  /** Pace target in seconds for Part 5 tasks; shown in the top bar. */
  pace?: number
  onFinish?(records: AnswerRecord[]): void
  /** Actions under the closing summary. */
  doneActions?: ReactNode
  /** Extra thread commands (again, another set…). */
  commands?: Command[]
  /** Enter on the finished thread runs this (usually "again"). */
  onEnterDone?(): void
}

function Pace({ since, limit }: { since: number; limit: number }) {
  const { o } = useO()
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const s = Math.floor((Date.now() - since) / 1000)
  const slow = s > limit
  return (
    <span className={slow ? 'chip pace slow' : 'chip pace'} title={`${limit}s`}>
      {slow && <AlertIcon />}
      <span className="mono">
        0:{String(Math.min(s, 59)).padStart(2, '0')}
        {s > 59 ? '+' : ''}
      </span>
      {slow && <span>{o('over', { s: limit })}</span>}
    </span>
  )
}

export function QuizThread({ entries, mode, crumbs, intro, pace, onFinish, doneActions, commands = [], onEnterDone }: Props) {
  const { o, t, skill } = useO()
  const [s, dispatch] = useReducer(quizReducer, undefined, () => initQuiz(entries, mode, Date.now()))
  const onAnswer = useRecordAnswer()
  const reported = useRef(0)
  const finished = useRef(false)

  useEffect(() => {
    while (reported.current < s.records.length) {
      onAnswer(s.records[reported.current])
      reported.current++
    }
  }, [s.records, onAnswer])

  useEffect(() => {
    if (s.done && s.entries.length > 0 && !finished.current) {
      finished.current = true
      onFinish?.(s.records)
    }
  }, [s.done, s.records, s.entries.length, onFinish])

  const choose = useCallback((i: number) => {
    dispatch({ type: 'answer', choice: i, now: Date.now() })
    focusComposer()
  }, [])
  const canAdvance = mode === 'instant' && s.selected !== null && !s.done
  const next = useCallback(() => dispatch({ type: 'next', now: Date.now() }), [])

  const onKey = useCallback(
    (key: string) => {
      if (s.done) {
        if (key === 'Enter' && onEnterDone) {
          onEnterDone()
          return true
        }
        return false
      }
      if (key === 'Enter' && canAdvance) {
        next()
        return true
      }
      const i = answerIndex(key)
      if (s.selected === null && i >= 0) {
        choose(i)
        return true
      }
      return false
    },
    [s.done, s.selected, canAdvance, next, choose, onEnterDone]
  )
  const onText = useCallback((text: string) => onKey(text), [onKey])

  const threadCommands = useMemo<Command[]>(
    () => [...(canAdvance ? [{ name: 'next', hint: o('cmdNext'), run: next }] : []), ...commands],
    [canAdvance, commands, next, o]
  )

  const total = s.entries.length
  const current = s.done ? null : s.entries[s.index]
  const paneEntry = current ?? s.entries[total - 1]
  const reveal = mode === 'instant' && s.selected !== null
  const pane =
    paneEntry && paneEntry.kind !== 'p5' ? (
      <DocPane
        key={paneEntry.set.id}
        entry={paneEntry}
        evidence={paneEntry.kind === 'p7' && current && reveal ? paneEntry.set.questions[paneEntry.q].evidence : null}
      />
    ) : undefined

  const correct = s.records.filter((r) => r.correct).length
  const timed = s.records.filter((r) => r.ms > 0)
  const avg = timed.length ? timed.reduce((a, r) => a + r.ms, 0) / timed.length : 0
  const missed = [
    ...new Set(
      s.records.flatMap((r, i) => {
        if (r.correct) return []
        const e = s.entries[i]
        const f = entryFields(e)
        return [e.kind === 'p7' ? skill(f.topic) : f.trap]
      })
    )
  ].filter((p) => p.trim() !== '')

  const status = (
    <>
      {current && pace !== undefined && current.kind === 'p5' && s.selected === null && <Pace key={s.shownAt} since={s.shownAt} limit={pace} />}
      {total > 0 && (
        <span className="chip mono">
          {Math.min(s.records.length + (current && s.selected === null ? 1 : 0), total)}/{total}
        </span>
      )}
    </>
  )

  const placeholder = s.done ? o('composerIdle') : canAdvance ? o('composerNext') : o('composerAnswer')

  return (
    <Thread
      crumbs={crumbs}
      status={status}
      pane={pane}
      composer={{ placeholder, onKey, onText, commands: threadCommands }}
      scrollSignal={`${s.index}-${s.selected}-${s.done}`}
    >
      {intro}
      {total === 0 && <AgentMsg head={t('quizEmpty')}>{null}</AgentMsg>}
      {s.entries.slice(0, s.done ? total : s.index).map((e, i) => (
        <PastRow key={i} entry={e} index={i} record={s.records[i]} revealed={mode === 'instant' || s.done} />
      ))}
      {current && (
        <>
          <AgentMsg
            anchor
            head={t('quizQuestionOf', { i: s.index + 1, n: total })}
            meta={skill(entryFields(current).topic)}
          >
            <Stem entry={current} />
            <Options entry={current} selected={s.selected} reveal={reveal} locked onChoose={choose} />
          </AgentMsg>
          {s.selected !== null && (
            <UserMsg>
              {LETTERS[s.selected]} · {entryFields(current).choices[s.selected]}
            </UserMsg>
          )}
          {reveal && s.records[s.index] && (
            <AgentMsg>
              <Verdict key={s.index} entry={current} record={s.records[s.index]} fresh />
            </AgentMsg>
          )}
          {mode === 'deferred' && s.index > 0 && s.selected === null && s.records.length === s.index && (
            <p className="sys">{o('recorded')}</p>
          )}
        </>
      )}
      {s.done && total > 0 && (
        <AgentMsg anchor head={o('doneHead', { c: correct, n: total })} meta={avg > 0 ? o('avg', { s: secs(avg) }) : undefined}>
          {missed.length > 0 ? (
            <>
              <p className="sub">{o('missed')}</p>
              <ul className="bullets">
                {missed.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>{o('allCorrect')}</p>
          )}
          {mode === 'deferred' && <p className="dim">{o('reviewHint')}</p>}
          {doneActions && <div className="actions">{doneActions}</div>}
        </AgentMsg>
      )}
    </Thread>
  )
}
