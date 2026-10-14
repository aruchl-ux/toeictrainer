import type { ContentBank, Part5Topic, Point } from '../types'
import type { CheatSheet } from './types'

/** One row of a sheet's "points tested in drills" list. */
export interface SheetPoint {
  key: string
  th: string
  en: string
  wrong: string[]
}

const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim()

/** Every point the bank's questions test for one topic: one row per distinct key, sorted A–Z. */
export function sheetPoints(topic: Part5Topic, bank: Pick<ContentBank, 'part5' | 'part6'>): SheetPoint[] {
  const points = [
    ...bank.part5.filter((i) => i.topic === topic).map((i) => i.point),
    ...bank.part6.flatMap((s) => s.blanks).filter((b) => b.topic === topic).map((b) => b.point)
  ].filter((p): p is Point => p !== undefined)
  const rows = new Map<string, SheetPoint>()
  for (const p of points) {
    const k = norm(p.key)
    const row = rows.get(k) ?? { key: p.key.trim(), th: p.th, en: p.en, wrong: [] }
    for (const w of p.wrong ?? []) if (!row.wrong.some((x) => norm(x) === norm(w))) row.wrong.push(w.trim())
    rows.set(k, row)
  }
  return [...rows.values()].sort((a, b) => norm(a.key).localeCompare(norm(b.key)))
}

/** All the English a sheet shows, flattened so "meet + a deadline/a demand" contains "meet a deadline". */
function sheetText(sheet: CheatSheet): string[] {
  return sheet.entries.flatMap((e) => {
    const formulas = e.formula.flatMap((line) => {
      const parts = line.split(' + ').map((p) => p.split('/'))
      // Every combination of the slash alternatives, e.g. "meet a deadline", "meet a demand".
      const variants = parts.reduce<string[]>((acc, alts) => acc.flatMap((a) => alts.map((x) => `${a} ${x}`)), [''])
      // The line as written too, so a formula-style key like "must + V1" matches it.
      return [line, ...variants]
    })
    return [...formulas, ...(e.words ?? []).map((w) => w.w), ...(e.clues ?? []), e.example.en.replace(/\{\{|\}\}/g, '')].map(norm)
  })
}

/** Points no entry mentions yet; the audit lists these so they can be folded into an entry. */
export function uncoveredPoints(sheet: CheatSheet, points: SheetPoint[]): SheetPoint[] {
  const text = sheetText(sheet)
  return points.filter((p) => {
    const key = wholeWords(norm(p.key))
    return !text.some((t) => key.test(t))
  })
}

/** Matches the key only as whole words, so "at" is not found inside "that" or "meeting". */
function wholeWords(key: string): RegExp {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`)
}
