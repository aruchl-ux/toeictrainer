import type { ItemSource } from './types'

/** "UNIT_3.pdf p.2 #12, …": where a private item was printed in the user's books. */
export function sourceText(sources: ItemSource[]): string {
  return sources.map((s) => `${s.file} p.${s.page}${s.no ? ` #${s.no}` : ''}`).join(', ')
}
