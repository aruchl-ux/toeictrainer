import { useEffect } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { resolveIds } from '@shared/quiz'
import { ContentReviewScreen } from '../features/content-review/ContentReviewScreen'
import { DrillScreen } from '../features/grammar/DrillScreen'
import { MixedTestScreen } from '../features/grammar/MixedTestScreen'
import { ReadingTestScreen } from '../features/reading-test/ReadingTestScreen'
import { TopicListScreen } from '../features/grammar/TopicListScreen'
import { ReadingScreen } from '../features/reading/ReadingScreen'
import { HomeScreen } from '../features/home/HomeScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { ProgressScreen } from '../features/progress/ProgressScreen'
import { ReviewScreen } from '../features/review/ReviewScreen'
import { useApp, useT } from './AppContext'
import { AppMark, ArrowIcon, InkDefs, LegendMark } from './Ink'

function DueBox() {
  const { progress, bank } = useApp()
  const { t } = useT()
  const due = resolveIds(bank, dueIds(progress.leitner, localDate())).length
  if (due === 0) return <p className="rail-due rail-due-none">{t('railDueNone')}</p>
  return (
    <Link className="rail-due" to="/review">
      <span>{t('railDue', { n: due })}</span>
      <span className="rail-due-go">
        {t('homeStartReview')}
        <ArrowIcon />
      </span>
    </Link>
  )
}

export function App() {
  const { isDev, saveError, settings } = useApp()
  const { t } = useT()

  useEffect(() => {
    document.documentElement.lang = settings.language
  }, [settings.language])

  // Ctrl+Shift+M flips to the Office view (and back from there).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && !e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        void window.api.app.setMode('office')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app" data-lang={settings.language}>
      <InkDefs />
      {/* While a question is on screen (.quiz), CSS dims this rail so the question owns the page. */}
      <aside className="rail">
        <Link to="/" className="brand" aria-label={t('appTitle')}>
          <AppMark className="brand-mark" />
          <span className="brand-name" aria-hidden="true">
            TOEIC
            <br />
            Trainer
          </span>
        </Link>
        <nav className="rail-nav">
          <NavLink to="/" end>
            {t('navHome')}
          </NavLink>
          <NavLink to="/topics">{t('navTopics')}</NavLink>
          <NavLink to="/reading">{t('navReading')}</NavLink>
          <NavLink to="/mixed">{t('navMixed')}</NavLink>
          <NavLink to="/reading-test">{t('navReadingTest')}</NavLink>
          <NavLink to="/review">{t('navReview')}</NavLink>
          <NavLink to="/progress">{t('navProgress')}</NavLink>
          <NavLink to="/settings">{t('navSettings')}</NavLink>
          {isDev && <NavLink to="/dev/content">Content review</NavLink>}
        </nav>
        <ul className="rail-legend">
          <li>
            <LegendMark kind="right" />
            {t('legendRight')}
          </li>
          <li>
            <LegendMark kind="wrong" />
            {t('legendWrong')}
          </li>
          <li>
            <LegendMark kind="now" />
            {t('legendNow')}
          </li>
        </ul>
        <DueBox />
      </aside>
      <main className="content">
        {saveError && (
          <p className="save-error" role="alert">
            {t('saveError')}
          </p>
        )}
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/topics" element={<TopicListScreen />} />
          <Route path="/reading" element={<ReadingScreen />} />
          <Route path="/drill/:topic" element={<DrillScreen />} />
          <Route path="/mixed" element={<MixedTestScreen />} />
          <Route path="/reading-test" element={<ReadingTestScreen />} />
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          {isDev && <Route path="/dev/content" element={<ContentReviewScreen />} />}
        </Routes>
      </main>
    </div>
  )
}
