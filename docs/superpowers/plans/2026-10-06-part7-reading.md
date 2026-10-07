# Part 7 Reading + Reading Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add TOEIC Part 7 reading-comprehension drills (single/double/triple passages with evidence highlighting) and a timed Reading test (Half 50 Q / 38 min default, Full 100 Q / 75 min) with free navigation, pause-on-close resume and per-part scoring.

**Architecture:** Part 7 content is a new `Part7Set` schema loaded beside Part 5/6. A new `p7` `QuizEntry` kind lets the existing `QuizRunner` drive Part 7 drills and Review unchanged. The Reading test is a new, separate engine (`src/shared/reading.ts` pure reducer + `features/reading-test/*` UI) so existing drills/mixed test are untouched. Progress gains `readingAttempts`, `readingTests`, `activeReadingTest` with zod defaults (no migration).

**Tech Stack:** Electron 44 + electron-vite, React 19, TypeScript 5.9, zod 4, react-router 7 (HashRouter), Vitest 3 + Testing Library (jsdom), Playwright `_electron` for E2E.

**Spec:** `docs/superpowers/specs/2026-10-06-part7-reading-design.md` (read it before starting). Also respect `PRODUCT.md` and `DESIGN.md` (riso visual system).

## Global Constraints

- **Do not run `git commit`.** The user asked for no commits yet. Each task ends with a verification checkpoint instead.
- Offline only: no network calls, no CDN assets. Fonts/assets bundled.
- Renderer has no Node access; all side effects through the typed `window.api` bridge (`src/shared/api.ts` → `src/preload/index.ts` → `src/main/ipc.ts`).
- Every UI string exists in both `en` and `th` in `src/renderer/src/app/i18n.ts` (the `th` record is typed `Record<StringKey, string>`, so a missing key is a type error).
- Choices are shuffled on screen: content text must never refer to a choice by letter or position.
- Right/wrong and timer warnings must never rely on color alone (icon + text label or shape).
- Score estimates always say they are estimates, never official.
- Progress file stays `version: 1`; new fields must have zod defaults so old files still load.
- Keep existing accessible names that tests rely on: choice buttons named `(B) text`, nav link names, `Score: c / n`, `button.choice`, `.explain`.
- Visual work follows `DESIGN.md`: four riso inks (pink, blue, yellow, violet only as pink-over-blue), cream paper, Kanit display / Anuphan text, 1.5px hairline frames, square corners, quiet question screens.
- Verification commands (run from repo root): `npx tsc --noEmit`, `npx vitest run`, `npx tsx scripts/check-content.ts`, `npm run test:e2e` (builds first).

## File Structure

| File | Responsibility |
|---|---|
| `src/shared/types.ts` (modify) | Part 7 zod schemas, `Skill` type, `ContentBank.part7`, progress fields |
| `src/shared/quiz.ts` (modify) | `p7` QuizEntry kind; ids, fields, flatten, resolve, shuffle |
| `src/shared/highlight.ts` (create) | Pure quote → text segments splitter for evidence highlighting |
| `src/shared/progress.ts` (modify) | Pure progress updates for reading attempts, test results, active test |
| `src/shared/scoring.ts` (modify) | `topicStats` over `Skill`, `latestBand` preferring Reading tests |
| `src/shared/reading.ts` (create) | Blueprint, `buildReadingTest`, `restoreReadingTest`, test reducer, scoring, band |
| `src/main/content.ts` (modify) | Load `content/reading/part7/*.json` |
| `src/main/store.ts`, `src/main/ipc.ts`, `src/shared/api.ts`, `src/preload/index.ts` (modify) | Persist + expose reading progress |
| `src/renderer/src/app/AppContext.tsx` (modify) | `recordReading`, `saveActiveTest`, `finishReadingTest` |
| `src/renderer/src/app/i18n.ts` (modify) | Question-type labels, new strings, `skillLabel` |
| `src/renderer/src/features/reading/PassageView.tsx` (create) | Part 7 docs with tabs, insertion markers, evidence highlight |
| `src/renderer/src/features/reading/ReadingScreen.tsx` (create) | Part 7 start screen + drill |
| `src/renderer/src/features/grammar/QuestionView.tsx` (modify) | Render p7 entries; `locked` prop for the test |
| `src/renderer/src/features/grammar/QuizSummary.tsx` (modify) | Sparse records, p7 rows with evidence quotes |
| `src/renderer/src/features/grammar/useRecordAnswer.ts`, `quizReducer.ts` (modify) | Route p7 answers to `recordReading` |
| `src/renderer/src/features/reading-test/*.tsx` (create) | `ReadingTestScreen`, `ReadingTestRunner`, `QuestionMap`, `TestTimer`, `ReadingTestResults` |
| `src/renderer/src/features/progress/*` (modify) | Band source note, Part 7 question-type rows |
| `src/renderer/src/app/App.tsx`, `styles.css` (modify) | Routes, nav entries, styles |
| `content/reading/part7/{single,double,triple}.json` (create) | Part 7 content |
| `scripts/check-content.ts`, `scripts/answer-sheet.ts` (modify) | Part 7 checks + answer sheet |
| `tests/fixtures/items.ts` (modify) | `makePart7` fixture |

---

### Task 1: Part 7 schema and `Skill` type

**Files:**
- Modify: `src/shared/types.ts`
- Modify: `tests/fixtures/items.ts`
- Test: `tests/unit/part7.test.ts` (create)

**Interfaces:**
- Produces: `PART7_FORMATS`, `Part7Format`, `PART7_QTYPES`, `Part7QType`, `PART7_DOC_KINDS`, `Part7Doc`, `Evidence`, `Part7Question`, `Part7Set` (zod schemas + inferred types), `type Skill = GrammarTopic | Part7QType`, `ContentBank.part7: Part7Set[]`, fixture `makePart7(over?)`.

- [ ] **Step 1: Add the fixture** — append to `tests/fixtures/items.ts`:

```ts
import type { Part7Question, Part7Set } from '@shared/types'

function question(over: Partial<Part7Question> = {}): Part7Question {
  return {
    type: 'detail',
    prompt: 'When will the office reopen?',
    difficulty: 3,
    choices: ['On Monday', 'On Tuesday', 'On Friday', 'Next month'],
    answer: 0,
    evidence: [{ doc: 0, quote: 'reopen on Monday' }],
    explain: { en: 'The notice says it will reopen on Monday.', th: 'ประกาศบอกว่าจะเปิดอีกครั้งวันจันทร์' },
    ...over
  }
}

export function makePart7(over: Partial<Part7Set> = {}): Part7Set {
  n++
  return {
    id: `p7-${pad(n)}`,
    part: 7,
    format: 'single',
    docs: [{ kind: 'notice', title: 'Notice: Office closure', body: 'The office is closed for cleaning and will reopen on Monday at 9 a.m.' }],
    questions: [question(), question({ type: 'inference', prompt: 'Why is the office closed?', choices: ['Cleaning', 'A holiday', 'A move', 'Repairs'], evidence: [{ doc: 0, quote: 'closed for cleaning' }] })],
    status: 'approved',
    ...over
  }
}
```

(Keep the existing `import type { Part5Item, Part6Blank, Part6Set }` line; merge the new names into it instead of adding a second import if your linter prefers.)

- [ ] **Step 2: Write the failing tests** — create `tests/unit/part7.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Part7Set } from '@shared/types'
import { makePart7 } from '../fixtures/items'

const doc = (body: string, kind: 'email' | 'chat' | 'schedule' = 'email') => ({ kind, title: `${kind}: x`, body })
const q = (over: Record<string, unknown> = {}) => ({
  type: 'detail',
  prompt: 'What is true?',
  difficulty: 3,
  choices: ['a', 'b', 'c', 'd'],
  answer: 0,
  evidence: [{ doc: 0, quote: 'alpha beta' }],
  explain: { en: 'Because of alpha beta.', th: 'เพราะ alpha beta' },
  ...over
})

describe('Part7Set schema', () => {
  it('accepts the fixture', () => {
    expect(Part7Set.safeParse(makePart7()).success).toBe(true)
  })

  it('rejects a doc count that does not match the format', () => {
    const r = Part7Set.safeParse(makePart7({ format: 'double' }))
    expect(r.success).toBe(false)
  })

  it('rejects an evidence quote missing from its doc', () => {
    const set = makePart7()
    set.questions[0].evidence = [{ doc: 0, quote: 'not in the text' }]
    expect(Part7Set.safeParse(set).success).toBe(false)
  })

  it('requires 5 questions and a two-doc cross-reference for double sets', () => {
    const docs = [doc('alpha beta gamma'), doc('delta epsilon alpha beta')]
    const five = [q(), q(), q(), q(), q()]
    expect(Part7Set.safeParse(makePart7({ format: 'double', docs, questions: five })).success).toBe(false)
    const withCross = [
      ...five.slice(0, 4),
      q({ type: 'cross-reference', evidence: [{ doc: 0, quote: 'gamma' }, { doc: 1, quote: 'delta' }] })
    ]
    expect(Part7Set.safeParse(makePart7({ format: 'double', docs, questions: withCross })).success).toBe(true)
    expect(Part7Set.safeParse(makePart7({ format: 'double', docs, questions: withCross.slice(0, 4) })).success).toBe(false)
  })

  it('requires insertion markers [1]-[4] for an insertion question', () => {
    const bad = makePart7({ questions: [q(), q({ type: 'insertion' })] })
    bad.docs = [doc('alpha beta text')]
    expect(Part7Set.safeParse(bad).success).toBe(false)
    const good = makePart7({ questions: [q(), q({ type: 'insertion' })] })
    good.docs = [doc('[1] alpha beta [2] text [3] more [4] end')]
    expect(Part7Set.safeParse(good).success).toBe(true)
  })

  it('requires a chat doc for an intent question', () => {
    const set = makePart7({ docs: [doc('alpha beta')], questions: [q(), q({ type: 'intent' })] })
    expect(Part7Set.safeParse(set).success).toBe(false)
    set.docs = [doc('Ana (9:01): alpha beta', 'chat')]
    expect(Part7Set.safeParse(set).success).toBe(true)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/part7.test.ts`
Expected: FAIL — `Part7Set` is not exported from `@shared/types`.

- [ ] **Step 4: Implement the schema** — in `src/shared/types.ts`, after the `Part6Set` export, add:

```ts
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
```

Then change `ContentBank`:

```ts
export interface ContentBank {
  part5: Part5Item[]
  part6: Part6Set[]
  part7: Part7Set[]
}
```

- [ ] **Step 5: Fix the type errors this causes** — run `npx tsc --noEmit`. Every object literal typed `ContentBank` now needs `part7: []` (tests in `tests/unit/quiz.test.ts`, `tests/unit/content.test.ts` and any others it lists). Add `part7: []` to each. `loadContent` errors are fixed in Task 2 — for now add `part7: []` to its return so it compiles:

```ts
return { bank: { part5, part6, part7: [] }, errors }
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run && npx tsc --noEmit`
Expected: all PASS, no type errors.

- [ ] **Step 7: Checkpoint** — no commit (Global Constraints). Confirm `git status` shows only the files above changed.

---

### Task 2: Load, check and print Part 7 content

**Files:**
- Modify: `src/main/content.ts`
- Modify: `scripts/check-content.ts`
- Modify: `scripts/answer-sheet.ts`
- Create: `content/reading/part7/single.json`, `content/reading/part7/double.json`, `content/reading/part7/triple.json`
- Modify: `tests/content/content.test.ts`
- Test: `tests/unit/content.test.ts` (modify)

**Interfaces:**
- Consumes: `Part7Set` (Task 1).
- Produces: `loadContent(root).bank.part7` (approved sets from `content/reading/part7/*.json`); seed sets `p7-0001` (single) and `p7-0021` (double); `content/reading/part7/triple.json` starts as `[]`.

