import type { Part5Topic } from '../types'
import { collocations } from './collocations'
import { comparatives } from './comparatives'
import { conditionals } from './conditionals'
import { conjVsPrep } from './conj-vs-prep'
import { determiners } from './determiners'
import { gerundInfinitive } from './gerund-infinitive'
import { inversion } from './inversion'
import { modals } from './modals'
import { nounClauses } from './noun-clauses'
import { prepositions } from './prepositions'
import { pronouns } from './pronouns'
import { reducedClauses } from './reduced-clauses'
import { relativeClauses } from './relative-clauses'
import { subjectVerbAgreement } from './subject-verb-agreement'
import { tenseVoice } from './tense-voice'
import type { CheatSheet } from './types'
import { wordChoice } from './word-choice'
import { wordForm } from './word-form'

export * from './types'

/** Formula sheets for every Part 5 topic, bundled with the app. */
export const CHEAT_SHEETS: Record<Part5Topic, CheatSheet> = {
  'word-form': wordForm,
  'tense-voice': tenseVoice,
  'subject-verb-agreement': subjectVerbAgreement,
  prepositions,
  'conj-vs-prep': conjVsPrep,
  pronouns,
  'relative-clauses': relativeClauses,
  'reduced-clauses': reducedClauses,
  conditionals,
  inversion,
  comparatives,
  'gerund-infinitive': gerundInfinitive,
  collocations,
  'word-choice': wordChoice,
  determiners,
  modals,
  'noun-clauses': nounClauses
}

/** The sheet for a topic, or null for topics without one (Part 6-only skills). */
export function cheatSheetFor(topic: string): CheatSheet | null {
  return (CHEAT_SHEETS as Record<string, CheatSheet | undefined>)[topic] ?? null
}
