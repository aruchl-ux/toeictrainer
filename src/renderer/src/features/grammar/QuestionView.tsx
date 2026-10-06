import { useState } from 'react'
import { entryFields, type QuizEntry } from '@shared/quiz'
import type { Part6Set } from '@shared/types'
import { t, type Lang } from '../../app/i18n'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  entry: QuizEntry
  lang: Lang
  selected: number | null
  reveal: boolean
  onChoose(choice: number): void
}

function Passage({ set, current }: { set: Part6Set; current: number }) {
  const parts = set.passage.split(/(\{\{[1-4]\}\})/)
  return (
    <div className="passage">
      <h3>{set.title}</h3>
      <p>
        {parts.map((part, i) => {
          const m = /^\{\{([1-4])\}\}$/.exec(part)
          if (!m) return <span key={i}>{part}</span>
          const n = Number(m[1])
          return (
            <mark key={i} className={n - 1 === current ? 'blank current' : 'blank'}>
              [{n}] ____
            </mark>
          )
        })}
      </p>
    </div>
  )
}

export function QuestionView({ entry, lang, selected, reveal, onChoose }: Props) {
  const [showOther, setShowOther] = useState(false)
  const f = entryFields(entry)
  const explainLang: Lang = showOther ? (lang === 'th' ? 'en' : 'th') : lang

  return (
    <div className="question">
      {entry.kind === 'p5' ? <p className="stem">{entry.item.stem}</p> : <Passage set={entry.set} current={entry.blank} />}
      <ol className="choices">
        {f.choices.map((choice, i) => {
          const state = reveal
            ? i === f.answer
              ? 'correct'
              : i === selected
                ? 'wrong'
                : ''
            : i === selected
              ? 'selected'
              : ''
          return (
            <li key={i}>
              <button
                type="button"
                className={`choice ${state}`}
                disabled={selected !== null}
                onClick={() => onChoose(i)}
              >
                ({LETTERS[i]}) {choice}
              </button>
            </li>
          )
        })}
      </ol>
      {reveal && (
        <div className="explain">
          <p>
            <strong>{t(lang, 'trapLabel')}:</strong> {f.trap}
          </p>
          <p>{f.explain[explainLang]}</p>
          <button type="button" className="link" onClick={() => setShowOther((v) => !v)}>
            {t(lang, showOther ? 'showMainLang' : 'showOtherLang')}
          </button>
        </div>
      )}
    </div>
  )
}
