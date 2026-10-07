import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { entryFields, entryId } from '@shared/quiz'
import { estimateReadingBand, scoreTest, type TestState } from '@shared/reading'
import { Part5Topic, Part7QType, type GrammarAttempt, type ReadingAttempt, type Skill } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { isGrammarTopic, skillLabel } from '../../app/i18n'
import { ArrowIcon } from '../../app/Ink'
import { QuizSummary } from '../grammar/QuizSummary'
import type { AnswerRecord } from '../grammar/quizReducer'

/** The skill with the most wrong answers (ties: first in test order), or null if nothing was wrong. */
export function weakestSkill(records: (AnswerRecord | undefined)[]): Skill | null {
  const wrong = new Map<Skill, number>()
  for (const r of records) if (r && !r.correct) wrong.set(r.topic, (wrong.get(r.topic) ?? 0) + 1)
  let best: Skill | null = null
  for (const [skill, n] of wrong) if (best === null || n > wrong.get(best)!) best = skill
  return best
}

/** Where to drill a skill: the reading drill for a Part 7 type, the topic drill for a Part 5 topic. */
function drillPath(skill: Skill): string | null {
  if (Part7QType.safeParse(skill).success) return `/reading?type=${skill}`
  if (Part5Topic.safeParse(skill).success) return `/drill/${skill}`
  return null // Part 6-only topics have no drill of their own.
}

export function ReadingTestResults({ state, onAgain }: { state: TestState; onAgain?: () => void }) {
  const { finishReadingTest } = useApp()
  const { lang, t } = useT()
  const parts = scoreTest(state)
  const band = estimateReadingBand(parts)
  const saved = useRef(false)

  const records: (AnswerRecord | undefined)[] = state.entries.map((e) => {
    const choice = state.answers[entryId(e)]
    if (choice === undefined) return undefined
    const f = entryFields(e)
    return { entryId: entryId(e), topic: f.topic, choice, correct: choice === f.answer, ms: 0 }
  })

  const weakest = weakestSkill(records)
  const weakestPath = weakest && drillPath(weakest)

  useEffect(() => {
    if (saved.current) return
    saved.current = true
    const at = new Date().toISOString()
    const answered = records.filter((r): r is AnswerRecord => r !== undefined)
    const grammar: GrammarAttempt[] = answered.flatMap((r) =>
      !r.entryId.startsWith('p7-') && isGrammarTopic(r.topic) ? [{ itemId: r.entryId, topic: r.topic, correct: r.correct, ms: 0, at }] : []
    )
    const reading: ReadingAttempt[] = answered.flatMap((r) =>
      r.entryId.startsWith('p7-') ? [{ itemId: r.entryId, qtype: r.topic as ReadingAttempt['qtype'], correct: r.correct, ms: 0, at }] : []
    )
    void finishReadingTest({ result: { length: state.length, parts, ms: Math.round(state.elapsedMs), at }, grammar, reading })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="test-results">
      <h1 className="page-title">{t('testResultTitle')}</h1>
      <ul className="part-scores">
        {(['p5', 'p6', 'p7'] as const).filter((p) => parts[p].total > 0).map((p) => (
          <li key={p} className="num">{t('testPartScore', { p: p.slice(1), c: parts[p].correct, n: parts[p].total })}</li>
        ))}
        <li className="num">{t('testTimeUsed', { m: Math.round(state.elapsedMs / 60000) })}</li>
      </ul>
      {band && (
        <div className="band-panel">
          <h2>{t('progressBand', { low: band.low, high: band.high })}</h2>
          <p>{t('testBandNote')}</p>
        </div>
      )}
      {/* Next steps sit under the score, not after a 50–100 item review list. */}
      <div className="result-actions">
        {onAgain && (
          <button type="button" className="primary" onClick={onAgain}>
            {t('quizAgain')}
            <ArrowIcon />
          </button>
        )}
        {weakest && weakestPath && (
          <Link className="text-link drill-weakest" to={weakestPath}>
            {t('testDrillWeakest', { skill: skillLabel(weakest, lang) })}
            <ArrowIcon />
          </Link>
        )}
      </div>
      <QuizSummary entries={state.entries} records={records} lang={lang} showReview />
    </div>
  )
}
