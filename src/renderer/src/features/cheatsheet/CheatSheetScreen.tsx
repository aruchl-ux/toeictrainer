import { Link, Navigate, useParams } from 'react-router'
import { CHEAT_SHEETS, sheetPoints } from '@shared/cheatsheet'
import { PART5_TOPICS, Part5Topic } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon, TopicMark } from '../../app/Ink'
import { CheatSheetView } from './CheatSheetView'

/** /cheatsheet: one tile per Part 5 topic. */
export function CheatSheetIndexScreen() {
  const { t, topic } = useT()
  const { bank } = useApp()
  const count = (tp: Part5Topic) => {
    const n = CHEAT_SHEETS[tp].entries.length
    const p = sheetPoints(tp, bank).length
    return p ? t('cheatCountPoints', { n, p }) : t('cheatCount', { n })
  }
  return (
    <section className="cheat-index">
      <header className="page-head">
        <h1 className="page-title">{t('cheatTitle')}</h1>
        <p className="page-lead">{t('cheatIntro')}</p>
      </header>
      <ul className="tile-grid tile-grid-wide">
        {PART5_TOPICS.map((tp) => (
          <li key={tp}>
            <Link className="tile" to={`/cheatsheet/${tp}`}>
              <TopicMark topic={tp} />
              <span className="tile-name">{topic(tp)}</span>
              <span className="tile-meta">
                <span className="num">{count(tp)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** /cheatsheet/:topic: the topic's formula cards, with a way back and a way into the drill. */
export function CheatSheetScreen() {
  const parsed = Part5Topic.safeParse(useParams().topic)
  const { bank } = useApp()
  const { t, topic, lang } = useT()
  if (!parsed.success) return <Navigate to="/cheatsheet" replace />
  const tp = parsed.data
  const canDrill = bank.part5.some((i) => i.topic === tp)
  return (
    <section className="cheat-page">
      <Link className="text-link cheat-back" to="/cheatsheet">
        {t('cheatAll')}
      </Link>
      <header className="page-head cheat-page-head">
        <TopicMark topic={tp} className="cheat-page-mark" />
        <h1 className="page-title">{topic(tp)}</h1>
      </header>
      {/* Keyed by topic so the language flip resets when switching sheets. */}
      <CheatSheetView key={tp} sheet={CHEAT_SHEETS[tp]} lang={lang} points={sheetPoints(tp, bank)} />
      <nav className="cheat-foot" aria-label={t('cheatAll')}>
        {canDrill && (
          <Link className="button primary" to={`/drill/${tp}`}>
            {t('cheatDrill')}
            <ArrowIcon />
          </Link>
        )}
        <ul className="cheat-switch">
          {PART5_TOPICS.filter((x) => x !== tp).map((x) => (
            <li key={x}>
              <Link to={`/cheatsheet/${x}`}>{topic(x)}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
