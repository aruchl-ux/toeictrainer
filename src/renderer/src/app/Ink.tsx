import type { GrammarTopic } from '@shared/types'

/**
 * Riso ink artwork: the app mark, topic marks, poster shapes and line icons.
 * Shapes overprint with multiply (pink over blue reads violet) and carry the
 * shared grain filter defined once in <InkDefs />.
 */

const PINK = 'var(--pink)'
const BLUE = 'var(--blue)'
const YELLOW = 'var(--yellow)'

/** Filters referenced by CSS (`filter: url(#riso-grain)`). Render once near the root. */
export function InkDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <filter id="riso-grain" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 1.9"
          result="speckle"
        />
        <feComposite in="SourceGraphic" in2="speckle" operator="in" result="speckled" />
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" seed="3" result="wobble" />
        <feDisplacementMap in="speckled" in2="wobble" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      {/* Lighter grain for display type: printed texture without eating the letterforms. */}
      <filter id="riso-text" x="-2%" y="-5%" width="104%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="11" result="noise" />
        <feColorMatrix
          in="noise"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.45"
          result="speckle"
        />
        <feComposite in="SourceGraphic" in2="speckle" operator="in" />
      </filter>
    </svg>
  )
}

export function AppMark({ className }: { className?: string }) {
  return (
    <svg className={`ink ${className ?? ''}`} viewBox="0 0 96 72" aria-hidden="true" focusable="false">
      <rect x="30" y="18" width="46" height="46" style={{ fill: BLUE }} />
      <circle cx="30" cy="26" r="22" style={{ fill: PINK }} />
      <path d="M58 64 L92 64 L75 34 Z" style={{ fill: YELLOW }} />
    </svg>
  )
}

type Shape =
  | { k: 'circle'; cx: number; cy: number; r: number; c: string }
  | { k: 'rect'; x: number; y: number; w: number; h: number; c: string }
  | { k: 'path'; d: string; c: string }

const c = (cx: number, cy: number, r: number, col: string): Shape => ({ k: 'circle', cx, cy, r, c: col })
const r = (x: number, y: number, w: number, h: number, col: string): Shape => ({ k: 'rect', x, y, w, h, c: col })
const p = (d: string, col: string): Shape => ({ k: 'path', d, c: col })

/** One small overprinted composition per topic, so a topic is recognisable at a glance. */
const TOPIC_SHAPES: Record<GrammarTopic, Shape[]> = {
  'word-form': [r(10, 22, 34, 34, BLUE), c(44, 22, 15, PINK)],
  'tense-voice': [p('M8 50 A22 22 0 0 1 52 50 Z', YELLOW), p('M20 56 L40 18 L58 56 Z', BLUE)],
  'subject-verb-agreement': [c(24, 34, 17, PINK), c(41, 34, 17, BLUE)],
  prepositions: [r(10, 30, 44, 26, BLUE), c(32, 18, 11, PINK)],
  'conj-vs-prep': [r(8, 26, 48, 12, PINK), r(26, 8, 12, 48, BLUE)],
  pronouns: [c(28, 30, 19, PINK), c(46, 46, 11, YELLOW)],
  'relative-clauses': [r(8, 14, 28, 40, BLUE), p('M36 54 L36 22 L58 54 Z', PINK)],
  'reduced-clauses': [r(8, 10, 38, 38, YELLOW), r(26, 28, 28, 28, PINK)],
  conditionals: [p('M8 44 L28 10 L48 44 Z', BLUE), p('M20 22 L56 22 L38 54 Z', PINK)],
  inversion: [p('M10 12 L54 12 L32 50 Z', PINK), p('M18 56 L32 30 L46 56 Z', BLUE)],
  comparatives: [r(8, 38, 12, 18, BLUE), r(24, 26, 12, 30, BLUE), r(40, 10, 12, 46, PINK)],
  'gerund-infinitive': [p('M32 32 L32 6 A26 26 0 0 0 6 32 Z', PINK), p('M32 32 L58 32 A26 26 0 0 1 32 58 Z', BLUE)],
  collocations: [c(21, 34, 14, YELLOW), c(43, 34, 14, BLUE)],
  'sentence-insertion': [r(8, 12, 48, 8, BLUE), r(8, 44, 48, 8, BLUE), r(14, 24, 36, 16, PINK)],
  transitions: [p('M6 46 A20 20 0 0 1 46 46 Z', PINK), p('M24 46 A16 16 0 0 1 56 46 L56 54 L24 54 Z', BLUE)]
}

function renderShape(s: Shape, i: number) {
  if (s.k === 'circle') return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} style={{ fill: s.c }} />
  if (s.k === 'rect') return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} style={{ fill: s.c }} />
  return <path key={i} d={s.d} style={{ fill: s.c }} />
}

export function TopicMark({ topic, className }: { topic: GrammarTopic; className?: string }) {
  return (
    <svg className={`ink topic-mark ${className ?? ''}`} viewBox="4 4 56 56" aria-hidden="true" focusable="false">
      {TOPIC_SHAPES[topic].map(renderShape)}
    </svg>
  )
}

/** The big poster composition behind the Home headline. */
export function PosterShapes() {
  return (
    <svg className="ink poster-shapes" viewBox="0 0 420 380" aria-hidden="true" focusable="false">
      <circle cx="262" cy="112" r="104" style={{ fill: YELLOW }} />
      <path d="M128 206 L396 164 L420 316 L150 338 Z" style={{ fill: PINK }} />
      <path d="M268 380 L340 262 L412 380 Z" style={{ fill: BLUE }} />
    </svg>
  )
}

/** Small shapes for empty states. */
export function RestShapes() {
  return (
    <svg className="ink rest-shapes" viewBox="0 0 160 120" aria-hidden="true" focusable="false">
      <path d="M4 116 A44 44 0 0 1 92 116 Z" style={{ fill: YELLOW }} />
      <rect x="98" y="58" width="50" height="58" style={{ fill: BLUE }} />
      <circle cx="100" cy="46" r="26" style={{ fill: PINK }} />
    </svg>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={`icon ${className ?? ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 12 H20 M14 6 L20 12 L14 18" {...stroke} />
    </svg>
  )
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={`icon ${className ?? ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 12.5 L9.5 18 L20 6" {...stroke} strokeWidth={2.6} />
    </svg>
  )
}

export function CrossIcon({ className }: { className?: string }) {
  return (
    <svg className={`icon ${className ?? ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 6 L18 18 M18 6 L6 18" {...stroke} strokeWidth={2.6} />
    </svg>
  )
}

/** Key marks for the rail legend: the same ink meanings the quiz uses. */
export function LegendMark({ kind }: { kind: 'right' | 'wrong' | 'now' }) {
  return (
    <svg className="ink" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
      {kind === 'right' && <rect x="2" y="2" width="18" height="18" style={{ fill: BLUE }} />}
      {kind === 'wrong' && (
        <>
          <defs>
            <pattern id="legend-hatch" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2" height="4.5" style={{ fill: 'var(--pink-ink)' }} />
            </pattern>
          </defs>
          <rect x="2.75" y="2.75" width="16.5" height="16.5" style={{ fill: 'url(#legend-hatch)', stroke: 'var(--pink-ink)', strokeWidth: 1.5 }} />
        </>
      )}
      {kind === 'now' && <circle cx="11" cy="11" r="9.5" style={{ fill: YELLOW }} />}
    </svg>
  )
}
