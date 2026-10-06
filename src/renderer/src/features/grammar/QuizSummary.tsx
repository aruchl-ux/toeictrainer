import { entryFields, entryId, type QuizEntry } from '@shared/quiz'
import { t, type Lang } from '../../app/i18n'
import type { AnswerRecord } from './quizReducer'

interface Props {
  entries: QuizEntry[]
  records: AnswerRecord[]
  lang: Lang
  showReview: boolean
}

export function QuizSummary({ entries, records, lang, showReview }: Props) {
  const correct = records.filter((r) => r.correct).length
  return (
    <div className="summary">
      <h2>{t(lang, 'quizScore', { c: correct, n: records.length })}</h2>
      {showReview && (
        <ol className="review-list">
          {entries.map((entry, i) => {
            const r = records[i]
            const f = entryFields(entry)
            return (
              <li key={entryId(entry)} className={r?.correct ? 'ok' : 'bad'}>
                {entry.kind === 'p5' ? entry.item.stem : `${entry.set.title} [${entry.blank + 1}]`}
                <div>
                  {t(lang, 'yourAnswer')}: {r ? f.choices[r.choice] : '—'} · {t(lang, 'correctAnswer')}:{' '}
                  {f.choices[f.answer]}
                </div>
                <div className="muted">{f.explain[lang]}</div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
