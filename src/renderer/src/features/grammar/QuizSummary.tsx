import { entryFields, entryId, type QuizEntry } from '@shared/quiz'
import { skillLabel, t, type Lang } from '../../app/i18n'
import { CheckIcon, CrossIcon, PosterShapes } from '../../app/Ink'
import type { AnswerRecord } from './quizReducer'

interface Props {
  entries: QuizEntry[]
  records: (AnswerRecord | undefined)[]
  lang: Lang
  showReview: boolean
}

export function QuizSummary({ entries, records, lang, showReview }: Props) {
  const correct = records.filter((r) => r?.correct).length
  // Distinct tested points behind the wrong answers: what to look at before the next drill.
  // Part 7 has no trap, so it names the question type instead.
  const missed = [
    ...new Set(
      records.flatMap((r, i) => {
        const entry = entries[i]
        if (r?.correct || !entry) return []
        const f = entryFields(entry)
        return [entry.kind === 'p7' ? skillLabel(f.topic, lang) : f.trap]
      })
    )
  ].filter((point) => point.trim() !== '')
  const score = <h2 className="summary-score">{t(lang, 'quizScore', { c: correct, n: entries.length })}</h2>

  if (!showReview) {
    return (
      <div className="summary summary-poster">
        <PosterShapes />
        {score}
        <ol className="summary-marks">
          {records.map((r, i) => (
            <li key={i} className={r?.correct ? 'ok' : 'bad'}>
              <span className="review-mark" aria-label={t(lang, r?.correct ? 'statusCorrect' : 'statusWrong')}>
                {r?.correct ? <CheckIcon /> : <CrossIcon />}
              </span>
            </li>
          ))}
        </ol>
        {missed.length > 0 && (
          <section className="summary-missed">
            <h3>{t(lang, 'summaryMissed')}</h3>
            <ul>
              {missed.map((trap) => (
                <li key={trap}>{trap}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    )
  }

  return (
    <div className="summary">
      {score}
      {showReview && (
        <ol className="review-list">
          {entries.map((entry, i) => {
            const r = records[i]
            const f = entryFields(entry)
            const ok = r?.correct === true
            return (
              <li key={entryId(entry)} className={ok ? 'ok' : 'bad'}>
                <span className="review-mark" aria-label={t(lang, ok ? 'statusCorrect' : 'statusWrong')}>
                  {ok ? <CheckIcon /> : <CrossIcon />}
                </span>
                <div className="review-body">
                  <p className="review-stem">
                    {entry.kind === 'p5'
                      ? entry.item.stem
                      : entry.kind === 'p6'
                        ? `${entry.set.title} [${entry.blank + 1}]`
                        : `${entry.set.docs.map((d) => d.title).join(' · ')} — ${entry.set.questions[entry.q].prompt}`}
                  </p>
                  <p className="review-answers">
                    {t(lang, 'yourAnswer')}: <span className={ok ? '' : 'strike'}>{r ? f.choices[r.choice] : '—'}</span>
                    {' · '}
                    {t(lang, 'correctAnswer')}: <strong>{f.choices[f.answer]}</strong>
                  </p>
                  {entry.kind === 'p7' && (
                    <p className="review-evidence">
                      {t(lang, 'evidenceLabel')}: {entry.set.questions[entry.q].evidence.map((e) => `“${e.quote}”`).join(' ')}
                    </p>
                  )}
                  <p className="muted review-explain">
                    {!ok && (
                      <>
                        {entry.kind === 'p7' ? skillLabel(f.topic, lang) : `${t(lang, 'trapLabel')}: ${f.trap}`} ·{' '}
                      </>
                    )}
                    {f.explain[lang]}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
