import { useEffect, useState } from 'react'
import { entryFields, entryId, type QuizEntry } from '@shared/quiz'
import type { Part6Set } from '@shared/types'
import { t, skillLabel, type Lang } from '../../app/i18n'
import { CheckIcon, CrossIcon } from '../../app/Ink'
import { PassageView } from '../reading/PassageView'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  entry: QuizEntry
  lang: Lang
  selected: number | null
  reveal: boolean
  onChoose(choice: number): void
  /** When false, choices stay enabled after selection (Reading test). */
  locked?: boolean
}

/** True when a key press belongs to a control the learner is using, not to the quiz. */
export function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('input, textarea, select, button, a, [contenteditable]') !== null
}

/** True only for fields that take typed text, where a letter key is input, not an answer. */
export function isTextEntryTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('input, textarea, select, [contenteditable]') !== null
}

/**
 * React key for a QuestionView. Part 7 questions of one set share a key so the passage
 * (and its selected document tab) stays mounted while the set's questions advance.
 */
export function questionViewKey(entry: QuizEntry): string {
  return entry.kind === 'p7' ? `set-${entry.set.id}` : entryId(entry)
}

function Passage({ set, current }: { set: Part6Set; current: number }) {
  const parts = set.passage.split(/(\{\{[1-4]\}\})/)
  return (
    <div className="passage sheet">
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

function Explain({ entry, lang }: { entry: QuizEntry; lang: Lang }) {
  const [showOther, setShowOther] = useState(false)
  const f = entryFields(entry)
  const explainLang: Lang = showOther ? (lang === 'th' ? 'en' : 'th') : lang
  return (
    <div className="explain">
      <p className="trap">
        <span className="stamp">{entry.kind === 'p7' ? skillLabel(f.topic, lang) : t(lang, 'trapLabel')}</span>
        {f.trap && <strong>{f.trap}</strong>}
      </p>
      <p className="explain-body" lang={explainLang}>{f.explain[explainLang]}</p>
      <button type="button" className="link" lang={lang} onClick={() => setShowOther((v) => !v)}>
        {t(lang, showOther ? 'showMainLang' : 'showOtherLang')}
      </button>
    </div>
  )
}

export function QuestionView({ entry, lang, selected, reveal, onChoose, locked = true }: Props) {
  const f = entryFields(entry)

  useEffect(() => {
    if (locked && selected !== null) return
    // In the Reading test (unlocked) answer keys work from any control (Prev, Flag, map cells);
    // locked drills keep ignoring keys while a button or link has focus.
    const ignore = locked ? isTypingTarget : isTextEntryTarget
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || ignore(e.target)) return
      const key = e.key.toUpperCase()
      const i = LETTERS.indexOf(key) >= 0 ? LETTERS.indexOf(key) : ['1', '2', '3', '4'].indexOf(key)
      if (i >= 0 && i < f.choices.length) {
        e.preventDefault()
        onChoose(i)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [locked, selected, f.choices.length, onChoose])

  return (
    <div className={`question ${entry.kind}`}>
      {entry.kind === 'p5' ? (
        <div className="sheet stem-sheet">
          <p className="stem">{entry.item.stem}</p>
        </div>
      ) : entry.kind === 'p6' ? (
        <Passage set={entry.set} current={entry.blank} />
      ) : (
        <PassageView docs={entry.set.docs} evidence={reveal ? entry.set.questions[entry.q].evidence : null} />
      )}
      <div className="answer-col">
        {entry.kind === 'p7' && <p className="q-prompt">{entry.set.questions[entry.q].prompt}</p>}
        <ol className="choices">
          {f.choices.map((choice, i) => {
            const state = reveal
              ? i === f.answer
                ? 'correct'
                : i === selected
                  ? 'wrong'
                  : 'dim'
              : i === selected
                ? 'selected'
                : ''
            return (
              <li key={i}>
                <button
                  type="button"
                  className={`choice ${state}`}
                  disabled={locked && selected !== null}
                  onClick={() => onChoose(i)}
                >
                  <span className="choice-letter">
                    <span className="sr-only">(</span>
                    {LETTERS[i]}
                    <span className="sr-only">)</span>
                  </span>{' '}
                  <span className="choice-text">{choice}</span>
                  {state === 'correct' && (
                    <span className="choice-status">
                      <CheckIcon />
                      {t(lang, 'statusCorrect')}
                    </span>
                  )}
                  {state === 'wrong' && (
                    <span className="choice-status">
                      <CrossIcon />
                      {t(lang, 'statusWrong')}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
        {reveal && <Explain key={entryId(entry)} entry={entry} lang={lang} />}
      </div>
    </div>
  )
}
