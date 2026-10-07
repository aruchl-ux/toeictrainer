import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { useApp } from '@renderer/app/AppContext'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { resolveIds } from '@shared/quiz'
import { STATS_WINDOW, topicStats } from '@shared/scoring'
import { PART5_TOPICS, PART7_FORMATS, type Part7Format } from '@shared/types'
import { ChartIcon, ComposeIcon, DocsIcon, FolderIcon, GrammarIcon, ReviewIcon, SlidersIcon, StopwatchIcon, SwapIcon } from './icons'
import { useO } from './strings'

const FORMAT_KEY = { single: 'readingSingle', double: 'readingDouble', triple: 'readingTriple' } as const

/** Recent accuracy as a diff stat: +right −wrong over the last attempts. Signs carry it, not color alone. */
function Diff({ results }: { results: boolean[] }) {
  if (results.length === 0) return null
  const recent = results.slice(-STATS_WINDOW)
  const c = recent.filter(Boolean).length
  return (
    <span className="diff mono" aria-label={`${c}/${recent.length}`}>
      <span className="add">+{c}</span>
      <span className="del">−{recent.length - c}</span>
    </span>
  )
}

function Row({ to, icon, label, meta, title }: { to: string; icon?: ReactNode; label: string; meta?: ReactNode; title?: string }) {
  const loc = useLocation()
  const here = loc.pathname + loc.search
  const active = to === '/' ? here === '/' : here === to || (!to.includes('?') && loc.pathname === to)
  return (
    <li>
      <Link to={to} className={active ? 'srow on' : 'srow'} aria-current={active ? 'page' : undefined} title={title ?? label}>
        {icon}
        <span className="srow-label">{label}</span>
        {meta}
      </Link>
    </li>
  )
}

export function Sidebar() {
  const { bank, progress } = useApp()
  const { o, t, skill } = useO()
  const due = resolveIds(bank, dueIds(progress.leitner, localDate())).length

  const byTopic = new Map<string, boolean[]>()
  for (const a of progress.grammarAttempts) byTopic.set(a.topic, [...(byTopic.get(a.topic) ?? []), a.correct])
  const formatOf = new Map(bank.part7.map((s) => [s.id, s.format]))
  const byFormat = new Map<Part7Format, boolean[]>()
  for (const a of progress.readingAttempts) {
    const f = formatOf.get(a.itemId.split('#')[0])
    if (f) byFormat.set(f, [...(byFormat.get(f) ?? []), a.correct])
  }
  // Part 5 folds to the open topic plus the weakest practised ones, so Reading and Tests stay in the first view.
  const loc = useLocation()
  const [allTopics, setAllTopics] = useState(false)
  const withItems = PART5_TOPICS.filter((tp) => bank.part5.some((i) => i.topic === tp))
  const openTopic = withItems.find((tp) => loc.pathname === `/drill/${tp}`)
  const weakFirst = topicStats(progress.grammarAttempts)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((s) => s.topic)
    .filter((tp): tp is (typeof withItems)[number] => (withItems as string[]).includes(tp))
  const short = [...new Set([...(openTopic ? [openTopic] : []), ...weakFirst, ...withItems])].slice(0, 4)
  const shown = allTopics ? withItems : withItems.filter((tp) => short.includes(tp))

  const lastMixed = progress.mixedTests[progress.mixedTests.length - 1]
  const active = progress.activeReadingTest

  return (
    <nav className="sidebar" aria-label={o('workspace')}>
      <div className="side-top">
        <span className="workspace">
          <FolderIcon />
          <span>{o('workspace')}</span>
        </span>
        <Link to="/" className="new-thread">
          <ComposeIcon />
          <span>{o('newThread')}</span>
          <kbd className="key sm">Ctrl N</kbd>
        </Link>
      </div>
      <div className="side-scroll">
        <ul className="srows">
          <Row to="/review" icon={<ReviewIcon />} label={t('navReview')} meta={due > 0 ? <span className="badge mono">{due}</span> : undefined} />
          <Row to="/status" icon={<ChartIcon />} label={o('status')} />
        </ul>

        <p className="side-group">
          <GrammarIcon />
          {o('groupPart5')}
        </p>
        <ul className="srows">
          {shown.map((tp) => (
            <Row key={tp} to={`/drill/${tp}`} label={skill(tp)} meta={<Diff results={byTopic.get(tp) ?? []} />} />
          ))}
          {withItems.length > short.length && (
            <li>
              <button type="button" className="srow more" aria-expanded={allTopics} onClick={() => setAllTopics((v) => !v)}>
                <span className="srow-label">{allTopics ? o('fewerTopics') : o('allTopics', { n: withItems.length })}</span>
              </button>
            </li>
          )}
        </ul>

        <p className="side-group">
          <DocsIcon />
          {o('groupReading')}
        </p>
        <ul className="srows">
          {PART7_FORMATS.filter((f) => bank.part7.some((s) => s.format === f)).map((f) => (
            <Row key={f} to={`/read?format=${f}`} label={t(FORMAT_KEY[f])} meta={<Diff results={byFormat.get(f) ?? []} />} />
          ))}
        </ul>

        <p className="side-group">
          <StopwatchIcon />
          {o('groupTests')}
        </p>
        <ul className="srows">
          <Row
            to="/mixed"
            label={t('navMixed')}
            meta={lastMixed ? <span className="smeta mono">{lastMixed.correct}/{lastMixed.total}</span> : undefined}
          />
          <Row
            to="/test"
            label={t('navReadingTest')}
            meta={
              active ? (
                <span className="smeta mono running">
                  <span className="pulse" aria-hidden="true" />
                  {Object.keys(active.answers).length}/{active.ids.length}
                </span>
              ) : undefined
            }
          />
        </ul>
      </div>
      <div className="side-foot">
        <ul className="srows">
          <Row to="/settings" icon={<SlidersIcon />} label={t('navSettings')} />
        </ul>
        <button type="button" className="srow" onClick={() => void window.api.app.setMode('trainer')} title={`${o('viewSwitch')} (Ctrl+Shift+M)`}>
          <SwapIcon />
          <span className="srow-label">{o('viewSwitch')}</span>
        </button>
      </div>
    </nav>
  )
}
