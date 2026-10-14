export interface PageRange {
  from: number
  to: number
}

export function parsePages(spec?: string): PageRange | null {
  if (spec === undefined) return null
  const m = /^(\d+)(?:-(\d+))?$/.exec(spec.trim())
  const from = m ? Number(m[1]) : NaN
  const to = m ? Number(m[2] ?? m[1]) : NaN
  if (!m || from < 1 || to < from) throw new Error(`--pages must look like 5 or 3-10 (got "${spec}")`)
  return { from, to }
}

export function pageNumbers(count: number, range: PageRange | null): number[] {
  const from = range?.from ?? 1
  const to = Math.min(range?.to ?? count, count)
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)
}

export function chunk<T>(xs: T[], n: number): T[][] {
  if (!(n >= 1)) throw new Error(`chunk size must be at least 1 (got ${n})`)
  const out: T[][] = []
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n))
  return out
}
