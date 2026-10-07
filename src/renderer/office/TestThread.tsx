import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useApp } from '@renderer/app/AppContext'
import { isGrammarTopic } from '@renderer/app/i18n'
import type { AnswerRecord } from '@renderer/features/grammar/quizReducer'
import { entryFields, entryId, entryPart, type QuizEntry } from '@shared/quiz'
import {
  availableCounts,
  BLUEPRINT,
  buildReadingTest,
  DURATION_MS,
  estimateReadingBand,
  initTest,
  restoreReadingTest,
  scoreTest,
  testReducer,
  toActive,
  type TestState
} from '@shared/reading'
import { Part5Topic, Part7QType, TestLength, type ActiveReadingTest, type GrammarAttempt, type ReadingAttempt, type Skill } from '@shared/types'
import type { Command } from './commands'
import { focusComposer } from './Composer'
import { DocPane } from './DocPane'
import { AlertIcon, ChevronLeft, ChevronRight, FlagIcon, StopwatchIcon } from './icons'
import { AgentMsg, answerIndex, Options, PastRow, Stem, UserMsg } from './Task'
import { Thread } from './Thread'
import { Typed } from './threads'
import { useO } from './strings'

const SAVE_EVERY_MS = 5000
const MAX_TICK_MS = 5000
const LETTERS = ['A', 'B', 'C', 'D']

function Clock({ remainingMs, paused }: { remainingMs: number; paused: boolean }) {
  const { o, t } = useO()
  const total = Math.max(0, Math.ceil(remainingMs / 1000))
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  const level = total <= 60 ? 'urgent' : total <= 300 ? 'warn' : ''
  return (
    <span className={`chip clock ${level}`} role="timer" aria-live="off">
      {level ? <AlertIcon /> : <StopwatchIcon />}
      <span className="mono">
        {mm}:{ss}
      </span>
      <span className="clock-cue" aria-live="polite">
        {level ? t(level === 'urgent' ? 'testOneLeft' : 'testFiveLeft') : paused ? o('testPaused') : o('testRunning')}
      </span>
    </span>
  )
}

