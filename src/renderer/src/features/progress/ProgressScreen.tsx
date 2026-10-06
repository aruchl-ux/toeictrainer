import { useNavigate } from 'react-router'
import { estimateBand, topicStats, weakestTopics } from '@shared/scoring'
import { Part5Topic } from '@shared/types'
import { useApp } from '../../app/AppContext'
import { ProgressView } from './ProgressView'

export function ProgressScreen() {
  const { progress, settings } = useApp()
  const navigate = useNavigate()
  const stats = topicStats(progress.grammarAttempts)
  // Only Part 5 topics are drillable, so the "focus on these" list is limited to them.
  const weakest = weakestTopics(stats.filter((s) => Part5Topic.safeParse(s.topic).success))
  return (
    <ProgressView
      stats={stats}
      weakest={weakest}
      band={estimateBand(progress.mixedTests)}
      lang={settings.language}
      onDrill={(topic) => void navigate(`/drill/${topic}`)}
    />
  )
}
