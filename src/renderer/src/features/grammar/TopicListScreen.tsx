import { Link } from 'react-router'
import { topicStats } from '@shared/scoring'
import { PART5_TOPICS } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { TopicMark } from '../../app/Ink'

export function TopicListScreen() {
  const { bank, progress } = useApp()
  const { t, topic } = useT()
  const stats = new Map(topicStats(progress.grammarAttempts).map((s) => [s.topic, s]))
  // Topics with no questions yet (e.g. new topics without a private pack) stay hidden.
  const topics = PART5_TOPICS.filter((tp) => bank.part5.some((i) => i.topic === tp))
  return (
    <section className="topics">
      <header className="page-head">
        <h1 className="page-title">{t('topicsTitle')}</h1>
        <p className="page-lead">{t('topicsIntro')}</p>
      </header>
      <ul className="tile-grid tile-grid-wide">
        {topics.map((tp) => {
          const count = bank.part5.filter((i) => i.topic === tp).length
          const stat = stats.get(tp)
          return (
            <li key={tp} className="tile-with-link">
              <Link className="tile" to={`/drill/${tp}`}>
                <TopicMark topic={tp} />
                <span className="tile-name" id={`tile-name-${tp}`}>
                  {topic(tp)}
                </span>
                <span className="tile-meta">
                  <span className="num">{t('topicsCount', { n: count })}</span>
                  {stat && <span className="num">{t('topicsAccuracy', { p: Math.round(stat.accuracy * 100) })}</span>}
                </span>
              </Link>
              {/* Named "Formulas"; the topic name is its description, so the drill tile keeps the only link named after the topic. */}
              <Link className="text-link tile-link" to={`/cheatsheet/${tp}`} aria-describedby={`tile-name-${tp}`}>
                {t('cheatOpen')}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