function QuestionMap({ s, onJump }: { s: TestState; onJump(i: number): void }) {
  const { o, t } = useO()
  const answered = s.entries.filter((e) => s.answers[entryId(e)] !== undefined).length
  const groups = (['p5', 'p6', 'p7'] as const)
    .map((part) => ({ part, items: s.entries.map((e, i) => ({ e, i })).filter(({ e }) => entryPart(e) === part) }))
    .filter((g) => g.items.length > 0)
  return (
    <details className="plan">
      <summary>
        <span className="past-chev">
          <ChevronRight />
        </span>
        <span className="plan-title">{o('mapTitle')}</span>
        <span className="dim">
          {o('mapSummary', { a: answered, f: s.flags.length, u: s.entries.length - answered })}
        </span>
      </summary>
      <nav className="qmap" aria-label={t('testTitle')}>
        {groups.map((g) => (
          <div key={g.part} className="qmap-group">
            <span className="qmap-part">{t('testPart', { n: g.part.slice(1) })}</span>
            <div className="qmap-cells">
              {g.items.map(({ e, i }) => {
                const id = entryId(e)
                const done = s.answers[id] !== undefined
                const flagged = s.flags.includes(id)
                const state = [t(done ? 'testAnswered' : 'testUnanswered'), flagged ? t('testFlagged') : ''].filter(Boolean).join(', ')
                const cls = ['cell', done && 'answered', flagged && 'flagged', i === s.index && 'current'].filter(Boolean).join(' ')
                return (
                  <button key={id} type="button" className={cls} aria-current={i === s.index} aria-label={t('testMapLabel', { i: i + 1, state })} onClick={() => onJump(i)}>
                    <span className="mono">{i + 1}</span>
                    {flagged && <FlagIcon />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </details>
  )
}

function Runner({ entries, length, saved, onDone }: { entries: QuizEntry[]; length: TestLength; saved?: ActiveReadingTest; onDone(s: TestState): void }) {
  const { saveActiveTest } = useApp()
  const { o, t, skill } = useO()
  const [s, dispatch] = useReducer(testReducer, undefined, () => initTest(entries, length, saved))
  const [confirming, setConfirming] = useState(false)
  const [hidden, setHidden] = useState(document.hidden)
  const latest = useRef(s)
  latest.current = s
  const finished = useRef(false)

  // Clock: runs while this thread is open and the window is shown. The boss key pauses it.
  useEffect(() => {
    let last = Date.now()
    let sinceSave = 0
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    const id = setInterval(() => {
      const now = Date.now()
      const ms = document.hidden ? 0 : Math.min(Math.max(0, now - last), MAX_TICK_MS)
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
      document.removeEventListener('visibilitychange', onVis)
      if (!latest.current.done) void saveActiveTest(toActive(latest.current))
    }
  }, [saveActiveTest])

  useEffect(() => {
    if (!s.done) void saveActiveTest(toActive(s))
  }, [s.answers, s.flags, s.index]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (s.done && !finished.current) {
      finished.current = true
      onDone(s)
    }
  }, [s, onDone])

  const entry = s.entries[s.index]
  const id = entryId(entry)
  const unanswered = s.entries.filter((e) => s.answers[entryId(e)] === undefined).length
  const submit = useCallback(() => {
    if (unanswered > 0) setConfirming(true)
    else dispatch({ type: 'submit' })
  }, [unanswered])
  const choose = useCallback((choice: number) => {
    dispatch({ type: 'answer', choice })
    focusComposer()
  }, [])

  const onKey = useCallback(
    (key: string) => {
      if (key === 'ArrowLeft') dispatch({ type: 'prev' })
      else if (key === 'ArrowRight' || (key === 'Enter' && s.answers[id] !== undefined)) dispatch({ type: 'next' })
      else if (key.toLowerCase() === 'f') dispatch({ type: 'flag' })
      else {
        const i = answerIndex(key)
        if (i < 0) return false
        choose(i)
      }
      return true
    },
    [choose, id, s.answers]
  )

  const commands = useMemo<Command[]>(
    () => [
      { name: 'next', hint: o('cmdNext'), run: () => dispatch({ type: 'next' }) },
      { name: 'prev', hint: o('cmdPrev'), run: () => dispatch({ type: 'prev' }) },
      { name: 'flag', hint: o('cmdFlag'), run: () => dispatch({ type: 'flag' }) },
      {
        name: 'goto',
        hint: o('cmdGoto'),
        needsArg: true,
        args: s.entries.map((_, i) => ({ value: String(i + 1), label: t('quizQuestionOf', { i: i + 1, n: s.entries.length }) })),
        run: (arg) => dispatch({ type: 'jump', index: Number(arg) - 1 })
      },
      { name: 'submit', hint: o('cmdSubmit'), run: submit }
    ],
    [s.entries, submit, o, t]
  )

  const selected = s.answers[id] ?? null
  return (
    <Thread
      crumbs={[o('groupTests'), `${t('testTitle')} · ${t(length === 'half' ? 'testHalf' : 'testFull')}`]}
      status={
        <>
          <Clock remainingMs={s.durationMs - s.elapsedMs} paused={hidden} />
          <span className="chip mono">
            {s.index + 1}/{s.entries.length}
          </span>
        </>
      }
      pane={entry.kind !== 'p5' ? <DocPane key={entry.set.id} entry={entry} evidence={null} /> : undefined}
      composer={{ placeholder: o('composerTest'), onKey, onText: onKey, commands }}
      scrollSignal={`${s.index}-${confirming}`}
    >
      <QuestionMap s={s} onJump={(i) => dispatch({ type: 'jump', index: i })} />
      <AgentMsg anchor head={t('quizQuestionOf', { i: s.index + 1, n: s.entries.length })} meta={skill(entryFields(entry).topic)}>
        <Stem entry={entry} />
        <Options entry={entry} selected={selected} reveal={false} locked={false} onChoose={choose} />
        {/* Quiet text actions, like an agent's inline follow-ups; the keys and /commands do the same. */}
        <div className="toolbar">
          <button type="button" className="tact" onClick={() => dispatch({ type: 'prev' })} disabled={s.index === 0}>
            <ChevronLeft />
            {t('testPrev')}
            <kbd className="key sm">←</kbd>
          </button>
          <button type="button" className="tact" aria-pressed={s.flags.includes(id)} onClick={() => dispatch({ type: 'flag' })}>
            <FlagIcon />
            {t(s.flags.includes(id) ? 'testUnflag' : 'testFlag')}
            <kbd className="key sm">F</kbd>
          </button>
          <button type="button" className="tact" onClick={() => dispatch({ type: 'next' })} disabled={s.index === s.entries.length - 1}>
            {t('testNext')}
            <ChevronRight />
            <kbd className="key sm">→</kbd>
          </button>
          <span className="spacer" />
          <button type="button" className="tact" onClick={submit}>
            {t('testSubmit')}
            <span className="mono dim">/submit</span>
          </button>
        </div>
      </AgentMsg>
      {selected !== null && (
        <UserMsg>
          {LETTERS[selected]} · {entryFields(entry).choices[selected]}
        </UserMsg>
      )}
      {confirming && (
        <AgentMsg anchor head={o('submitAsk', { n: unanswered })}>
          <div className="actions" role="alert">
            <button type="button" className="btn primary" onClick={() => dispatch({ type: 'submit' })}>
              {t('testConfirmYes')}
            </button>
            <button type="button" className="btn" onClick={() => setConfirming(false)}>
              {t('testConfirmNo')}
            </button>
          </div>
        </AgentMsg>
      )}
    </Thread>
  )
}

/** The skill with the most wrong answers (ties: first in test order), or null if nothing was wrong. */
function weakestSkill(records: (AnswerRecord | undefined)[]): Skill | null {
  const wrong = new Map<Skill, number>()
  for (const r of records) if (r && !r.correct) wrong.set(r.topic, (wrong.get(r.topic) ?? 0) + 1)
  let best: Skill | null = null
  for (const [k, n] of wrong) if (best === null || n > wrong.get(best)!) best = k
  return best
}

function drillPath(skill: Skill): string | null {
  if (Part7QType.safeParse(skill).success) return `/read?type=${skill}`
  if (Part5Topic.safeParse(skill).success) return `/drill/${skill}`
  return null
}

function Results({ state, onAgain }: { state: TestState; onAgain(): void }) {
  const { finishReadingTest } = useApp()
  const { o, t, skill } = useO()
  const navigate = useNavigate()
  const parts = scoreTest(state)
  const band = estimateReadingBand(parts)
  const saved = useRef(false)
  const records: (AnswerRecord | undefined)[] = state.entries.map((e) => {
    const choice = state.answers[entryId(e)]
    if (choice === undefined) return undefined
    const f = entryFields(e)
    return { entryId: entryId(e), topic: f.topic, choice, correct: choice === f.answer, ms: 0 }
  })
  const weakest = weakestSkill(records)
  const weakestPath = weakest && drillPath(weakest)

  useEffect(() => {
    if (saved.current) return
    saved.current = true
    const at = new Date().toISOString()
    const answered = records.filter((r): r is AnswerRecord => r !== undefined)
    const grammar: GrammarAttempt[] = answered.flatMap((r) =>
      !r.entryId.startsWith('p7-') && isGrammarTopic(r.topic) ? [{ itemId: r.entryId, topic: r.topic, correct: r.correct, ms: 0, at }] : []
    )
    const reading: ReadingAttempt[] = answered.flatMap((r) =>
      r.entryId.startsWith('p7-') ? [{ itemId: r.entryId, qtype: r.topic as ReadingAttempt['qtype'], correct: r.correct, ms: 0, at }] : []
    )
    void finishReadingTest({ result: { length: state.length, parts, ms: Math.round(state.elapsedMs), at }, grammar, reading })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const last = state.entries[state.entries.length - 1]
  return (
    <Thread
      crumbs={[o('groupTests'), t('testResultTitle')]}
      pane={last && last.kind !== 'p5' ? <DocPane key={last.set.id} entry={last} evidence={null} /> : undefined}
      composer={{
        placeholder: o('composerIdle'),
        onKey: (k) => {
          if (k !== 'Enter') return false
          onAgain()
          return true
        }
      }}
    >
      <AgentMsg anchor head={o('resultsHead')}>
        <table className="grid">
          <tbody>
            {(['p5', 'p6', 'p7'] as const)
              .filter((p) => parts[p].total > 0)
              .map((p) => (
                <tr key={p}>
                  <th scope="row">{t('testPart', { n: p.slice(1) })}</th>
                  <td className="mono r">
                    {parts[p].correct}/{parts[p].total}
                  </td>
                  <td className="bar-cell">
                    <span className="meter" aria-hidden="true">
                      <span style={{ width: `${Math.round((parts[p].correct / parts[p].total) * 100)}%` }} />
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <p className="dim">{t('testTimeUsed', { m: Math.round(state.elapsedMs / 60000) })}</p>
        {band && (
          <div className="note">
            <p className="note-head">{t('progressBand', { low: band.low, high: band.high })}</p>
            <p className="dim">{t('testBandNote')}</p>
          </div>
        )}
        <div className="actions">
          <button type="button" className="btn primary" onClick={onAgain}>
            {t('quizAgain')} <kbd className="key sm">↵</kbd>
          </button>
          {weakest && weakestPath && (
            <button type="button" className="btn" onClick={() => navigate(weakestPath)}>
              {t('testDrillWeakest', { skill: skill(weakest) })}
            </button>
          )}
        </div>
        <p className="sub">{o('reviewAll')}</p>
        <p className="dim">{o('reviewHint')}</p>
      </AgentMsg>
      <div className="past-list">
        {state.entries.map((e, i) => (
          <PastRow key={entryId(e)} entry={e} index={i} record={records[i]} revealed />
        ))}
      </div>
    </Thread>
  )
}

export function TestThread() {
  const { bank, progress, saveActiveTest } = useApp()
  const { o, t } = useO()
  const [params, setParams] = useSearchParams()
  const [length, setLength] = useState<TestLength>('half')
  const [running, setRunning] = useState<{ entries: QuizEntry[]; length: TestLength; saved?: ActiveReadingTest } | null>(null)
  const [result, setResult] = useState<TestState | null>(null)
  const [round, setRound] = useState(0)
  const active = progress.activeReadingTest
  const restored = useMemo(() => (active ? restoreReadingTest(bank, active) : null), [bank, active])
  const [discarded, setDiscarded] = useState(false)

  useEffect(() => {
    if (active && !restored) {
      setDiscarded(true)
      void saveActiveTest(null)
    }
  }, [active, restored, saveActiveTest])

  const built = useMemo(
    () => ({ half: buildReadingTest(bank, 'half'), full: buildReadingTest(bank, 'full') }),
    [bank, round] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const short = (l: TestLength) => {
    const have = availableCounts(bank, l)
    const want = BLUEPRINT[l]
    return (Object.keys(want) as (keyof typeof want)[]).some((k) => have[k] < want[k])
  }
  const start = useCallback(
    (l: TestLength) => {
      setRunning({ entries: built[l], length: l })
      setRound((r) => r + 1)
    },
    [built]
  )

  // `/test half` and `/test full` start straight away (unless an unfinished test is waiting).
  useEffect(() => {
    const want = TestLength.safeParse(params.get('start'))
    if (!want.success) return
    setParams({}, { replace: true })
    setLength(want.data)
    if (!(active && restored) && built[want.data].length > 0) start(want.data)
  }, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  const onDone = useCallback((s: TestState) => {
    setResult(s)
    setRunning(null)
  }, [])

  if (running) return <Runner entries={running.entries} length={running.length} saved={running.saved} onDone={onDone} />
  if (result) return <Results state={result} onAgain={() => setResult(null)} />

  const resumable = Boolean(active && restored)
  const resume = () => active && restored && setRunning({ entries: restored, length: active.length, saved: active })
  return (
    <Thread
      crumbs={[o('groupTests'), t('testTitle')]}
      composer={{
        placeholder: o('composerIdle'),
        onKey: (k) => {
          if (k !== 'Enter') return false
          if (resumable) resume()
          else if (built[length].length > 0) start(length)
          return true
        }
      }}
    >
      <Typed cmd="/test" />
      <AgentMsg anchor head={t('testTitle')}>
        <p>{t('testIntro')}</p>
        {active && restored && (
          <div className="note">
            <p className="note-head">{t('testResumeTitle', { length: t(active.length === 'half' ? 'testHalf' : 'testFull') })}</p>
            <p className="mono dim">
              {t('testResumeMeta', {
                a: Object.keys(active.answers).length,
                n: active.ids.length,
                m: Math.ceil((DURATION_MS[active.length] - active.elapsedMs) / 60000)
              })}
            </p>
            <div className="actions">
              <button type="button" className="btn primary" onClick={resume}>
                {t('testResume')} <kbd className="key sm">↵</kbd>
              </button>
              <button type="button" className="btn" onClick={() => void saveActiveTest(null)}>
                {t('testDiscard')}
              </button>
            </div>
          </div>
        )}
        {discarded && <p className="dim">{t('testDiscarded')}</p>}
        <fieldset className="radios">
          <legend className="sub">{t('testLengthLabel')}</legend>
          {(['half', 'full'] as const).map((l) => (
            <label key={l} className="radio-row">
              <input type="radio" name="test-length" checked={length === l} onChange={() => setLength(l)} />
              <span className="row-title">{t(l === 'half' ? 'testHalf' : 'testFull')}</span>
              <span className="row-meta mono">{t(l === 'half' ? 'testHalfMeta' : 'testFullMeta', { n: built[l].length })}</span>
            </label>
          ))}
        </fieldset>
        {short(length) && <p className="dim">{t('testShortBank', { n: built[length].length })}</p>}
        <div className="actions">
          <button type="button" className={resumable ? 'btn' : 'btn primary'} disabled={built[length].length === 0} onClick={() => start(length)}>
            {t('testStart')}
            {!resumable && <kbd className="key sm">↵</kbd>}
          </button>
        </div>
      </AgentMsg>
    </Thread>
  )
}
