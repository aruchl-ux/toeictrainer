import { entryId, entryFields, entryPart, flattenPart7, flattenSet, resolveIds, shuffle, shuffleChoices, type QuizEntry } from './quiz'
import type { ActiveReadingTest, ContentBank, Part7Format, TestLength, PartScore } from './types'
import type { Band } from './scoring'

export interface Blueprint {
  p5: number
  p6: number
  single: number
  double: number
  triple: number
}

export const BLUEPRINT: Record<TestLength, Blueprint> = {
  full: { p5: 30, p6: 4, single: 10, double: 2, triple: 3 },
  half: { p5: 15, p6: 2, single: 5, double: 1, triple: 1 }
}

export const DURATION_MS: Record<TestLength, number> = { full: 75 * 60_000, half: 38 * 60_000 }

const byFormat = (bank: ContentBank, f: Part7Format) => bank.part7.filter((s) => s.format === f)

export function availableCounts(bank: ContentBank, length: TestLength): Blueprint {
  const b = BLUEPRINT[length]
  return {
    p5: Math.min(b.p5, bank.part5.length),
    p6: Math.min(b.p6, bank.part6.length),
    single: Math.min(b.single, byFormat(bank, 'single').length),
    double: Math.min(b.double, byFormat(bank, 'double').length),
    triple: Math.min(b.triple, byFormat(bank, 'triple').length)
  }
}

export function buildReadingTest(bank: ContentBank, length: TestLength, rng: () => number = Math.random): QuizEntry[] {
  const c = availableCounts(bank, length)
  const p5: QuizEntry[] = shuffle(bank.part5, rng).slice(0, c.p5).map((item) => ({ kind: 'p5', item }))
  const p6 = shuffle(bank.part6, rng).slice(0, c.p6).flatMap(flattenSet)
  const p7 = (['single', 'double', 'triple'] as const).flatMap((f) =>
    shuffle(byFormat(bank, f), rng).slice(0, c[f]).flatMap(flattenPart7)
  )
  return shuffleChoices([...p5, ...p6, ...p7], rng)
}

export function restoreReadingTest(bank: ContentBank, saved: ActiveReadingTest): QuizEntry[] | null {
  const entries = resolveIds(bank, saved.ids)
  if (entries.length !== saved.ids.length || saved.orders.length !== entries.length) return null
  const out: QuizEntry[] = []
  for (let i = 0; i < entries.length; i++) {
    const order = saved.orders[i]
    if (entryId(entries[i]) !== saved.ids[i]) return null
    if (order.length !== 4 || new Set(order).size !== 4) return null
    out.push({ ...entries[i], order })
  }
  return out
}

export interface TestState {
  length: TestLength
  entries: QuizEntry[]
  answers: Record<string, number>
  flags: string[]
  index: number
  elapsedMs: number
  durationMs: number
  done: boolean
}

export type TestAction =
  | { type: 'answer'; choice: number }
  | { type: 'jump'; index: number }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'flag' }
  | { type: 'tick'; ms: number }
  | { type: 'submit' }

export function initTest(
  entries: QuizEntry[],
  length: TestLength,
  saved?: Pick<ActiveReadingTest, 'answers' | 'flags' | 'index' | 'elapsedMs'>
): TestState {
  const durationMs = DURATION_MS[length]
  return {
    length,
    entries,
    answers: saved?.answers ?? {},
    flags: saved?.flags ?? [],
    index: Math.min(saved?.index ?? 0, Math.max(0, entries.length - 1)),
    elapsedMs: Math.min(saved?.elapsedMs ?? 0, durationMs),
    durationMs,
    done: entries.length === 0
  }
}

const clamp = (s: TestState, i: number) => Math.max(0, Math.min(s.entries.length - 1, i))

export function testReducer(s: TestState, a: TestAction): TestState {
  if (s.done) return s
  const id = entryId(s.entries[s.index])
  switch (a.type) {
    case 'answer':
      return { ...s, answers: { ...s.answers, [id]: a.choice } }
    case 'jump':
      return { ...s, index: clamp(s, a.index) }
    case 'next':
      return { ...s, index: clamp(s, s.index + 1) }
    case 'prev':
      return { ...s, index: clamp(s, s.index - 1) }
    case 'flag':
      return { ...s, flags: s.flags.includes(id) ? s.flags.filter((f) => f !== id) : [...s.flags, id] }
    case 'tick': {
      const elapsedMs = Math.min(s.durationMs, s.elapsedMs + Math.max(0, a.ms))
      return { ...s, elapsedMs, done: elapsedMs >= s.durationMs }
    }
    case 'submit':
      return { ...s, done: true }
  }
}

export function toActive(s: TestState): ActiveReadingTest {
  return {
    length: s.length,
    ids: s.entries.map(entryId),
    orders: s.entries.map((e) => e.order ?? [0, 1, 2, 3]),
    answers: s.answers,
    flags: s.flags,
    index: s.index,
    elapsedMs: Math.round(s.elapsedMs)
  }
}

export function scoreTest(s: TestState): { p5: PartScore; p6: PartScore; p7: PartScore } {
  const parts = { p5: { correct: 0, total: 0 }, p6: { correct: 0, total: 0 }, p7: { correct: 0, total: 0 } }
  for (const e of s.entries) {
    const p = parts[entryPart(e)]
    p.total++
    if (s.answers[entryId(e)] === entryFields(e).answer) p.correct++
  }
  return parts
}

// Approximate raw-percentage → scaled Reading band. An estimate, not ETS's conversion.
const READING_BANDS: { min: number; band: Band }[] = [
  { min: 0.96, band: { low: 460, high: 495 } },
  { min: 0.86, band: { low: 400, high: 460 } },
  { min: 0.76, band: { low: 345, high: 400 } },
  { min: 0.66, band: { low: 290, high: 345 } },
  { min: 0.56, band: { low: 235, high: 290 } },
  { min: 0.46, band: { low: 180, high: 235 } },
  { min: 0.36, band: { low: 130, high: 180 } },
  { min: 0, band: { low: 5, high: 130 } }
]

export function estimateReadingBand(parts: { p5: PartScore; p6: PartScore; p7: PartScore }): Band | null {
  const total = parts.p5.total + parts.p6.total + parts.p7.total
  if (total === 0) return null
  const pct = (parts.p5.correct + parts.p6.correct + parts.p7.correct) / total
  return READING_BANDS.find((b) => pct >= b.min)!.band
}
