import type { ItemSource } from '../../../src/shared/types'

/** One question as Claude read it off a page. `no` is the printed number, 0 if none. */
export interface ExtractedItem {
  no: number
  stem: string
  choices: string[]
}

/** A unique question with every place it was printed. */
export interface RawItem {
  stem: string
  choices: string[]
  source: ItemSource[]
}

/** Books print blanks as ----, ____ or both split over a line break; the app uses ____. */
export function normalizeStem(stem: string): string {
  return stem
    .replace(/[_\-–—]{2,}(?:\s*[_\-–—]{2,})*/g, ' ____ ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

export function cleanChoice(choice: string): string {
  return choice
    .replace(/^\s*\(?[A-Da-d][).]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function cleanItem(e: ExtractedItem): ExtractedItem {
  return { no: e.no, stem: normalizeStem(e.stem), choices: e.choices.map(cleanChoice) }
}

/** Why an item cannot become a Part 5 question, or null if it can. */
export function problemOf(item: { stem: string; choices: string[] }): string | null {
  const blanks = item.stem.split('____').length - 1
  if (blanks !== 1) return `stem has ${blanks} blanks`
  if (item.choices.length !== 4) return `${item.choices.length} choices`
  if (item.choices.some((c) => c === '')) return 'empty choice'
  return null
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/____/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** The same question printed in two books gets the same key, whatever the choice order or spacing. */
export function dedupeKey(item: { stem: string; choices: string[] }): string {
  return `${norm(item.stem)}|${item.choices.map(norm).sort().join('|')}`
}

/** First printing wins; later printings are added to its sources. Input order is kept. */
export function dedupe(pages: { file: string; page: number; items: ExtractedItem[] }[]): RawItem[] {
  const byKey = new Map<string, RawItem>()
  for (const p of pages) {
    for (const it of p.items) {
      const src: ItemSource = it.no > 0 ? { file: p.file, page: p.page, no: it.no } : { file: p.file, page: p.page }
      const prev = byKey.get(dedupeKey(it))
      if (prev) prev.source.push(src)
      else byKey.set(dedupeKey(it), { stem: it.stem, choices: it.choices, source: [src] })
    }
  }
  return [...byKey.values()]
}
