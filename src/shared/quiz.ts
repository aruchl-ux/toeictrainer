import type { ContentBank, Explain, Part5Item, Part5Topic, Part6Set, Part7Set, Skill } from './types'

/**
 * `order` is the display order of the choices as indexes into the source choices
 * (e.g. [2, 0, 3, 1]); omitted means source order. Ids and content stay untouched.
 */
export type QuizEntry =
  | { kind: 'p5'; item: Part5Item; order?: number[] }
  | { kind: 'p6'; set: Part6Set; blank: number; order?: number[] }
  | { kind: 'p7'; set: Part7Set; q: number; order?: number[] }

export interface EntryFields {
  topic: Skill
  choices: string[]
  answer: number
  trap: string
  explain: Explain
}

export const blankId = (setId: string, blank: number): string => `${setId}#${blank + 1}`

export const entryPart = (e: QuizEntry): 'p5' | 'p6' | 'p7' => e.kind

export function entryId(e: QuizEntry): string {
  if (e.kind === 'p5') return e.item.id
  if (e.kind === 'p6') return blankId(e.set.id, e.blank)
  return `${e.set.id}#q${e.q + 1}`
}

function source(e: QuizEntry): { topic: Skill; choices: string[]; answer: number; trap: string; explain: Explain } {
  if (e.kind === 'p5') return e.item
  if (e.kind === 'p6') return e.set.blanks[e.blank]
  const q = e.set.questions[e.q]
  return { topic: q.type, choices: q.choices, answer: q.answer, trap: '', explain: q.explain }
}

export function entryFields(e: QuizEntry): EntryFields {
  const src = source(e)
  const order = e.order ?? src.choices.map((_, i) => i)
  return {
    topic: src.topic,
    choices: order.map((i) => src.choices[i]),
    answer: order.indexOf(src.answer),
    trap: src.trap,
    explain: src.explain
  }
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Gives every entry its own random choice order, so the answer is not always in the same slot. */
export function shuffleChoices(entries: QuizEntry[], rng: () => number = Math.random): QuizEntry[] {
  return entries.map((e) => {
    const n = source(e).choices.length
    // Insertion questions list passage positions [1]-[4]; shuffling them would only confuse.
    const keep = e.kind === 'p7' && e.set.questions[e.q].type === 'insertion'
    return { ...e, order: keep ? [...Array(n).keys()] : shuffle([...Array(n).keys()], rng) }
  })
}

export function flattenSet(set: Part6Set): QuizEntry[] {
  return set.blanks.map((_, blank) => ({ kind: 'p6', set, blank }))
}

export function flattenPart7(set: Part7Set): QuizEntry[] {
  return set.questions.map((_, q) => ({ kind: 'p7', set, q }))
}

export function pickTopicDrill(
  bank: ContentBank,
  topic: Part5Topic,
  n = 10,
  rng: () => number = Math.random
): QuizEntry[] {
  const items = bank.part5.filter((i) => i.topic === topic)
  return shuffleChoices(
    shuffle(items, rng)
      .slice(0, n)
      .map((item) => ({ kind: 'p5', item })),
    rng
  )
}

export function pickMixedTest(
  bank: ContentBank,
  rng: () => number = Math.random,
  p5Count = 30,
  p6Count = 4
): QuizEntry[] {
  const p5: QuizEntry[] = shuffle(bank.part5, rng)
    .slice(0, p5Count)
    .map((item) => ({ kind: 'p5', item }))
  const p6 = shuffle(bank.part6, rng).slice(0, p6Count).flatMap(flattenSet)
  return shuffleChoices([...p5, ...p6], rng)
}

export function resolveIds(bank: ContentBank, ids: string[]): QuizEntry[] {
  const p5 = new Map(bank.part5.map((i) => [i.id, i]))
  const p6 = new Map(bank.part6.map((s) => [s.id, s]))
  const p7 = new Map(bank.part7.map((s) => [s.id, s]))
  const out: QuizEntry[] = []
  for (const id of ids) {
    const item = p5.get(id)
    if (item) {
      out.push({ kind: 'p5', item })
      continue
    }
    const m7 = /^(p7-\d{4})#q([1-5])$/.exec(id)
    const set7 = m7 ? p7.get(m7[1]) : undefined
    if (m7 && set7 && Number(m7[2]) <= set7.questions.length) {
      out.push({ kind: 'p7', set: set7, q: Number(m7[2]) - 1 })
      continue
    }
    const m = /^(p6-\d{4})#([1-4])$/.exec(id)
    const set = m ? p6.get(m[1]) : undefined
    if (m && set) out.push({ kind: 'p6', set, blank: Number(m[2]) - 1 })
  }
  return out
}
