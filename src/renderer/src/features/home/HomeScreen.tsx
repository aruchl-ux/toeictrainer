import { Link } from 'react-router'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { topicStats, weakestTopics } from '@shared/scoring'
import { resolveIds } from '@shared/quiz'
import { PART5_TOPICS, Part5Topic } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon, PosterShapes, TopicMark } from '../../app/Ink'
import { P5_COUNT, P6_COUNT } from '../grammar/MixedTestScreen'
import { RecentTests } from './RecentTests'

const TILE_COUNT = 6

export function HomeScreen() {
  const { progress, bank } = useApp()
  const { t, topic } = useT()
  const due = resolveIds(bank, dueIds(progress.leitner, localDate())).length
  const stats = topicStats(progress.grammarAttempts)
  const weakest = weakestTopics(stats.filter((s) => Part5Topic.safeParse(s.topic).success))
  const weakestP5 = weakest.map((tp) => Part5Topic.safeParse(tp)).flatMap((r) => (r.success ? [r.data] : []))

  // Tiles: weakest topics first, then topics that have questions, then the rest.
  const withItems = PART5_TOPICS.filter((tp) => bank.part5.some((i) => i.topic === tp))
  const tiles = [...new Set<Part5Topic>([...weakestP5, ...withItems, ...PART5_TOPICS])].slice(0, TILE_COUNT)

  const focus = weakestP5[0]
  const head = due > 0 ? t('homeHeadReview', { n: due }) : focus ? t('homeHeadDrill') : t('homeHeadStart')
  const lead = due > 0 ? t('homeDue', { n: due }) : focus ? t('homeLeadDrill', { topic: topic(focus) }) : t('homeLeadStart')
  const action =
    due > 0
      ? { to: '/review', label: t('homeStartReview') }
      : focus
        ? { to: `/drill/${focus}`, label: t('progressDrill') }
        : { to: '/topics', label: t('navTopics') }

  return (
    <section className="home">
      <div className="home-poster">
        <PosterShapes />
        <h1 className="poster-head">
          <span className="ink-pink">{t('homeHeadToday')}</span>
          <span className="ink-blue">{head}</span>
        </h1>
        <p className="poster-lead">{lead}</p>
        <div className="poster-actions">
          <Link className="button primary" to={action.to}>
            {action.label}
            <ArrowIcon />
          </Link>
          {due > 0 && (
            <Link className="text-link" to="/topics">
              {t('navTopics')}
              <ArrowIcon />
            </Link>
          )}
        </div>
      </div>

      <div className="home-side">
        <section className="frame frame-blue topic-panel" aria-labelledby="home-topics">
          <h2 id="home-topics" className="panel-title">
            {t('homeChooseTopic')}
          </h2>
          <ul className="tile-grid">
            {tiles.map((tp) => {
              const count = bank.part5.filter((i) => i.topic === tp).length
              return (
                <li key={tp}>
                  {count > 0 ? (
                    <Link className="tile" to={`/drill/${tp}`}>
                      <TopicMark topic={tp} />
                      <span className="tile-name">{topic(tp)}</span>
                    </Link>
                  ) : (
                    <span className="tile tile-empty" aria-disabled="true">
                      <TopicMark topic={tp} />
                      <span className="tile-name">{topic(tp)}</span>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          <Link className="panel-foot" to="/topics">
            {t('homeAllTopics')}
            <ArrowIcon />
          </Link>
        </section>

        <section className="mixed-panel" aria-labelledby="home-mixed">
          <h2 id="home-mixed">{t('mixedTitle')}</h2>
          <p>{t('homeMixedBody', { p5: P5_COUNT, p6: P6_COUNT })}</p>
          <Link className="text-link" to="/mixed">
            {t('homeMixedGo')}
            <ArrowIcon />
          </Link>
        </section>
      </div>

      <section className="home-recent" aria-labelledby="home-recent">
        <h2 id="home-recent" className="panel-title">
          {t('homeRecent')}
        </h2>
        <RecentTests />
        {weakest.length > 0 && (
          <p className="recent-weak">
            <span className="muted">{t('homeWeakest')}:</span>{' '}
            {weakest.map((tp, i) => (
              <span key={tp}>
                {i > 0 && ' · '}
                {Part5Topic.safeParse(tp).success ? <Link to={`/drill/${tp}`}>{topic(tp)}</Link> : topic(tp)}
              </span>
            ))}
          </p>
        )}
      </section>
    </section>
  )
}
