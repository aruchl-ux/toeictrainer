import { useCallback, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { useApp } from '@renderer/app/AppContext'
import { P5_COUNT, P6_COUNT } from '@renderer/features/grammar/MixedTestScreen'
import type { AnswerRecord } from '@renderer/features/grammar/quizReducer'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { flattenPart7, pickMixedTest, pickTopicDrill, resolveIds, shuffle, shuffleChoices, type QuizEntry } from '@shared/quiz'
import { topicStats, weakestTopics } from '@shared/scoring'
import { PART7_FORMATS, PART7_QTYPES, Part5Topic, Part7Format, Part7QType, type Part7Set } from '@shared/types'
import type { Command } from './commands'
import { ChevronRight, DocsIcon, ShuffleIcon } from './icons'
import { QuizThread } from './QuizThread'
import { AgentMsg, UserMsg } from './Task'
import { Thread } from './Thread'
import { useO } from './strings'

const FORMAT_KEY = { single: 'readingSingle', double: 'readingDouble', triple: 'readingTriple' } as const

/** The learner's command echoed at the top of a thread, as if they had typed it. */
export const Typed = ({ cmd }: { cmd: string }) => (
  <UserMsg>
    <code className="cmd">{cmd}</code>
  </UserMsg>
)

export function DrillThread() {
  const parsed = Part5Topic.safeParse(useParams().topic)
  const topic = parsed.success ? parsed.data : null
  const { bank, progress } = useApp()
  const { o, t, skill } = useO()
  const navigate = useNavigate()
  const [run, setRun] = useState(0)
  const entries = useMemo(
    () => (topic ? pickTopicDrill(bank, topic, 10) : []),
    // `run` reshuffles a fresh drill.
    [bank, topic, run] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const again = useCallback(() => setRun((r) => r + 1), [])
  const commands = useMemo<Command[]>(() => [{ name: 'again', hint: o('cmdAgain'), run: again }], [again, o])

  if (!topic) return <Navigate to="/" replace />
  const weakest = weakestTopics(topicStats(progress.grammarAttempts))
    .map((s) => Part5Topic.safeParse(s))
    .flatMap((r) => (r.success && r.data !== topic ? [r.data] : []))[0]

  return (
    <QuizThread
      key={`${topic}-${run}`}
      entries={entries}
      mode="instant"
      pace={20}
      crumbs={[o('groupPart5'), skill(topic)]}
      intro={<Typed cmd={`/drill ${topic}`} />}
      commands={commands}
      onEnterDone={again}
      doneActions={
        <>
          <button type="button" className="btn primary" onClick={again}>
            {t('quizAgain')} <kbd className="key sm">↵</kbd>
          </button>
          {weakest && (
            <button type="button" className="btn" onClick={() => navigate(`/drill/${weakest}`)}>
              {o('nextWeakest', { topic: skill(weakest) })}
            </button>
          )}
        </>
      }
    />
  )
}

export function ReviewThread() {
  const { bank, progress } = useApp()
  const { t } = useO()
  // Freeze the queue when the thread opens so answering does not reshuffle it mid-session.
  const [entries] = useState(() => shuffleChoices(shuffle(resolveIds(bank, dueIds(progress.leitner, localDate())))))

  if (entries.length === 0) {
    return (
      <Thread crumbs={[t('navReview')]} composer={{ placeholder: t('reviewNothing') }}>
        <Typed cmd="/review" />
        <AgentMsg anchor head={t('reviewNothing')}>
          {null}
        </AgentMsg>
      </Thread>
    )
  }
  return <QuizThread entries={entries} mode="instant" crumbs={[t('navReview')]} intro={<Typed cmd="/review" />} />
}

function accuracyByType(attempts: { qtype: Part7QType; correct: boolean }[]): Map<Part7QType, number> {
  const acc = new Map<Part7QType, [number, number]>()
  for (const a of attempts) {
    const [c, n] = acc.get(a.qtype) ?? [0, 0]
    acc.set(a.qtype, [c + (a.correct ? 1 : 0), n + 1])
  }
  return new Map([...acc].map(([k, [c, n]]) => [k, c / n]))
}

export function ReadThread() {
  const { bank, progress } = useApp()
  const { o, t, skill } = useO()
  const [params, setParams] = useSearchParams()
  const fParsed = Part7Format.safeParse(params.get('format'))
  const format = fParsed.success ? fParsed.data : null
  const tParsed = Part7QType.safeParse(params.get('type'))
  const type = tParsed.success ? tParsed.data : null
  const [current, setCurrent] = useState<Part7Set | null>(null)
  const [run, setRun] = useState(0)

  const visible = bank.part7.filter((s) => (!format || s.format === format) && (!type || s.questions.some((q) => q.type === type)))
  const random = useCallback(
    (pool: Part7Set[]) => {
      if (pool.length === 0) return
      const others = pool.length > 1 && current ? pool.filter((s) => s.id !== current.id) : pool
      setCurrent(others[Math.floor(Math.random() * others.length)])
      setRun((r) => r + 1)
    },
    [current]
  )
  const entries = useMemo<QuizEntry[]>(
    () => (current ? shuffleChoices(flattenPart7(current)) : []),
    [current, run] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const commands = useMemo<Command[]>(
    () => [
      { name: 'random', hint: o('cmdRandom'), run: () => random(visible) },
      ...(current ? [{ name: 'again', hint: o('cmdAgain'), run: () => setRun((r) => r + 1) }] : [])
    ],
    [current, visible, random, o]
  )
  const filterLabel = format ? t(FORMAT_KEY[format]) : o('readingAll')
  const cmd = `/read${format ? ` ${format}` : ''}`

  if (current) {
    const sameFormat = bank.part7.filter((s) => s.format === current.format && (!type || s.questions.some((q) => q.type === type)))
    return (
      <QuizThread
        key={`${current.id}-${run}`}
        entries={entries}
        mode="instant"
        crumbs={[o('groupReading'), t(FORMAT_KEY[current.format]), current.docs.map((d) => d.title).join(' · ')]}
        intro={<Typed cmd={`${cmd} ${current.id}`} />}
        commands={commands}
        onEnterDone={() => random(sameFormat)}
        doneActions={
          <>
            <button type="button" className="btn primary" onClick={() => random(sameFormat)}>
              {o('anotherSet')} <kbd className="key sm">↵</kbd>
            </button>
            <button type="button" className="btn" onClick={() => setRun((r) => r + 1)}>
              {t('quizAgain')}
            </button>
            <button type="button" className="btn" onClick={() => setCurrent(null)}>
              {o('backToSets')}
            </button>
          </>
        }
      />
    )
  }

  const acc = accuracyByType(progress.readingAttempts)
  const types = [...PART7_QTYPES].sort((a, b) => (acc.get(a) ?? 2) - (acc.get(b) ?? 2))
  const setParam = (key: 'type' | 'format', value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <Thread
      crumbs={[o('groupReading'), filterLabel]}
      composer={{
        placeholder: o('composerPick'),
        commands,
        onKey: (k) => {
          if (k !== 'Enter') return false
          random(visible)
          return true
        }
      }}
    >
      <Typed cmd={cmd} />
      <AgentMsg anchor head={o('pickIntro')}>
        <div className="chips" role="group" aria-label={t('readingAllTypes')}>
          <button type="button" className={format ? 'fchip' : 'fchip on'} aria-pressed={!format} onClick={() => setParam('format', null)}>
            {o('readingAll')}
          </button>
          {PART7_FORMATS.map((f) => (
            <button key={f} type="button" className={format === f ? 'fchip on' : 'fchip'} aria-pressed={format === f} onClick={() => setParam('format', f)}>
              {t(FORMAT_KEY[f])}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label={t('readingAllTypes')}>
          <button type="button" className={type ? 'fchip' : 'fchip on'} aria-pressed={!type} onClick={() => setParam('type', null)}>
            {t('readingAllTypes')}
          </button>
          {types.map((ty) => (
            <button key={ty} type="button" className={type === ty ? 'fchip on' : 'fchip'} aria-pressed={type === ty} onClick={() => setParam('type', ty)}>
              {skill(ty)}
              {acc.has(ty) && <span className="mono dim"> {Math.round((acc.get(ty) ?? 0) * 100)}%</span>}
            </button>
          ))}
        </div>
        {visible.length === 0 ? (
          <p className="dim">{o('pickNone')}</p>
        ) : (
          <>
            <button type="button" className="row-btn random" onClick={() => random(visible)}>
              <ShuffleIcon />
              <span className="row-title">{o('pickRandom')}</span>
              <span className="row-meta mono">↵</span>
            </button>
            <ul className="files">
              {visible.map((set) => (
                <li key={set.id}>
                  <button type="button" className="row-btn" onClick={() => setCurrent(set)}>
                    <DocsIcon />
                    <span className="row-title">{set.docs.map((d) => d.title).join(' · ')}</span>
                    <span className="row-meta">
                      <span className="mono">{set.id}</span> · {t('readingQuestions', { n: set.questions.length })}
                    </span>
                    <ChevronRight />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </AgentMsg>
    </Thread>
  )
}

export function MixedThread() {
  const { bank, progress, recordMixedTest } = useApp()
  const { o, t, lang } = useO()
  const [entries, setEntries] = useState<QuizEntry[] | null>(null)
  const [run, setRun] = useState(0)
  const startedAt = useRef(0)
  const start = useCallback(() => {
    startedAt.current = Date.now()
    setEntries(pickMixedTest(bank, Math.random, P5_COUNT, P6_COUNT))
    setRun((r) => r + 1)
  }, [bank])
  const onFinish = useCallback(
    (records: AnswerRecord[]) => {
      void recordMixedTest({
        at: new Date().toISOString(),
        correct: records.filter((r) => r.correct).length,
        total: records.length,
        ms: Date.now() - startedAt.current
      })
    },
    [recordMixedTest]
  )
  const commands = useMemo<Command[]>(() => [{ name: 'again', hint: o('cmdAgain'), run: start }], [start, o])

  if (entries) {
    return (
      <QuizThread
        key={run}
        entries={entries}
        mode="deferred"
        pace={20}
        crumbs={[o('groupTests'), t('navMixed')]}
        intro={<Typed cmd="/mixed" />}
        onFinish={onFinish}
        commands={commands}
        doneActions={
          <button type="button" className="btn primary" onClick={start}>
            {t('quizAgain')}
          </button>
        }
      />
    )
  }

  const recent = progress.mixedTests.slice(-3).reverse()
  const dateFmt = new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' })
  return (
    <Thread
      crumbs={[o('groupTests'), t('navMixed')]}
      composer={{
        placeholder: o('composerIdle'),
        commands,
        onKey: (k) => {
          if (k !== 'Enter') return false
          start()
          return true
        }
      }}
    >
      <Typed cmd="/mixed" />
      <AgentMsg anchor head={t('mixedTitle')}>
        <p>{t('mixedIntro', { p5: P5_COUNT, p6: P6_COUNT })}</p>
        <p className="sub">{t('homeRecent')}</p>
        {recent.length === 0 ? (
          <p className="dim">{t('homeRecentNone')}</p>
        ) : (
          <ul className="table-rows">
            {recent.map((r) => (
              <li key={r.at}>
                <span className="mono dim">{dateFmt.format(new Date(r.at))}</span>
                <span>{t('homeRecentRow', { c: r.correct, n: r.total })}</span>
                <span className="meter" aria-hidden="true">
                  <span style={{ width: `${r.total ? Math.round((r.correct / r.total) * 100) : 0}%` }} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="actions">
          <button type="button" className="btn primary" onClick={start} disabled={bank.part5.length === 0}>
            {t('mixedStart')} <kbd className="key sm">↵</kbd>
          </button>
        </div>
      </AgentMsg>
    </Thread>
  )
}
