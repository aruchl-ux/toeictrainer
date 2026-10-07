import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { flattenPart7, shuffleChoices } from '@shared/quiz'
import { PART7_FORMATS, PART7_QTYPES, Part7QType, type Part7Format, type Part7Set } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon } from '../../app/Ink'
import { QuizRunner } from '../grammar/QuizRunner'
import { useRecordAnswer } from '../grammar/useRecordAnswer'

const FORMAT_KEY = { single: 'readingSingle', double: 'readingDouble', triple: 'readingTriple' } as const

function accuracyByType(attempts: { qtype: Part7QType; correct: boolean }[]): Map<Part7QType, number> {
  const acc = new Map<Part7QType, [number, number]>()
  for (const a of attempts) {
    const [c, n] = acc.get(a.qtype) ?? [0, 0]
    acc.set(a.qtype, [c + (a.correct ? 1 : 0), n + 1])
  }
  return new Map([...acc].map(([k, [c, n]]) => [k, c / n]))
}

export function ReadingScreen() {
  const { bank, progress } = useApp()
  const { lang, t, topic } = useT()
  const [params, setParams] = useSearchParams()
  const parsed = Part7QType.safeParse(params.get('type'))
  const filter = parsed.success ? parsed.data : null
  const [current, setCurrent] = useState<Part7Set | null>(null)
  const [run, setRun] = useState(0)
  const onAnswer = useRecordAnswer()
  const onFinish = useCallback(() => {}, [])

  const entries = useMemo(
    () => (current ? shuffleChoices(flattenPart7(current)) : []),
    // `run` is a dependency on purpose: bumping it reshuffles a fresh drill.
    [current, run]
  )
  const acc = accuracyByType(progress.readingAttempts)
  // Weakest types first (types with no attempts keep catalog order after them).
  const types = [...PART7_QTYPES].sort((a, b) => (acc.get(a) ?? 2) - (acc.get(b) ?? 2))
  const visible = bank.part7.filter((s) => !filter || s.questions.some((q) => q.type === filter))

  if (current) {
    return (
      <section className="quiz-screen">
        <header className="quiz-title">
          <h1>{current.docs.map((d) => d.title).join(' · ')}</h1>
        </header>
        <QuizRunner key={`${current.id}-${run}`} entries={entries} mode="instant" lang={lang} onAnswer={onAnswer} onFinish={onFinish} />
        <div className="actions">
          <button type="button" className="again" onClick={() => setRun((r) => r + 1)}>
            {t('quizAgain')}
          </button>
          <button type="button" className="again" onClick={() => setCurrent(null)}>
            {t('readingBack')}
          </button>
        </div>
      </section>
    )
  }

  const pick = (format: Part7Format) => {
    const pool = visible.filter((s) => s.format === format)
    if (pool.length) setCurrent(pool[Math.floor(Math.random() * pool.length)])
  }

  return (
    <section className="reading">
      <header className="page-head">
        <h1 className="page-title">{t('readingTitle')}</h1>
        <p className="page-lead">{t('readingIntro')}</p>
      </header>
      <div className="type-chips" role="group" aria-label={t('readingAllTypes')}>
        <button type="button" className={filter ? 'chip' : 'chip on'} aria-pressed={!filter} onClick={() => setParams({})}>
          {t('readingAllTypes')}
        </button>
        {types.map((ty) => (
          <button
            key={ty}
            type="button"
            className={filter === ty ? 'chip on' : 'chip'}
            aria-pressed={filter === ty}
            onClick={() => setParams({ type: ty })}
          >
            {topic(ty)}
            {acc.has(ty) && <span className="num"> · {Math.round((acc.get(ty) ?? 0) * 100)}%</span>}
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="muted">{t('readingEmpty')}</p>}
      {PART7_FORMATS.map((format) => {
        const sets = visible.filter((s) => s.format === format)
        if (sets.length === 0) return null
        return (
          <section key={format} className="set-group">
            <div className="set-group-head">
              <h2 className="panel-title">{t(FORMAT_KEY[format])}</h2>
              <button type="button" className="text-link" onClick={() => pick(format)}>
                {t('readingRandom')}
                <ArrowIcon />
              </button>
            </div>
            <ul className="set-list">
              {sets.map((s) => (
                <li key={s.id}>
                  <button type="button" className="set-row" onClick={() => setCurrent(s)}>
                    <span className="set-title">{s.docs.map((d) => d.title).join(' · ')}</span>
                    <span className="set-meta">
                      {t('readingQuestions', { n: s.questions.length })} · {[...new Set(s.questions.map((q) => topic(q.type)))].join(', ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </section>
  )
}
