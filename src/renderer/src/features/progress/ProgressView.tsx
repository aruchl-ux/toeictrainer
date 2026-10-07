import type { Band, TopicStat } from '@shared/scoring'
import { Part5Topic, type GrammarTopic, type Part7QType } from '@shared/types'
import { skillLabel, t, topicLabel, type Lang } from '../../app/i18n'
import { ArrowIcon, RestShapes, TopicMark } from '../../app/Ink'

interface Props {
  stats: TopicStat[]
  weakest: GrammarTopic[]
  band: Band | null
  bandSource: 'test' | 'mixed' | null
  readingStats: TopicStat[]
  lang: Lang
  onDrill(topic: Part5Topic): void
  onDrillReading(type: Part7QType): void
}

function StatsTable({ stats, lang, onDrill }: { stats: TopicStat[]; lang: Lang; onDrill?: (topic: TopicStat['topic']) => void }) {
  return (
    <table className="stats">
      <thead>
        <tr>
          <th scope="col">{t(lang, 'progressTopic')}</th>
          <th scope="col">{t(lang, 'progressAccuracy')}</th>
          <th scope="col" className="r">
            {t(lang, 'progressAvgTime')}
          </th>
          <th scope="col" className="r">
            {t(lang, 'progressAttempts')}
          </th>
          {onDrill && <td />}
        </tr>
      </thead>
      <tbody>
        {stats.map((s) => {
          const pct = Math.round(s.accuracy * 100)
          return (
            <tr key={s.topic}>
              <th scope="row">{skillLabel(s.topic, lang)}</th>
              <td>
                <span className="acc">
                  <span className="acc-bar" aria-hidden="true">
                    <span className={pct < 60 ? 'low' : ''} style={{ width: `${pct}%` }} />
                  </span>
                  <span className="num">{pct}%</span>
                </span>
              </td>
              {/* avgMs is 0 when every attempt came from an untimed test: show a dash, not "0s". */}
              <td className="r num">{s.avgMs > 0 ? t(lang, 'seconds', { s: Math.round(s.avgMs / 1000) }) : '—'}</td>
              <td className="r num">{s.count}</td>
              {onDrill && (
                <td className="r">
                  <button type="button" className="small" onClick={() => onDrill(s.topic)}>
                    {t(lang, 'progressDrill')}
                    <ArrowIcon />
                  </button>
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function ProgressView({ stats, weakest, band, bandSource, readingStats, lang, onDrill, onDrillReading }: Props) {
  return (
    <section className="progress">
      <header className="page-head">
        <h1 className="page-title">{t(lang, 'progressTitle')}</h1>
      </header>

      <div className="progress-top">
        <div className="band-panel">
          {band ? (
            <>
              <h2>{t(lang, 'progressBand', { low: band.low, high: band.high })}</h2>
              <p>{t(lang, bandSource === 'test' ? 'progressBandNoteTest' : 'progressBandNote')}</p>
            </>
          ) : (
            <p className="band-none">{t(lang, 'progressBandNone')}</p>
          )}
        </div>

        {weakest.length > 0 && (
          <section className="frame frame-pink weak-panel" aria-labelledby="progress-weak">
            <h2 id="progress-weak" className="panel-title">
              {t(lang, 'progressWeakest')}
            </h2>
            <ul className="weak-list">
              {weakest.map((topic) => {
                const p5 = Part5Topic.safeParse(topic)
                return (
                  <li key={topic}>
                    <TopicMark topic={topic} />
                    <span className="weak-name">{topicLabel(topic, lang)}</span>
                    {p5.success && (
                      <button type="button" className="small" onClick={() => onDrill(p5.data)}>
                        {t(lang, 'progressDrill')}
                        <ArrowIcon />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>

      {stats.length === 0 ? (
        <div className="rest">
          <RestShapes />
          <p>{t(lang, 'progressNoData')}</p>
        </div>
      ) : (
        <StatsTable stats={stats} lang={lang} />
      )}

      {readingStats.length > 0 && (
        <>
          <h2 className="panel-title">{t(lang, 'progressReading')}</h2>
          <StatsTable stats={readingStats} lang={lang} onDrill={(topic) => onDrillReading(topic as Part7QType)} />
        </>
      )}
    </section>
  )
}
