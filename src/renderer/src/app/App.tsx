import { NavLink, Route, Routes } from 'react-router'
import { ContentReviewScreen } from '../features/content-review/ContentReviewScreen'
import { DrillScreen } from '../features/grammar/DrillScreen'
import { MixedTestScreen } from '../features/grammar/MixedTestScreen'
import { TopicListScreen } from '../features/grammar/TopicListScreen'
import { HomeScreen } from '../features/home/HomeScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { ProgressScreen } from '../features/progress/ProgressScreen'
import { ReviewScreen } from '../features/review/ReviewScreen'
import { useApp, useT } from './AppContext'

export function App() {
  const { isDev, saveError } = useApp()
  const { t } = useT()
  return (
    <div className="app">
      <nav className="sidebar">
        <h2>{t('appTitle')}</h2>
        <NavLink to="/" end>
          {t('navHome')}
        </NavLink>
        <NavLink to="/topics">{t('navTopics')}</NavLink>
        <NavLink to="/mixed">{t('navMixed')}</NavLink>
        <NavLink to="/review">{t('navReview')}</NavLink>
        <NavLink to="/progress">{t('navProgress')}</NavLink>
        <NavLink to="/settings">{t('navSettings')}</NavLink>
        {isDev && <NavLink to="/dev/content">Content review</NavLink>}
      </nav>
      <main className="content">
        {saveError && (
          <p className="error" role="alert">
            {t('saveError')}
          </p>
        )}
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/topics" element={<TopicListScreen />} />
          <Route path="/drill/:topic" element={<DrillScreen />} />
          <Route path="/mixed" element={<MixedTestScreen />} />
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          {isDev && <Route path="/dev/content" element={<ContentReviewScreen />} />}
        </Routes>
      </main>
    </div>
  )
}
