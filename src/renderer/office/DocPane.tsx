import { useEffect, useRef, useState, type ReactNode } from 'react'
import { splitHighlights } from '@shared/highlight'
import type { QuizEntry } from '@shared/quiz'
import type { Evidence } from '@shared/types'
import { DocIcon } from './icons'
import { useO } from './strings'

type Piece = { text: string; hit: boolean }

/** Splits a body into editor lines, keeping evidence marks that cross line breaks. */
function toLines(body: string, quotes: string[]): Piece[][] {
  const lines: Piece[][] = [[]]
  for (const seg of splitHighlights(body, quotes)) {
    seg.text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([])
      if (part) lines[lines.length - 1].push({ text: part, hit: seg.hit })
    })
  }
  return lines
}

const TOKEN = /(\{\{[1-4]\}\}|\[[1-4]\])/

function Tokens({ text, current }: { text: string; current: number | null }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        const blank = /^\{\{([1-4])\}\}$/.exec(part)
        if (blank) {
          const n = Number(blank[1])
          return (
            <code key={i} className={n - 1 === current ? 'blank now' : 'blank'}>
              [{n}] ____
            </code>
          )
        }
        if (/^\[[1-4]\]$/.test(part)) {
          return (
            <code key={i} className="marker">
              {part}
            </code>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

/** A passage as a read-only editor buffer: line numbers, and evidence lines marked like added lines in a diff. */
function Buffer({ body, quotes, current }: { body: string; quotes: string[]; current: number | null }) {
  const lines = toLines(body, quotes)
  return (
    <ol className="buffer">
      {lines.map((pieces, i) => {
        const added = pieces.some((p) => p.hit)
        return (
          <li key={i} className={added ? 'line added' : 'line'}>
            <span className="gutter" aria-hidden="true">
              <span className="ln">{i + 1}</span>
              <span className="sign">{added ? '+' : ''}</span>
            </span>
            <span className="code">
              {pieces.length === 0
                ? ' '
                : pieces.map((p, j): ReactNode =>
                    p.hit ? (
                      <mark key={j} className="ev">
                        <Tokens text={p.text} current={current} />
                      </mark>
                    ) : (
                      <Tokens key={j} text={p.text} current={current} />
                    )
                  )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * The document pane for Part 6 and Part 7 tasks. Mount it with a key per set so the
 * open tab survives while that set's questions advance.
 */
export function DocPane({ entry, evidence }: { entry: QuizEntry; evidence: Evidence[] | null }) {
  const { o } = useO()
  const docs =
    entry.kind === 'p7'
      ? entry.set.docs.map((d) => ({ title: d.title, kind: d.kind, body: d.body }))
      : entry.kind === 'p6'
        ? [{ title: entry.set.title, kind: 'text', body: entry.set.passage }]
        : []
  const [active, setActive] = useState(0)
  const body = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (evidence && evidence.length > 0) setActive(evidence[0].doc)
  }, [evidence])

  // Bring the proof into view once it is marked.
  useEffect(() => {
    const mark = body.current?.querySelector('mark.ev, code.blank.now')
    mark?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [evidence, active, entry])

  if (docs.length === 0) return null
  const i = Math.min(active, docs.length - 1)
  const doc = docs[i]
  const quotes = (evidence ?? []).filter((e) => e.doc === i).map((e) => e.quote)
  return (
    <section className="doc" aria-label={o('pane')}>
      <div className="tabs" role="tablist">
        {docs.map((d, k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === i}
            className={k === i ? 'tab on' : 'tab'}
            onClick={() => setActive(k)}
          >
            <DocIcon />
            <span className="tab-title">{d.title}</span>
            <span className="tab-kind">{d.kind}</span>
          </button>
        ))}
      </div>
      {evidence && evidence.length > 0 && (
        <p className="doc-note">
          <span className="sign-chip">+</span> {o('evidence')}
        </p>
      )}
      <div ref={body} className="doc-body" role="tabpanel">
        <Buffer body={doc.body} quotes={quotes} current={entry.kind === 'p6' ? entry.blank : null} />
      </div>
    </section>
  )
}
