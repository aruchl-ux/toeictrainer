import { z } from 'zod'
import {
  GRAMMAR_TOPICS,
  GrammarTopic,
  Part5Item,
  Part6Set,
  formatIssues,
  type Part5Topic
} from '../../src/shared/types'
import { GenPoint, POINT_RULES, isPart5Topic, pointField } from './points'

// Generation schemas are deliberately loose (no length/regex limits) so they work with
// structured outputs; strict validation happens afterwards with the app's own schemas.
const genChoiceFields = {
  choices: z.array(z.string()),
  answer: z.number().int(),
  trap: z.string(),
  explain_en: z.string(),
  explain_th: z.string(),
  difficulty: z.number().int(),
  point: GenPoint
}

export const GenPart5 = z.object({
  items: z.array(z.object({ stem: z.string(), ...genChoiceFields }))
})
export type GenPart5 = z.infer<typeof GenPart5>

export const GenPart6 = z.object({
  sets: z.array(
    z.object({
      title: z.string(),
      passage: z.string(),
      blanks: z.array(z.object({ topic: GrammarTopic, ...genChoiceFields }))
    })
  )
})
export type GenPart6 = z.infer<typeof GenPart6>

export const CheckResult = z.object({
  verdicts: z.array(z.object({ index: z.number().int(), ok: z.boolean(), reason: z.string() }))
})
export type CheckResult = z.infer<typeof CheckResult>

export interface Prompt {
  system: string
  user: string
}

const pad = (n: number) => String(n).padStart(4, '0')

export function nextNumber(ids: string[]): number {
  let max = 0
  for (const id of ids) {
    const m = /(\d{4})$/.exec(id)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max + 1
}

/** Parse one draft file's text; a malformed file yields no items plus a warning instead of throwing. */
export function parseDraftFile(text: string, name: string): { items: Record<string, unknown>[]; warning?: string } {
  try {
    const data: unknown = JSON.parse(text)
    if (!Array.isArray(data)) throw new Error('not an array')
    return { items: data.filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null) }
  } catch (e) {
    return { items: [], warning: `${name}: unreadable draft file skipped (${e instanceof Error ? e.message : String(e)})` }
  }
}

export function toPart5Drafts(
  gen: GenPart5,
  topic: Part5Topic,
  start: number
): { items: Part5Item[]; errors: string[] } {
  const items: Part5Item[] = []
  const errors: string[] = []
  gen.items.forEach((g, i) => {
    const r = Part5Item.safeParse({
      id: `p5-${topic}-${pad(start + items.length)}`,
      part: 5,
      topic,
      difficulty: g.difficulty,
      stem: g.stem,
      choices: g.choices,
      answer: g.answer,
      trap: g.trap,
      explain: { en: g.explain_en, th: g.explain_th },
      ...pointField(g.point),
      status: 'draft'
    })
    if (r.success) items.push(r.data)
    else errors.push(`item ${i}: ${formatIssues(r.error)}`)
  })
  return { items, errors }
}

export function toPart6Drafts(gen: GenPart6, start: number): { items: Part6Set[]; errors: string[] } {
  const items: Part6Set[] = []
  const errors: string[] = []
  gen.sets.forEach((g, i) => {
    const r = Part6Set.safeParse({
      id: `p6-${pad(start + items.length)}`,
      part: 6,
      title: g.title,
      passage: g.passage,
      blanks: g.blanks.map((b) => ({
        topic: b.topic,
        difficulty: b.difficulty,
        choices: b.choices,
        answer: b.answer,
        trap: b.trap,
        explain: { en: b.explain_en, th: b.explain_th },
        // Part 6-only topics have no cheat sheet, so their blanks get no point.
        ...(isPart5Topic(b.topic) ? pointField(b.point) : {})
      })),
      status: 'draft'
    })
    if (r.success) items.push(r.data)
    else errors.push(`set ${i}: ${formatIssues(r.error)}`)
  })
  return { items, errors }
}

/** Keeps an earlier flag (e.g. a copyright-overlap hint) when a new reason is added. */
export const addFlag = (existing: string | undefined, reason: string): string => (existing ? `${existing}; ${reason}` : reason)

export function applyVerdicts<T extends { flag?: string }>(items: T[], verdicts: CheckResult['verdicts']): T[] {
  return items.map((item, i) => {
    const v = verdicts.find((x) => x.index === i)
    if (!v) return { ...item, flag: addFlag(item.flag, 'not reviewed by self-check') }
    return v.ok ? item : { ...item, flag: addFlag(item.flag, v.reason) }
  })
}

export const DIFFICULTY_GUIDE = `Difficulty scale for TOEIC 600–850+ learners:
1 = very easy, basic form
2 = common pattern; distractors are clearly wrong to an intermediate learner
3 = typical TOEIC item with one tempting distractor
4 = advanced; two plausible distractors, the whole sentence must be read carefully
5 = hardest TOEIC items; subtle collocation, register or structure differences`

/** How to write the tested point and the two explanations; shared with the importer. */
export const EXPLAIN_FIELD_RULES = `- "trap": a short English label naming exactly what is tested, e.g. "adverb modifies the verb 'implemented'".
- "explain_en": 1–3 sentences on why the answer is right and why the most tempting distractor is wrong.
- "explain_th": the same explanation in natural, friendly Thai for Thai learners. Keep key grammar terms in English in parentheses, e.g. คำกริยาวิเศษณ์ (adverb).
${POINT_RULES}`

const EXPLAIN_RULES = `${EXPLAIN_FIELD_RULES}
- "answer" is the 0-based index of the correct choice. Vary the position of the correct answer across items.
- Never copy real ETS TOEIC questions; write original items.`

