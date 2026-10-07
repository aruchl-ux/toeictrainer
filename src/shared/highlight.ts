export interface Segment {
  text: string
  hit: boolean
}

/** Splits `body` into plain and highlighted segments. Each quote marks its first occurrence that does not overlap an earlier mark. */
export function splitHighlights(body: string, quotes: string[]): Segment[] {
  const ranges: [number, number][] = []
  for (const q of quotes) {
    if (!q) continue
    let from = 0
    for (;;) {
      const at = body.indexOf(q, from)
      if (at < 0) break
      const end = at + q.length
      if (ranges.every(([s, e]) => end <= s || at >= e)) {
        ranges.push([at, end])
        break
      }
      from = at + 1
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  const out: Segment[] = []
  let pos = 0
  for (const [s, e] of ranges) {
    if (s > pos) out.push({ text: body.slice(pos, s), hit: false })
    out.push({ text: body.slice(s, e), hit: true })
    pos = e
  }
  if (pos < body.length || out.length === 0) out.push({ text: body.slice(pos), hit: false })
  return out
}
