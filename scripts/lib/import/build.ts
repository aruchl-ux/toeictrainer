import { Part5Item, formatIssues, type Part5Topic } from '../../../src/shared/types'
import type { RawItem } from './normalize'
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
