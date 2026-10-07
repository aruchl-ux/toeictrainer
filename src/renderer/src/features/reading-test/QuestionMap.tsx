import { entryId, entryPart, type QuizEntry } from '@shared/quiz'
import { t, type Lang } from '../../app/i18n'

interface Props {
  entries: QuizEntry[]
  answers: Record<string, number>
  flags: string[]
  index: number
  lang: Lang
  onJump(i: number): void
}

export function QuestionMap({ entries, answers, flags, index, lang, onJump }: Props) {
  const groups = (['p5', 'p6', 'p7'] as const)
    .map((part) => ({ part, items: entries.map((e, i) => ({ e, i })).filter(({ e }) => entryPart(e) === part) }))
    .filter((g) => g.items.length > 0)
  return (
    <nav className="qmap" aria-label={t(lang, 'testTitle')}>
      {groups.map((g) => (
        <div key={g.part} className="qmap-group">
          <span className="qmap-part">{t(lang, 'testPart', { n: g.part.slice(1) })}</span>
          <div className="qmap-cells">
            {g.items.map(({ e, i }) => {
              const id = entryId(e)
              const answered = answers[id] !== undefined
              const flagged = flags.includes(id)
              const state = [t(lang, answered ? 'testAnswered' : 'testUnanswered'), flagged ? t(lang, 'testFlagged') : '']
                .filter(Boolean)
                .join(', ')
              const cls = ['cell', answered && 'answered', flagged && 'flagged', i === index && 'current'].filter(Boolean).join(' ')
              return (
                <button key={id} type="button" className={cls} aria-current={i === index} aria-label={t(lang, 'testMapLabel', { i: i + 1, state })} onClick={() => onJump(i)}>
                  <span className="num">{i + 1}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
