import { t, type Lang } from '../../app/i18n'

export function TestTimer({ remainingMs, lang }: { remainingMs: number; lang: Lang }) {
  const total = Math.max(0, Math.ceil(remainingMs / 1000))
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  const level = total <= 60 ? 'urgent' : total <= 300 ? 'warn' : ''
  return (
    <span className={`test-timer ${level}`} role="timer" aria-live="off">
      <span className="num">
        <span className="sr-only">
          {mm}:{ss}
        </span>
        {/* Kanit has no tabular figures: a fixed cell per character keeps the clock (and the map beside it) from shifting every second. */}
        <span className="timer-face" aria-hidden="true">
          {`${mm}:${ss}`.split('').map((ch, i) => (
            <span key={i} className={ch === ':' ? 'timer-colon' : 'timer-digit'}>
              {ch}
            </span>
          ))}
        </span>
      </span>
      {/* Only the cue is live (polite), and it is always mounted so each new cue is announced once. */}
      <span className="timer-cue" aria-live="polite">
        {level && t(lang, level === 'urgent' ? 'testOneLeft' : 'testFiveLeft')}
      </span>
    </span>
  )
}
