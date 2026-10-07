import { useNavigate } from 'react-router'
import { useApp } from '@renderer/app/AppContext'
import { latestBand, topicStats, weakestTopics, type TopicStat } from '@shared/scoring'
import { Part5Topic, type Skill } from '@shared/types'
import { ChevronRight } from './icons'
import { AgentMsg } from './Task'
import { Thread } from './Thread'
import { Typed } from './threads'
import { useO } from './strings'

function StatTable({ stats, drillPath }: { stats: TopicStat[]; drillPath(s: Skill): string | null }) {
  const { t, skill } = useO()
  const navigate = useNavigate()
  return (
    <table className="grid stats">
      <thead>
        <tr>
          <th scope="col">{t('progressTopic')}</th>
          <th scope="col" colSpan={2}>
            {t('progressAccuracy')}
          </th>
          <th scope="col" className="r">
            {t('progressAvgTime')}
          </th>
          <th scope="col" className="r">
            {t('progressAttempts')}
          </th>
          <th scope="col" />
        </tr>
      </thead>
      <tbody>
        {stats.map((s) => {
          const pct = Math.round(s.accuracy * 100)
          const path = drillPath(s.topic)
          return (
            <tr key={s.topic} className={pct < 60 ? 'weak' : undefined}>
              <th scope="row">{skill(s.topic)}</th>
              <td className="mono r">{pct}%</td>
              <td className="bar-cell">
                <span className="meter" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </span>
              </td>
              {/* avgMs is 0 when every attempt came from an untimed test: a dash, not "0s". */}
              <td className="mono r">{s.avgMs > 0 ? `${(s.avgMs / 1000).toFixed(1)}s` : '—'}</td>
              <td className="mono r">{s.count}</td>
              <td className="r">
                {path && (
                  <button type="button" className="icon-btn sm" aria-label={`${t('progressDrill')}: ${skill(s.topic)}`} onClick={() => navigate(path)}>
                    <ChevronRight />
                  </button>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function StatusThread() {
  const { progress } = useApp()
  const { o, t, lang, skill } = useO()
  const navigate = useNavigate()
  const stats = topicStats(progress.grammarAttempts)
  const readingStats = topicStats(progress.readingAttempts.map((a) => ({ topic: a.qtype, correct: a.correct, ms: a.ms })))
  const weakest = weakestTopics(stats)
  const band = latestBand(progress)
  const dateFmt = new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' })
  const recent = [
    ...progress.mixedTests.map((m) => ({ at: m.at, label: o('statusMixedRow'), c: m.correct, n: m.total })),
    ...progress.readingTests.map((r) => ({
      at: r.at,
      label: o('statusTestRow', { length: t(r.length === 'half' ? 'testHalf' : 'testFull') }),
      c: r.parts.p5.correct + r.parts.p6.correct + r.parts.p7.correct,
      n: r.parts.p5.total + r.parts.p6.total + r.parts.p7.total
    }))
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5)

  return (
    <Thread crumbs={[o('status')]} composer={{ placeholder: o('composerIdle') }}>
      <Typed cmd="/status" />
      <AgentMsg anchor head={o('statusHead')}>
        <div className="note">
          {band ? (
            <>
              <p className="note-head">{t('progressBand', { low: band.band.low, high: band.band.high })}</p>
              <p className="dim">{t(band.source === 'test' ? 'progressBandNoteTest' : 'progressBandNote')}</p>
            </>
          ) : (
            <p className="dim">{t('progressBandNone')}</p>
          )}
        </div>

        {weakest.length > 0 && (
          <>
            <p className="sub">{t('progressWeakest')}</p>
            <ul className="files">
              {weakest.map((w) => {
                const p5 = Part5Topic.safeParse(w)
                return (
                  <li key={w}>
                    {p5.success ? (
                      <button type="button" className="row-btn" onClick={() => navigate(`/drill/${p5.data}`)}>
                        <span className="row-title">{skill(w)}</span>
                        <span className="row-meta mono">/drill {w}</span>
                        <ChevronRight />
                      </button>
                    ) : (
                      <span className="row-btn static">
                        <span className="row-title">{skill(w)}</span>
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}

        <p className="sub">{o('statusGrammar')}</p>
        {stats.length === 0 ? (
          <p className="dim">{t('progressNoData')}</p>
        ) : (
          <StatTable stats={stats} drillPath={(s) => (Part5Topic.safeParse(s).success ? `/drill/${s}` : null)} />
        )}

        {readingStats.length > 0 && (
          <>
            <p className="sub">{o('statusReading')}</p>
            <StatTable stats={readingStats} drillPath={(s) => `/read?type=${s}`} />
          </>
        )}

        {recent.length > 0 && (
          <>
            <p className="sub">{o('statusRecent')}</p>
            <ul className="table-rows">
              {recent.map((r) => (
                <li key={r.at}>
                  <span className="mono dim">{dateFmt.format(new Date(r.at))}</span>
                  <span>
                    {r.label} · <span className="mono">{r.c}/{r.n}</span>
                  </span>
                  <span className="meter" aria-hidden="true">
                    <span style={{ width: `${r.n ? Math.round((r.c / r.n) * 100) : 0}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </AgentMsg>
    </Thread>
  )
}
