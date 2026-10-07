import { useCallback, useEffect, useMemo, useState } from 'react'
import { availableCounts, BLUEPRINT, buildReadingTest, DURATION_MS, restoreReadingTest, type TestState } from '@shared/reading'
import type { QuizEntry } from '@shared/quiz'
import type { ActiveReadingTest, TestLength } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon, PosterShapes } from '../../app/Ink'
import { ReadingTestResults } from './ReadingTestResults'
import { ReadingTestRunner } from './ReadingTestRunner'

export function ReadingTestScreen() {
  const { bank, progress, saveActiveTest } = useApp()
  const { t } = useT()
  const [length, setLength] = useState<TestLength>('half')
  const [running, setRunning] = useState<{ entries: QuizEntry[]; length: TestLength; saved?: ActiveReadingTest } | null>(null)
  const [result, setResult] = useState<TestState | null>(null)

  const active = progress.activeReadingTest
  const restored = useMemo(() => (active ? restoreReadingTest(bank, active) : null), [bank, active])
  const [discarded, setDiscarded] = useState(false)

  useEffect(() => {
    if (active && !restored) {
      setDiscarded(true)
      void saveActiveTest(null)
    }
  }, [active, restored, saveActiveTest])

  // Build each length's test once, so the count shown is exactly the test that starts.
  // `round` is bumped on every start so the next test is freshly drawn.
  const [round, setRound] = useState(0)
  const built = useMemo(
    () => ({ half: buildReadingTest(bank, 'half'), full: buildReadingTest(bank, 'full') }),
    [bank, round] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const short = useMemo(() => {
    const isShort = (l: TestLength) => {
      const have = availableCounts(bank, l)
      const want = BLUEPRINT[l]
      return (Object.keys(want) as (keyof typeof want)[]).some((k) => have[k] < want[k])
    }
    return { half: isShort('half'), full: isShort('full') }
  }, [bank])
  const entries = built[length]

  const onDone = useCallback((s: TestState) => {
    setResult(s)
    setRunning(null)
  }, [])

  if (running) return <section className="quiz-screen"><ReadingTestRunner entries={running.entries} length={running.length} saved={running.saved} onDone={onDone} /></section>
  if (result) {
    return (
      <section className="quiz-screen">
        <ReadingTestResults state={result} onAgain={() => setResult(null)} />
      </section>
    )
  }

  const resumable = Boolean(active && restored)
  return (
    <section className="mixed">
      <div className="mixed-intro">
        <PosterShapes />
        <h1 className="poster-head">
          <span className="ink-blue">{t('testTitle')}</span>
        </h1>
        <p className="poster-lead">{t('testIntro')}</p>
        {active && restored && (
          <div className="frame frame-pink resume-panel">
            <h2 className="panel-title">{t('testResumeTitle', { length: t(active.length === 'half' ? 'testHalf' : 'testFull') })}</h2>
            <p className="num">
              {t('testResumeMeta', {
                a: Object.keys(active.answers).length,
                n: active.ids.length,
                m: Math.ceil((DURATION_MS[active.length] - active.elapsedMs) / 60000)
              })}
            </p>
            <div className="actions">
              <button type="button" className="primary" onClick={() => setRunning({ entries: restored, length: active.length, saved: active })}>
                {t('testResume')}
                <ArrowIcon />
              </button>
              <button type="button" onClick={() => void saveActiveTest(null)}>
                {t('testDiscard')}
              </button>
            </div>
          </div>
        )}
        {discarded && <p className="muted">{t('testDiscarded')}</p>}
        {/* Setup reads as one unit: choose a length, then start. */}
        <div className="test-setup">
          <fieldset className="lang-field">
            <legend className="sr-only">{t('testLengthLabel')}</legend>
            <div className="lang-options">
              {(['half', 'full'] as const).map((l) => (
                <label key={l} className="lang-option">
                  <input type="radio" name="test-length" checked={length === l} onChange={() => setLength(l)} />
                  <span className="lang-label">{t(l === 'half' ? 'testHalf' : 'testFull')}</span>
                  <span className="lang-sample num">{t(l === 'half' ? 'testHalfMeta' : 'testFullMeta', { n: built[l].length })}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {short[length] && <p className="muted">{t('testShortBank', { n: entries.length })}</p>}
          {/* One primary per view: while Resume is offered, Start steps down to a secondary button. */}
          <button
            type="button"
            className={resumable ? undefined : 'primary'}
            disabled={entries.length === 0}
            onClick={() => {
              setRunning({ entries, length })
              setRound((r) => r + 1)
            }}
          >
            {t('testStart')}
            <ArrowIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
