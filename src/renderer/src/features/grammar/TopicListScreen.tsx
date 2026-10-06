import { Link } from 'react-router'
import { PART5_TOPICS } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'

export function TopicListScreen() {
  const { bank } = useApp()
  const { t, topic } = useT()
  return (
    <section>
      <h1>{t('topicsTitle')}</h1>
      <div className="topic-grid">
        {PART5_TOPICS.map((tp) => {
          const count = bank.part5.filter((i) => i.topic === tp).length
          const body = (
            <div className="card">
              <strong>{topic(tp)}</strong>
              <div className="muted">{t('topicsCount', { n: count })}</div>
            </div>
          )
          return count > 0 ? (
            <Link key={tp} to={`/drill/${tp}`}>
              {body}
            </Link>
          ) : (
            <div key={tp} aria-disabled="true" style={{ opacity: 0.5 }}>
              {body}
            </div>
          )
        })}
      </div>
    </section>
  )
}
