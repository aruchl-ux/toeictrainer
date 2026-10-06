import { useCallback, useEffect, useState } from 'react'
import type { DraftEntry } from '@shared/api'
import { useApp } from '../../app/AppContext'

function DraftCard({ draft, onDone }: { draft: DraftEntry; onDone(): void }) {
  const [text, setText] = useState(() => JSON.stringify(draft.item, null, 2))
  const [error, setError] = useState<string | null>(null)

  async function approve() {
    let item: unknown
    try {
      item = JSON.parse(text)
    } catch {
      setError('Invalid JSON')
      return
    }
    const r = await window.api.dev.approveDraft(draft.file, draft.id, item)
    if (r.ok) onDone()
    else setError(r.error)
  }

  async function reject() {
    await window.api.dev.rejectDraft(draft.file, draft.id)
    onDone()
  }

  return (
    <article className="card draft">
      <header>
        <strong>{draft.id}</strong> <small className="muted">{draft.file}</small>
        {typeof draft.item.flag === 'string' && <span className="flag">⚠ {draft.item.flag}</span>}
      </header>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={18} spellCheck={false} />
      <div className="actions">
        <button type="button" className="primary" onClick={() => void approve()}>
          Approve
        </button>
        <button type="button" onClick={() => void reject()}>
          Reject
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </article>
  )
}

export function ContentReviewScreen() {
  const { reloadBank } = useApp()
  const [drafts, setDrafts] = useState<DraftEntry[] | null>(null)
  const refresh = useCallback(() => {
    void window.api.dev.listDrafts().then(setDrafts)
  }, [])
  useEffect(refresh, [refresh])

  const onDone = () => {
    refresh()
    void reloadBank()
  }

  return (
    <section>
      <h1>Content review</h1>
      {drafts === null ? (
        <p className="muted">Loading…</p>
      ) : drafts.length === 0 ? (
        <p className="muted">No drafts. Generate some with npm run gen.</p>
      ) : (
        drafts.map((d) => <DraftCard key={`${d.file}:${d.id}`} draft={d} onDone={onDone} />)
      )}
    </section>
  )
}
