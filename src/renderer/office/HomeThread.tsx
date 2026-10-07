import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useApp } from '@renderer/app/AppContext'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { resolveIds } from '@shared/quiz'
import { DURATION_MS } from '@shared/reading'
import { topicStats, weakestTopics } from '@shared/scoring'
import { PART5_TOPICS, Part5Topic } from '@shared/types'
import { Composer } from './Composer'
import { ChartIcon, ChevronRight, DocIcon, GrammarIcon, LayersIcon, ReviewIcon, StopwatchIcon } from './icons'
import { Thread } from './Thread'
import { useO } from './strings'

interface Suggestion {
  icon: ReactNode
  label: string
  meta?: string
  to: string
}

export function HomeThread() {
  const { bank, progress } = useApp()
  const { o, t, skill } = useO()
  const navigate = useNavigate()

  const due = resolveIds(bank, dueIds(progress.leitner, localDate())).length
  const stats = topicStats(progress.grammarAttempts)
  const statOf = new Map(stats.map((s) => [s.topic, s]))
  const weakest = weakestTopics(stats.filter((s) => Part5Topic.safeParse(s.topic).success))
    .map((s) => Part5Topic.parse(s))
  const untouched = PART5_TOPICS.filter((tp) => !statOf.has(tp) && bank.part5.some((i) => i.topic === tp))
  const active = progress.activeReadingTest
  const focus = weakest[0]

  const head = active ? t('testResume') : due > 0 ? o('homeDueHead', { n: due }) : focus ? t('homeHeadDrill') : t('homeHeadStart')
  const lead = active
    ? o('homeLeadTest')
    : due > 0
      ? weakest.length > 0
        ? `${t('homeWeakest')}: ${weakest.map((w) => skill(w)).join(', ')}`
        : t('homeDue', { n: due })
      : focus
        ? t('homeLeadDrill', { topic: skill(focus) })
        : t('homeLeadStart')

  const drills = [...weakest, ...untouched].slice(0, 2)
  const suggestions: Suggestion[] = [
    ...(active
      ? [
          {
            icon: <StopwatchIcon />,
            label: o('sugResume'),
            meta: o('sugResumeMeta', {
              a: Object.keys(active.answers).length,
              n: active.ids.length,
              m: Math.ceil((DURATION_MS[active.length] - active.elapsedMs) / 60000)
            }),
            to: '/test'
          }
        ]
      : []),
    ...(due > 0 ? [{ icon: <ReviewIcon />, label: o('sugReview'), meta: String(due), to: '/review' }] : []),
    ...drills.map((tp) => {
      const s = statOf.get(tp)
      return {
        icon: <GrammarIcon />,
        label: o('sugDrill', { topic: skill(tp) }),
        meta: s ? o('sugDrillMeta', { p: Math.round(s.accuracy * 100) }) : o('sugDrillNew'),
        to: `/drill/${tp}`
      }
    }),
    { icon: <DocIcon />, label: o('sugRead'), to: '/read?format=single' },
    { icon: <LayersIcon />, label: o('sugMixed'), to: '/mixed' },
    { icon: <ChartIcon />, label: o('sugStatus'), to: '/status' }
  ].slice(0, 5)

  return (
    <Thread
      crumbs={[o('home')]}
      centered
      composer={{ placeholder: o('composerIdle') }}
    >
      <div className="home">
        <h1 className="home-head">{head}</h1>
        <p className="home-lead">{lead}</p>
        <Composer
          big
          placeholder={o('composerIdle')}
          onKey={(k) => {
            if (k !== 'Enter' || suggestions.length === 0) return false
            navigate(suggestions[0].to)
            return true
          }}
        />
        <section className="suggest" aria-labelledby="suggest-head">
          <h2 id="suggest-head" className="sub">
            {o('suggested')}
          </h2>
          <ul className="files">
            {suggestions.map((sg, i) => (
              <li key={sg.to + i}>
                <button type="button" className="row-btn" onClick={() => navigate(sg.to)}>
                  {sg.icon}
                  <span className="row-title">{sg.label}</span>
                  {sg.meta && <span className={/^\d+$/.test(sg.meta) ? 'row-meta mono' : 'row-meta'}>{sg.meta}</span>}
                  {i === 0 ? <kbd className="key sm">↵</kbd> : <ChevronRight />}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Thread>
  )
}
