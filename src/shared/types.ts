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

export const PART7_FORMATS = ['single', 'double', 'triple'] as const
export const Part7Format = z.enum(PART7_FORMATS)
export type Part7Format = z.infer<typeof Part7Format>

export const PART7_QTYPES = [
  'main-idea',
  'detail',
  'inference',
  'not-true',
  'vocabulary',
  'intent',
  'insertion',
  'cross-reference'
] as const
export const Part7QType = z.enum(PART7_QTYPES)
export type Part7QType = z.infer<typeof Part7QType>

/** Anything a learner's attempt can be grouped by: a grammar topic or a Part 7 question type. */
export type Skill = GrammarTopic | Part7QType

export const PART7_DOC_KINDS = [
  'email', 'letter', 'memo', 'notice', 'ad', 'article', 'chat', 'form', 'schedule', 'review', 'webpage'
] as const
export const Part7Doc = z.object({
  kind: z.enum(PART7_DOC_KINDS),
  title: z.string().min(1),
  body: z.string().min(1)
})
export type Part7Doc = z.infer<typeof Part7Doc>

export const Evidence = z.object({ doc: z.number().int().min(0).max(2), quote: z.string().min(3) })
export type Evidence = z.infer<typeof Evidence>

export const Part7Question = z.object({
  type: Part7QType,
  prompt: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
  choices: z.array(z.string().min(1)).length(4),
  answer: z.number().int().min(0).max(3),
  evidence: z.array(Evidence).min(1),
  explain: Explain
})
export type Part7Question = z.infer<typeof Part7Question>

const DOCS_FOR: Record<Part7Format, number> = { single: 1, double: 2, triple: 3 }
const INSERTION_MARKERS = ['[1]', '[2]', '[3]', '[4]']

export const Part7Set = z
  .object({
    id: z.string().regex(/^p7-\d{4}$/),
    part: z.literal(7),
    format: Part7Format,
    docs: z.array(Part7Doc).min(1).max(3),
    questions: z.array(Part7Question).min(2).max(5),
    status: ItemStatus,
    flag: z.string().optional()
  })
  .superRefine((set, ctx) => {
    const issue = (message: string, path: (string | number)[] = []) => ctx.addIssue({ code: 'custom', path, message })
    if (set.docs.length !== DOCS_FOR[set.format]) {
      issue(`${set.format} set needs ${DOCS_FOR[set.format]} docs, got ${set.docs.length}`, ['docs'])
    }
    const n = set.questions.length
    if (set.format === 'single' ? n < 2 || n > 4 : n !== 5) {
      issue(`${set.format} set has ${n} questions`, ['questions'])
    }
    set.questions.forEach((q, qi) => {
      q.evidence.forEach((ev, ei) => {
        const body = set.docs[ev.doc]?.body
        if (body === undefined || !body.includes(ev.quote)) {
          issue(`evidence quote not found in doc ${ev.doc}: "${ev.quote}"`, ['questions', qi, 'evidence', ei])
        }
      })
      if (q.type === 'insertion') {
        const withMarkers = set.docs.filter((d) => INSERTION_MARKERS.every((m) => d.body.includes(m)))
        if (withMarkers.length !== 1) issue('insertion question needs markers [1]-[4] in exactly one doc', ['questions', qi])
      }
      if (q.type === 'intent' && !set.docs.some((d) => d.kind === 'chat')) {
        issue('intent question needs a chat doc', ['questions', qi])
      }
    })
    if (set.format !== 'single') {
      const cross = set.questions.some(
        (q) => q.type === 'cross-reference' && new Set(q.evidence.map((e) => e.doc)).size >= 2
      )
      if (!cross) issue('multi-passage set needs a cross-reference question with evidence from 2+ docs', ['questions'])
    }
  })
export type Part7Set = z.infer<typeof Part7Set>

export interface ContentBank {
  part5: Part5Item[]
  part6: Part6Set[]
  part7: Part7Set[]
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

export const ReadingAttempt = z.object({
  itemId: z.string().regex(/^p7-\d{4}#q[1-5]$/),
  qtype: Part7QType,
  correct: z.boolean(),
  ms: z.number().int().nonnegative(),
  at: z.string().min(1)
})
export type ReadingAttempt = z.infer<typeof ReadingAttempt>

export const TestLength = z.enum(['half', 'full'])
export type TestLength = z.infer<typeof TestLength>

export const PartScore = z.object({ correct: z.number().int().nonnegative(), total: z.number().int().nonnegative() })
export type PartScore = z.infer<typeof PartScore>

export const ReadingTestResult = z.object({
  length: TestLength,
  parts: z.object({ p5: PartScore, p6: PartScore, p7: PartScore }),
  ms: z.number().int().nonnegative(),
  at: z.string().min(1)
})
export type ReadingTestResult = z.infer<typeof ReadingTestResult>

export const ActiveReadingTest = z.object({
  length: TestLength,
  ids: z.array(z.string().min(1)),
  orders: z.array(z.array(z.number().int().min(0).max(3))),
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
  flags: z.array(z.string()),
  index: z.number().int().nonnegative(),
  elapsedMs: z.number().int().nonnegative()
})
export type ActiveReadingTest = z.infer<typeof ActiveReadingTest>

export const FinishReadingTest = z.object({
  result: ReadingTestResult,
  grammar: z.array(GrammarAttempt),
  reading: z.array(ReadingAttempt)
})
export type FinishReadingTest = z.infer<typeof FinishReadingTest>

export const Progress = z.object({
  version: z.literal(1),
  grammarAttempts: z.array(GrammarAttempt).default([]),
  leitner: z.record(z.string(), LeitnerCard).default({}),
  mixedTests: z.array(MixedTestResult).default([]),
  readingAttempts: z.array(ReadingAttempt).default([]),
  readingTests: z.array(ReadingTestResult).default([]),
  // A malformed saved test is dropped on its own instead of failing the whole progress file.
  activeReadingTest: ActiveReadingTest.nullable().catch(null).default(null)
})
export type Progress = z.infer<typeof Progress>

export const emptyProgress = (): Progress => ({
  version: 1,
  grammarAttempts: [],
  leitner: {},
  mixedTests: [],
  readingAttempts: [],
  readingTests: [],
  activeReadingTest: null
})

/** Which renderer the window shows: the poster trainer or the agent-style Office view. */
export const UiMode = z.enum(['trainer', 'office'])
export type UiMode = z.infer<typeof UiMode>
export const OfficeTheme = z.enum(['dark', 'light'])
export type OfficeTheme = z.infer<typeof OfficeTheme>

// uiMode and officeTheme stay absent until the learner picks them, so a fresh settings file is still `{ language }`.
// A bad value drops that one field instead of resetting the whole file.
export const Settings = z.object({
  language: Language.default('th'),
  uiMode: UiMode.optional().catch(undefined),
  officeTheme: OfficeTheme.optional().catch(undefined)
})
export type Settings = z.infer<typeof Settings>
export const SettingsPatch = z.object({
  language: Language.optional(),
  uiMode: UiMode.optional(),
  officeTheme: OfficeTheme.optional()
})
export type SettingsPatch = z.infer<typeof SettingsPatch>
export const defaultSettings = (): Settings => ({ language: 'th' })

export function formatIssues(err: z.ZodError): string {
  return err.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
}
