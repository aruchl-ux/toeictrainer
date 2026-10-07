import { useEffect, useState, type ReactNode } from 'react'
import { entryFields, entryId, type QuizEntry } from '@shared/quiz'
import type { AnswerRecord } from '@renderer/features/grammar/quizReducer'
import type { Lang } from '@renderer/app/i18n'
import { CheckIcon, ChevronRight, CrossIcon, PromptMark } from './icons'
import { useO } from './strings'

const LETTERS = ['A', 'B', 'C', 'D']

/** Maps a typed or pressed answer (a–d, 1–4) to a choice index, or -1. */
export function answerIndex(key: string): number {
  const k = key.trim().toUpperCase()
  if (k.length !== 1) return -1
  const i = LETTERS.indexOf(k)
  return i >= 0 ? i : ['1', '2', '3', '4'].indexOf(k)
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const secs = (ms: number) => (ms / 1000).toFixed(1)

export function AgentMsg({ head, meta, anchor, children }: { head?: ReactNode; meta?: ReactNode; anchor?: boolean; children: ReactNode }) {
  return (
    <article className="msg agent" data-anchor={anchor ? '' : undefined}>
      {(head || meta) && (
        <header className="msg-head">
          <span className="agent-mark">
            <PromptMark />
          </span>
          {head && <span className="msg-title">{head}</span>}
          {meta && <span className="msg-meta">{meta}</span>}
        </header>
      )}
      <div className="msg-body">{children}</div>
    </article>
  )
}

export function UserMsg({ children }: { children: ReactNode }) {
  return (
    <div className="msg user">
      <p className="bubble">{children}</p>
    </div>
  )
}

/** The sentence around blank `n` of a Part 6 passage, so the task reads on its own when the pane is hidden. */
function blankExcerpt(passage: string, n: number): string {
  const token = `{{${n}}}`
  const at = passage.indexOf(token)
  if (at < 0) return ''
  const before = passage.slice(0, at)
  const after = passage.slice(at + token.length)
  const start = Math.max(before.lastIndexOf('. '), before.lastIndexOf('! '), before.lastIndexOf('? '), before.lastIndexOf('\n'))
  const endMatch = /[.!?](\s|$)/.exec(after)
  const end = endMatch ? endMatch.index + 1 : after.length
  return `${before.slice(start + 1)}[${n}] ____${after.slice(0, end)}`.replace(/\{\{([1-4])\}\}/g, '[$1]').trim()
}

function WithBlanks({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[1-4]\] ____|_{3,})/).map((part, i) =>
        /^(\[[1-4]\] ____|_{3,})$/.test(part) ? (
          <code key={i} className="blank">
            {part.replace(/_{3,}/, '____')}
          </code>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

/** What the task asks: the Part 5 sentence, the Part 6 blank in context, or the Part 7 question. */
export function Stem({ entry }: { entry: QuizEntry }) {
  if (entry.kind === 'p5') {
    return (
      <p className="stem">
        <WithBlanks text={entry.item.stem} />
      </p>
    )
  }
  if (entry.kind === 'p6') {
    return (
      <>
        <p className="stem-ref">
          {entry.set.title} · <span className="mono">[{entry.blank + 1}]</span>
        </p>
        <blockquote className="stem excerpt">
          <WithBlanks text={blankExcerpt(entry.set.passage, entry.blank + 1)} />
        </blockquote>
      </>
    )
  }
  return <p className="stem">{entry.set.questions[entry.q].prompt}</p>
}

export function stemPreview(entry: QuizEntry): string {
  if (entry.kind === 'p5') return entry.item.stem.replace(/_{3,}/, '____')
  if (entry.kind === 'p6') return `${entry.set.title} [${entry.blank + 1}]`
  return entry.set.questions[entry.q].prompt
}

interface OptionsProps {
  entry: QuizEntry
  selected: number | null
  reveal: boolean
  /** Locked once answered (drills); the Reading test keeps choices open. */
  locked: boolean
  onChoose?(i: number): void
}

export function Options({ entry, selected, reveal, locked, onChoose }: OptionsProps) {
  const { t } = useO()
  const f = entryFields(entry)
  return (
    <ol className="opts">
      {f.choices.map((choice, i) => {
        const state = reveal ? (i === f.answer ? 'correct' : i === selected ? 'wrong' : 'dim') : i === selected ? 'selected' : ''
        return (
          <li key={i}>
            <button
              type="button"
              className={`opt choice ${state}`}
              disabled={!onChoose || (locked && selected !== null)}
              onClick={() => onChoose?.(i)}
            >
              <kbd className="key">
                <span className="sr-only">(</span>
                {LETTERS[i]}
                <span className="sr-only">)</span>
              </kbd>
              <span className="opt-text choice-text">{choice}</span>
              {state === 'correct' && (
                <span className="opt-state">
                  <CheckIcon />
                  {t('statusCorrect')}
                </span>
              )}
              {state === 'wrong' && (
                <span className="opt-state">
                  <CrossIcon />
                  {t('statusWrong')}
                </span>
              )}
              {state === 'selected' && <span className="opt-state quiet">{t('yourAnswer')}</span>}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function Explain({ entry, lang }: { entry: QuizEntry; lang: Lang }) {
  const { t } = useO()
  const [other, setOther] = useState(false)
  const f = entryFields(entry)
  const shown: Lang = other ? (lang === 'th' ? 'en' : 'th') : lang
  return (
    <>
      <p className="explain-body" lang={shown}>
        {f.explain[shown]}
      </p>
      <button type="button" className="link" onClick={() => setOther((v) => !v)}>
        {t(other ? 'showMainLang' : 'showOtherLang')}
      </button>
    </>
  )
}

/**
 * The agent's answer to the learner's reply: right or wrong (icon and word, never color alone),
 * the time taken, the tested point, and the explanation. A fresh verdict "checks" briefly first.
 */
export function Verdict({ entry, record, fresh }: { entry: QuizEntry; record: AnswerRecord; fresh: boolean }) {
  const { o, t, lang, skill } = useO()
  const [checking, setChecking] = useState(fresh && !reduceMotion())
  useEffect(() => {
    if (!checking) return
    const id = window.setTimeout(() => setChecking(false), 320)
    return () => window.clearTimeout(id)
  }, [checking])
  const f = entryFields(entry)

  if (checking) {
    return (
      <div className="result checking" aria-live="polite">
        <span className="shimmer">{o('thinking')}</span>
      </div>
    )
  }
  return (
    <div className={fresh ? 'result explain enter' : 'result explain'} aria-live={fresh ? 'polite' : undefined}>
      <p className={record.correct ? 'verdict ok' : 'verdict bad'}>
        {record.correct ? <CheckIcon /> : <CrossIcon />}
        <strong>{t(record.correct ? 'statusCorrect' : 'statusWrong')}</strong>
        {!record.correct && <span className="verdict-answer">{o('answerIs', { x: `${LETTERS[f.answer]} · ${f.choices[f.answer]}` })}</span>}
        {record.ms > 0 && <span className="mono dim">{secs(record.ms)}s</span>}
      </p>
      <p className="trap">
        <span className="trap-label">{entry.kind === 'p7' ? skill(f.topic) : t('trapLabel')}</span>
        {f.trap && <span className="trap-text">{f.trap}</span>}
      </p>
      <Explain entry={entry} lang={lang} />
    </div>
  )
}

/**
 * An earlier task folded into one line, like a finished tool call. Opens to the full task.
 * `revealed` is false while a deferred test is still running: the row then shows the reply only.
 */
export function PastRow({ entry, index, record, revealed }: { entry: QuizEntry; index: number; record: AnswerRecord | undefined; revealed: boolean }) {
  const { t } = useO()
  const f = entryFields(entry)
  const mark = !record ? 'skip' : revealed ? (record.correct ? 'ok' : 'bad') : 'done'
  return (
    <details className={`past ${mark}`}>
      <summary>
        <span className="past-chev">
          <ChevronRight />
        </span>
        <span className="past-mark" aria-label={revealed && record ? t(record.correct ? 'statusCorrect' : 'statusWrong') : undefined}>
          {revealed && record ? record.correct ? <CheckIcon /> : <CrossIcon /> : <span className="dot" aria-hidden="true" />}
        </span>
        <span className="past-n mono">#{index + 1}</span>
        <span className="past-stem">{stemPreview(entry)}</span>
        <span className="past-pick">
          {record ? `${LETTERS[record.choice]} · ${f.choices[record.choice]}` : '—'}
        </span>
        {record && record.ms > 0 && <span className="past-ms mono">{secs(record.ms)}s</span>}
      </summary>
      <div className="past-body">
        <Stem entry={entry} />
        <Options entry={entry} selected={record?.choice ?? null} reveal={revealed} locked />
        {revealed && (
          <Verdict
            entry={entry}
            record={record ?? { entryId: entryId(entry), topic: f.topic, choice: -1, correct: false, ms: 0 }}
            fresh={false}
          />
        )}
      </div>
    </details>
  )
}
