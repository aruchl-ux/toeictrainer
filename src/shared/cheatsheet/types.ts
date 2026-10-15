import type { Explain, Part5Topic } from '../types'

/** A word used in a formula, with what it means, e.g. "owing to = เนื่องจาก". */
export interface CheatWord {
  w: string
  en: string
  th: string
}

/** The error a Thai learner actually makes with this entry, shown as ✗ wrong → ✓ right. */
export interface CheatMistake {
  wrong: string
  right: string
  why: Explain
}

/** One structure on a topic's cheat sheet, e.g. "Present simple: S + V(s/es) + Obj". */
export interface CheatEntry {
  /** Kebab-case, unique across all sheets. */
  id: string
  name: Explain
  /** 1–3 lines. Parts are joined by ' + '; ', ' or '; ' marks a clause break. */
  formula: string[]
  /** When to use it, in one or two short sentences. */
  use: Explain
  /** `en` marks the part the formula produces with {{…}}; `th` is a plain translation. */
  example: Explain
  /** Meanings of the words in the formula, so a choice is understood, not just placed. */
  words?: CheatWord[]
  /** Signal words or pairs that point to this entry, each with its meaning. */
  clues?: CheatWord[]
  /** The common mistake for this entry, shown as ✗ wrong → ✓ right. */
  mistake: CheatMistake
}

export interface CheatSheet {
  topic: Part5Topic
  intro: Explain
  entries: CheatEntry[]
}

/** The English of a clue. */
export const clueText = (c: CheatWord): string => c.w

/** subject: S · verb: V forms and to-infinitives · slot: Obj, N, Adj, Adv… · word: literal English · punct: clause break (, or ;). */
export type FormulaKind = 'subject' | 'verb' | 'slot' | 'word' | 'punct'

export interface FormulaPart {
  text: string
  kind: FormulaKind
}

const SUBJECT = /^S\d?$/
const VERB = /^(to )?V(?![a-z])/
const SLOT = /^(Obj|N|NP|Adj|Adv|Clause|Prep|Pron|Det)(?![a-z])/

function kindOf(text: string): FormulaKind {
  // Optional parts are written in brackets: "(Adv)" is still an adverb slot.
  const core = text.replace(/^\((.*)\)$/, '$1')
  if (SUBJECT.test(core)) return 'subject'
  if (VERB.test(core)) return 'verb'
  if (SLOT.test(core)) return 'slot'
  return 'word'
}

/** Splits one formula line into tagged parts, so a slot looks the same on every sheet. */
export function formulaParts(line: string): FormulaPart[] {
  return line
    .split(/ \+ |(, |; )/)
    .filter((p): p is string => p !== undefined && p !== '')
    .map((p) => (p === ', ' || p === '; ' ? { text: p.trim(), kind: 'punct' } : { text: p, kind: kindOf(p) }))
}

/** Splits an example on {{…}} into plain and highlighted pieces. */
export function exampleParts(text: string): { text: string; hit: boolean }[] {
  return text
    .split(/(\{\{[^}]+\}\})/)
    .filter((p) => p !== '')
    .map((p) => {
      const m = /^\{\{([^}]+)\}\}$/.exec(p)
      return m ? { text: m[1], hit: true } : { text: p, hit: false }
    })
}
