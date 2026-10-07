import { useApp, useT } from '../../app/AppContext'

/** The last three mixed-test results, newest first, as ruled rows with an ink bar. */
export function RecentTests() {
  const { progress } = useApp()
  const { lang, t } = useT()
  const recent = progress.mixedTests.slice(-3).reverse()
  const dateFmt = new Intl.DateTimeFormat(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' })

  if (recent.length === 0) return <p className="muted">{t('homeRecentNone')}</p>
  return (
    <ol className="recent-list">
      {recent.map((r) => (
        <li key={r.at}>
          <time dateTime={r.at}>{dateFmt.format(new Date(r.at))}</time>
          <span className="recent-score">{t('homeRecentRow', { c: r.correct, n: r.total })}</span>
          <span className="recent-bar" aria-hidden="true">
            <span style={{ width: `${r.total ? Math.round((r.correct / r.total) * 100) : 0}%` }} />
          </span>
        </li>
      ))}
    </ol>
  )
}
