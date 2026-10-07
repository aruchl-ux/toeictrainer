import { Link } from 'react-router'
import { topicStats } from '@shared/scoring'
import { PART5_TOPICS } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { TopicMark } from '../../app/Ink'

export function TopicListScreen() {
  const { bank, progress } = useApp()
  const { t, topic } = useT()
  const stats = new Map(topicStats(progress.grammarAttempts).map((s) => [s.topic, s]))
  return (
    <section className="topics">
      <header className="page-head">
        <h1 className="page-title">{t('topicsTitle')}</h1>
        <p className="page-lead">{t('topicsIntro')}</p>
      </header>
      <ul className="tile-grid tile-grid-wide">
        {PART5_TOPICS.map((tp) => {
          const count = bank.part5.filter((i) => i.topic === tp).length
          const stat = stats.get(tp)
          const body = (
            <>
              <TopicMark topic={tp} />
              <span className="tile-name">{topic(tp)}</span>
              <span className="tile-meta">
                <span className="num">{t('topicsCount', { n: count })}</span>
                {stat && <span className="num">{t('topicsAccuracy', { p: Math.round(stat.accuracy * 100) })}</span>}
              </span>
            </>
          )
          return (
            <li key={tp}>
              {count > 0 ? (
                <Link className="tile" to={`/drill/${tp}`}>
                  {body}
                </Link>
              ) : (
                <div className="tile tile-empty" aria-disabled="true">
                  {body}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
