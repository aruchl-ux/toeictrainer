import type { Band, TopicStat } from '@shared/scoring'
import { Part5Topic, type GrammarTopic } from '@shared/types'
import { t, topicLabel, type Lang } from '../../app/i18n'

interface Props {
  stats: TopicStat[]
  weakest: GrammarTopic[]
  band: Band | null
  lang: Lang
  onDrill(topic: Part5Topic): void
}

export function ProgressView({ stats, weakest, band, lang, onDrill }: Props) {
  return (
    <section>
      <h1>{t(lang, 'progressTitle')}</h1>
      <div className="card">
        {band ? (
          <>
            <h3>{t(lang, 'progressBand', { low: band.low, high: band.high })}</h3>
            <p className="muted">{t(lang, 'progressBandNote')}</p>
          </>
        ) : (
          <p className="muted">{t(lang, 'progressBandNone')}</p>
        )}
      </div>
      {weakest.length > 0 && (
        <div className="card">
          <h3>{t(lang, 'progressWeakest')}</h3>
          <ul>
            {weakest.map((topic) => {
              const p5 = Part5Topic.safeParse(topic)
              return (
                <li key={topic}>
                  {topicLabel(topic, lang)}{' '}
                  {p5.success && (
                    <button type="button" onClick={() => onDrill(p5.data)}>
                      {t(lang, 'progressDrill')}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <div className="card">
        {stats.length === 0 ? (
          <p className="muted">{t(lang, 'progressNoData')}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t(lang, 'progressTopic')}</th>
                <th>{t(lang, 'progressAccuracy')}</th>
                <th>{t(lang, 'progressAvgTime')}</th>
                <th>{t(lang, 'progressAttempts')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.topic}>
                  <td>{topicLabel(s.topic, lang)}</td>
                  <td>{Math.round(s.accuracy * 100)}%</td>
                  <td>{t(lang, 'seconds', { s: Math.round(s.avgMs / 1000) })}</td>
                  <td>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
