import { addDays } from './dates'
import type { LeitnerCard } from './types'

export const INTERVALS = [1, 3, 7, 14, 30] as const

export function schedule(
  card: LeitnerCard | undefined,
  correct: boolean,
  today: string
): LeitnerCard | undefined {
  if (!correct) return { box: 1, due: addDays(today, INTERVALS[0]) }
  if (!card) return undefined
  const box = Math.min(5, card.box + 1)
  return { box, due: addDays(today, INTERVALS[box - 1]) }
}

export function dueIds(leitner: Record<string, LeitnerCard>, today: string): string[] {
  return Object.entries(leitner)
    .filter(([, card]) => card.due <= today)
    .sort(([a, ca], [b, cb]) => ca.due.localeCompare(cb.due) || a.localeCompare(b))
    .map(([id]) => id)
}
