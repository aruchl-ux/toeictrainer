import { useNavigate } from 'react-router'
import { latestBand, topicStats, weakestTopics } from '@shared/scoring'
import { Part5Topic } from '@shared/types'
import { useApp } from '../../app/AppContext'
import { isGrammarTopic } from '../../app/i18n'
import { ProgressView } from './ProgressView'

export function ProgressScreen() {
  const { progress, settings } = useApp()
  const navigate = useNavigate()
  const lb = latestBand(progress)
  const stats = topicStats(progress.grammarAttempts)
  const readingStats = topicStats(progress.readingAttempts.map((a) => ({ topic: a.qtype, correct: a.correct, ms: a.ms })))
  // Only Part 5 topics are drillable, so the "focus on these" list is limited to them.
  const weakest = weakestTopics(stats.filter((s) => Part5Topic.safeParse(s.topic).success)).filter(isGrammarTopic)
  return (
    <ProgressView
      stats={stats}
      weakest={weakest}
      band={lb?.band ?? null}
      bandSource={lb?.source ?? null}
      readingStats={readingStats}
      lang={settings.language}
      onDrill={(topic) => void navigate(`/drill/${topic}`)}
      onDrillReading={(type) => void navigate(`/reading?type=${type}`)}
    />
  )
}
