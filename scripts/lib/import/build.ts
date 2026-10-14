import { POSITIONAL, mentionsAnswer } from '../../../src/shared/explainRules'
import { Part5Item, formatIssues, type Part5Topic } from '../../../src/shared/types'
import { toPoint } from '../points'
import { dedupeKey, type RawItem } from './normalize'
import type { BlindResult, SolveResult } from './prompts'

type Solved = SolveResult['items'][number]
type Blind = BlindResult['items'][number]

export interface Built {
  approved: Part5Item[]
  flagged: Part5Item[]
  errors: string[]
}

/** Next free private id per topic, continuing after every id ever used (approved, draft or rejected). */
export function makeNumberer(usedIds: string[]): (topic: Part5Topic) => string {
  const next = new Map<string, number>()
  for (const id of usedIds) {
    const m = /^p5x-([a-z-]+)-(\d{4})$/.exec(id)
    if (m) next.set(m[1], Math.max(next.get(m[1]) ?? 1, Number(m[2]) + 1))
  }
  return (topic) => {
    const n = next.get(topic) ?? 1
    next.set(topic, n + 1)
    return `p5x-${topic}-${String(n).padStart(4, '0')}`
  }
}

/** Why an item needs a human look, or null when the solver and the blind re-check agree. */
export function verdictFlag(raw: RawItem, solved: Solved, blind: Blind | undefined): string | null {
  if (solved.problem.trim()) return `solver: ${solved.problem.trim()}`
  if (!blind) return 'not re-checked'
  if (blind.answer !== solved.answer) {
    const name = (i: number) => raw.choices[i] ?? `#${i}`
    return `re-check chose "${name(blind.answer)}", solver chose "${name(solved.answer)}"`
  }
  if (!blind.confident) return 're-check not confident'
  const answer = raw.choices[solved.answer]
  if (answer !== undefined && !mentionsAnswer(solved.explain_en, answer)) return 'explanation does not mention the answer'
  if ([solved.explain_en, solved.explain_th, solved.trap].some((t) => POSITIONAL.test(t))) {
    return 'explanation refers to a choice by position'
  }
  return null
}

export function buildItems(
  batch: RawItem[],
  solved: Solved[],
  blind: Blind[],
  nextId: (topic: Part5Topic) => string
): Built {
  const out: Built = { approved: [], flagged: [], errors: [] }
  batch.forEach((raw, i) => {
    const s = solved.find((x) => x.index === i)
    if (!s) {
      out.errors.push(`no solution for "${raw.stem}"`)
      return
    }
    const flag = verdictFlag(raw, s, blind.find((x) => x.index === i))
    const r = Part5Item.safeParse({
      id: nextId(s.topic),
      part: 5,
      topic: s.topic,
      difficulty: Math.min(5, Math.max(1, s.difficulty)),
      stem: raw.stem,
      choices: raw.choices,
      answer: s.answer,
      trap: s.trap,
      explain: { en: s.explain_en, th: s.explain_th },
      ...(() => {
        const p = toPoint(s.point)
        return p ? { point: p } : {}
      })(),
      source: raw.source,
      status: flag ? 'draft' : 'approved',
      ...(flag ? { flag } : {})
    })
    if (!r.success) {
      out.errors.push(`"${raw.stem}": ${formatIssues(r.error)}`)
      return
    }
    ;(flag ? out.flagged : out.approved).push(r.data)
  })
  return out
}

export interface PlannedBatch {
  batch: RawItem[]
  /** Positions in `batch` whose key is not in the ledger yet. */
  todo: number[]
}

/** Fixed-size batches over ALL deduped items (so cache keys stay stable between runs); fully-done batches are dropped. */
export function planBatches(raws: RawItem[], size: number, ledger: Record<string, string>): PlannedBatch[] {
  const out: PlannedBatch[] = []
  for (let i = 0; i < raws.length; i += size) {
    const batch = raws.slice(i, i + size)
    const todo = batch.flatMap((r, j) => (dedupeKey(r) in ledger ? [] : [j]))
    if (todo.length) out.push({ batch, todo })
  }
  return out
}

/** Halves a batch (for a call whose output was cut off); `todo` is remapped, and a half with nothing to do is dropped. */
export function splitBatch(p: PlannedBatch): PlannedBatch[] {
  const mid = Math.ceil(p.batch.length / 2)
  const halves: PlannedBatch[] = [
    { batch: p.batch.slice(0, mid), todo: p.todo.filter((i) => i < mid) },
    { batch: p.batch.slice(mid), todo: p.todo.filter((i) => i >= mid).map((i) => i - mid) }
  ]
  return halves.filter((h) => h.todo.length > 0)
}

/** Builds only the `keep` positions of a batch, remapping solver/re-check indices so no ids are spent on skipped items. */
export function buildSubset(
  batch: RawItem[],
  solved: Solved[],
  blind: Blind[],
  keep: number[],
  nextId: (topic: Part5Topic) => string
): Built {
  const remap = <T extends { index: number }>(xs: T[]): T[] =>
    xs.flatMap((x) => {
      const j = keep.indexOf(x.index)
      return j < 0 ? [] : [{ ...x, index: j }]
    })
  return buildItems(
    keep.map((i) => batch[i]),
    remap(solved),
    remap(blind),
    nextId
  )
}