- [ ] **Step 1: Write the failing loader test** — in `tests/unit/content.test.ts` add (reuse the file's existing temp-dir helpers; if it has none, use this):

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { makePart7 } from '../fixtures/items'

it('loads approved Part 7 sets from reading/part7 and skips invalid ones', () => {
  const root = mkdtempSync(join(tmpdir(), 'toeic-content-'))
  mkdirSync(join(root, 'reading', 'part7'), { recursive: true })
  const ok = makePart7({ id: 'p7-0001' })
  const draft = makePart7({ id: 'p7-0002', status: 'draft' })
  const bad = { ...makePart7({ id: 'p7-0003' }), format: 'triple' }
  writeFileSync(join(root, 'reading', 'part7', 'single.json'), JSON.stringify([ok, draft, bad]))
  const { bank, errors } = loadContent(root)
  expect(bank.part7.map((s) => s.id)).toEqual(['p7-0001'])
  expect(errors.some((e) => e.includes('single.json#2'))).toBe(true)
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/content.test.ts`
Expected: FAIL — `bank.part7` is `[]`.

- [ ] **Step 3: Implement loading** — in `src/main/content.ts` import `Part7Set` and change `loadContent`:

```ts
import { Part5Item, Part6Set, Part7Set, formatIssues, type ContentBank } from '@shared/types'
// ...
export function loadContent(root: string): LoadResult {
  const errors: string[] = []
  const seen = new Set<string>()
  const part5 = collect(join(root, 'grammar', 'part5'), Part5Item, errors, seen)
  const part6 = collect(join(root, 'grammar', 'part6'), Part6Set, errors, seen)
  const part7 = collect(join(root, 'reading', 'part7'), Part7Set, errors, seen)
  return { bank: { part5, part6, part7 }, errors }
}
```

- [ ] **Step 4: Seed content** — create the three files. `triple.json` is `[]`. `single.json` holds one set `p7-0001`; `double.json` holds one set `p7-0021`. Write them by hand following spec §3 (business English, Thai explanations, no positional wording, every `evidence.quote` copied exactly from its doc). Use this single set verbatim:

```json
[
  {
    "id": "p7-0001",
    "part": 7,
    "format": "single",
    "docs": [
      {
        "kind": "notice",
        "title": "Notice: Parking garage maintenance",
        "body": "To all Harbor Plaza tenants:\n\nThe north parking garage will be closed from Saturday, May 11, through Sunday, May 12, while the surface is resealed. During this time, tenants may park in the south garage at no charge. Please show your tenant badge to the attendant at the entrance.\n\nVehicles left in the north garage after 7 p.m. on Friday will be moved at the owner's expense. We apologize for any inconvenience and thank you for your cooperation.\n\nHarbor Plaza Building Management"
      }
    ],
    "questions": [
      {
        "type": "main-idea",
        "prompt": "What is the purpose of the notice?",
        "difficulty": 2,
        "choices": [
          "To announce a temporary garage closure",
          "To introduce new parking fees",
          "To report damage to tenants' vehicles",
          "To advertise a new parking garage"
        ],
        "answer": 0,
        "evidence": [{ "doc": 0, "quote": "The north parking garage will be closed from Saturday, May 11, through Sunday, May 12" }],
        "explain": {
          "en": "The notice tells tenants that the north garage will be closed for two days and explains where to park instead. It does not mention new fees, damage or a new garage.",
          "th": "ประกาศนี้แจ้งผู้เช่าว่าที่จอดรถฝั่งเหนือจะปิดสองวัน และบอกว่าให้ไปจอดที่ไหนแทน จึงเป็นการประกาศปิดที่จอดรถชั่วคราว ไม่ได้พูดถึงค่าจอดใหม่ ความเสียหายของรถ หรือที่จอดรถแห่งใหม่"
        }
      },
      {
        "type": "detail",
        "prompt": "What should tenants do to park in the south garage?",
        "difficulty": 2,
        "choices": [
          "Show a tenant badge at the entrance",
          "Pay a small fee to the attendant",
          "Register online before Friday",
          "Leave their keys with building management"
        ],
        "answer": 0,
        "evidence": [{ "doc": 0, "quote": "Please show your tenant badge to the attendant at the entrance." }],
        "explain": {
          "en": "The notice asks tenants to show their tenant badge to the attendant. Parking there is free ('at no charge'), so paying a fee is wrong.",
          "th": "ประกาศขอให้ผู้เช่าแสดงบัตรผู้เช่า (tenant badge) กับพนักงานที่ทางเข้า และการจอดที่ฝั่งใต้ไม่เสียค่าใช้จ่าย (at no charge) จึงไม่ต้องจ่ายเงิน"
        }
      },
      {
        "type": "inference",
        "prompt": "What will most likely happen to a car left in the north garage on Saturday morning?",
        "difficulty": 3,
        "choices": [
          "It will be moved, and the owner will pay the cost",
          "It will be resealed together with the surface",
          "It will be given a free parking pass",
          "It will be parked by the attendant in the south garage for free"
        ],
        "answer": 0,
        "evidence": [{ "doc": 0, "quote": "Vehicles left in the north garage after 7 p.m. on Friday will be moved at the owner's expense." }],
        "explain": {
          "en": "Any vehicle still there after 7 p.m. on Friday will be moved 'at the owner's expense', meaning the owner pays. A car there on Saturday morning falls into that group.",
          "th": "รถที่ยังจอดอยู่หลัง 1 ทุ่มวันศุกร์จะถูกย้าย โดยเจ้าของต้องเสียค่าใช้จ่ายเอง (at the owner's expense) รถที่ยังอยู่เช้าวันเสาร์จึงจะถูกย้ายและเจ้าของต้องจ่าย"
        }
      }
    ],
    "status": "approved"
  }
]
```

For `double.json`, write set `p7-0021` yourself: format `double`, 2 docs (e.g. an `ad` for a conference room rental and an `email` booking it), exactly 5 questions, at least one `cross-reference` with evidence from both docs, quotes copied exactly. Validate with the checker in Step 7.

- [ ] **Step 5: Extend the content test** — in `tests/content/content.test.ts` add:

```ts
it('has at least one Part 7 set and unique Part 7 ids', () => {
  expect(bank.part7.length).toBeGreaterThan(0)
  const ids = bank.part7.map((s) => s.id)
  expect(new Set(ids).size).toBe(ids.length)
})
```

- [ ] **Step 6: Extend the checker** — in `scripts/check-content.ts`, after the Part 6 loop add:

```ts
for (const set of bank.part7) {
  set.questions.forEach((q, i) => {
    const where = `${set.id}#q${i + 1}`
    // Part 7 has no trap label; pass the prompt so the positional ban still applies to it.
    checkChoices(where, q.choices, q.answer, q.explain, q.prompt)
    if (/\b(?:choice|option)\s+[A-D]\b/i.test(q.prompt)) problems.push(`${where}: prompt refers to a choice by letter`)
  })
  const words = set.docs.reduce((n, d) => n + d.body.split(/\s+/).filter(Boolean).length, 0)
  if (words < 60) problems.push(`${set.id}: passages are too short (${words} words)`)
}
console.log(`Part 7: ${bank.part7.length} sets`, {
  single: bank.part7.filter((s) => s.format === 'single').length,
  double: bank.part7.filter((s) => s.format === 'double').length,
  triple: bank.part7.filter((s) => s.format === 'triple').length
})
```

Note: `checkChoices` requires the English explanation to mention the first word of the correct answer when the answer is under 40 characters. For Part 7 choices that are full phrases this can be too strict. Change that check to apply only when `where` does not start with `p7-`:

```ts
if (!where.startsWith('p7-') && !explain.en.toLowerCase().includes(choices[answer].toLowerCase().split(' ')[0]) && choices[answer].length < 40) {
```

- [ ] **Step 7: Extend the answer sheet** — in `scripts/answer-sheet.ts`, before writing the file, add:

```ts
for (const set of bank.part7) {
  lines.push(`## Part 7 · ${set.id} · ${set.format}`, '')
  set.docs.forEach((d, i) => lines.push(`**Doc ${i + 1} — ${d.title}**`, '', ...d.body.split('\n').map((l) => `> ${l}`), ''))
  lines.push('| q | type | question | answer | wrong choices | evidence | คำอธิบาย |', '|---|---|---|---|---|---|---|')
  set.questions.forEach((q, i) =>
    lines.push(
      `| ${i + 1} | ${q.type} | ${cell(q.prompt)} | **${cell(q.choices[q.answer])}** | ${cell(others(q.choices, q.answer))} | ${cell(q.evidence.map((e) => `[doc ${e.doc + 1}] “${e.quote}”`).join(' '))} | ${cell(q.explain.th)} |`
    )
  )
  lines.push('')
}
```

and change the intro line to include `${bank.part7.length} Part 7 sets`.

- [ ] **Step 8: Run all checks**

Run: `npx vitest run && npx tsc --noEmit && npx tsx scripts/check-content.ts && npx tsx scripts/answer-sheet.ts`
Expected: tests PASS; checker prints `Part 7: 2 sets` and `OK: no problems found`; answer sheet written.

- [ ] **Step 9: Checkpoint** — no commit.

---

### Task 3: `p7` quiz entries

**Files:**
- Modify: `src/shared/quiz.ts`
- Test: `tests/unit/quiz.test.ts` (modify)

**Interfaces:**
- Consumes: `Part7Set`, `Skill` (Task 1).
- Produces:
  - `QuizEntry` gains `{ kind: 'p7'; set: Part7Set; q: number; order?: number[] }`
  - `EntryFields.topic: Skill` (was `GrammarTopic`); for p7 `trap` is `''`
  - `entryId` p7 → `` `${set.id}#q${q + 1}` ``
  - `flattenPart7(set: Part7Set): QuizEntry[]`
  - `resolveIds` resolves `p7-0001#q3`
  - `shuffleChoices` works for p7
  - `entryPart(e: QuizEntry): 'p5' | 'p6' | 'p7'`

- [ ] **Step 1: Write the failing tests** — append to `tests/unit/quiz.test.ts` (add `flattenPart7`, `entryPart` to the import list and `makePart7` to the fixtures import):

```ts
describe('Part 7 entries', () => {
  it('flattens a set into one entry per question with q-ids', () => {
    const set = makePart7({ id: 'p7-0042' })
    const entries = flattenPart7(set)
    expect(entries.map(entryId)).toEqual(['p7-0042#q1', 'p7-0042#q2'])
    expect(entries.every((e) => entryPart(e) === 'p7')).toBe(true)
  })

  it('reads fields from the question, using its type as the topic', () => {
    const set = makePart7()
    const f = entryFields({ kind: 'p7', set, q: 1 })
    expect(f.topic).toBe('inference')
    expect(f.trap).toBe('')
    expect(f.choices[f.answer]).toBe('Cleaning')
  })

  it('resolves p7 ids and shuffles their choices safely', () => {
    const set = makePart7({ id: 'p7-0007' })
    const bank: ContentBank = { part5: [], part6: [], part7: [set] }
    const [entry] = shuffleChoices(resolveIds(bank, ['p7-0007#q2', 'p7-0007#q9']), rng())
    expect(entryId(entry)).toBe('p7-0007#q2')
    const f = entryFields(entry)
    expect(f.choices[f.answer]).toBe('Cleaning')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/quiz.test.ts`
Expected: FAIL — `flattenPart7` / `entryPart` not exported.

- [ ] **Step 3: Implement** — in `src/shared/quiz.ts`:

```ts
import type { ContentBank, Explain, Part5Item, Part5Topic, Part6Set, Part7Set, Skill } from './types'

export type QuizEntry =
  | { kind: 'p5'; item: Part5Item; order?: number[] }
  | { kind: 'p6'; set: Part6Set; blank: number; order?: number[] }
  | { kind: 'p7'; set: Part7Set; q: number; order?: number[] }

export interface EntryFields {
  topic: Skill
  choices: string[]
  answer: number
  trap: string
  explain: Explain
}

export const entryPart = (e: QuizEntry): 'p5' | 'p6' | 'p7' => e.kind

export function entryId(e: QuizEntry): string {
  if (e.kind === 'p5') return e.item.id
  if (e.kind === 'p6') return blankId(e.set.id, e.blank)
  return `${e.set.id}#q${e.q + 1}`
}

function source(e: QuizEntry): { topic: Skill; choices: string[]; answer: number; trap: string; explain: Explain } {
  if (e.kind === 'p5') return e.item
  if (e.kind === 'p6') return e.set.blanks[e.blank]
  const q = e.set.questions[e.q]
  return { topic: q.type, choices: q.choices, answer: q.answer, trap: '', explain: q.explain }
}

export function entryFields(e: QuizEntry): EntryFields {
  const src = source(e)
  const order = e.order ?? src.choices.map((_, i) => i)
  return {
    topic: src.topic,
    choices: order.map((i) => src.choices[i]),
    answer: order.indexOf(src.answer),
    trap: src.trap,
    explain: src.explain
  }
}

export function shuffleChoices(entries: QuizEntry[], rng: () => number = Math.random): QuizEntry[] {
  return entries.map((e) => ({ ...e, order: shuffle([...Array(source(e).choices.length).keys()], rng) }))
}

export function flattenPart7(set: Part7Set): QuizEntry[] {
  return set.questions.map((_, q) => ({ kind: 'p7', set, q }))
}
```

In `resolveIds`, add a `p7` map and branch:

```ts
  const p7 = new Map(bank.part7.map((s) => [s.id, s]))
  // inside the loop, before the p6 regex:
    const m7 = /^(p7-\d{4})#q([1-5])$/.exec(id)
    const set7 = m7 ? p7.get(m7[1]) : undefined
    if (m7 && set7 && Number(m7[2]) <= set7.questions.length) {
      out.push({ kind: 'p7', set: set7, q: Number(m7[2]) - 1 })
      continue
    }
```

Remove the old `entryFields`/`shuffleChoices` bodies being replaced. Keep `blankId`, `shuffle`, `flattenSet`, `pickTopicDrill`, `pickMixedTest` unchanged.

- [ ] **Step 4: Fix downstream types** — `npx tsc --noEmit` will flag places that assumed `topic: GrammarTopic`:
  - `src/renderer/src/features/grammar/quizReducer.ts`: change `AnswerRecord.topic` to `Skill` (import `Skill` from `@shared/types`). `toAttempt` must now narrow: change its signature to `toAttempt(r: AnswerRecord & { topic: GrammarTopic }, at: string)` and leave callers for Task 5.
  - Any `useT().topic(...)` call receiving a `Skill`: leave for Task 5 (it will become `skillLabel`). If tsc fails only in renderer files touched in Task 5, temporarily cast with `as GrammarTopic` and add `// Task 5 replaces this` — Task 5 must remove every such cast.

- [ ] **Step 5: Run tests**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Checkpoint** — no commit.

---

### Task 4: Reading progress — schema, store, IPC, context

**Files:**
- Modify: `src/shared/types.ts`, `src/shared/progress.ts`, `src/main/store.ts`, `src/main/ipc.ts`, `src/shared/api.ts`, `src/preload/index.ts`, `src/renderer/src/app/AppContext.tsx`
- Test: `tests/unit/progress.test.ts`, `tests/unit/store.test.ts` (modify)

**Interfaces:**
- Produces (types): `ReadingAttempt { itemId: string /^p7-\d{4}#q[1-5]$/; qtype: Part7QType; correct: boolean; ms: number; at: string }`, `TestLength = 'half' | 'full'`, `PartScore { correct: number; total: number }`, `ReadingTestResult { length: TestLength; parts: { p5: PartScore; p6: PartScore; p7: PartScore }; ms: number; at: string }`, `ActiveReadingTest { length; ids: string[]; orders: number[][]; answers: Record<string, number>; flags: string[]; index: number; elapsedMs: number }`, `FinishReadingTest { result: ReadingTestResult; grammar: GrammarAttempt[]; reading: ReadingAttempt[] }`. `Progress` gains `readingAttempts`, `readingTests`, `activeReadingTest: ActiveReadingTest | null`.
- Produces (pure): `applyReadingAttempt(p, a, today)`, `applyFinishedTest(p, payload, today)`, `setActiveTest(p, t)`.
- Produces (api): `window.api.progress.recordReading(a)`, `saveActiveTest(t | null)`, `finishReadingTest(payload)` all → `Promise<Progress>`.
- Produces (context): `useApp().recordReading(a)`, `saveActiveTest(t)`, `finishReadingTest(payload)` → `Promise<void>`; on failure set `saveError`.

- [ ] **Step 1: Write failing pure tests** — append to `tests/unit/progress.test.ts`:

```ts
import { applyFinishedTest, applyReadingAttempt, setActiveTest } from '@shared/progress'
import { emptyProgress } from '@shared/types'

const ra = { itemId: 'p7-0001#q2', qtype: 'inference' as const, correct: false, ms: 30000, at: 'x' }

describe('reading progress', () => {
  it('records a reading attempt and schedules a wrong answer for review', () => {
    const p = applyReadingAttempt(emptyProgress(), ra, '2026-10-06')
    expect(p.readingAttempts).toHaveLength(1)
    expect(p.leitner['p7-0001#q2']).toEqual({ box: 1, due: '2026-10-07' })
  })

  it('stores and clears the active test', () => {
    const active = { length: 'half' as const, ids: ['a'], orders: [[0, 1, 2, 3]], answers: {}, flags: [], index: 0, elapsedMs: 5000 }
    expect(setActiveTest(emptyProgress(), active).activeReadingTest).toEqual(active)
    expect(setActiveTest(setActiveTest(emptyProgress(), active), null).activeReadingTest).toBeNull()
  })

  it('applies a finished test: result, all attempts, and clears the active test', () => {
    const active = { length: 'half' as const, ids: ['a'], orders: [[0, 1, 2, 3]], answers: {}, flags: [], index: 0, elapsedMs: 1 }
    const start = setActiveTest(emptyProgress(), active)
    const result = { length: 'half' as const, parts: { p5: { correct: 1, total: 2 }, p6: { correct: 0, total: 0 }, p7: { correct: 0, total: 1 } }, ms: 1000, at: 'x' }
    const grammar = [{ itemId: 'p5-word-form-0001', topic: 'word-form' as const, correct: false, ms: 1, at: 'x' }]
    const p = applyFinishedTest(start, { result, grammar, reading: [ra] }, '2026-10-06')
    expect(p.readingTests).toEqual([result])
    expect(p.grammarAttempts).toHaveLength(1)
    expect(p.readingAttempts).toHaveLength(1)
    expect(Object.keys(p.leitner).sort()).toEqual(['p5-word-form-0001', 'p7-0001#q2'])
    expect(p.activeReadingTest).toBeNull()
  })

  it('loads an old progress file without the new fields', () => {
    const old = Progress.parse({ version: 1, grammarAttempts: [], leitner: {}, mixedTests: [] })
    expect(old.readingAttempts).toEqual([])
    expect(old.readingTests).toEqual([])
    expect(old.activeReadingTest).toBeNull()
  })
})
```

(Import `Progress` from `@shared/types` as well.)

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run tests/unit/progress.test.ts`
Expected: FAIL — functions not exported.

- [ ] **Step 3: Add schemas** — in `src/shared/types.ts`, after `MixedTestResult`:

```ts
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
```

Move these above `Progress` and extend it:

```ts
export const Progress = z.object({
  version: z.literal(1),
  grammarAttempts: z.array(GrammarAttempt).default([]),
  leitner: z.record(z.string(), LeitnerCard).default({}),
  mixedTests: z.array(MixedTestResult).default([]),
  readingAttempts: z.array(ReadingAttempt).default([]),
  readingTests: z.array(ReadingTestResult).default([]),
  activeReadingTest: ActiveReadingTest.nullable().default(null)
})

export const emptyProgress = (): Progress => ({
  version: 1,
  grammarAttempts: [],
  leitner: {},
  mixedTests: [],
  readingAttempts: [],
  readingTests: [],
  activeReadingTest: null
})
```

`Part7QType` must be declared before `ReadingAttempt` (it is, from Task 1, if Task 1's block sits above `GrammarAttempt`; move it up if not).

- [ ] **Step 4: Implement pure updates** — append to `src/shared/progress.ts`:

```ts
import type { ActiveReadingTest, FinishReadingTest, GrammarAttempt, MixedTestResult, Progress, ReadingAttempt } from './types'

function scheduleId(leitner: Progress['leitner'], id: string, correct: boolean, today: string): Progress['leitner'] {
  const next = schedule(leitner[id], correct, today)
  return next ? { ...leitner, [id]: next } : leitner
}

export function applyReadingAttempt(p: Progress, a: ReadingAttempt, today: string): Progress {
  return { ...p, readingAttempts: [...p.readingAttempts, a], leitner: scheduleId(p.leitner, a.itemId, a.correct, today) }
}

export function setActiveTest(p: Progress, t: ActiveReadingTest | null): Progress {
  return { ...p, activeReadingTest: t }
}

export function applyFinishedTest(p: Progress, f: FinishReadingTest, today: string): Progress {
  let leitner = p.leitner
  for (const a of [...f.grammar, ...f.reading]) leitner = scheduleId(leitner, a.itemId, a.correct, today)
  return {
    ...p,
    grammarAttempts: [...p.grammarAttempts, ...f.grammar],
    readingAttempts: [...p.readingAttempts, ...f.reading],
    readingTests: [...p.readingTests, f.result],
    leitner,
    activeReadingTest: null
  }
}
```

(Replace the existing import line; `applyGrammarAttempt` may reuse `scheduleId`.)

- [ ] **Step 5: Store** — in `src/main/store.ts` add to the `Store` interface and implementation:

```ts
  recordReading(a: ReadingAttempt): Progress
  saveActiveTest(t: ActiveReadingTest | null): Progress
  finishReadingTest(f: FinishReadingTest): Progress
// implementation:
    recordReading: (a) => saveProgress(applyReadingAttempt(progress, a, today())),
    saveActiveTest: (t) => saveProgress(setActiveTest(progress, t)),
    finishReadingTest: (f) => saveProgress(applyFinishedTest(progress, f, today())),
```

Add a store test to `tests/unit/store.test.ts`:

```ts
it('persists the active reading test across instances', () => {
  const active = { length: 'full' as const, ids: ['x'], orders: [[0, 1, 2, 3]], answers: { x: 2 }, flags: ['x'], index: 0, elapsedMs: 12000 }
  createStore(dir, today).saveActiveTest(active)
  expect(createStore(dir, today).getProgress().activeReadingTest).toEqual(active)
})
```

- [ ] **Step 6: IPC + API + preload**
  - `src/shared/api.ts`: add to `IPC`: `progressRecordReading: 'progress:recordReading'`, `progressSaveActiveTest: 'progress:saveActiveTest'`, `progressFinishReadingTest: 'progress:finishReadingTest'`; add to `Api.progress`: `recordReading(a: ReadingAttempt): Promise<Progress>`, `saveActiveTest(t: ActiveReadingTest | null): Promise<Progress>`, `finishReadingTest(f: FinishReadingTest): Promise<Progress>`.
  - `src/main/ipc.ts`:

```ts
  ipcMain.handle(IPC.progressRecordReading, (_e, a: unknown) => store.recordReading(ReadingAttempt.parse(a)))
  ipcMain.handle(IPC.progressSaveActiveTest, (_e, t: unknown) =>
    store.saveActiveTest(t === null ? null : ActiveReadingTest.parse(t))
  )
  ipcMain.handle(IPC.progressFinishReadingTest, (_e, f: unknown) => store.finishReadingTest(FinishReadingTest.parse(f)))
```

  - `src/preload/index.ts` inside `progress`:

```ts
    recordReading: (a) => ipcRenderer.invoke(IPC.progressRecordReading, a),
    saveActiveTest: (t) => ipcRenderer.invoke(IPC.progressSaveActiveTest, t),
    finishReadingTest: (f) => ipcRenderer.invoke(IPC.progressFinishReadingTest, f)
```

- [ ] **Step 7: Context** — in `src/renderer/src/app/AppContext.tsx`, add three callbacks modeled exactly on `recordMixedTest` (try → set `progress`, catch → `setSaveError(true)`), expose them in `AppData` and the provider value:

```ts
  recordReading(a: ReadingAttempt): Promise<void>
  saveActiveTest(t: ActiveReadingTest | null): Promise<void>
  finishReadingTest(f: FinishReadingTest): Promise<void>
```

- [ ] **Step 8: Run tests**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 9: Checkpoint** — no commit.

---

### Task 5: Record Part 7 answers and label question types

**Files:**
- Modify: `src/renderer/src/app/i18n.ts`, `src/renderer/src/app/AppContext.tsx` (`useT`), `src/renderer/src/features/grammar/quizReducer.ts`, `src/renderer/src/features/grammar/useRecordAnswer.ts`
- Test: `tests/unit/renderer/i18n.test.ts`, `tests/unit/renderer/quizReducer.test.ts` (modify)

**Interfaces:**
- Consumes: `Skill`, `Part7QType`, `ReadingAttempt` (Tasks 1, 4); `recordReading` (Task 4).
- Produces: `QTYPE_LABELS: Record<Part7QType, Record<Lang, string>>`, `skillLabel(s: Skill, lang): string`, `isGrammarTopic(s: Skill): s is GrammarTopic`; `useT().topic(s: Skill)` now accepts any `Skill`; `toReadingAttempt(r, at): ReadingAttempt`; `useRecordAnswer()` routes `p7-` ids to `recordReading`.

- [ ] **Step 1: Failing tests** — in `tests/unit/renderer/i18n.test.ts`:

```ts
import { skillLabel } from '../../../src/renderer/src/app/i18n'
it('labels grammar topics and Part 7 question types in both languages', () => {
  expect(skillLabel('word-form', 'en')).toBe('Word form')
  expect(skillLabel('inference', 'en')).toBe('Inference')
  expect(skillLabel('inference', 'th')).toBe('การอนุมาน')
})
```

In `tests/unit/renderer/quizReducer.test.ts`:

```ts
import { toReadingAttempt } from '../../../src/renderer/src/features/grammar/quizReducer'
it('converts a Part 7 answer record into a reading attempt', () => {
  const r = { entryId: 'p7-0001#q2', topic: 'inference' as const, choice: 1, correct: true, ms: 4000 }
  expect(toReadingAttempt(r, 'T')).toEqual({ itemId: 'p7-0001#q2', qtype: 'inference', correct: true, ms: 4000, at: 'T' })
})
```

(Adjust relative import paths to match the existing tests in those files.)

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/renderer`
Expected: FAIL — missing exports.

- [ ] **Step 3: i18n** — in `src/renderer/src/app/i18n.ts`:

```ts
import { GRAMMAR_TOPICS, type GrammarTopic, type Language, type Part7QType, type Skill } from '@shared/types'

export const QTYPE_LABELS: Record<Part7QType, Record<Lang, string>> = {
  'main-idea': { en: 'Main idea', th: 'ใจความสำคัญ' },
  detail: { en: 'Detail', th: 'รายละเอียด' },
  inference: { en: 'Inference', th: 'การอนุมาน' },
  'not-true': { en: 'NOT true', th: 'ข้อใดไม่จริง' },
  vocabulary: { en: 'Vocabulary in context', th: 'ความหมายคำศัพท์ในบริบท' },
  intent: { en: "Writer's intent", th: 'เจตนาของผู้เขียน' },
  insertion: { en: 'Sentence position', th: 'ตำแหน่งของประโยค' },
  'cross-reference': { en: 'Cross-reference', th: 'เชื่อมข้อมูลหลายเอกสาร' }
}

export const isGrammarTopic = (s: Skill): s is GrammarTopic => (GRAMMAR_TOPICS as readonly string[]).includes(s)

export const skillLabel = (s: Skill, lang: Lang): string =>
  isGrammarTopic(s) ? TOPIC_LABELS[s][lang] : QTYPE_LABELS[s][lang]
```

In `AppContext.tsx` `useT`, change `topic: (topic: GrammarTopic) => topicLabel(topic, lang)` to `topic: (s: Skill) => skillLabel(s, lang)` (update imports).

- [ ] **Step 4: Reducer + hook** — in `quizReducer.ts`:

```ts
import type { GrammarAttempt, GrammarTopic, ReadingAttempt, Skill } from '@shared/types'
// AnswerRecord.topic: Skill
export function toAttempt(r: AnswerRecord & { topic: GrammarTopic }, at: string): GrammarAttempt {
  return { itemId: r.entryId, topic: r.topic, correct: r.correct, ms: r.ms, at }
}
export function toReadingAttempt(r: AnswerRecord, at: string): ReadingAttempt {
  return { itemId: r.entryId, qtype: r.topic as ReadingAttempt['qtype'], correct: r.correct, ms: r.ms, at }
}
```

`useRecordAnswer.ts`:

```ts
import { useCallback } from 'react'
import { useApp } from '../../app/AppContext'
import { isGrammarTopic } from '../../app/i18n'
import { toAttempt, toReadingAttempt, type AnswerRecord } from './quizReducer'

export function useRecordAnswer(): (r: AnswerRecord) => void {
  const { recordGrammar, recordReading } = useApp()
  return useCallback(
    (r: AnswerRecord) => {
      const at = new Date().toISOString()
      if (r.entryId.startsWith('p7-')) void recordReading(toReadingAttempt(r, at))
      else if (isGrammarTopic(r.topic)) void recordGrammar(toAttempt({ ...r, topic: r.topic }, at))
    },
    [recordGrammar, recordReading]
  )
}
```

Remove any temporary `as GrammarTopic` casts left by Task 3.

- [ ] **Step 5: Run**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Checkpoint** — no commit.

---

### Task 6: Evidence highlighting and `PassageView`; `QuestionView` renders Part 7

**Files:**
- Create: `src/shared/highlight.ts`, `src/renderer/src/features/reading/PassageView.tsx`
- Modify: `src/renderer/src/features/grammar/QuestionView.tsx`, `src/renderer/src/styles.css`, `src/renderer/src/app/i18n.ts`
- Test: `tests/unit/highlight.test.ts` (create), `tests/unit/renderer/PassageView.test.tsx` (create), `tests/unit/renderer/QuizRunner.test.tsx` (modify)

**Interfaces:**
- Consumes: `Part7Doc`, `Evidence` (Task 1); `entryFields` p7 (Task 3); `skillLabel` (Task 5).
- Produces:
  - `splitHighlights(body: string, quotes: string[]): { text: string; hit: boolean }[]` (first occurrence of each quote, non-overlapping, in text order).
  - `<PassageView docs={Part7Doc[]} evidence={Evidence[] | null} />`: tabs for 2–3 docs (`role="tablist"`), `[1]`–`[4]` markers styled, highlighted segments as `<mark className="evidence">`; when `evidence` changes to non-null it switches to `evidence[0].doc`.
  - `QuestionView` prop `locked?: boolean` (default `true`): when `false`, choices stay enabled after selection and the A–D keys keep working (used by the Reading test).
  - `QuestionView` renders p7 as: `PassageView` left; right column has the prompt (`<p className="q-prompt">`), choices, and on reveal the explain slip whose stamp shows `skillLabel(type)` instead of the trap label.

- [ ] **Step 1: Failing highlight test** — `tests/unit/highlight.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { splitHighlights } from '@shared/highlight'

describe('splitHighlights', () => {
  it('marks each quote once, in text order', () => {
    expect(splitHighlights('one two three two', ['two', 'three'])).toEqual([
      { text: 'one ', hit: false },
      { text: 'two', hit: true },
      { text: ' ', hit: false },
      { text: 'three', hit: true },
      { text: ' two', hit: false }
    ])
  })
  it('ignores quotes that are missing or overlap an earlier hit', () => {
    expect(splitHighlights('abc def', ['zzz', 'abc d', 'c de'])).toEqual([
      { text: 'abc d', hit: true },
      { text: 'ef', hit: false }
    ])
  })
  it('returns the whole body when there are no quotes', () => {
    expect(splitHighlights('abc', [])).toEqual([{ text: 'abc', hit: false }])
  })
})
```

- [ ] **Step 2: Run** — `npx vitest run tests/unit/highlight.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement** — `src/shared/highlight.ts`:

```ts
export interface Segment {
  text: string
  hit: boolean
}

/** Splits `body` into plain and highlighted segments. Each quote marks its first occurrence that does not overlap an earlier mark. */
export function splitHighlights(body: string, quotes: string[]): Segment[] {
  const ranges: [number, number][] = []
  for (const q of quotes) {
    if (!q) continue
    let from = 0
    for (;;) {
      const at = body.indexOf(q, from)
      if (at < 0) break
      const end = at + q.length
      if (ranges.every(([s, e]) => end <= s || at >= e)) {
        ranges.push([at, end])
        break
      }
      from = at + 1
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  const out: Segment[] = []
  let pos = 0
  for (const [s, e] of ranges) {
    if (s > pos) out.push({ text: body.slice(pos, s), hit: false })
    out.push({ text: body.slice(s, e), hit: true })
    pos = e
  }
  if (pos < body.length || out.length === 0) out.push({ text: body.slice(pos), hit: false })
  return out
}
```

Run the test → PASS.

- [ ] **Step 4: Failing PassageView test** — `tests/unit/renderer/PassageView.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PassageView } from '../../../src/renderer/src/features/reading/PassageView'

const docs = [
  { kind: 'ad' as const, title: 'Ad: Room rental', body: 'Rooms from $90 per day.' },
  { kind: 'email' as const, title: 'Email: Booking', body: 'We booked the large room for Tuesday.' }
]

describe('PassageView', () => {
  it('shows one doc at a time with tabs', () => {
    render(<PassageView docs={docs} evidence={null} />)
    expect(screen.getByText('Rooms from $90 per day.')).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'Email: Booking' }))
    expect(screen.getByText(/We booked the large room/)).toBeTruthy()
  })

  it('switches to the evidence doc and highlights the quote', () => {
    const { container, rerender } = render(<PassageView docs={docs} evidence={null} />)
    rerender(<PassageView docs={docs} evidence={[{ doc: 1, quote: 'large room' }]} />)
    expect(container.querySelector('mark.evidence')?.textContent).toBe('large room')
    expect(screen.getByRole('tab', { name: 'Email: Booking' }).getAttribute('aria-selected')).toBe('true')
  })
})
```

- [ ] **Step 5: Implement `PassageView`** — `src/renderer/src/features/reading/PassageView.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { splitHighlights } from '@shared/highlight'
import type { Evidence, Part7Doc } from '@shared/types'

const MARKER = /(\[[1-4]\])/

function Body({ body, quotes }: { body: string; quotes: string[] }) {
  return (
    <p className="doc-body">
      {splitHighlights(body, quotes).map((seg, i) => {
        const parts = seg.text.split(MARKER).map((t, j) =>
          MARKER.test(t) ? (
            <span key={j} className="insert-marker">
              {t}
            </span>
          ) : (
            <span key={j}>{t}</span>
          )
        )
        return seg.hit ? (
          <mark key={i} className="evidence">
            {parts}
          </mark>
        ) : (
          <span key={i}>{parts}</span>
        )
      })}
    </p>
  )
}

export function PassageView({ docs, evidence }: { docs: Part7Doc[]; evidence: Evidence[] | null }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    if (evidence && evidence.length > 0) setActive(evidence[0].doc)
  }, [evidence])
  const doc = docs[Math.min(active, docs.length - 1)]
  const quotes = (evidence ?? []).filter((e) => e.doc === active).map((e) => e.quote)
  return (
    <div className="passage sheet p7-passage">
      {docs.length > 1 && (
        <div className="doc-tabs" role="tablist">
          {docs.map((d, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={i === active ? 'doc-tab active' : 'doc-tab'}
              onClick={() => setActive(i)}
            >
              {d.title}
            </button>
          ))}
        </div>
      )}
      <h3>{doc.title}</h3>
      <Body body={doc.body} quotes={quotes} />
    </div>
  )
}
```

Note: the tab buttons must not trigger the quiz A–D key handler; `isTypingTarget` already ignores keys whose target is a `button`.

- [ ] **Step 6: QuestionView** — in `QuestionView.tsx`:
  - Add prop `locked?: boolean` (default `true`). Replace `disabled={selected !== null}` with `disabled={locked && selected !== null}`, and in the keydown effect replace `if (selected !== null) return` with `if (locked && selected !== null) return`. Add `locked` to the effect deps.
  - Render p7: replace the stem/passage ternary with:

```tsx
      {entry.kind === 'p5' ? (
        <div className="sheet stem-sheet">
          <p className="stem">{entry.item.stem}</p>
        </div>
      ) : entry.kind === 'p6' ? (
        <Passage set={entry.set} current={entry.blank} />
      ) : (
        <PassageView docs={entry.set.docs} evidence={reveal ? entry.set.questions[entry.q].evidence : null} />
      )}
