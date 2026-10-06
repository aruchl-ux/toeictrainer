import { z } from 'zod'

export const PART5_TOPICS = [
  'word-form',
  'tense-voice',
  'subject-verb-agreement',
  'prepositions',
  'conj-vs-prep',
  'pronouns',
  'relative-clauses',
  'reduced-clauses',
  'conditionals',
  'inversion',
  'comparatives',
  'gerund-infinitive',
  'collocations'
] as const
export const PART6_ONLY_TOPICS = ['sentence-insertion', 'transitions'] as const
export const GRAMMAR_TOPICS = [...PART5_TOPICS, ...PART6_ONLY_TOPICS] as const

export const Part5Topic = z.enum(PART5_TOPICS)
export type Part5Topic = z.infer<typeof Part5Topic>
export const GrammarTopic = z.enum(GRAMMAR_TOPICS)
export type GrammarTopic = z.infer<typeof GrammarTopic>

export const Language = z.enum(['th', 'en'])
export type Language = z.infer<typeof Language>

export const Explain = z.object({ en: z.string().min(1), th: z.string().min(1) })
export type Explain = z.infer<typeof Explain>

export const ItemStatus = z.enum(['draft', 'approved'])
export type ItemStatus = z.infer<typeof ItemStatus>

const choiceFields = {
  difficulty: z.number().int().min(1).max(5),
  choices: z.array(z.string().min(1)).length(4),
  answer: z.number().int().min(0).max(3),
  trap: z.string().min(1),
  explain: Explain
}

export const Part5Item = z.object({
  id: z.string().regex(/^p5-[a-z-]+-\d{4}$/),
  part: z.literal(5),
  topic: Part5Topic,
  stem: z.string().includes('____'),
  ...choiceFields,
  status: ItemStatus,
  flag: z.string().optional()
})
export type Part5Item = z.infer<typeof Part5Item>

export const Part6Blank = z.object({ topic: GrammarTopic, ...choiceFields })
export type Part6Blank = z.infer<typeof Part6Blank>

export const Part6Set = z
  .object({
    id: z.string().regex(/^p6-\d{4}$/),
    part: z.literal(6),
    title: z.string().min(1),
    passage: z.string().min(1),
    blanks: z.array(Part6Blank).length(4),
    status: ItemStatus,
    flag: z.string().optional()
  })
  .superRefine((set, ctx) => {
    for (const n of [1, 2, 3, 4]) {
      if (!set.passage.includes(`{{${n}}}`)) {
        ctx.addIssue({ code: 'custom', path: ['passage'], message: `passage is missing {{${n}}}` })
      }
    }
    const insertions = set.blanks.filter((b) => b.topic === 'sentence-insertion').length
    if (insertions !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['blanks'],
        message: `expected exactly 1 sentence-insertion blank, got ${insertions}`
      })
    }
  })
export type Part6Set = z.infer<typeof Part6Set>

export interface ContentBank {
  part5: Part5Item[]
  part6: Part6Set[]
}

export const GrammarAttempt = z.object({
  itemId: z.string().min(1),
  topic: GrammarTopic,
  correct: z.boolean(),
  ms: z.number().int().nonnegative(),
  at: z.string().min(1)
})
export type GrammarAttempt = z.infer<typeof GrammarAttempt>

export const LeitnerCard = z.object({
  box: z.number().int().min(1).max(5),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})
export type LeitnerCard = z.infer<typeof LeitnerCard>

export const MixedTestResult = z.object({
  at: z.string().min(1),
  correct: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  ms: z.number().int().nonnegative()
})
export type MixedTestResult = z.infer<typeof MixedTestResult>

export const Progress = z.object({
  version: z.literal(1),
  grammarAttempts: z.array(GrammarAttempt).default([]),
  leitner: z.record(z.string(), LeitnerCard).default({}),
  mixedTests: z.array(MixedTestResult).default([])
})
export type Progress = z.infer<typeof Progress>

export const emptyProgress = (): Progress => ({
  version: 1,
  grammarAttempts: [],
  leitner: {},
  mixedTests: []
})

export const Settings = z.object({ language: Language.default('th') })
export type Settings = z.infer<typeof Settings>
export const SettingsPatch = z.object({ language: Language.optional() })
export type SettingsPatch = z.infer<typeof SettingsPatch>
export const defaultSettings = (): Settings => ({ language: 'th' })

export function formatIssues(err: z.ZodError): string {
  return err.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
}
