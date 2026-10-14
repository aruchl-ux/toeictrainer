import { z } from 'zod'
import { Part5Topic } from '../../../src/shared/types'
import { DIFFICULTY_GUIDE, EXPLAIN_FIELD_RULES, type Prompt } from '../gen'
import { GenPoint } from '../points'

// Loose shapes for structured outputs; strict validation happens with Part5Item afterwards.
export const ExtractResult = z.object({
  pageKind: z.enum(['part5', 'other']),
  items: z.array(z.object({ no: z.number().int(), stem: z.string(), choices: z.array(z.string()) }))
})
export type ExtractResult = z.infer<typeof ExtractResult>

export const SolveResult = z.object({
  items: z.array(
    z.object({
      index: z.number().int(),
      answer: z.number().int(),
      topic: Part5Topic,
      difficulty: z.number().int(),
      trap: z.string(),
      explain_en: z.string(),
      explain_th: z.string(),
      point: GenPoint,
      problem: z.string()
    })
  )
})
export type SolveResult = z.infer<typeof SolveResult>

export const BlindResult = z.object({
  items: z.array(z.object({ index: z.number().int(), answer: z.number().int(), confident: z.boolean() }))
})
export type BlindResult = z.infer<typeof BlindResult>

export const extractSystem = `You turn one page of a Thai TOEIC prep book into structured TOEIC Reading Part 5 questions.
- pageKind = "part5" if the page has incomplete-sentence multiple-choice questions (one sentence with one blank and four options A–D). Otherwise "other" (word lists, grammar explanations, listening, reading passages, answer keys, contents pages) with an empty items list.
- The page may be laid out in two columns, so a question's sentence and options can be split up or mixed with a neighbouring question. Rebuild each question from its number and options.
- "no": the question number printed in the book, or 0 if there is none.
- "stem": the sentence as printed, with the blank written as ____ whatever the book used (dashes, underscores, dots). Only repair line-break hyphenation and broken spacing; keep the book's wording.
- "choices": the four options in order A, B, C, D, without the letter and without grammar labels such as "(Adjective)".
- Skip any question that is not complete on this page. Never invent text. Do not answer the questions.
- Ignore Thai text, headers and page numbers.`

const TOPIC_GUIDE = `Topics (pick the one the item really tests):
- word-form: four forms of one word family; the position decides (noun, verb, adjective, adverb)
- tense-voice: verb tense, or active vs passive
- subject-verb-agreement: singular vs plural verb for the subject
- prepositions: choosing a preposition (in, on, at, by, for, during, within…)
- conj-vs-prep: conjunction vs preposition of similar meaning (although / despite, because / because of), paired conjunctions
- pronouns: personal, possessive, reflexive and indefinite pronouns
- relative-clauses: who, which, that, whose, whom, where
- reduced-clauses: V-ing or V3 phrases that replace a clause
- conditionals: if, unless, provided that, mixed conditionals
- inversion: inverted order (Should you…, Never have…, Only after…)
- comparatives: comparative and superlative forms, as … as
- gerund-infinitive: V-ing vs to V after a verb or preposition; causatives (have / make / let / get someone do)
- collocations: fixed word partnerships (meet a deadline, place an order)
- word-choice: the choices are the same part of speech with different meanings; context decides
- determiners: articles and quantifiers (each, every, all, most, few, little, another, other)
- modals: can, must, should, may, might; modal + have V3
- noun-clauses: that, what, whether / if, or wh-word clauses used as subject or object`

export function solvePrompt(items: { index: number; stem: string; choices: string[] }[]): Prompt {
  const system = `You are an expert TOEIC teacher for Thai learners. Each numbered item is a TOEIC Part 5 practice question printed in a Thai prep book; no answer key is available.
Return exactly one entry per input item, echoing its "index" unchanged.
For each item return:
- "answer": the 0-based index of the one correct choice.
- "topic": the single grammar point it tests, from the list below.
- "difficulty": 1–5 on the scale below.
${EXPLAIN_FIELD_RULES}
- Never refer to a choice by letter or position ("A", "the first option"); the app shuffles choices. Name the words themselves.
- The English explanation must mention the correct choice.
- "problem": "" if the item is sound. Otherwise a short reason: no correct choice, more than one correct choice, garbled text, a typo that changes the answer, or not a Part 5 question. Still give your best answer.
${TOPIC_GUIDE}
${DIFFICULTY_GUIDE}`
  return { system, user: JSON.stringify(items, null, 2) }
}

export function blindPrompt(items: { index: number; stem: string; choices: string[] }[]): Prompt {
  const system = `Answer each TOEIC Part 5 question. Return exactly one entry per input item, echoing its "index" unchanged. Return the 0-based index of the one correct choice for each item index.
Set confident=false if more than one choice could be right, no choice is right, or the text is unclear.`
  return { system, user: JSON.stringify(items, null, 2) }
}