```

  and at the top of `answer-col`, for p7 only: `{entry.kind === 'p7' && <p className="q-prompt">{entry.set.questions[entry.q].prompt}</p>}`.
  - In the explain slip, render the stamp as `{entry.kind === 'p7' ? skillLabel(f.topic, lang) : t(lang, 'trapLabel')}` and only render `<strong>{f.trap}</strong>` when `f.trap` is non-empty.
  - Add `.p7` to the two-column grid: in `styles.css` change `.question.p6 {` selector to `.question.p6, .question.p7 {` and `.p6 .choices` to `.p6 .choices, .p7 .choices`; also include `.question.p7` in the `@media (max-width: 1080px)` single-column rule.

- [ ] **Step 7: Styles** — append to `src/renderer/src/styles.css` (riso system; no new colors):

```css
/* ---------- Part 7 passages ---------- */
.p7-passage { max-height: calc(100vh - 220px); overflow: auto; }
.doc-tabs { display: flex; gap: 6px; margin: -6px 0 14px; border-bottom: var(--rule) solid var(--blue); }
.doc-tab { padding: 6px 12px; font-size: 14px; border: var(--rule) solid var(--blue); border-bottom: 0; margin-bottom: calc(-1 * var(--rule)); background: var(--paper-deep); color: var(--blue); }
.doc-tab.active { background: var(--paper-lift); font-weight: 700; }
.doc-body { margin: 0; white-space: pre-line; }
mark.evidence { background: var(--yellow); color: var(--ink); padding: 0 2px; }
.insert-marker { display: inline-block; padding: 0 4px; margin: 0 2px; font: 700 13px/1.4 var(--display); color: var(--paper); background: var(--blue); }
.q-prompt { margin: 0; font-weight: 600; font-size: 19px; line-height: 1.5; }
```

- [ ] **Step 8: QuizRunner p7 test** — in `tests/unit/renderer/QuizRunner.test.tsx` add a test that renders `QuizRunner` with `flattenPart7(makePart7())` in `instant` mode and `lang="en"`, clicks the button named `/\(\s*A\s*\)/` after finding the correct one by text (`screen.getByRole('button', { name: /On Monday/ })`), then expects `container.querySelector('mark.evidence')?.textContent` to be `'reopen on Monday'` and `screen.getByText('Detail')` (the stamp) to exist.

- [ ] **Step 9: Run**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 10: Checkpoint** — no commit.

---

### Task 7: Part 7 drill screen (`/reading`)

**Files:**
- Create: `src/renderer/src/features/reading/ReadingScreen.tsx`
- Modify: `src/renderer/src/app/App.tsx`, `src/renderer/src/app/i18n.ts`, `src/renderer/src/styles.css`
- Test: `tests/unit/renderer/ReadingScreen.test.tsx` (create)

**Interfaces:**
- Consumes: `bank.part7`, `progress.readingAttempts` via `useApp()`; `flattenPart7`, `shuffleChoices` (Task 3); `QuizRunner`, `useRecordAnswer` (existing/Task 5); `topicStats`, `weakestTopics` (Task 9 generalizes them — until then compute per-type accuracy locally as below).
- Produces: route `/reading`, optional query `?type=<Part7QType>` preselecting the filter; nav link `navReading` placed after Topic drills.

- [ ] **Step 1: Strings** — add to both `en` and `th` in `i18n.ts`:

| key | en | th |
|---|---|---|
| `navReading` | `Reading (Part 7)` | `การอ่าน (Part 7)` |
| `readingTitle` | `Reading (Part 7)` | `การอ่าน (Part 7)` |
| `readingIntro` | `Read a passage, answer its questions, and see the sentence that proves each answer.` | `อ่านบทความ ตอบคำถาม แล้วดูประโยคที่เป็นหลักฐานของแต่ละคำตอบ` |
| `readingSingle` | `Single passages` | `บทความเดียว` |
| `readingDouble` | `Double passages` | `บทความคู่` |
| `readingTriple` | `Triple passages` | `บทความสามชิ้น` |
| `readingAllTypes` | `All question types` | `คำถามทุกประเภท` |
| `readingQuestions` | `{n} questions` | `{n} คำถาม` |
| `readingRandom` | `Random set` | `สุ่มชุด` |
| `readingBack` | `All sets` | `ทุกชุด` |
| `readingEmpty` | `No sets match this question type yet.` | `ยังไม่มีชุดที่มีคำถามประเภทนี้` |

- [ ] **Step 2: Failing test** — `tests/unit/renderer/ReadingScreen.test.tsx`: render `ReadingScreen` inside a `MemoryRouter` and a minimal fake `AppProvider`. If the repo has no test helper for `useApp`, mock the module:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { emptyProgress } from '@shared/types'
import { makePart7 } from '../../fixtures/items'

const set = makePart7({ id: 'p7-0001' })
vi.mock('../../../src/renderer/src/app/AppContext', () => ({
  useApp: () => ({ bank: { part5: [], part6: [], part7: [set] }, progress: emptyProgress(), recordGrammar: vi.fn(), recordReading: vi.fn() }),
  useT: () => ({ lang: 'en', t: (k: string, v?: Record<string, unknown>) => (v ? `${k}:${JSON.stringify(v)}` : k), topic: (s: string) => s })
}))
import { ReadingScreen } from '../../../src/renderer/src/features/reading/ReadingScreen'

describe('ReadingScreen', () => {
  it('lists sets and starts a drill with the passage', () => {
    render(<MemoryRouter initialEntries={['/reading']}><ReadingScreen /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Office closure/ }))
    expect(screen.getByText(/reopen on Monday/)).toBeTruthy()
  })
  it('filters sets by question type', () => {
    render(<MemoryRouter initialEntries={['/reading?type=vocabulary']}><ReadingScreen /></MemoryRouter>)
    expect(screen.getByText('readingEmpty')).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run** — `npx vitest run tests/unit/renderer/ReadingScreen.test.tsx` → FAIL (module missing).

- [ ] **Step 4: Implement** — `src/renderer/src/features/reading/ReadingScreen.tsx`:

```tsx
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { flattenPart7, shuffleChoices } from '@shared/quiz'
import { PART7_FORMATS, PART7_QTYPES, Part7QType, type Part7Format, type Part7Set } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon } from '../../app/Ink'
import { QuizRunner } from '../grammar/QuizRunner'
import { useRecordAnswer } from '../grammar/useRecordAnswer'

const FORMAT_KEY = { single: 'readingSingle', double: 'readingDouble', triple: 'readingTriple' } as const

function accuracyByType(attempts: { qtype: Part7QType; correct: boolean }[]): Map<Part7QType, number> {
  const acc = new Map<Part7QType, [number, number]>()
  for (const a of attempts) {
    const [c, n] = acc.get(a.qtype) ?? [0, 0]
    acc.set(a.qtype, [c + (a.correct ? 1 : 0), n + 1])
  }
  return new Map([...acc].map(([k, [c, n]]) => [k, c / n]))
}

export function ReadingScreen() {
  const { bank, progress } = useApp()
  const { lang, t, topic } = useT()
  const [params, setParams] = useSearchParams()
  const parsed = Part7QType.safeParse(params.get('type'))
  const filter = parsed.success ? parsed.data : null
  const [current, setCurrent] = useState<Part7Set | null>(null)
  const [run, setRun] = useState(0)
  const onAnswer = useRecordAnswer()
  const onFinish = useCallback(() => {}, [])

  const entries = useMemo(() => (current ? shuffleChoices(flattenPart7(current)) : []), [current, run])
  const acc = accuracyByType(progress.readingAttempts)
  // Weakest types first (types with no attempts keep catalog order after them).
  const types = [...PART7_QTYPES].sort((a, b) => (acc.get(a) ?? 2) - (acc.get(b) ?? 2))
  const visible = bank.part7.filter((s) => !filter || s.questions.some((q) => q.type === filter))

  if (current) {
    return (
      <section className="quiz-screen">
        <header className="quiz-title">
          <h1>{current.docs.map((d) => d.title).join(' · ')}</h1>
        </header>
        <QuizRunner key={`${current.id}-${run}`} entries={entries} mode="instant" lang={lang} onAnswer={onAnswer} onFinish={onFinish} />
        <div className="actions">
          <button type="button" className="again" onClick={() => setRun((r) => r + 1)}>
            {t('quizAgain')}
          </button>
          <button type="button" className="again" onClick={() => setCurrent(null)}>
            {t('readingBack')}
          </button>
        </div>
      </section>
    )
  }

  const pick = (format: Part7Format) => {
    const pool = visible.filter((s) => s.format === format)
    if (pool.length) setCurrent(pool[Math.floor(Math.random() * pool.length)])
  }

  return (
    <section className="reading">
      <header className="page-head">
        <h1 className="page-title">{t('readingTitle')}</h1>
        <p className="page-lead">{t('readingIntro')}</p>
      </header>
      <div className="type-chips" role="group" aria-label={t('readingAllTypes')}>
        <button type="button" className={filter ? 'chip' : 'chip on'} onClick={() => setParams({})}>
          {t('readingAllTypes')}
        </button>
        {types.map((ty) => (
          <button key={ty} type="button" className={filter === ty ? 'chip on' : 'chip'} onClick={() => setParams({ type: ty })}>
            {topic(ty)}
            {acc.has(ty) && <span className="num"> · {Math.round((acc.get(ty) ?? 0) * 100)}%</span>}
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="muted">{t('readingEmpty')}</p>}
      {PART7_FORMATS.map((format) => {
        const sets = visible.filter((s) => s.format === format)
        if (sets.length === 0) return null
        return (
          <section key={format} className="set-group">
            <div className="set-group-head">
              <h2 className="panel-title">{t(FORMAT_KEY[format])}</h2>
              <button type="button" className="text-link" onClick={() => pick(format)}>
                {t('readingRandom')}
                <ArrowIcon />
              </button>
            </div>
            <ul className="set-list">
              {sets.map((s) => (
                <li key={s.id}>
                  <button type="button" className="set-row" onClick={() => setCurrent(s)}>
                    <span className="set-title">{s.docs.map((d) => d.title).join(' · ')}</span>
                    <span className="set-meta">
                      {t('readingQuestions', { n: s.questions.length })} · {[...new Set(s.questions.map((q) => topic(q.type)))].join(', ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </section>
  )
}
```

- [ ] **Step 5: Route + nav** — in `App.tsx`: import `ReadingScreen`; add `<NavLink to="/reading">{t('navReading')}</NavLink>` after the Topic drills link; add `<Route path="/reading" element={<ReadingScreen />} />`.

- [ ] **Step 6: Styles** — append to `styles.css`:

```css
/* ---------- Part 7 start screen ---------- */
.type-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
.chip { padding: 6px 12px; font-size: 14px; border-color: var(--blue); color: var(--blue); }
.chip.on { background: var(--blue); color: var(--paper); }
.set-group { margin-bottom: 26px; }
.set-group-head { display: flex; align-items: baseline; justify-content: space-between; border-bottom: var(--rule) solid var(--pink); margin-bottom: 4px; }
.set-list { list-style: none; margin: 0; padding: 0; }
.set-row { width: 100%; display: grid; gap: 2px; text-align: left; padding: 12px 4px; border: 0; border-bottom: 1px solid var(--rule-soft); }
.set-title { font-weight: 700; color: var(--blue); }
.set-meta { font-size: 14px; color: var(--ink-soft); }
```

- [ ] **Step 7: Run**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 8: Checkpoint** — no commit.

---

### Task 8: Part 7 content batch 1 (content task, no code)

**Files:**
- Modify: `content/reading/part7/single.json` (add `p7-0002` … `p7-0020`), `double.json` (add `p7-0022` … `p7-0024`), `triple.json` (add `p7-0025` … `p7-0030`)
- Output: `docs/content-review/answer-sheet.md` regenerated

**Interfaces:**
- Consumes: `Part7Set` schema (Task 1), checker and answer sheet (Task 2).
- Produces: 20 single, 4 double, 6 triple approved sets.

- [ ] **Step 1: Dispatch writers in parallel** (one agent per file range, each touching only its range in its file; if two writers share a file, give each its own temp file `content/reading/part7/batch-<n>.json` and merge afterwards like Part 6). Every writer prompt must include:
  - Read `PRODUCT.md`, `src/shared/types.ts` (`Part7Set` + `superRefine`), and the seed sets `p7-0001`, `p7-0021`.
  - Doc kinds: rotate across `email, letter, memo, notice, ad, article, chat, form, schedule, review, webpage`; at least 3 single sets are `chat` (text-message chains with timestamps and an `intent` question) and at least 2 single sets contain `[1]`–`[4]` with an `insertion` question.
  - Single sets: 2–4 questions; double/triple: exactly 5, including at least one `cross-reference` question with evidence from 2+ docs.
  - Question type mix across the batch: every type in `PART7_QTYPES` appears at least 6 times; `not-true` questions say "NOT" in capitals in the prompt.
  - Each `evidence.quote` copied **exactly** from its doc body (the schema rejects missing quotes).
  - Thai explanations written for Thai learners, explaining where the proof is and why the tempting distractor fails; no positional wording ((A), "option C", ตัวเลือก ก).
  - 80–200 words per doc; generic made-up names; difficulty mostly 2–4.
  - Validate with `npx tsx scripts/check-content.ts` and `npx vitest run tests/content` before finishing.
- [ ] **Step 2: Blind verification** — dispatch 1–2 fresh reviewers (report-only) that solve each question without looking at the key, check one defensible answer, evidence correctness, natural English and Thai, and return a table of problems with concrete fixes.
- [ ] **Step 3: Apply fixes**, merge any temp files, re-run `npx tsx scripts/check-content.ts` (expect `Part 7: 30 sets` with `single: 20, double: 4, triple: 6` and `OK`), then `npx tsx scripts/answer-sheet.ts`.
- [ ] **Step 4: Checkpoint** — no commit. Tell the user the answer sheet now includes Part 7 for spot-checking.

---

### Task 9: Reading test builder and stats over skills

**Files:**
- Create: `src/shared/reading.ts`
- Modify: `src/shared/scoring.ts`
- Test: `tests/unit/reading.test.ts` (create), `tests/unit/scoring.test.ts` (modify)

**Interfaces:**
- Consumes: `ContentBank`, `QuizEntry`, `flattenSet`, `flattenPart7`, `shuffle`, `shuffleChoices`, `entryId` (Task 3); `ActiveReadingTest`, `TestLength` (Task 4).
- Produces:
  - `BLUEPRINT: Record<TestLength, { p5: number; p6: number; single: number; double: number; triple: number }>` = full `{30,4,10,2,3}`, half `{15,2,5,1,1}`.
  - `DURATION_MS: Record<TestLength, number>` = full `75*60_000`, half `38*60_000`.
  - `availableCounts(bank, length)` → same shape as a blueprint row, capped by the bank.
  - `buildReadingTest(bank, length, rng?) : QuizEntry[]` (Part 5, then Part 6 blanks set by set, then Part 7 single, double, triple; choices shuffled).
  - `restoreReadingTest(bank, saved: ActiveReadingTest): QuizEntry[] | null` (null if any id is missing or an order is invalid).
  - `topicStats(attempts: { topic: Skill; correct: boolean; ms: number }[]): TopicStat[]` with `TopicStat.topic: Skill`; `weakestTopics` returns `Skill[]`.

- [ ] **Step 1: Failing tests** — `tests/unit/reading.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { BLUEPRINT, availableCounts, buildReadingTest, restoreReadingTest } from '@shared/reading'
import { entryId, entryPart } from '@shared/quiz'
import type { ContentBank } from '@shared/types'
import { makePart5, makePart6, makePart7 } from '../fixtures/items'

const doubleSet = () => {
  const s = makePart7({ format: 'double' })
  s.docs = [s.docs[0], { kind: 'email', title: 'Email: x', body: 'The office will reopen on Monday after cleaning.' }]
  const base = s.questions[0]
  s.questions = [base, base, base, base, { ...base, type: 'cross-reference', evidence: [{ doc: 0, quote: 'reopen on Monday' }, { doc: 1, quote: 'after cleaning' }] }]
  return s
}
const bigBank = (): ContentBank => ({
  part5: Array.from({ length: 40 }, () => makePart5()),
  part6: Array.from({ length: 6 }, () => makePart6()),
  part7: [...Array.from({ length: 12 }, () => makePart7()), doubleSet(), doubleSet(), doubleSet()]
})

describe('buildReadingTest', () => {
  it('follows the half blueprint and part order', () => {
    const entries = buildReadingTest(bigBank(), 'half', () => 0.3)
    const parts = entries.map(entryPart)
    expect(parts.filter((p) => p === 'p5')).toHaveLength(BLUEPRINT.half.p5)
    expect(parts.filter((p) => p === 'p6')).toHaveLength(BLUEPRINT.half.p6 * 4)
    expect(parts.join(',')).toMatch(/^(p5,)+(p6,)+(p7,?)+$/)
    expect(entries.every((e) => e.order !== undefined)).toBe(true)
  })

  it('uses what exists when the bank is short', () => {
    const bank: ContentBank = { part5: [makePart5()], part6: [], part7: [] }
    expect(buildReadingTest(bank, 'full')).toHaveLength(1)
    expect(availableCounts(bank, 'full')).toEqual({ p5: 1, p6: 0, single: 0, double: 0, triple: 0 })
  })
})

describe('restoreReadingTest', () => {
  it('rebuilds the same entries and choice orders from saved ids', () => {
    const bank = bigBank()
    const entries = buildReadingTest(bank, 'half', () => 0.7)
    const saved = { length: 'half' as const, ids: entries.map(entryId), orders: entries.map((e) => e.order!), answers: {}, flags: [], index: 3, elapsedMs: 1000 }
    const restored = restoreReadingTest(bank, saved)!
    expect(restored.map(entryId)).toEqual(saved.ids)
    expect(restored.map((e) => e.order)).toEqual(saved.orders)
  })
  it('returns null when an item no longer exists', () => {
    const saved = { length: 'half' as const, ids: ['p5-word-form-9999'], orders: [[0, 1, 2, 3]], answers: {}, flags: [], index: 0, elapsedMs: 0 }
    expect(restoreReadingTest(bigBank(), saved)).toBeNull()
  })
})
```

In `tests/unit/scoring.test.ts` add:

```ts
it('computes stats for Part 7 question types', () => {
  const stats = topicStats([
    { topic: 'inference', correct: false, ms: 1000 },
    { topic: 'inference', correct: true, ms: 3000 }
  ])
  expect(stats).toEqual([{ topic: 'inference', count: 2, accuracy: 0.5, avgMs: 2000 }])
})
```

- [ ] **Step 2: Run** — `npx vitest run tests/unit/reading.test.ts tests/unit/scoring.test.ts` → FAIL.

- [ ] **Step 3: Generalize scoring** — in `src/shared/scoring.ts` change types only:

```ts
import type { MixedTestResult, Skill } from './types'

export interface TopicStat {
  topic: Skill
  count: number
  accuracy: number
  avgMs: number
}

type SkillAttempt = { topic: Skill; correct: boolean; ms: number }

export function topicStats(attempts: SkillAttempt[]): TopicStat[] { /* body unchanged, Map<Skill, SkillAttempt[]> */ }
export function weakestTopics(stats: TopicStat[], n = 3, minCount = 5): Skill[] { /* body unchanged */ }
```

Then run `npx tsc --noEmit` and fix callers: `HomeScreen.tsx` and `ProgressScreen.tsx` already filter with `Part5Topic.safeParse`; where a `GrammarTopic` is required, narrow with `isGrammarTopic` from `i18n.ts` or `Part5Topic.safeParse`.

- [ ] **Step 4: Implement `reading.ts`** — create `src/shared/reading.ts`:

```ts
import { entryId, flattenPart7, flattenSet, resolveIds, shuffle, shuffleChoices, type QuizEntry } from './quiz'
import type { ActiveReadingTest, ContentBank, Part7Format, TestLength } from './types'

export interface Blueprint {
  p5: number
  p6: number
  single: number
  double: number
  triple: number
}

export const BLUEPRINT: Record<TestLength, Blueprint> = {
  full: { p5: 30, p6: 4, single: 10, double: 2, triple: 3 },
  half: { p5: 15, p6: 2, single: 5, double: 1, triple: 1 }
}

export const DURATION_MS: Record<TestLength, number> = { full: 75 * 60_000, half: 38 * 60_000 }

const byFormat = (bank: ContentBank, f: Part7Format) => bank.part7.filter((s) => s.format === f)

export function availableCounts(bank: ContentBank, length: TestLength): Blueprint {
  const b = BLUEPRINT[length]
  return {
    p5: Math.min(b.p5, bank.part5.length),
    p6: Math.min(b.p6, bank.part6.length),
    single: Math.min(b.single, byFormat(bank, 'single').length),
    double: Math.min(b.double, byFormat(bank, 'double').length),
    triple: Math.min(b.triple, byFormat(bank, 'triple').length)
  }
}

export function buildReadingTest(bank: ContentBank, length: TestLength, rng: () => number = Math.random): QuizEntry[] {
  const c = availableCounts(bank, length)
  const p5: QuizEntry[] = shuffle(bank.part5, rng).slice(0, c.p5).map((item) => ({ kind: 'p5', item }))
  const p6 = shuffle(bank.part6, rng).slice(0, c.p6).flatMap(flattenSet)
  const p7 = (['single', 'double', 'triple'] as const).flatMap((f) =>
    shuffle(byFormat(bank, f), rng).slice(0, c[f]).flatMap(flattenPart7)
  )
  return shuffleChoices([...p5, ...p6, ...p7], rng)
}

export function restoreReadingTest(bank: ContentBank, saved: ActiveReadingTest): QuizEntry[] | null {
  const entries = resolveIds(bank, saved.ids)
  if (entries.length !== saved.ids.length || saved.orders.length !== entries.length) return null
  const out: QuizEntry[] = []
  for (let i = 0; i < entries.length; i++) {
    const order = saved.orders[i]
    if (entryId(entries[i]) !== saved.ids[i]) return null
    if (order.length !== 4 || new Set(order).size !== 4) return null
    out.push({ ...entries[i], order })
  }
  return out
}
```

- [ ] **Step 5: Run**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Checkpoint** — no commit.

---

### Task 10: Test reducer, scoring and band

**Files:**
- Modify: `src/shared/reading.ts`, `src/shared/scoring.ts`
- Test: `tests/unit/reading.test.ts`, `tests/unit/scoring.test.ts` (modify)

**Interfaces:**
- Consumes: Task 9.
- Produces:
  - `TestState { length: TestLength; entries: QuizEntry[]; answers: Record<string, number>; flags: string[]; index: number; elapsedMs: number; durationMs: number; done: boolean }`
  - `TestAction = { type: 'answer'; choice: number } | { type: 'jump'; index: number } | { type: 'next' } | { type: 'prev' } | { type: 'flag' } | { type: 'tick'; ms: number } | { type: 'submit' }`
  - `initTest(entries, length, saved?: Pick<ActiveReadingTest, 'answers' | 'flags' | 'index' | 'elapsedMs'>): TestState`
  - `testReducer(s: TestState, a: TestAction): TestState`
  - `toActive(s: TestState): ActiveReadingTest`
  - `scoreTest(s: TestState): { p5: PartScore; p6: PartScore; p7: PartScore }`
  - `estimateReadingBand(parts): Band | null` (null when no questions)
  - `latestBand(progress: Progress): { band: Band; source: 'test' | 'mixed' } | null` (in `scoring.ts`)

- [ ] **Step 1: Failing tests** — append to `tests/unit/reading.test.ts`:

```ts
import { DURATION_MS, initTest, scoreTest, testReducer, toActive } from '@shared/reading'
import { entryFields } from '@shared/quiz'

const small = () => buildReadingTest({ part5: [makePart5(), makePart5()], part6: [], part7: [makePart7()] }, 'half', () => 0.4)

describe('testReducer', () => {
  it('answers, changes an answer, moves, jumps and flags', () => {
    let s = initTest(small(), 'half')
    s = testReducer(s, { type: 'answer', choice: 1 })
    s = testReducer(s, { type: 'answer', choice: 2 })
    expect(s.answers[entryId(s.entries[0])]).toBe(2)
    s = testReducer(s, { type: 'next' })
    expect(s.index).toBe(1)
    s = testReducer(s, { type: 'prev' })
    s = testReducer(s, { type: 'prev' })
    expect(s.index).toBe(0)
    s = testReducer(s, { type: 'jump', index: 3 })
    expect(s.index).toBe(3)
    s = testReducer(s, { type: 'flag' })
    expect(s.flags).toEqual([entryId(s.entries[3])])
    s = testReducer(s, { type: 'flag' })
    expect(s.flags).toEqual([])
  })

  it('submits on timeout and ignores actions after submit', () => {
    let s = initTest(small(), 'half')
    s = testReducer(s, { type: 'tick', ms: DURATION_MS.half - 1 })
    expect(s.done).toBe(false)
    s = testReducer(s, { type: 'tick', ms: 5 })
    expect(s.done).toBe(true)
    expect(s.elapsedMs).toBe(DURATION_MS.half)
    expect(testReducer(s, { type: 'answer', choice: 0 })).toBe(s)
  })

  it('resumes from saved state and round-trips through toActive', () => {
    const entries = small()
    const s0 = initTest(entries, 'half', { answers: { [entryId(entries[1])]: 3 }, flags: [], index: 1, elapsedMs: 60_000 })
    expect(s0.index).toBe(1)
    expect(toActive(s0)).toMatchObject({ length: 'half', index: 1, elapsedMs: 60_000, ids: entries.map(entryId) })
  })

  it('scores by part', () => {
    let s = initTest(small(), 'half')
    const correct = entryFields(s.entries[0]).answer
    s = testReducer(s, { type: 'answer', choice: correct })
    const parts = scoreTest(s)
    expect(parts.p5).toEqual({ correct: 1, total: 2 })
    expect(parts.p6).toEqual({ correct: 0, total: 0 })
    expect(parts.p7.total).toBe(2)
  })
})
```

Append to `tests/unit/scoring.test.ts`:

```ts
import { estimateReadingBand } from '@shared/reading'
import { latestBand } from '@shared/scoring'
import { emptyProgress } from '@shared/types'

it('estimates a Reading band from part scores', () => {
  const perfect = { p5: { correct: 30, total: 30 }, p6: { correct: 16, total: 16 }, p7: { correct: 54, total: 54 } }
  expect(estimateReadingBand(perfect)).toEqual({ low: 460, high: 495 })
  expect(estimateReadingBand({ p5: { correct: 0, total: 0 }, p6: { correct: 0, total: 0 }, p7: { correct: 0, total: 0 } })).toBeNull()
})

it('prefers the latest Reading test over mixed tests', () => {
  const p = emptyProgress()
  p.mixedTests = [{ at: 'a', correct: 34, total: 34, ms: 1 }]
  expect(latestBand(p)?.source).toBe('mixed')
  p.readingTests = [{ length: 'half', parts: { p5: { correct: 5, total: 15 }, p6: { correct: 2, total: 8 }, p7: { correct: 8, total: 27 } }, ms: 1, at: 'b' }]
  expect(latestBand(p)?.source).toBe('test')
})
```

- [ ] **Step 2: Run** — FAIL (missing exports).

- [ ] **Step 3: Implement** — append to `src/shared/reading.ts`:

```ts
import { entryFields, entryPart } from './quiz'
import type { Band } from './scoring'
import type { PartScore } from './types'

export interface TestState {
  length: TestLength
  entries: QuizEntry[]
  answers: Record<string, number>
  flags: string[]
  index: number
  elapsedMs: number
  durationMs: number
  done: boolean
}

export type TestAction =
  | { type: 'answer'; choice: number }
  | { type: 'jump'; index: number }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'flag' }
  | { type: 'tick'; ms: number }
  | { type: 'submit' }

export function initTest(
  entries: QuizEntry[],
  length: TestLength,
  saved?: Pick<ActiveReadingTest, 'answers' | 'flags' | 'index' | 'elapsedMs'>
): TestState {
  const durationMs = DURATION_MS[length]
  return {
    length,
    entries,
    answers: saved?.answers ?? {},
    flags: saved?.flags ?? [],
    index: Math.min(saved?.index ?? 0, Math.max(0, entries.length - 1)),
    elapsedMs: Math.min(saved?.elapsedMs ?? 0, durationMs),
    durationMs,
    done: entries.length === 0
  }
}

const clamp = (s: TestState, i: number) => Math.max(0, Math.min(s.entries.length - 1, i))

export function testReducer(s: TestState, a: TestAction): TestState {
  if (s.done) return s
  const id = entryId(s.entries[s.index])
  switch (a.type) {
    case 'answer':
      return { ...s, answers: { ...s.answers, [id]: a.choice } }
    case 'jump':
      return { ...s, index: clamp(s, a.index) }
    case 'next':
      return { ...s, index: clamp(s, s.index + 1) }
    case 'prev':
      return { ...s, index: clamp(s, s.index - 1) }
    case 'flag':
      return { ...s, flags: s.flags.includes(id) ? s.flags.filter((f) => f !== id) : [...s.flags, id] }
    case 'tick': {
      const elapsedMs = Math.min(s.durationMs, s.elapsedMs + Math.max(0, a.ms))
      return { ...s, elapsedMs, done: elapsedMs >= s.durationMs }
    }
    case 'submit':
      return { ...s, done: true }
  }
}

export function toActive(s: TestState): ActiveReadingTest {
  return {
    length: s.length,
    ids: s.entries.map(entryId),
    orders: s.entries.map((e) => e.order ?? [0, 1, 2, 3]),
    answers: s.answers,
    flags: s.flags,
    index: s.index,
    elapsedMs: Math.round(s.elapsedMs)
  }
}

export function scoreTest(s: TestState): { p5: PartScore; p6: PartScore; p7: PartScore } {
  const parts = { p5: { correct: 0, total: 0 }, p6: { correct: 0, total: 0 }, p7: { correct: 0, total: 0 } }
  for (const e of s.entries) {
    const p = parts[entryPart(e)]
    p.total++
    if (s.answers[entryId(e)] === entryFields(e).answer) p.correct++
  }
  return parts
}

// Approximate raw-percentage → scaled Reading band. An estimate, not ETS's conversion.
const READING_BANDS: { min: number; band: Band }[] = [
  { min: 0.96, band: { low: 460, high: 495 } },
  { min: 0.86, band: { low: 400, high: 460 } },
  { min: 0.76, band: { low: 345, high: 400 } },
  { min: 0.66, band: { low: 290, high: 345 } },
  { min: 0.56, band: { low: 235, high: 290 } },
  { min: 0.46, band: { low: 180, high: 235 } },
  { min: 0.36, band: { low: 130, high: 180 } },
  { min: 0, band: { low: 5, high: 130 } }
]

export function estimateReadingBand(parts: { p5: PartScore; p6: PartScore; p7: PartScore }): Band | null {
  const total = parts.p5.total + parts.p6.total + parts.p7.total
  if (total === 0) return null
  const pct = (parts.p5.correct + parts.p6.correct + parts.p7.correct) / total
  return READING_BANDS.find((b) => pct >= b.min)!.band
}
```

(Merge the new imports into the file's existing import lines rather than duplicating `./quiz`/`./types` imports.)

In `src/shared/scoring.ts` add:

```ts
import { estimateReadingBand } from './reading'
import type { Progress } from './types'

export function latestBand(p: Progress): { band: Band; source: 'test' | 'mixed' } | null {
  const last = p.readingTests[p.readingTests.length - 1]
  const fromTest = last ? estimateReadingBand(last.parts) : null
  if (fromTest) return { band: fromTest, source: 'test' }
  const fromMixed = estimateBand(p.mixedTests)
  return fromMixed ? { band: fromMixed, source: 'mixed' } : null
}
```

`reading.ts` imports the `Band` type from `scoring.ts` and `scoring.ts` imports a function from `reading.ts`; this cycle is safe because `reading.ts` uses `Band` only as a type (`import type`). Keep it `import type`.

- [ ] **Step 4: Run**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Checkpoint** — no commit.

---

### Task 11: Reading test UI — start, runner, map, timer

**Files:**
- Create: `src/renderer/src/features/reading-test/ReadingTestScreen.tsx`, `ReadingTestRunner.tsx`, `QuestionMap.tsx`, `TestTimer.tsx`
- Modify: `src/renderer/src/app/App.tsx`, `src/renderer/src/app/i18n.ts`, `src/renderer/src/styles.css`
- Test: `tests/unit/renderer/ReadingTestRunner.test.tsx` (create)

**Interfaces:**
- Consumes: `buildReadingTest`, `availableCounts`, `initTest`, `testReducer`, `toActive`, `DURATION_MS` (Tasks 9–10); `QuestionView` with `locked={false}` (Task 6); `useApp().saveActiveTest` (Task 4).
- Produces:
  - `<TestTimer remainingMs={number} lang={Lang} />` — `mm:ss` tabular; class `warn` at ≤ 5 min with text `t('testFiveLeft')`, class `urgent` at ≤ 1 min with `t('testOneLeft')`.
  - `<QuestionMap entries answers flags index onJump lang />` — one button per entry grouped under Part headings; `aria-label` like `Question 12, answered, flagged`; classes `cell answered|flagged|current`.
  - `<ReadingTestRunner entries length saved? onDone(state: TestState) />` — owns the reducer, the 1 s ticker (`Date.now()` deltas), saving via `saveActiveTest(toActive(state))` on every answer/flag/jump and every 5 s, and on unmount.
  - Route `/reading-test`; nav link `navReadingTest` after Mixed test.

- [ ] **Step 1: Strings** — add to both languages:

| key | en | th |
|---|---|---|
| `navReadingTest` | `Reading test` | `ข้อสอบ Reading` |
| `testTitle` | `Reading test` | `ข้อสอบ Reading` |
| `testIntro` | `Parts 5, 6 and 7 in exam order, one timer for the whole test. You can move freely and change answers. Explanations come at the end.` | `Part 5, 6 และ 7 ตามลำดับข้อสอบจริง จับเวลาทั้งชุด เลื่อนไปมาและเปลี่ยนคำตอบได้ คำอธิบายจะแสดงตอนจบ` |
| `testHalf` | `Half test` | `ครึ่งชุด` |
| `testFull` | `Full test` | `เต็มชุด` |
| `testHalfMeta` | `{n} questions · 38 minutes` | `{n} ข้อ · 38 นาที` |
| `testFullMeta` | `{n} questions · 75 minutes` | `{n} ข้อ · 75 นาที` |
| `testShortBank` | `The question bank is still small, so this test has {n} questions.` | `คลังข้อสอบยังมีไม่ครบ ชุดนี้จึงมี {n} ข้อ` |
| `testStart` | `Start test` | `เริ่มทำข้อสอบ` |
| `testPrev` | `Previous` | `ข้อก่อนหน้า` |
| `testNext` | `Next` | `ข้อถัดไป` |
| `testFlag` | `Flag` | `ทำเครื่องหมาย` |
| `testUnflag` | `Remove flag` | `เอาเครื่องหมายออก` |
| `testSubmit` | `Submit test` | `ส่งข้อสอบ` |
| `testConfirm` | `{n} questions are unanswered. Submit anyway?` | `ยังไม่ได้ตอบ {n} ข้อ ต้องการส่งเลยหรือไม่` |
| `testConfirmYes` | `Submit now` | `ส่งเลย` |
| `testConfirmNo` | `Keep working` | `ทำต่อ` |
| `testFiveLeft` | `5 minutes left` | `เหลือ 5 นาที` |
| `testOneLeft` | `1 minute left` | `เหลือ 1 นาที` |
| `testMapLabel` | `Question {i}, {state}` | `ข้อ {i} {state}` |
| `testAnswered` | `answered` | `ตอบแล้ว` |
| `testUnanswered` | `unanswered` | `ยังไม่ตอบ` |
| `testFlagged` | `flagged` | `ทำเครื่องหมายไว้` |
| `testPart` | `Part {n}` | `Part {n}` |

- [ ] **Step 2: Failing component test** — `tests/unit/renderer/ReadingTestRunner.test.tsx` (mock `AppContext` like Task 7, adding `saveActiveTest: vi.fn().mockResolvedValue(undefined)`):

```tsx
it('jumps via the map, changes answers, and confirms before submitting with blanks', () => {
  const entries = buildReadingTest({ part5: [makePart5(), makePart5()], part6: [], part7: [] }, 'half', () => 0.2)
  const onDone = vi.fn()
  render(<ReadingTestRunner entries={entries} length="half" onDone={onDone} />)
  fireEvent.click(screen.getByRole('button', { name: /Question 2, unanswered/ }))
  fireEvent.click(screen.getAllByRole('button', { name: /^\(\s*A\s*\)/ })[0])
  expect(screen.getByRole('button', { name: /Question 2, answered/ })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'testSubmit' }))
  expect(screen.getByText(/testConfirm/)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'testConfirmYes' }))
  expect(onDone).toHaveBeenCalledTimes(1)
})
```

(With the mocked `t` returning the key or `key:{json}`, labels read like `testMapLabel:{"i":2,"state":"testUnanswered"}`; to make the regexes above work, have the mock `t` interpolate: `(k, v) => v ? k === 'testMapLabel' ? \`Question ${v.i}, ${v.state}\` : \`${k}:${JSON.stringify(v)}\` : k`, and pass the already-translated `state` word — the component calls `t('testMapLabel', { i, state: t('testAnswered') })`, so the mock returns `testAnswered`; use `/Question 2, testUnanswered/` and `/Question 2, testAnswered/` in the assertions if you keep the plain-key mock.)

- [ ] **Step 3: Run** — FAIL (module missing).

- [ ] **Step 4: Implement `TestTimer.tsx`:**

```tsx
import { t, type Lang } from '../../app/i18n'

export function TestTimer({ remainingMs, lang }: { remainingMs: number; lang: Lang }) {
  const total = Math.max(0, Math.ceil(remainingMs / 1000))
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  const level = total <= 60 ? 'urgent' : total <= 300 ? 'warn' : ''
  return (
    <span className={`test-timer ${level}`} role="timer" aria-live="off">
      <span className="num">
        {mm}:{ss}
      </span>
      {level && <span className="timer-cue">{t(lang, level === 'urgent' ? 'testOneLeft' : 'testFiveLeft')}</span>}
    </span>
  )
}
```

- [ ] **Step 5: Implement `QuestionMap.tsx`:**

```tsx
import { entryId, entryPart, type QuizEntry } from '@shared/quiz'
import { t, type Lang } from '../../app/i18n'

interface Props {
  entries: QuizEntry[]
  answers: Record<string, number>
  flags: string[]
  index: number
  lang: Lang
  onJump(i: number): void
}

export function QuestionMap({ entries, answers, flags, index, lang, onJump }: Props) {
  const groups = (['p5', 'p6', 'p7'] as const)
    .map((part) => ({ part, items: entries.map((e, i) => ({ e, i })).filter(({ e }) => entryPart(e) === part) }))
    .filter((g) => g.items.length > 0)
  return (
    <nav className="qmap" aria-label={t(lang, 'testTitle')}>
      {groups.map((g) => (
        <div key={g.part} className="qmap-group">
          <span className="qmap-part">{t(lang, 'testPart', { n: g.part.slice(1) })}</span>
          <div className="qmap-cells">
            {g.items.map(({ e, i }) => {
              const id = entryId(e)
              const answered = answers[id] !== undefined
              const flagged = flags.includes(id)
              const state = [t(lang, answered ? 'testAnswered' : 'testUnanswered'), flagged ? t(lang, 'testFlagged') : '']
                .filter(Boolean)
                .join(', ')
              const cls = ['cell', answered && 'answered', flagged && 'flagged', i === index && 'current'].filter(Boolean).join(' ')
              return (
                <button key={id} type="button" className={cls} aria-current={i === index} aria-label={t(lang, 'testMapLabel', { i: i + 1, state })} onClick={() => onJump(i)}>
                  <span className="num">{i + 1}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
```

- [ ] **Step 6: Implement `ReadingTestRunner.tsx`:**

```tsx
import { useEffect, useReducer, useRef, useState } from 'react'
import { entryId, type QuizEntry } from '@shared/quiz'
import { initTest, testReducer, toActive, type TestState } from '@shared/reading'
import type { ActiveReadingTest, TestLength } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon } from '../../app/Ink'
import { QuestionView } from '../grammar/QuestionView'
import { QuestionMap } from './QuestionMap'
import { TestTimer } from './TestTimer'

interface Props {
  entries: QuizEntry[]
  length: TestLength
  saved?: Pick<ActiveReadingTest, 'answers' | 'flags' | 'index' | 'elapsedMs'>
  onDone(state: TestState): void
}

const SAVE_EVERY_MS = 5000

export function ReadingTestRunner({ entries, length, saved, onDone }: Props) {
  const { saveActiveTest } = useApp()
  const { lang, t } = useT()
  const [s, dispatch] = useReducer(testReducer, undefined, () => initTest(entries, length, saved))
  const [confirming, setConfirming] = useState(false)
  const latest = useRef(s)
  latest.current = s
  const finished = useRef(false)

  // Clock: advances only while this screen is mounted (pauses when the app is closed).
  useEffect(() => {
    let last = Date.now()
    let sinceSave = 0
    const id = setInterval(() => {
      const now = Date.now()
      const ms = now - last
      last = now
      dispatch({ type: 'tick', ms })
      sinceSave += ms
      if (sinceSave >= SAVE_EVERY_MS) {
        sinceSave = 0
        if (!latest.current.done) void saveActiveTest(toActive(latest.current))
      }
    }, 1000)
    return () => {
      clearInterval(id)
      if (!latest.current.done) void saveActiveTest(toActive(latest.current))
    }
  }, [saveActiveTest])

  // Save on every answer, flag or move.
  useEffect(() => {
    if (!s.done) void saveActiveTest(toActive(s))
  }, [s.answers, s.flags, s.index]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (s.done && !finished.current) {
      finished.current = true
      onDone(s)
    }
  }, [s, onDone])

  if (s.entries.length === 0) return null
  const entry = s.entries[s.index]
  const id = entryId(entry)
  const unanswered = s.entries.filter((e) => s.answers[entryId(e)] === undefined).length

  return (
    <div className="test quiz">
      <div className="test-bar">
        <TestTimer remainingMs={s.durationMs - s.elapsedMs} lang={lang} />
        <QuestionMap entries={s.entries} answers={s.answers} flags={s.flags} index={s.index} lang={lang} onJump={(i) => dispatch({ type: 'jump', index: i })} />
      </div>
      <p className="quiz-count num">{t('quizQuestionOf', { i: s.index + 1, n: s.entries.length })}</p>
      <QuestionView
        key={id}
        entry={entry}
        lang={lang}
        selected={s.answers[id] ?? null}
        reveal={false}
        locked={false}
        onChoose={(choice) => dispatch({ type: 'answer', choice })}
      />
      <div className="quiz-foot test-foot">
        <div className="actions">
          <button type="button" onClick={() => dispatch({ type: 'prev' })} disabled={s.index === 0}>
            {t('testPrev')}
          </button>
          <button type="button" onClick={() => dispatch({ type: 'flag' })} aria-pressed={s.flags.includes(id)}>
            {t(s.flags.includes(id) ? 'testUnflag' : 'testFlag')}
          </button>
          <button type="button" onClick={() => dispatch({ type: 'next' })} disabled={s.index === s.entries.length - 1}>
            {t('testNext')}
            <ArrowIcon />
          </button>
        </div>
        {confirming ? (
          <div className="confirm-bar" role="alert">
            <span>{t('testConfirm', { n: unanswered })}</span>
            <button type="button" className="primary" onClick={() => dispatch({ type: 'submit' })}>
              {t('testConfirmYes')}
            </button>
            <button type="button" onClick={() => setConfirming(false)}>
              {t('testConfirmNo')}
            </button>
          </div>
        ) : (
          <button type="button" className="primary" onClick={() => (unanswered > 0 ? setConfirming(true) : dispatch({ type: 'submit' }))}>
            {t('testSubmit')}
          </button>
        )}
      </div>
    </div>
  )
}
```

Note: the `.quiz` class makes the rail recede (existing `.app:has(.quiz)` rule) — keep it.

- [ ] **Step 7: Implement `ReadingTestScreen.tsx`** (start + runner; results come in Task 12, resume in Task 13):

```tsx
import { useCallback, useMemo, useState } from 'react'
import { buildReadingTest, type TestState } from '@shared/reading'
import type { QuizEntry } from '@shared/quiz'
import type { TestLength } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { ArrowIcon, PosterShapes } from '../../app/Ink'
import { ReadingTestRunner } from './ReadingTestRunner'

export function ReadingTestScreen() {
  const { bank } = useApp()
  const { t } = useT()
  const [length, setLength] = useState<TestLength>('half')
  const [running, setRunning] = useState<{ entries: QuizEntry[]; length: TestLength } | null>(null)
  const [result, setResult] = useState<TestState | null>(null)

  const counts = useMemo(() => {
    const total = (l: TestLength) => buildReadingTest(bank, l, () => 0).length
    return { half: total('half'), full: total('full') }
  }, [bank])

  const onDone = useCallback((s: TestState) => {
    setResult(s)
    setRunning(null)
  }, [])

  if (running) return <section className="quiz-screen"><ReadingTestRunner entries={running.entries} length={running.length} onDone={onDone} /></section>
  if (result) return <section className="quiz-screen">{/* Task 12 renders <ReadingTestResults state={result} /> here */}</section>

  const target = { half: 50, full: 100 }
  return (
    <section className="mixed">
      <div className="mixed-intro">
        <PosterShapes />
        <h1 className="poster-head">
          <span className="ink-blue">{t('testTitle')}</span>
        </h1>
        <p className="poster-lead">{t('testIntro')}</p>
        <fieldset className="lang-field">
          <div className="lang-options">
            {(['half', 'full'] as const).map((l) => (
              <label key={l} className="lang-option">
                <input type="radio" name="test-length" checked={length === l} onChange={() => setLength(l)} />
                <span className="lang-label">{t(l === 'half' ? 'testHalf' : 'testFull')}</span>
                <span className="lang-sample num">{t(l === 'half' ? 'testHalfMeta' : 'testFullMeta', { n: target[l] })}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {counts[length] < target[length] && <p className="muted">{t('testShortBank', { n: counts[length] })}</p>}
        <button type="button" className="primary" disabled={counts[length] === 0} onClick={() => setRunning({ entries: buildReadingTest(bank, length), length })}>
          {t('testStart')}
          <ArrowIcon />
        </button>
      </div>
    </section>
  )
}
```

- [ ] **Step 8: Route + nav** — `App.tsx`: import `ReadingTestScreen`; add `<NavLink to="/reading-test">{t('navReadingTest')}</NavLink>` after Mixed test; add `<Route path="/reading-test" element={<ReadingTestScreen />} />`.

- [ ] **Step 9: Styles** — append:

```css
/* ---------- Reading test ---------- */
.test-bar { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: start; padding-bottom: 12px; margin-bottom: 8px; border-bottom: var(--rule) solid var(--blue); }
.test-timer { display: inline-grid; gap: 2px; font: 700 26px/1 var(--display); color: var(--blue); }
.test-timer .timer-cue { font: 600 13px/1.2 var(--text); }
.test-timer.warn { color: var(--pink-ink); }
.test-timer.urgent { color: var(--paper); background: var(--pink-ink); padding: 4px 8px; }
.qmap { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.qmap-group { display: grid; gap: 4px; }
.qmap-part { font-size: 12px; font-weight: 700; color: var(--blue); }
.qmap-cells { display: flex; flex-wrap: wrap; gap: 3px; }
.qmap .cell { width: 26px; height: 22px; padding: 0; justify-content: center; font-size: 11px; border-color: var(--blue); }
.qmap .cell.answered { background: var(--blue); color: var(--paper); }
.qmap .cell.flagged { box-shadow: inset 0 -4px 0 var(--pink-ink); }
.qmap .cell.current { outline: 2px solid var(--yellow); outline-offset: 1px; }
.test-foot { flex-wrap: wrap; }
.confirm-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; padding: 10px 14px; background: var(--pink-wash); border: var(--rule) solid var(--pink-ink); }
```

(The flagged cell uses an inset bar — a shape cue, not color alone.)

- [ ] **Step 10: Run**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 11: Checkpoint** — no commit.

---

### Task 12: Results, per-part review, Progress screen band and Part 7 stats

**Files:**
- Create: `src/renderer/src/features/reading-test/ReadingTestResults.tsx`
- Modify: `ReadingTestScreen.tsx`, `src/renderer/src/features/grammar/QuizSummary.tsx`, `src/renderer/src/features/progress/ProgressScreen.tsx`, `ProgressView.tsx`, `i18n.ts`, `styles.css`
- Test: `tests/unit/renderer/QuizSummary.test.tsx` (create), `tests/unit/renderer/ProgressView.test.tsx` (modify)

**Interfaces:**
- Consumes: `scoreTest`, `estimateReadingBand`, `TestState` (Task 10); `finishReadingTest` (Task 4); `latestBand`, `topicStats` (Tasks 9–10).
- Produces:
  - `QuizSummary` accepts `records: (AnswerRecord | undefined)[]`; score counts only defined correct records; p7 review rows show set title, prompt, and evidence quotes as `“…”`.
  - `<ReadingTestResults state={TestState} />` — records the finished test once via `finishReadingTest`, shows per-part scores, time used, band (with estimate note), then `QuizSummary showReview`.
  - `ProgressView` new props `bandSource: 'test' | 'mixed' | null`, `readingStats: TopicStat[]`, `onDrillReading(type: Part7QType)`.

- [ ] **Step 1: Strings** (both languages):

| key | en | th |
|---|---|---|
| `testResultTitle` | `Reading test results` | `ผลข้อสอบ Reading` |
| `testPartScore` | `Part {p}: {c} / {n}` | `Part {p}: {c} / {n}` |
| `testTimeUsed` | `Time used: {m} min` | `ใช้เวลา {m} นาที` |
| `testBandNote` | `Estimate from this test only. Not an official score.` | `ประมาณจากข้อสอบชุดนี้เท่านั้น ไม่ใช่คะแนนอย่างเป็นทางการ` |
| `progressBandNoteTest` | `Estimate from your latest Reading test. Not an official score.` | `ประมาณจากข้อสอบ Reading ครั้งล่าสุด ไม่ใช่คะแนนอย่างเป็นทางการ` |
| `progressReading` | `Reading question types (Part 7)` | `ประเภทคำถามการอ่าน (Part 7)` |
| `evidenceLabel` | `Proof` | `หลักฐาน` |

- [ ] **Step 2: Failing QuizSummary test** — `tests/unit/renderer/QuizSummary.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { flattenPart7 } from '@shared/quiz'
import { QuizSummary } from '../../../src/renderer/src/features/grammar/QuizSummary'
import { makePart5, makePart7 } from '../../fixtures/items'

describe('QuizSummary with gaps and Part 7', () => {
  it('scores only answered items and shows evidence for Part 7', () => {
    const entries = [{ kind: 'p5' as const, item: makePart5() }, ...flattenPart7(makePart7())]
    const records = [undefined, { entryId: 'x', topic: 'detail' as const, choice: 0, correct: true, ms: 1 }, undefined]
    render(<QuizSummary entries={entries} records={records} lang="en" showReview />)
    expect(screen.getByText('Score: 1 / 3')).toBeTruthy()
    expect(screen.getByText(/“reopen on Monday”/)).toBeTruthy()
  })
})
```

- [ ] **Step 3: Run** — FAIL.

- [ ] **Step 4: Update `QuizSummary.tsx`:**
  - Props: `records: (AnswerRecord | undefined)[]`.
  - `const correct = records.filter((r) => r?.correct).length` and the score uses `entries.length` as the total: `t(lang, 'quizScore', { c: correct, n: entries.length })`. (Drills/mixed tests pass equal-length arrays, so their output is unchanged.)
  - In the `missed` computation use `r?.correct`.
  - Review row stem: 

```tsx
{entry.kind === 'p5'
  ? entry.item.stem
  : entry.kind === 'p6'
    ? `${entry.set.title} [${entry.blank + 1}]`
    : `${entry.set.docs.map((d) => d.title).join(' · ')} — ${entry.set.questions[entry.q].prompt}`}
```

  - For p7 rows, after the answers line add:

```tsx
{entry.kind === 'p7' && (
  <p className="review-evidence">
    {t(lang, 'evidenceLabel')}: {entry.set.questions[entry.q].evidence.map((e) => `“${e.quote}”`).join(' ')}
  </p>
)}
```

  - In the trap/explanation line, for p7 replace `t(lang, 'trapLabel')}: {f.trap}` with `skillLabel(f.topic, lang)` (import from `../../app/i18n`).

- [ ] **Step 5: `ReadingTestResults.tsx`:**

```tsx
import { useEffect, useRef } from 'react'
import { entryFields, entryId } from '@shared/quiz'
import { estimateReadingBand, scoreTest, type TestState } from '@shared/reading'
import type { GrammarAttempt, ReadingAttempt } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { isGrammarTopic } from '../../app/i18n'
import { QuizSummary } from '../grammar/QuizSummary'
import type { AnswerRecord } from '../grammar/quizReducer'

export function ReadingTestResults({ state }: { state: TestState }) {
  const { finishReadingTest } = useApp()
  const { lang, t } = useT()
  const parts = scoreTest(state)
  const band = estimateReadingBand(parts)
  const saved = useRef(false)

  const records: (AnswerRecord | undefined)[] = state.entries.map((e) => {
    const choice = state.answers[entryId(e)]
    if (choice === undefined) return undefined
    const f = entryFields(e)
    return { entryId: entryId(e), topic: f.topic, choice, correct: choice === f.answer, ms: 0 }
  })

  useEffect(() => {
    if (saved.current) return
    saved.current = true
    const at = new Date().toISOString()
    const answered = records.filter((r): r is AnswerRecord => r !== undefined)
    const grammar: GrammarAttempt[] = answered.flatMap((r) =>
      !r.entryId.startsWith('p7-') && isGrammarTopic(r.topic) ? [{ itemId: r.entryId, topic: r.topic, correct: r.correct, ms: 0, at }] : []
    )
    const reading: ReadingAttempt[] = answered.flatMap((r) =>
      r.entryId.startsWith('p7-') ? [{ itemId: r.entryId, qtype: r.topic as ReadingAttempt['qtype'], correct: r.correct, ms: 0, at }] : []
    )
    void finishReadingTest({ result: { length: state.length, parts, ms: Math.round(state.elapsedMs), at }, grammar, reading })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="test-results">
      <h1 className="page-title">{t('testResultTitle')}</h1>
      <ul className="part-scores">
        {(['p5', 'p6', 'p7'] as const).filter((p) => parts[p].total > 0).map((p) => (
          <li key={p} className="num">{t('testPartScore', { p: p.slice(1), c: parts[p].correct, n: parts[p].total })}</li>
        ))}
        <li className="num">{t('testTimeUsed', { m: Math.round(state.elapsedMs / 60000) })}</li>
      </ul>
      {band && (
        <div className="band-panel">
          <h2>{t('progressBand', { low: band.low, high: band.high })}</h2>
          <p>{t('testBandNote')}</p>
        </div>
      )}
      <QuizSummary entries={state.entries} records={records} lang={lang} showReview />
    </div>
  )
}
```

Per-question time is not tracked in the free-navigation test, so attempts carry `ms: 0`; this is intentional and must not skew drill timing stats — in `topicStats` callers on Home/Progress keep using all attempts (acceptable small skew) **or** filter `ms > 0` for the average-time column. Choose: in `topicStats`, compute `avgMs` over attempts with `ms > 0` only (fall back to 0 when none). Add a unit test for that in `tests/unit/scoring.test.ts`.

In `ReadingTestScreen.tsx` replace the results placeholder with `<ReadingTestResults state={result} />` and add a "Practice again" button that clears `result`.

- [ ] **Step 6: Progress screen** — `ProgressScreen.tsx`:

```tsx
const lb = latestBand(progress)
const readingStats = topicStats(progress.readingAttempts.map((a) => ({ topic: a.qtype, correct: a.correct, ms: a.ms })))
// pass band={lb?.band ?? null} bandSource={lb?.source ?? null} readingStats={readingStats}
// onDrillReading={(type) => void navigate(`/reading?type=${type}`)}
```

`ProgressView.tsx`: under the band heading render `t(lang, bandSource === 'test' ? 'progressBandNoteTest' : 'progressBandNote')`; after the grammar table, when `readingStats.length > 0`, render a second `table.stats` with heading `progressReading`, rows `skillLabel(s.topic, lang)`, accuracy bar, avg time, attempts, and a small `Drill this` button calling `onDrillReading(s.topic as Part7QType)`. Update `tests/unit/renderer/ProgressView.test.tsx` to pass the new props (`bandSource: 'mixed'`, `readingStats: []`, `onDrillReading: vi.fn()`) so existing assertions keep passing, and add one assertion that `progressBandNoteTest` text appears when `bandSource: 'test'`.

- [ ] **Step 7: Styles** — append:

```css
.part-scores { list-style: none; margin: 8px 0 18px; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 24px; font: 600 18px/1.4 var(--display); color: var(--blue); }
.test-results .band-panel { margin-bottom: 18px; }
.review-evidence { font-size: 15px; background: var(--paper-lift); padding: 4px 8px; }
```

- [ ] **Step 8: Run**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 9: Checkpoint** — no commit.

---

### Task 13: Resume and discard

**Files:**
- Modify: `src/renderer/src/features/reading-test/ReadingTestScreen.tsx`, `i18n.ts`
- Test: `tests/unit/renderer/ReadingTestScreen.test.tsx` (create)

**Interfaces:**
- Consumes: `progress.activeReadingTest`, `restoreReadingTest`, `DURATION_MS` (Tasks 4, 9, 10); `saveActiveTest(null)`.
- Produces: start screen shows a Resume panel when `activeReadingTest` is present and restorable; Discard clears it; a non-restorable saved test is discarded automatically with a notice.

- [ ] **Step 1: Strings** (both languages):

| key | en | th |
|---|---|---|
| `testResumeTitle` | `Unfinished {length} test` | `ข้อสอบ{length}ที่ยังทำไม่เสร็จ` |
| `testResumeMeta` | `{a} of {n} answered · {m} min left` | `ตอบแล้ว {a} จาก {n} ข้อ · เหลือ {m} นาที` |
| `testResume` | `Resume` | `ทำต่อ` |
| `testDiscard` | `Discard` | `ทิ้งข้อสอบนี้` |
| `testDiscarded` | `Your unfinished test used questions that are no longer in the bank, so it was discarded.` | `ข้อสอบที่ค้างไว้มีข้อที่ไม่มีในคลังแล้ว จึงถูกยกเลิก` |

- [ ] **Step 2: Failing test** — `tests/unit/renderer/ReadingTestScreen.test.tsx` (mock `AppContext`; the mocked progress has an `activeReadingTest` built from `buildReadingTest` + `toActive(initTest(...))` with one answer and `elapsedMs: 600000`):

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entryId } from '@shared/quiz'
import { buildReadingTest, initTest, toActive } from '@shared/reading'
import { emptyProgress, type ActiveReadingTest, type ContentBank } from '@shared/types'
import { makePart5 } from '../../fixtures/items'

const bank: ContentBank = { part5: [makePart5(), makePart5(), makePart5()], part6: [], part7: [] }
const saveActiveTest = vi.fn().mockResolvedValue(undefined)
let active: ActiveReadingTest | null = null

vi.mock('../../../src/renderer/src/app/AppContext', () => ({
  useApp: () => ({ bank, progress: { ...emptyProgress(), activeReadingTest: active }, saveActiveTest, finishReadingTest: vi.fn() }),
  useT: () => ({
    lang: 'en',
    t: (k: string, v?: Record<string, unknown>) =>
      k === 'testMapLabel' && v ? `Question ${v.i}, ${v.state}` : v ? `${k}:${JSON.stringify(v)}` : k,
    topic: (x: string) => x
  })
}))
import { ReadingTestScreen } from '../../../src/renderer/src/features/reading-test/ReadingTestScreen'

const renderScreen = () => render(<MemoryRouter><ReadingTestScreen /></MemoryRouter>)

describe('ReadingTestScreen resume', () => {
  beforeEach(() => saveActiveTest.mockClear())

  it('offers Resume and restores answers and remaining time', () => {
    const entries = buildReadingTest(bank, 'half', () => 0.5)
    active = toActive(initTest(entries, 'half', { answers: { [entryId(entries[0])]: 1 }, flags: [], index: 0, elapsedMs: 600_000 }))
    renderScreen()
    expect(screen.getByText(/testResumeTitle/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /testResume/ }))
    expect(screen.getByRole('timer').textContent).toContain('28:00')
    expect(screen.getByRole('button', { name: /Question 1, testAnswered/ })).toBeTruthy()
  })

  it('discards a saved test that can no longer be restored', () => {
    active = { length: 'half', ids: ['p5-word-form-9999'], orders: [[0, 1, 2, 3]], answers: {}, flags: [], index: 0, elapsedMs: 0 }
    renderScreen()
    expect(saveActiveTest).toHaveBeenCalledWith(null)
    expect(screen.getByText('testDiscarded')).toBeTruthy()
  })
})
```



- [ ] **Step 3: Run** — FAIL.

- [ ] **Step 4: Implement** — in `ReadingTestScreen.tsx`:

```tsx
const { bank, progress, saveActiveTest } = useApp()
const active = progress.activeReadingTest
const restored = useMemo(() => (active ? restoreReadingTest(bank, active) : null), [bank, active])
const [discarded, setDiscarded] = useState(false)

useEffect(() => {
  if (active && !restored) {
    setDiscarded(true)
    void saveActiveTest(null)
  }
}, [active, restored, saveActiveTest])

// running state gains `saved?`:
// const [running, setRunning] = useState<{ entries: QuizEntry[]; length: TestLength; saved?: ActiveReadingTest } | null>(null)
// <ReadingTestRunner entries={running.entries} length={running.length} saved={running.saved} onDone={onDone} />
```

Render, above the length picker when `active && restored`:

```tsx
<div className="frame frame-pink resume-panel">
  <h2 className="panel-title">{t('testResumeTitle', { length: t(active.length === 'half' ? 'testHalf' : 'testFull') })}</h2>
  <p className="num">
    {t('testResumeMeta', {
      a: Object.keys(active.answers).length,
      n: active.ids.length,
      m: Math.ceil((DURATION_MS[active.length] - active.elapsedMs) / 60000)
    })}
  </p>
  <div className="actions">
    <button type="button" className="primary" onClick={() => setRunning({ entries: restored, length: active.length, saved: active })}>
      {t('testResume')}
      <ArrowIcon />
    </button>
    <button type="button" onClick={() => void saveActiveTest(null)}>
      {t('testDiscard')}
    </button>
  </div>
</div>
```

and `{discarded && <p className="muted">{t('testDiscarded')}</p>}`. Starting a new test while one is saved overwrites it on the first save — acceptable; the Resume panel makes the choice visible.

- [ ] **Step 5: Run**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Checkpoint** — no commit.

---

### Task 14: End-to-end tests, docs and final verification

**Files:**
- Modify: `tests/e2e/grammar.spec.ts` (or create `tests/e2e/reading.spec.ts`)
- Modify: `PRODUCT.md`, `DESIGN.md` + `.impeccable/design.json` (via the impeccable documenter), `docs/content-review/answer-sheet.md` (regenerate)

**Interfaces:**
- Consumes: everything above; Playwright `_electron` pattern and `launchEnv` helper in `tests/e2e/grammar.spec.ts`.

- [ ] **Step 1: Write E2E tests** — create `tests/e2e/reading.spec.ts` reusing `launchEnv` (copy the helper or export it from a shared `tests/e2e/helpers.ts`):

```ts
test('a Part 7 drill answer is recorded and its evidence highlighted', async () => {
  const userData = mkdtempSync(join(tmpdir(), 'toeic-e2e-'))
  writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
  const app = await electron.launch({ args: ['.'], env: launchEnv(userData) })
  const page = await app.firstWindow()
  await page.locator('nav').getByRole('link', { name: 'Reading (Part 7)' }).click()
  await page.getByRole('button', { name: /Parking garage maintenance/ }).click()
  await page.locator('button.choice').first().click()
  await expect(page.locator('mark.evidence')).toBeVisible()
  const progressFile = join(userData, 'progress.json')
  await expect.poll(() => (existsSync(progressFile) ? JSON.parse(readFileSync(progressFile, 'utf8')).readingAttempts.length : 0)).toBe(1)
  await app.close()
})

test('a half Reading test resumes with the same remaining time after restart, then submits', async () => {
  const userData = mkdtempSync(join(tmpdir(), 'toeic-e2e-'))
  writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
  let app = await electron.launch({ args: ['.'], env: launchEnv(userData) })
  let page = await app.firstWindow()
  await page.locator('nav').getByRole('link', { name: 'Reading test', exact: true }).click()
  await page.getByRole('button', { name: /Start test/ }).click()
  await page.locator('button.choice').first().click()
  const before = await page.getByRole('timer').innerText()
  await app.close()

  app = await electron.launch({ args: ['.'], env: launchEnv(userData) })
  page = await app.firstWindow()
  await page.locator('nav').getByRole('link', { name: 'Reading test', exact: true }).click()
  await page.getByRole('button', { name: /Resume/ }).click()
  const after = await page.getByRole('timer').innerText()
  // Clock paused while closed: at most a few seconds of difference, never minutes.
  const secs = (s: string) => { const [m, ss] = s.slice(0, 5).split(':').map(Number); return m * 60 + ss }
  expect(Math.abs(secs(before) - secs(after))).toBeLessThanOrEqual(8)
  await page.getByRole('button', { name: 'Submit test' }).click()
  await page.getByRole('button', { name: 'Submit now' }).click()
  await expect(page.getByText('Reading test results')).toBeVisible()
  const progress = JSON.parse(readFileSync(join(userData, 'progress.json'), 'utf8'))
  expect(progress.readingTests).toHaveLength(1)
  expect(progress.activeReadingTest).toBeNull()
  await app.close()
})
```

- [ ] **Step 2: Run E2E**

Run: `npm run test:e2e`
Expected: all E2E tests PASS (existing 2 + new 2).

- [ ] **Step 3: Update PRODUCT.md** — in "Capabilities and Constraints": move Part 7 from out-of-scope into "Built"; add the Reading test (half/full, free navigation, pause-on-close). Keep everything else.

- [ ] **Step 4: Design system** — spawn the `impeccable-documenter` agent to extend `DESIGN.md` and `.impeccable/design.json` with the new components (doc tabs, evidence mark, insertion marker, question map, test timer, confirm bar, set list, type chips), deriving from the shipped CSS.

- [ ] **Step 5: Final verification**

Run: `npx tsc --noEmit && npx vitest run && npx tsx scripts/check-content.ts && npx tsx scripts/answer-sheet.ts && npm run test:e2e`
Expected: everything PASS; checker `OK`; answer sheet regenerated with Part 7.

- [ ] **Step 6: Checkpoint** — no commit. Report to the user: what shipped, test counts, and that `docs/content-review/answer-sheet.md` includes Part 7 for spot-checking.
