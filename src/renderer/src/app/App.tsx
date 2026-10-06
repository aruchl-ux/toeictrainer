import { NavLink, Route, Routes } from 'react-router'
import { DrillScreen } from '../features/grammar/DrillScreen'
import { TopicListScreen } from '../features/grammar/TopicListScreen'
import { HomeScreen } from '../features/home/HomeScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { ProgressScreen } from '../features/progress/ProgressScreen'
import { ReviewScreen } from '../features/review/ReviewScreen'
import { useT } from './AppContext'

export function App() {
  const { t } = useT()
  return (
    <div className="app">
      <nav className="sidebar">
        <h2>{t('appTitle')}</h2>
        <NavLink to="/" end>
          {t('navHome')}
        </NavLink>
        <NavLink to="/topics">{t('navTopics')}</NavLink>
        <NavLink to="/review">{t('navReview')}</NavLink>
        <NavLink to="/progress">{t('navProgress')}</NavLink>
        <NavLink to="/settings">{t('navSettings')}</NavLink>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/topics" element={<TopicListScreen />} />
          <Route path="/drill/:topic" element={<DrillScreen />} />
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>
    </div>
  )
}
