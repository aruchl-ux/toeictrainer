import { Link } from 'react-router'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { topicStats, weakestTopics } from '@shared/scoring'
import { Part5Topic } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'

export function HomeScreen() {
  const { progress } = useApp()
  const { t, topic } = useT()
  const due = dueIds(progress.leitner, localDate()).length
  const weakest = weakestTopics(topicStats(progress.grammarAttempts))

  return (
    <section>
      <h1>{t('homeTitle')}</h1>
      <div className="card">
        <p>{t('homeDue', { n: due })}</p>
        {due > 0 && (
          <Link className="button primary" to="/review">
            {t('homeStartReview')}
          </Link>
        )}
      </div>
      <div className="card">
        <h3>{t('homeWeakest')}</h3>
        {weakest.length === 0 ? (
          <p className="muted">{t('homeNoData')}</p>
        ) : (
          <ul>
            {weakest.map((tp) => (
              <li key={tp}>
                {Part5Topic.safeParse(tp).success ? <Link to={`/drill/${tp}`}>{topic(tp)}</Link> : topic(tp)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
