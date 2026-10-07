import { useEffect, useState } from 'react'
import { splitHighlights } from '@shared/highlight'
import type { Evidence, Part7Doc } from '@shared/types'

const MARKER = /(\[[1-4]\])/

function Body({ body, quotes }: { body: string; quotes: string[] }) {
  return (
    <p className="doc-body">
      {splitHighlights(body, quotes).map((seg, i) => {
        const parts = seg.text.split(MARKER).map((t, j) =>
          MARKER.test(t) ? (
            <span key={j} className="insert-marker">
              {t}
            </span>
          ) : (
            <span key={j}>{t}</span>
          )
        )
        return seg.hit ? (
          <mark key={i} className="evidence">
            {parts}
          </mark>
        ) : (
          <span key={i}>{parts}</span>
        )
      })}
    </p>
  )
}

export function PassageView({ docs, evidence }: { docs: Part7Doc[]; evidence: Evidence[] | null }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (evidence && evidence.length > 0) setActive(evidence[0].doc)
  }, [evidence])
  const doc = docs[Math.min(active, docs.length - 1)]
  const quotes = (evidence ?? []).filter((e) => e.doc === active).map((e) => e.quote)
  return (
    <div className="passage sheet p7-passage">
      <div className="p7-scroll">
        {docs.length > 1 && (
          <div className="doc-tabs" role="tablist">
            {docs.map((d, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={i === active ? 'doc-tab active' : 'doc-tab'}
                onClick={() => setActive(i)}
              >
                {d.title}
              </button>
            ))}
          </div>
        )}
        <h3>{doc.title}</h3>
        <Body body={doc.body} quotes={quotes} />
      </div>
    </div>
  )
}
