import type { ContentBank, Explain, GrammarTopic, Part5Item, Part5Topic, Part6Set } from './types'

export type QuizEntry = { kind: 'p5'; item: Part5Item } | { kind: 'p6'; set: Part6Set; blank: number }

export interface EntryFields {
  topic: GrammarTopic
  choices: string[]
  answer: number
  trap: string
  explain: Explain
}

export const blankId = (setId: string, blank: number): string => `${setId}#${blank + 1}`

export function entryId(e: QuizEntry): string {
  return e.kind === 'p5' ? e.item.id : blankId(e.set.id, e.blank)
}

export function entryFields(e: QuizEntry): EntryFields {
  const src = e.kind === 'p5' ? e.item : e.set.blanks[e.blank]
  return { topic: src.topic, choices: src.choices, answer: src.answer, trap: src.trap, explain: src.explain }
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function flattenSet(set: Part6Set): QuizEntry[] {
  return set.blanks.map((_, blank) => ({ kind: 'p6', set, blank }))
}

export function pickTopicDrill(
  bank: ContentBank,
  topic: Part5Topic,
  n = 10,
  rng: () => number = Math.random
): QuizEntry[] {
  const items = bank.part5.filter((i) => i.topic === topic)
  return shuffle(items, rng)
    .slice(0, n)
    .map((item) => ({ kind: 'p5', item }))
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
  return [...p5, ...p6]
}

export function resolveIds(bank: ContentBank, ids: string[]): QuizEntry[] {
  const p5 = new Map(bank.part5.map((i) => [i.id, i]))
  const p6 = new Map(bank.part6.map((s) => [s.id, s]))
  const out: QuizEntry[] = []
  for (const id of ids) {
    const item = p5.get(id)
    if (item) {
      out.push({ kind: 'p5', item })
      continue
    }
    const m = /^(p6-\d{4})#([1-4])$/.exec(id)
    const set = m ? p6.get(m[1]) : undefined
    if (m && set) out.push({ kind: 'p6', set, blank: Number(m[2]) - 1 })
  }
  return out
}