const trigrams = (s: string): Set<string> => {
  const w = s
    .toLowerCase()
    .replace(/____/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
  const out = new Set<string>()
  for (let i = 0; i + 2 < w.length; i++) out.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`)
  return out
}

/** Word-trigram Jaccard similarity of two stems, 0–1. */
export function overlapScore(a: string, b: string): number {
  const x = trigrams(a)
  const y = trigrams(b)
  if (x.size === 0 || y.size === 0) return 0
  let both = 0
  for (const t of x) if (y.has(t)) both++
  return both / (x.size + y.size - both)
}

const DROP_AT = 0.5
const FLAG_AT = 0.3

/** Keeps generated items from echoing the user's private (copyrighted) questions. */
export function guardOverlap<T extends { stem: string; flag?: string }>(
  items: T[],
  refs: { id: string; stem: string }[]
): { kept: T[]; dropped: string[] } {
  const kept: T[] = []
  const dropped: string[] = []
  for (const item of items) {
    let best = { id: '', score: 0 }
    for (const r of refs) {
      const score = overlapScore(item.stem, r.stem)
      if (score > best.score) best = { id: r.id, score }
    }
    if (best.score >= DROP_AT) dropped.push(`"${item.stem}" ≈ ${best.id}`)
    else if (best.score >= FLAG_AT) {
      const note = `similar to ${best.id}`
      kept.push({ ...item, flag: item.flag ? `${item.flag}; ${note}` : note })
    } else kept.push(item)
  }
  return { kept, dropped }
}

/** Up to n items spread from easiest to hardest. */
export function spreadPick<T extends { difficulty: number }>(items: T[], n: number): T[] {
  const sorted = [...items].sort((a, b) => a.difficulty - b.difficulty)
  if (sorted.length <= n) return sorted
  return Array.from({ length: n }, (_, i) => sorted[Math.floor((i * sorted.length) / n)])
}

export function part5Prompt(
  topic: Part5Topic,
  count: number,
  difficulty: number,
  examples: Part5Item[],
  avoidStems: string[],
  styleOnly = false
): Prompt {
  const system = `You write original practice questions in the style of TOEIC Reading Part 5 (incomplete sentences) for Thai learners targeting a score of 600–850+.
Rules:
- Business or workplace context: offices, hiring, travel, shipping, finance, events, customer service. Natural professional English.
- Each stem contains exactly one blank written as ____ (four underscores).
- Exactly four choices. Exactly one choice is correct in both grammar and meaning; each other choice must be clearly wrong for a specific reason.
- For word-form items, all four choices come from the same word family.
${EXPLAIN_RULES}
${DIFFICULTY_GUIDE}`
  const exampleIntro = styleOnly
    ? `Use these examples only as a model of trap type, sentence length and difficulty. Write entirely new sentences, names, companies and situations. Never reuse a stem or any distinctive phrase from them:`
    : `Match the style and quality of these approved examples:`
  const user = `Write ${count} new Part 5 questions that test the grammar topic "${topic}" at difficulty ${difficulty}.

${exampleIntro}
${JSON.stringify(
  examples.map((e) => ({ stem: e.stem, choices: e.choices, answer: e.answer, trap: e.trap })),
  null,
  2
)}

Do not reuse or closely paraphrase any of these existing stems:
${avoidStems.map((s) => `- ${s}`).join('\n') || '- (none)'}`
  return { system, user }
}

export function part6Prompt(
  count: number,
  difficulty: number,
  examples: Part6Set[],
  avoidTitles: string[] = []
): Prompt {
  const system = `You write original practice sets in the style of TOEIC Reading Part 6 (text completion) for Thai learners targeting a score of 600–850+.
Rules for each set:
- "title" names the text type and subject, e.g. "Email: Office renovation" or "Notice: New parking policy".
- "passage" is a 90–150 word business email, memo, notice, advertisement or article. Use \\n for line breaks.
- The passage contains exactly four blanks written as {{1}}, {{2}}, {{3}}, {{4}}, in that order.
- "blanks" has exactly four entries, in order. Each has a "topic" from this list: ${GRAMMAR_TOPICS.join(', ')}.
- Exactly one blank has topic "sentence-insertion"; its four choices are complete sentences and only one fits the context.
- At least one blank has topic "transitions" (connecting words such as However, Therefore, In addition).
- Every blank has exactly four choices and exactly one correct answer, judged using the whole passage.
${EXPLAIN_RULES}
${DIFFICULTY_GUIDE}`
  const user = `Write ${count} new Part 6 sets at difficulty ${difficulty}.

Match the style and quality of these approved examples:
${JSON.stringify(
  examples.map((e) => ({ title: e.title, passage: e.passage, blanks: e.blanks.map((b) => b.topic) })),
  null,
  2
)}

Use different subjects from the examples and from these existing titles:
${avoidTitles.map((s) => `- ${s}`).join('\n') || '- (none)'}`
  return { system, user }
}

export function checkPrompt(items: unknown[]): Prompt {
  const system = `You are a strict reviewer of TOEIC-style practice questions written for Thai learners.
For each numbered item return a verdict. Set ok=true only if ALL of these hold:
1. Exactly one choice is correct in grammar and meaning; no other choice is defensible.
2. The "answer" index points to that correct choice.
3. The English and Thai explanations agree with the answer and are accurate.
4. The Thai is natural and grammatical.
5. The topic label matches what the item actually tests.
Otherwise set ok=false and give a short reason (under 20 words). Return one verdict per item using its index.`
  const user = JSON.stringify(
    items.map((item, index) => ({ index, item })),
    null,
    2
  )
  return { system, user }
}
