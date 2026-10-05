# TOEIC Trainer — Plan 1: Foundation + Grammar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local Electron desktop app where Thai learners drill TOEIC Part 5/6 grammar with instant bilingual feedback, Leitner spaced review, a progress dashboard and timed mixed tests, plus a developer pipeline that generates and reviews the question bank with Claude.

**Architecture:** Electron main process owns every side effect (content files, progress/settings JSON in `userData`). A sandboxed preload exposes a narrow typed `window.api`. The React renderer (Vite) holds all UI. Pure logic (schemas, Leitner, scoring, quiz selection) lives in `src/shared/` so it is unit-tested without Electron.

**Tech Stack:** Electron, electron-vite 4, Vite 7, React 19, react-router 7, TypeScript 5, zod 4, Vitest 3 + Testing Library + jsdom, Playwright (Electron), `@anthropic-ai/sdk` + `tsx` (generation script only).

**Spec:** `docs/superpowers/specs/2026-10-05-toeic-grammar-writing-design.md`. This plan covers spec build-order steps 1–5. Plan 2 = Writing module (steps 6–7). Plan 3 = Study guide + packaging (steps 8–9).

## Global Constraints

- Platform: Windows first. Node.js 20+.
- Electron security: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. Renderer talks only to `window.api`.
- The sandboxed preload may import **only types** from `@shared/*`, plus the `IPC` constant in `src/shared/api.ts`. `src/shared/api.ts` must use `import type` only, so zod is never pulled into the preload bundle.
- UI is Thai-first (`language: 'th'` default) with an English toggle. Explanations always exist in both `th` and `en`.
- Target level TOEIC 600–850+. Question difficulty is 1–5, mostly 2–4.
- App loads only items with `status: "approved"`. Drafts live in `content/drafts/` and are never loaded by the app.
- Progress and settings are local JSON files in Electron `userData`, written atomically (temp file + rename).
- Leitner intervals are exactly 1, 3, 7, 14, 30 days (boxes 1–5).
- Unit tests never call the live Claude API.
- Generation script model: `claude-opus-5-5` (current default model). The writing-grading model is decided in Plan 2.
- Approved deviations from the spec:
  - `content.list(filter)` becomes `content.bank()`, which returns the whole bank. The renderer filters with pure functions.
  - Approved Part 6 sets live in `content/grammar/part6/sets.json`.
  - Renderer code lives under `src/renderer/src/` (electron-vite convention).
  - Part 6 sets get a `title` field.
  - The score estimate is labelled as an estimated Reading band.

## File Map

```
package.json, tsconfig.json, electron.vite.config.ts, vitest.config.ts, playwright.config.ts, .gitignore
content/grammar/part5/word-form.json        seed (5 items)
content/grammar/part5/prepositions.json     seed (5 items)
content/grammar/part6/sets.json             seed (1 set)
scripts/generate.ts                         CLI: generate drafts with Claude
scripts/lib/gen.ts                          pure: prompts, conversion, verdicts
scripts/lib/claude.ts                       Claude structured-output call
src/shared/types.ts                         zod schemas + types + formatIssues
src/shared/dates.ts                         localDate, addDays
src/shared/leitner.ts                       schedule, dueIds
src/shared/progress.ts                      applyGrammarAttempt, applyMixedTest
src/shared/scoring.ts                       topicStats, weakestTopics, estimateBand
src/shared/quiz.ts                          QuizEntry, pickers, resolveIds
src/shared/api.ts                           IPC channel names + Api interface (types only)
src/main/index.ts                           window + security + wiring
src/main/paths.ts                           contentRoot()
src/main/jsonFile.ts                        readJson, writeJsonAtomic
src/main/store.ts                           createStore (progress + settings)
src/main/content.ts                         loadContent (no electron import)
src/main/drafts.ts                          listDrafts, approveDraft, rejectDraft
src/main/ipc.ts                             registerIpc
src/preload/index.ts                        window.api implementation
src/renderer/index.html
src/renderer/src/main.tsx, env.d.ts, styles.css
src/renderer/src/app/AppContext.tsx, App.tsx, i18n.ts
src/renderer/src/features/home/HomeScreen.tsx
src/renderer/src/features/settings/SettingsScreen.tsx
src/renderer/src/features/grammar/quizReducer.ts, QuestionView.tsx, QuizSummary.tsx, QuizRunner.tsx
src/renderer/src/features/grammar/TopicListScreen.tsx, DrillScreen.tsx, MixedTestScreen.tsx
src/renderer/src/features/review/ReviewScreen.tsx
src/renderer/src/features/progress/ProgressView.tsx, ProgressScreen.tsx
src/renderer/src/features/content-review/ContentReviewScreen.tsx
tests/setup.ts, tests/fixtures/items.ts
tests/unit/*.test.ts, tests/unit/renderer/*.test.tsx, tests/content/content.test.ts, tests/e2e/grammar.spec.ts
```

---

### Task 1: Scaffold + shared schemas

**Files:**
- Create: `package.json`, `.gitignore`, `tsconfig.json`, `electron.vite.config.ts`, `vitest.config.ts`, `tests/setup.ts`
- Create: `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/index.html`, `src/renderer/src/main.tsx`
- Create: `src/shared/types.ts`, `tests/fixtures/items.ts`
- Test: `tests/unit/types.test.ts`

**Interfaces:**
- Produces (from `src/shared/types.ts`):
  - Constants: `PART5_TOPICS`, `PART6_ONLY_TOPICS`, `GRAMMAR_TOPICS`.
  - Schemas, each with a same-named type: `Part5Topic`, `GrammarTopic`, `Language`, `Explain`, `ItemStatus`, `Part5Item`, `Part6Blank`, `Part6Set`, `GrammarAttempt`, `LeitnerCard`, `MixedTestResult`, `Progress`, `Settings`, `SettingsPatch`.
  - `interface ContentBank { part5: Part5Item[]; part6: Part6Set[] }`
  - `emptyProgress(): Progress`, `defaultSettings(): Settings`, `formatIssues(err: z.ZodError): string`.
- Produces (from `tests/fixtures/items.ts`): `makePart5(over?)`, `makePart6(over?)`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "toeic-trainer",
  "version": "0.1.0",
  "private": true,
  "description": "TOEIC grammar and writing trainer for Thai learners",
  "main": "./out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "start": "electron-vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Do **not** add `"type": "module"`. electron-vite then builds main and preload as CommonJS, which the sandboxed preload requires.

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install zod@^4 react@^19 react-dom@^19 react-router@^7
npm install -D electron electron-vite@^4 vite@^7 @vitejs/plugin-react@^5 typescript@^5 @types/node @types/react@^19 @types/react-dom@^19 vitest@^3.2 jsdom @testing-library/react@^16 @testing-library/dom
```
Expected: installs without peer-dependency errors. If npm reports a peer conflict between `electron-vite` and `vite`, install the `vite` major that `electron-vite@4` lists in its peerDependencies (`npm view electron-vite@4 peerDependencies`).

- [ ] **Step 3: Create config files**

`.gitignore`:
```
node_modules/
out/
dist/
test-results/
playwright-report/
*.tmp
.env
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["node", "vite/client"],
    "paths": {
      "@shared/*": ["./src/shared/*"],
      "@renderer/*": ["./src/renderer/src/*"]
    }
  },
  "include": ["src", "scripts", "tests", "electron.vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

`electron.vite.config.ts`:
```ts
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const shared = { '@shared': resolve('src/shared') }

export default defineConfig({
  main: { plugins: [externalizeDepsPlugin()], resolve: { alias: shared } },
  preload: { plugins: [externalizeDepsPlugin()], resolve: { alias: shared } },
  renderer: {
    resolve: { alias: { ...shared, '@renderer': resolve('src/renderer/src') } },
    plugins: [react()]
  }
})
```
(If the installed electron-vite no longer exports `externalizeDepsPlugin` because externalizing became the default, remove the import and both `plugins` entries for main and preload.)

`vitest.config.ts`:
```ts
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@shared': resolve('src/shared'), '@renderer': resolve('src/renderer/src') }
  },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/content/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['tests/setup.ts']
  }
})
```

`tests/setup.ts`:
```ts
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())
```

- [ ] **Step 4: Create minimal Electron entry points**

`src/main/index.ts`:
```ts
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

if (process.env.TOEIC_USER_DATA) app.setPath('userData', process.env.TOEIC_USER_DATA)

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  win.on('ready-to-show', () => win.show())
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

`src/preload/index.ts`:
```ts
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {})
```

`src/renderer/index.html`:
```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
    />
    <title>TOEIC Trainer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/renderer/src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h1>TOEIC Trainer</h1>
  </StrictMode>
)
```

- [ ] **Step 5: Write test fixtures**

`tests/fixtures/items.ts`:
```ts
import type { Part5Item, Part6Blank, Part6Set } from '@shared/types'

let n = 0
const pad = (x: number) => String(x).padStart(4, '0')

export function makePart5(over: Partial<Part5Item> = {}): Part5Item {
  n++
  return {
    id: `p5-word-form-${pad(n)}`,
    part: 5,
    topic: 'word-form',
    difficulty: 3,
    stem: `Report ${n} was ____ written.`,
    choices: ['clear', 'clearly', 'clarity', 'clarify'],
    answer: 1,
    trap: 'adverb modifies verb',
    explain: { en: 'An adverb modifies the verb.', th: 'ต้องใช้ adverb ขยายกริยา' },
    status: 'approved',
    ...over
  }
}

function blank(topic: Part6Blank['topic'], answer = 0): Part6Blank {
  return {
    topic,
    difficulty: 3,
    choices: ['a', 'b', 'c', 'd'],
    answer,
    trap: 'trap',
    explain: { en: 'Because.', th: 'เพราะว่า' }
  }
}

export function makePart6(over: Partial<Part6Set> = {}): Part6Set {
  n++
  return {
    id: `p6-${pad(n)}`,
    part: 6,
    title: 'Email: Test',
    passage: 'One {{1}} two {{2}} three {{3}} four {{4}}.',
    blanks: [blank('word-form'), blank('sentence-insertion', 2), blank('transitions'), blank('prepositions', 3)],
    status: 'approved',
    ...over
  }
}
```

- [ ] **Step 6: Write the failing schema tests**

`tests/unit/types.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { Part5Item, Part6Set, Progress, Settings, formatIssues } from '@shared/types'
import { makePart5, makePart6 } from '../fixtures/items'

describe('Part5Item', () => {
  it('accepts a valid item', () => {
    expect(Part5Item.safeParse(makePart5()).success).toBe(true)
  })
  it('rejects an item with three choices', () => {
    expect(Part5Item.safeParse(makePart5({ choices: ['a', 'b', 'c'] })).success).toBe(false)
  })
  it('rejects a stem without a blank', () => {
    expect(Part5Item.safeParse(makePart5({ stem: 'No blank here.' })).success).toBe(false)
  })
  it('rejects a Part 6 only topic', () => {
    expect(Part5Item.safeParse(makePart5({ topic: 'transitions' as never })).success).toBe(false)
  })
  it('rejects a malformed id', () => {
    expect(Part5Item.safeParse(makePart5({ id: 'q1' })).success).toBe(false)
  })
})

describe('Part6Set', () => {
  it('accepts a valid set', () => {
    expect(Part6Set.safeParse(makePart6()).success).toBe(true)
  })
  it('rejects a passage missing a blank marker', () => {
    const r = Part6Set.safeParse(makePart6({ passage: 'One {{1}} two {{2}} three {{3}}.' }))
    expect(r.success).toBe(false)
    if (!r.success) expect(formatIssues(r.error)).toContain('{{4}}')
  })
  it('requires exactly one sentence-insertion blank', () => {
    const set = makePart6()
    set.blanks[2] = { ...set.blanks[2], topic: 'sentence-insertion' }
    const r = Part6Set.safeParse(set)
    expect(r.success).toBe(false)
    if (!r.success) expect(formatIssues(r.error)).toContain('sentence-insertion')
  })
})

describe('Progress and Settings', () => {
  it('fills progress defaults', () => {
    expect(Progress.parse({ version: 1 })).toEqual({
      version: 1,
      grammarAttempts: [],
      leitner: {},
      mixedTests: []
    })
  })
  it('defaults language to Thai', () => {
    expect(Settings.parse({})).toEqual({ language: 'th' })
  })
})
```

- [ ] **Step 7: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL. Vitest cannot resolve `@shared/types`.

- [ ] **Step 8: Implement `src/shared/types.ts`**

```ts
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
```

- [ ] **Step 9: Run tests and typecheck**

Run: `npm test && npm run typecheck`
Expected: all tests in `tests/unit/types.test.ts` PASS, and typecheck exits 0.

- [ ] **Step 10: Launch the app**

Run: `npm run dev`
Expected: a window opens showing "TOEIC Trainer". Close it.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json .gitignore tsconfig.json electron.vite.config.ts vitest.config.ts tests src
git commit -m "feat: scaffold electron app and shared content schemas"
```

---

### Task 2: Dates, Leitner scheduling, progress reducers

**Files:**
- Create: `src/shared/dates.ts`, `src/shared/leitner.ts`, `src/shared/progress.ts`
- Test: `tests/unit/leitner.test.ts`, `tests/unit/progress.test.ts`

**Interfaces:**
- Consumes: `LeitnerCard`, `Progress`, `GrammarAttempt`, `MixedTestResult` from `@shared/types`.
- Produces:
  - `localDate(d?: Date): string` (YYYY-MM-DD, local time)
  - `addDays(date: string, days: number): string`
  - `INTERVALS: readonly [1, 3, 7, 14, 30]`
  - `schedule(card: LeitnerCard | undefined, correct: boolean, today: string): LeitnerCard | undefined`
  - `dueIds(leitner: Record<string, LeitnerCard>, today: string): string[]`
  - `applyGrammarAttempt(p: Progress, a: GrammarAttempt, today: string): Progress`
  - `applyMixedTest(p: Progress, r: MixedTestResult): Progress`

- [ ] **Step 1: Write the failing tests**

`tests/unit/leitner.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { addDays, localDate } from '@shared/dates'
import { dueIds, schedule } from '@shared/leitner'

const TODAY = '2026-10-05'

describe('dates', () => {
  it('formats a local date', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
  })
})

describe('schedule', () => {
  it('puts a new wrong item in box 1 due tomorrow', () => {
    expect(schedule(undefined, false, TODAY)).toEqual({ box: 1, due: '2026-10-06' })
  })
  it('keeps a new correct item out of the queue', () => {
    expect(schedule(undefined, true, TODAY)).toBeUndefined()
  })
  it('moves a correct item up one box with that box interval', () => {
    expect(schedule({ box: 1, due: TODAY }, true, TODAY)).toEqual({ box: 2, due: '2026-10-08' })
    expect(schedule({ box: 3, due: TODAY }, true, TODAY)).toEqual({ box: 4, due: '2026-10-19' })
  })
  it('caps at box 5 with a 30 day interval', () => {
    expect(schedule({ box: 5, due: TODAY }, true, TODAY)).toEqual({ box: 5, due: '2026-11-04' })
  })
  it('sends a wrong item back to box 1', () => {
    expect(schedule({ box: 4, due: TODAY }, false, TODAY)).toEqual({ box: 1, due: '2026-10-06' })
  })
})

describe('dueIds', () => {
  it('returns items due today or earlier, oldest first then by id', () => {
    const leitner = {
      b: { box: 1, due: '2026-10-05' },
      a: { box: 2, due: '2026-10-05' },
      c: { box: 1, due: '2026-10-01' },
      d: { box: 1, due: '2026-10-06' }
    }
    expect(dueIds(leitner, TODAY)).toEqual(['c', 'a', 'b'])
  })
})
```

`tests/unit/progress.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { emptyProgress, type GrammarAttempt } from '@shared/types'
import { applyGrammarAttempt, applyMixedTest } from '@shared/progress'

const attempt = (over: Partial<GrammarAttempt> = {}): GrammarAttempt => ({
  itemId: 'p5-word-form-0001',
  topic: 'word-form',
  correct: false,
  ms: 12000,
  at: '2026-10-05T03:00:00.000Z',
  ...over
})

describe('applyGrammarAttempt', () => {
  it('appends the attempt and schedules a wrong answer', () => {
    const before = emptyProgress()
    const after = applyGrammarAttempt(before, attempt(), '2026-10-05')
    expect(after.grammarAttempts).toHaveLength(1)
    expect(after.leitner['p5-word-form-0001']).toEqual({ box: 1, due: '2026-10-06' })
    expect(before.grammarAttempts).toHaveLength(0)
    expect(before.leitner).toEqual({})
  })
  it('does not add a card for a first-time correct answer', () => {
    const after = applyGrammarAttempt(emptyProgress(), attempt({ correct: true }), '2026-10-05')
    expect(after.leitner).toEqual({})
  })
  it('promotes an existing card on a correct answer', () => {
    const p = { ...emptyProgress(), leitner: { 'p5-word-form-0001': { box: 1, due: '2026-10-05' } } }
    const after = applyGrammarAttempt(p, attempt({ correct: true }), '2026-10-05')
    expect(after.leitner['p5-word-form-0001']).toEqual({ box: 2, due: '2026-10-08' })
  })
})

describe('applyMixedTest', () => {
  it('appends the result', () => {
    const r = { at: '2026-10-05T03:00:00.000Z', correct: 20, total: 34, ms: 600000 }
    expect(applyMixedTest(emptyProgress(), r).mixedTests).toEqual([r])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/leitner.test.ts tests/unit/progress.test.ts`
Expected: FAIL. Modules `@shared/dates`, `@shared/leitner` and `@shared/progress` are not found.

- [ ] **Step 3: Implement**

`src/shared/dates.ts`:
```ts
export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}
```

`src/shared/leitner.ts`:
```ts
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
```

`src/shared/progress.ts`:
```ts
import { schedule } from './leitner'
import type { GrammarAttempt, MixedTestResult, Progress } from './types'

export function applyGrammarAttempt(p: Progress, a: GrammarAttempt, today: string): Progress {
  const next = schedule(p.leitner[a.itemId], a.correct, today)
  const leitner = { ...p.leitner }
  if (next) leitner[a.itemId] = next
  return { ...p, grammarAttempts: [...p.grammarAttempts, a], leitner }
}

export function applyMixedTest(p: Progress, r: MixedTestResult): Progress {
  return { ...p, mixedTests: [...p.mixedTests, r] }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/leitner.test.ts tests/unit/progress.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/dates.ts src/shared/leitner.ts src/shared/progress.ts tests/unit/leitner.test.ts tests/unit/progress.test.ts
git commit -m "feat: add Leitner scheduling and progress reducers"
```

---

### Task 3: Scoring (topic stats, weakest topics, band estimate)

**Files:**
- Create: `src/shared/scoring.ts`
- Test: `tests/unit/scoring.test.ts`

**Interfaces:**
- Consumes: `GrammarAttempt`, `GrammarTopic`, `MixedTestResult` from `@shared/types`.
- Produces:
  - `interface TopicStat { topic: GrammarTopic; count: number; accuracy: number; avgMs: number }`
  - `STATS_WINDOW = 20`
  - `topicStats(attempts: GrammarAttempt[]): TopicStat[]` (sorted by topic name)
  - `weakestTopics(stats: TopicStat[], n?: number, minCount?: number): GrammarTopic[]` (defaults: n = 3, minCount = 5)
  - `interface Band { low: number; high: number }`
  - `estimateBand(tests: MixedTestResult[]): Band | null`

- [ ] **Step 1: Write the failing tests**

`tests/unit/scoring.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { GrammarAttempt, GrammarTopic, MixedTestResult } from '@shared/types'
import { estimateBand, topicStats, weakestTopics, type TopicStat } from '@shared/scoring'

const att = (topic: GrammarTopic, correct: boolean, ms = 10000): GrammarAttempt => ({
  itemId: `${topic}-x`,
  topic,
  correct,
  ms,
  at: '2026-10-05T00:00:00.000Z'
})

describe('topicStats', () => {
  it('uses only the last 20 attempts per topic', () => {
    const attempts = [
      ...Array.from({ length: 5 }, () => att('word-form', false)),
      ...Array.from({ length: 20 }, () => att('word-form', true))
    ]
    expect(topicStats(attempts)).toEqual([{ topic: 'word-form', count: 20, accuracy: 1, avgMs: 10000 }])
  })
  it('computes accuracy and average time per topic, sorted by topic', () => {
    const stats = topicStats([
      att('prepositions', true, 10000),
      att('prepositions', false, 20000),
      att('conditionals', true, 5000)
    ])
    expect(stats).toEqual([
      { topic: 'conditionals', count: 1, accuracy: 1, avgMs: 5000 },
      { topic: 'prepositions', count: 2, accuracy: 0.5, avgMs: 15000 }
    ])
  })
})

describe('weakestTopics', () => {
  const s = (topic: GrammarTopic, accuracy: number, avgMs: number, count = 10): TopicStat => ({
    topic,
    count,
    accuracy,
    avgMs
  })
  it('ignores topics with too few attempts and sorts by accuracy then slowness', () => {
    const stats = [
      s('word-form', 0.9, 10000),
      s('prepositions', 0.5, 10000),
      s('conditionals', 0.5, 20000),
      s('inversion', 0.1, 10000, 3),
      s('pronouns', 0.7, 10000)
    ]
    expect(weakestTopics(stats)).toEqual(['conditionals', 'prepositions', 'pronouns'])
  })
})

describe('estimateBand', () => {
  const t = (correct: number, total: number): MixedTestResult => ({
    at: '2026-10-05T00:00:00.000Z',
    correct,
    total,
    ms: 1
  })
  it('returns null with no mixed tests', () => {
    expect(estimateBand([])).toBeNull()
  })
  it('uses the last three tests only', () => {
    expect(estimateBand([t(0, 10), t(9, 10), t(9, 10), t(9, 10)])).toEqual({ low: 400, high: 450 })
  })
  it('maps band boundaries', () => {
    expect(estimateBand([t(95, 100)])).toEqual({ low: 450, high: 495 })
    expect(estimateBand([t(50, 100)])).toEqual({ low: 230, high: 300 })
    expect(estimateBand([t(49, 100)])).toEqual({ low: 5, high: 230 })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/scoring.test.ts`
Expected: FAIL. `@shared/scoring` is not found.

- [ ] **Step 3: Implement `src/shared/scoring.ts`**

```ts
import type { GrammarAttempt, GrammarTopic, MixedTestResult } from './types'

export interface TopicStat {
  topic: GrammarTopic
  count: number
  accuracy: number
  avgMs: number
}

export const STATS_WINDOW = 20

export function topicStats(attempts: GrammarAttempt[]): TopicStat[] {
  const byTopic = new Map<GrammarTopic, GrammarAttempt[]>()
  for (const a of attempts) {
    const list = byTopic.get(a.topic) ?? []
    list.push(a)
    byTopic.set(a.topic, list)
  }
  return [...byTopic.entries()]
    .map(([topic, list]) => {
      const recent = list.slice(-STATS_WINDOW)
      const correct = recent.filter((a) => a.correct).length
      const totalMs = recent.reduce((sum, a) => sum + a.ms, 0)
      return {
        topic,
        count: recent.length,
        accuracy: correct / recent.length,
        avgMs: Math.round(totalMs / recent.length)
      }
    })
    .sort((a, b) => a.topic.localeCompare(b.topic))
}

export function weakestTopics(stats: TopicStat[], n = 3, minCount = 5): GrammarTopic[] {
  return stats
    .filter((s) => s.count >= minCount)
    .sort((a, b) => a.accuracy - b.accuracy || b.avgMs - a.avgMs)
    .slice(0, n)
    .map((s) => s.topic)
}

export interface Band {
  low: number
  high: number
}

const BANDS: { min: number; band: Band }[] = [
  { min: 0.95, band: { low: 450, high: 495 } },
  { min: 0.85, band: { low: 400, high: 450 } },
  { min: 0.75, band: { low: 350, high: 400 } },
  { min: 0.65, band: { low: 300, high: 350 } },
  { min: 0.5, band: { low: 230, high: 300 } },
  { min: 0, band: { low: 5, high: 230 } }
]

export function estimateBand(tests: MixedTestResult[]): Band | null {
  const recent = tests.slice(-3)
  if (recent.length === 0) return null
  const correct = recent.reduce((sum, t) => sum + t.correct, 0)
  const total = recent.reduce((sum, t) => sum + t.total, 0)
  const accuracy = correct / total
  return BANDS.find((b) => accuracy >= b.min)!.band
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/scoring.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/scoring.ts tests/unit/scoring.test.ts
git commit -m "feat: add topic stats, weakest topics and band estimate"
```

---

### Task 4: Quiz entries and pickers

**Files:**
- Create: `src/shared/quiz.ts`
- Test: `tests/unit/quiz.test.ts`

**Interfaces:**
- Consumes: `ContentBank`, `Part5Item`, `Part6Set`, `Part5Topic`, `GrammarTopic`, `Explain` from `@shared/types`.
- Produces:
  - `type QuizEntry = { kind: 'p5'; item: Part5Item } | { kind: 'p6'; set: Part6Set; blank: number }` (blank is 0-based)
  - `interface EntryFields { topic: GrammarTopic; choices: string[]; answer: number; trap: string; explain: Explain }`
  - `blankId(setId: string, blank: number): string`, which returns `"p6-0001#1"` for blank 0
  - `entryId(e: QuizEntry): string`
  - `entryFields(e: QuizEntry): EntryFields`
  - `shuffle<T>(items: readonly T[], rng?: () => number): T[]`
  - `flattenSet(set: Part6Set): QuizEntry[]`
  - `pickTopicDrill(bank: ContentBank, topic: Part5Topic, n?: number, rng?: () => number): QuizEntry[]` (n defaults to 10)
  - `pickMixedTest(bank: ContentBank, rng?: () => number, p5Count?: number, p6Count?: number): QuizEntry[]` (defaults 30 and 4; Part 5 entries come first)
  - `resolveIds(bank: ContentBank, ids: string[]): QuizEntry[]` (unknown ids are skipped)

- [ ] **Step 1: Write the failing tests**

`tests/unit/quiz.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { ContentBank } from '@shared/types'
import {
  blankId,
  entryFields,
  entryId,
  flattenSet,
  pickMixedTest,
  pickTopicDrill,
  resolveIds,
  shuffle
} from '@shared/quiz'
import { makePart5, makePart6 } from '../fixtures/items'

const rng = () => {
  let i = 0
  return () => (i++ * 0.37) % 1
}

describe('shuffle', () => {
  it('keeps every element and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input, rng())
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('pickTopicDrill', () => {
  it('returns at most n Part 5 items of the topic', () => {
    const bank: ContentBank = {
      part5: [
        ...Array.from({ length: 12 }, () => makePart5()),
        makePart5({ id: 'p5-prepositions-0001', topic: 'prepositions' })
      ],
      part6: []
    }
    const entries = pickTopicDrill(bank, 'word-form', 10, rng())
    expect(entries).toHaveLength(10)
    expect(entries.every((e) => e.kind === 'p5' && e.item.topic === 'word-form')).toBe(true)
  })
})

describe('Part 6 entries', () => {
  it('flattens a set into four blank entries with stable ids', () => {
    const set = makePart6({ id: 'p6-0001' })
    const entries = flattenSet(set)
    expect(entries.map(entryId)).toEqual(['p6-0001#1', 'p6-0001#2', 'p6-0001#3', 'p6-0001#4'])
    expect(blankId('p6-0001', 0)).toBe('p6-0001#1')
  })
  it('reads fields from the blank', () => {
    const set = makePart6()
    const fields = entryFields({ kind: 'p6', set, blank: 1 })
    expect(fields.topic).toBe('sentence-insertion')
    expect(fields.answer).toBe(2)
  })
})

describe('pickMixedTest', () => {
  it('puts Part 5 entries first, then all blanks of the chosen sets', () => {
    const bank: ContentBank = { part5: [makePart5(), makePart5(), makePart5()], part6: [makePart6()] }
    const entries = pickMixedTest(bank, rng())
    expect(entries).toHaveLength(7)
    expect(entries.slice(0, 3).every((e) => e.kind === 'p5')).toBe(true)
    expect(entries.slice(3).every((e) => e.kind === 'p6')).toBe(true)
  })
})

describe('resolveIds', () => {
  it('maps Part 5 ids and Part 6 blank ids, skipping unknown ids', () => {
    const p5 = makePart5({ id: 'p5-word-form-0099' })
    const set = makePart6({ id: 'p6-0042' })
    const bank: ContentBank = { part5: [p5], part6: [set] }
    const entries = resolveIds(bank, ['p6-0042#3', 'missing', 'p5-word-form-0099'])
    expect(entries.map(entryId)).toEqual(['p6-0042#3', 'p5-word-form-0099'])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/quiz.test.ts`
Expected: FAIL. `@shared/quiz` is not found.

- [ ] **Step 3: Implement `src/shared/quiz.ts`**

```ts
import type { ContentBank, Explain, GrammarTopic, Part5Item, Part5Topic, Part6Set } from './types'

export type QuizEntry = { kind: 'p5'; item: Part5Item } | { kind: 'p6'; set: Part6Set; blank: number }

export interface EntryFields {
  topic: GrammarTopic
  choices: string[]
  answer: number
  trap: string
  explain: Explain
}

export const blankId = (setId: string, blank: number): string => `${setId}#${blank + 1}`

export function entryId(e: QuizEntry): string {
  return e.kind === 'p5' ? e.item.id : blankId(e.set.id, e.blank)
}

export function entryFields(e: QuizEntry): EntryFields {
  const src = e.kind === 'p5' ? e.item : e.set.blanks[e.blank]
  return { topic: src.topic, choices: src.choices, answer: src.answer, trap: src.trap, explain: src.explain }
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function flattenSet(set: Part6Set): QuizEntry[] {
  return set.blanks.map((_, blank) => ({ kind: 'p6', set, blank }))
}

export function pickTopicDrill(
  bank: ContentBank,
  topic: Part5Topic,
  n = 10,
  rng: () => number = Math.random
): QuizEntry[] {
  const items = bank.part5.filter((i) => i.topic === topic)
  return shuffle(items, rng)
    .slice(0, n)
    .map((item) => ({ kind: 'p5', item }))
}

export function pickMixedTest(
  bank: ContentBank,
  rng: () => number = Math.random,
  p5Count = 30,
  p6Count = 4
): QuizEntry[] {
  const p5: QuizEntry[] = shuffle(bank.part5, rng)
    .slice(0, p5Count)
    .map((item) => ({ kind: 'p5', item }))
  const p6 = shuffle(bank.part6, rng).slice(0, p6Count).flatMap(flattenSet)
  return [...p5, ...p6]
}

export function resolveIds(bank: ContentBank, ids: string[]): QuizEntry[] {
  const p5 = new Map(bank.part5.map((i) => [i.id, i]))
  const p6 = new Map(bank.part6.map((s) => [s.id, s]))
  const out: QuizEntry[] = []
  for (const id of ids) {
    const item = p5.get(id)
    if (item) {
      out.push({ kind: 'p5', item })
      continue
    }
    const m = /^(p6-\d{4})#([1-4])$/.exec(id)
    const set = m ? p6.get(m[1]) : undefined
    if (m && set) out.push({ kind: 'p6', set, blank: Number(m[2]) - 1 })
  }
  return out
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/quiz.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shared/quiz.ts tests/unit/quiz.test.ts
git commit -m "feat: add quiz entries, pickers and id resolution"
```

---

### Task 5: Local JSON store (progress + settings)

**Files:**
- Create: `src/main/jsonFile.ts`, `src/main/store.ts`
- Test: `tests/unit/store.test.ts`

**Interfaces:**
- Consumes:
  - From `@shared/types`: `Progress`, `Settings`, `SettingsPatch`, `GrammarAttempt`, `MixedTestResult`, `emptyProgress`, `defaultSettings`.
  - From `@shared/progress`: `applyGrammarAttempt`, `applyMixedTest`.
  - From `@shared/dates`: `localDate`.
- Produces:
  - `readJson<T>(path: string, schema: ZodType<T>, fallback: () => T): T`
  - `writeJsonAtomic(path: string, data: unknown): void`
  - `interface Store { getProgress(): Progress; recordGrammar(a: GrammarAttempt): Progress; recordMixedTest(r: MixedTestResult): Progress; getSettings(): Settings; setSettings(patch: SettingsPatch): Settings }`
  - `createStore(dir: string, today?: () => string): Store`

- [ ] **Step 1: Write the failing tests**

`tests/unit/store.test.ts`:
```ts
import { existsSync, mkdtempSync, readdirSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStore } from '../../src/main/store'

let dir: string
const today = () => '2026-10-05'
const attempt = {
  itemId: 'p5-word-form-0001',
  topic: 'word-form' as const,
  correct: false,
  ms: 9000,
  at: '2026-10-05T03:00:00.000Z'
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'toeic-store-'))
})

describe('createStore', () => {
  it('starts empty with default settings', () => {
    const store = createStore(dir, today)
    expect(store.getProgress().grammarAttempts).toEqual([])
    expect(store.getSettings()).toEqual({ language: 'th' })
  })

  it('persists grammar attempts and Leitner cards across instances', () => {
    createStore(dir, today).recordGrammar(attempt)
    const reopened = createStore(dir, today).getProgress()
    expect(reopened.grammarAttempts).toHaveLength(1)
    expect(reopened.leitner['p5-word-form-0001']).toEqual({ box: 1, due: '2026-10-06' })
  })

  it('persists mixed test results', () => {
    createStore(dir, today).recordMixedTest({ at: 'x', correct: 1, total: 2, ms: 3 })
    expect(createStore(dir, today).getProgress().mixedTests).toHaveLength(1)
  })

  it('persists a settings patch without dropping other fields', () => {
    createStore(dir, today).setSettings({ language: 'en' })
    expect(createStore(dir, today).getSettings()).toEqual({ language: 'en' })
    createStore(dir, today).setSettings({})
    expect(createStore(dir, today).getSettings()).toEqual({ language: 'en' })
  })

  it('moves a corrupt progress file aside and starts fresh', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    writeFileSync(join(dir, 'progress.json'), '{not json')
    const store = createStore(dir, today)
    expect(store.getProgress().grammarAttempts).toEqual([])
    expect(readdirSync(dir).some((f) => f.startsWith('progress.json.corrupt-'))).toBe(true)
    spy.mockRestore()
  })

  it('leaves no temp file after writing', () => {
    createStore(dir, today).recordGrammar(attempt)
    expect(existsSync(join(dir, 'progress.json.tmp'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/store.test.ts`
Expected: FAIL. `../../src/main/store` is not found.

- [ ] **Step 3: Implement**

`src/main/jsonFile.ts`:
```ts
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import type { ZodType } from 'zod'

export function readJson<T>(path: string, schema: ZodType<T>, fallback: () => T): T {
  if (!existsSync(path)) return fallback()
  try {
    return schema.parse(JSON.parse(readFileSync(path, 'utf8')))
  } catch (err) {
    const backup = `${path}.corrupt-${Date.now()}`
    renameSync(path, backup)
    console.error(`[store] ${path} was invalid and has been moved to ${backup}:`, err)
    return fallback()
  }
}

export function writeJsonAtomic(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  renameSync(tmp, path)
}
```

`src/main/store.ts`:
```ts
import { join } from 'path'
import { localDate } from '@shared/dates'
import { applyGrammarAttempt, applyMixedTest } from '@shared/progress'
import {
  Progress,
  Settings,
  defaultSettings,
  emptyProgress,
  type GrammarAttempt,
  type MixedTestResult,
  type SettingsPatch
} from '@shared/types'
import { readJson, writeJsonAtomic } from './jsonFile'

export interface Store {
  getProgress(): Progress
  recordGrammar(a: GrammarAttempt): Progress
  recordMixedTest(r: MixedTestResult): Progress
  getSettings(): Settings
  setSettings(patch: SettingsPatch): Settings
}

export function createStore(dir: string, today: () => string = () => localDate()): Store {
  const progressPath = join(dir, 'progress.json')
  const settingsPath = join(dir, 'settings.json')
  let progress = readJson(progressPath, Progress, emptyProgress)
  let settings = readJson(settingsPath, Settings, defaultSettings)

  const saveProgress = (next: Progress): Progress => {
    progress = next
    writeJsonAtomic(progressPath, progress)
    return progress
  }

  return {
    getProgress: () => progress,
    recordGrammar: (a) => saveProgress(applyGrammarAttempt(progress, a, today())),
    recordMixedTest: (r) => saveProgress(applyMixedTest(progress, r)),
    getSettings: () => settings,
    setSettings(patch) {
      settings = Settings.parse({ ...settings, ...patch })
      writeJsonAtomic(settingsPath, settings)
      return settings
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/store.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/main/jsonFile.ts src/main/store.ts tests/unit/store.test.ts
git commit -m "feat: add atomic local store for progress and settings"
```

---

### Task 6: Content loader + seed content

**Files:**
- Create: `src/main/content.ts`
- Create: `content/grammar/part5/word-form.json`, `content/grammar/part5/prepositions.json`, `content/grammar/part6/sets.json`
- Test: `tests/unit/content.test.ts`, `tests/content/content.test.ts`

**Interfaces:**
- Consumes: `Part5Item`, `Part6Set`, `ContentBank`, `formatIssues` from `@shared/types`.
- Produces:
  - `interface LoadResult { bank: ContentBank; errors: string[] }`
  - `loadContent(root: string): LoadResult`. Reads `root/grammar/part5/*.json` and `root/grammar/part6/*.json`. Each file holds a JSON array. Returns only approved items. Invalid items and duplicate ids go into `errors` and are skipped.
- **Constraint:** `content.ts` must not import `electron`, because the generation script and the tests import it.

- [ ] **Step 1: Write the failing loader tests**

`tests/unit/content.test.ts`:
```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'
import { loadContent } from '../../src/main/content'
import { makePart5, makePart6 } from '../fixtures/items'

let root: string
const write = (rel: string, data: unknown) => {
  const path = join(root, rel)
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, typeof data === 'string' ? data : JSON.stringify(data))
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'toeic-content-'))
})

describe('loadContent', () => {
  it('returns an empty bank when folders are missing', () => {
    expect(loadContent(root)).toEqual({ bank: { part5: [], part6: [] }, errors: [] })
  })

  it('loads approved items and skips drafts', () => {
    write('grammar/part5/word-form.json', [makePart5(), makePart5({ status: 'draft' })])
    write('grammar/part6/sets.json', [makePart6()])
    const { bank, errors } = loadContent(root)
    expect(errors).toEqual([])
    expect(bank.part5).toHaveLength(1)
    expect(bank.part6).toHaveLength(1)
  })

  it('reports an invalid item with file and index but keeps valid ones', () => {
    write('grammar/part5/word-form.json', [makePart5(), { ...makePart5(), choices: ['a'] }])
    const { bank, errors } = loadContent(root)
    expect(bank.part5).toHaveLength(1)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/word-form\.json#1: choices/)
  })

  it('reports duplicate ids', () => {
    const item = makePart5()
    write('grammar/part5/word-form.json', [item, item])
    const { bank, errors } = loadContent(root)
    expect(bank.part5).toHaveLength(1)
    expect(errors[0]).toMatch(/duplicate id/)
  })

  it('reports invalid JSON and non-array files', () => {
    write('grammar/part5/a.json', '{oops')
    write('grammar/part5/b.json', { not: 'array' })
    const { errors } = loadContent(root)
    expect(errors).toHaveLength(2)
    expect(errors[0]).toMatch(/a\.json: invalid JSON/)
    expect(errors[1]).toMatch(/b\.json: expected an array/)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/content.test.ts`
Expected: FAIL. `../../src/main/content` is not found.

- [ ] **Step 3: Implement `src/main/content.ts`**

```ts
import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { ZodType } from 'zod'
import { Part5Item, Part6Set, formatIssues, type ContentBank } from '@shared/types'

export interface LoadResult {
  bank: ContentBank
  errors: string[]
}

function collect<T extends { id: string; status: string }>(
  dir: string,
  schema: ZodType<T>,
  errors: string[],
  seen: Set<string>
): T[] {
  if (!existsSync(dir)) return []
  const out: T[] = []
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const path = join(dir, file)
    let raw: unknown
    try {
      raw = JSON.parse(readFileSync(path, 'utf8'))
    } catch (err) {
      errors.push(`${path}: invalid JSON (${(err as Error).message})`)
      continue
    }
    if (!Array.isArray(raw)) {
      errors.push(`${path}: expected an array`)
      continue
    }
    raw.forEach((entry, i) => {
      const r = schema.safeParse(entry)
      if (!r.success) {
        errors.push(`${path}#${i}: ${formatIssues(r.error)}`)
        return
      }
      if (seen.has(r.data.id)) {
        errors.push(`${path}#${i}: duplicate id ${r.data.id}`)
        return
      }
      seen.add(r.data.id)
      if (r.data.status === 'approved') out.push(r.data)
    })
  }
  return out
}

export function loadContent(root: string): LoadResult {
  const errors: string[] = []
  const seen = new Set<string>()
  const part5 = collect(join(root, 'grammar', 'part5'), Part5Item, errors, seen)
  const part6 = collect(join(root, 'grammar', 'part6'), Part6Set, errors, seen)
  return { bank: { part5, part6 }, errors }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/content.test.ts`
Expected: PASS.

- [ ] **Step 5: Add seed content**

`content/grammar/part5/word-form.json`:
```json
[
  {
    "id": "p5-word-form-0001",
    "part": 5,
    "topic": "word-form",
    "difficulty": 2,
    "stem": "The new policy will be ____ implemented next quarter.",
    "choices": ["full", "fully", "fullness", "fuller"],
    "answer": 1,
    "trap": "adverb modifies the verb 'implemented'",
    "explain": {
      "en": "The blank sits between 'be' and the past participle 'implemented', so it must be an adverb that modifies the verb. 'fully' is the adverb; 'full' is an adjective.",
      "th": "ช่องว่างอยู่ระหว่าง be กับกริยาช่อง 3 (implemented) จึงต้องใช้คำกริยาวิเศษณ์ (adverb) มาขยายกริยา คำตอบคือ fully ส่วน full เป็นคำคุณศัพท์ (adjective) ใช้ไม่ได้"
    },
    "status": "approved"
  },
  {
    "id": "p5-word-form-0002",
    "part": 5,
    "topic": "word-form",
    "difficulty": 2,
    "stem": "Ms. Tanaka gave a very ____ presentation on the merger.",
    "choices": ["inform", "information", "informative", "informatively"],
    "answer": 2,
    "trap": "adjective before the noun 'presentation'",
    "explain": {
      "en": "After 'very' and before the noun 'presentation' we need an adjective. 'informative' is the adjective; 'informatively' is an adverb and cannot describe a noun.",
      "th": "หลัง very และหน้าคำนาม presentation ต้องใช้คำคุณศัพท์ (adjective) คือ informative ส่วน informatively เป็น adverb ขยายคำนามไม่ได้"
    },
    "status": "approved"
  },
  {
    "id": "p5-word-form-0003",
    "part": 5,
    "topic": "word-form",
    "difficulty": 3,
    "stem": "Please submit your ____ for the marketing position by Friday.",
    "choices": ["apply", "applicant", "application", "applied"],
    "answer": 2,
    "trap": "noun after 'your'; 'applicant' is a person",
    "explain": {
      "en": "After the possessive 'your' we need a noun. Both 'applicant' and 'application' are nouns, but you submit a document, not a person, so 'application' is correct.",
      "th": "หลัง your ต้องใช้คำนาม (noun) ซึ่งมีทั้ง applicant และ application แต่สิ่งที่ส่งได้คือใบสมัคร (application) ไม่ใช่ผู้สมัคร (applicant)"
    },
    "status": "approved"
  },
  {
    "id": "p5-word-form-0004",
    "part": 5,
    "topic": "word-form",
    "difficulty": 3,
    "stem": "The company has grown ____ since it opened its first overseas office.",
    "choices": ["consider", "considerable", "considerably", "consideration"],
    "answer": 2,
    "trap": "adverb modifies the verb 'grown'",
    "explain": {
      "en": "The blank describes how the company 'has grown', so an adverb is needed. 'considerably' means 'a lot'. 'considerable' is an adjective and needs a noun after it.",
      "th": "ช่องว่างบอกว่าบริษัทเติบโต (has grown) มากแค่ไหน จึงต้องใช้ adverb คือ considerably (อย่างมาก) ส่วน considerable เป็น adjective ต้องมีคำนามตามหลัง"
    },
    "status": "approved"
  },
  {
    "id": "p5-word-form-0005",
    "part": 5,
    "topic": "word-form",
    "difficulty": 3,
    "stem": "All employees must follow the safety ____ posted in the warehouse.",
    "choices": ["regulate", "regulations", "regulatory", "regulated"],
    "answer": 1,
    "trap": "noun completes the noun phrase 'the safety ____'",
    "explain": {
      "en": "'the safety ____' is the object of 'follow', so the blank must be a noun that completes the noun phrase. 'regulations' is the plural noun; 'regulatory' is an adjective.",
      "th": "the safety ____ เป็นกลุ่มคำนามที่เป็นกรรมของ follow จึงต้องใช้คำนาม regulations (กฎระเบียบ) ส่วน regulatory เป็น adjective"
    },
    "status": "approved"
  }
]
```

`content/grammar/part5/prepositions.json`:
```json
[
  {
    "id": "p5-prepositions-0001",
    "part": 5,
    "topic": "prepositions",
    "difficulty": 2,
    "stem": "The annual conference will be held ____ March 14 at the Grand Hotel.",
    "choices": ["in", "on", "at", "by"],
    "answer": 1,
    "trap": "'on' before a specific date",
    "explain": {
      "en": "Use 'on' with specific dates and days (on March 14, on Monday). 'in' is for months and years; 'at' is for clock times.",
      "th": "ใช้ on กับวันที่หรือวันเฉพาะ (on March 14, on Monday) ส่วน in ใช้กับเดือนหรือปี และ at ใช้กับเวลา"
    },
    "status": "approved"
  },
  {
    "id": "p5-prepositions-0002",
    "part": 5,
    "topic": "prepositions",
    "difficulty": 3,
    "stem": "Our branch office will be closed ____ the national holiday.",
    "choices": ["during", "while", "among", "between"],
    "answer": 0,
    "trap": "'during' + noun; 'while' + clause",
    "explain": {
      "en": "'the national holiday' is a noun phrase, so we need a preposition. 'during' + noun is correct. 'while' is a conjunction and must be followed by a clause.",
      "th": "the national holiday เป็นกลุ่มคำนาม จึงต้องใช้คำบุพบท (preposition) คือ during ส่วน while เป็นคำสันธาน (conjunction) ต้องตามด้วยประโยค"
    },
    "status": "approved"
  },
  {
    "id": "p5-prepositions-0003",
    "part": 5,
    "topic": "prepositions",
    "difficulty": 2,
    "stem": "Mr. Lee has worked in the accounting department ____ 2015.",
    "choices": ["for", "since", "from", "during"],
    "answer": 1,
    "trap": "present perfect + 'since' + starting point",
    "explain": {
      "en": "With the present perfect ('has worked') and a starting point in time (2015), use 'since'. 'for' is used with a length of time, such as 'for ten years'.",
      "th": "กับ present perfect (has worked) และจุดเริ่มต้นของเวลา (2015) ต้องใช้ since ส่วน for ใช้กับระยะเวลา เช่น for ten years"
    },
    "status": "approved"
  },
  {
    "id": "p5-prepositions-0004",
    "part": 5,
    "topic": "prepositions",
    "difficulty": 3,
    "stem": "The replacement parts are expected to arrive ____ two weeks.",
    "choices": ["within", "among", "along", "upon"],
    "answer": 0,
    "trap": "'within' + period of time = no later than",
    "explain": {
      "en": "'within two weeks' means 'before two weeks have passed'. 'among' needs a group of three or more things, and 'along' is used with roads or lines.",
      "th": "within two weeks แปลว่า ภายในสองสัปดาห์ ส่วน among ใช้กับกลุ่มสิ่งของตั้งแต่สามสิ่งขึ้นไป และ along ใช้กับถนนหรือแนวยาว"
    },
    "status": "approved"
  },
  {
    "id": "p5-prepositions-0005",
    "part": 5,
    "topic": "prepositions",
    "difficulty": 2,
    "stem": "Applicants should send their résumés directly ____ the human resources manager.",
    "choices": ["to", "at", "for", "with"],
    "answer": 0,
    "trap": "'send something to someone'",
    "explain": {
      "en": "The pattern is 'send something to someone'. 'to' shows the person who receives the résumés.",
      "th": "รูปแบบที่ถูกต้องคือ send something to someone โดย to บอกผู้รับ ในที่นี้คือผู้จัดการฝ่ายบุคคล"
    },
    "status": "approved"
  }
]
```

`content/grammar/part6/sets.json`:
```json
[
  {
    "id": "p6-0001",
    "part": 6,
    "title": "Email: Fourth-floor renovation",
    "passage": "To: All staff\nFrom: Facilities Department\nSubject: Fourth-floor renovation\n\nRenovation work on the fourth floor will begin on Monday, June 3. During this period, employees on that floor will be {{1}} to temporary desks on the second floor. {{2}} The work is expected to last about three weeks. {{3}}, the cafeteria will remain open as usual. We appreciate your patience and apologize for any {{4}}.",
    "blanks": [
      {
        "topic": "tense-voice",
        "difficulty": 2,
        "choices": ["relocate", "relocating", "relocated", "relocation"],
        "answer": 2,
        "trap": "passive voice: will be + past participle",
        "explain": {
          "en": "Employees do not move themselves here; they are moved. After 'will be', use the past participle 'relocated' to form the passive voice.",
          "th": "พนักงานเป็นผู้ถูกย้าย จึงต้องใช้ passive voice คือ will be + กริยาช่อง 3 (relocated)"
        }
      },
      {
        "topic": "sentence-insertion",
        "difficulty": 3,
        "choices": [
          "Please pack your personal items in the boxes provided by Friday.",
          "The cafeteria menu has been updated for the summer.",
          "Our sales figures rose sharply last quarter.",
          "Thank you for attending the training session."
        ],
        "answer": 0,
        "trap": "the inserted sentence must continue the topic of moving desks",
        "explain": {
          "en": "The previous sentence says employees will move to temporary desks, so the next sentence should tell them how to prepare: packing their personal items.",
          "th": "ประโยคก่อนหน้าบอกว่าพนักงานจะย้ายไปโต๊ะชั่วคราว ประโยคถัดไปจึงควรบอกวิธีเตรียมตัว คือให้แพ็กของส่วนตัว ตัวเลือกอื่นไม่เกี่ยวกับการย้าย"
        }
      },
      {
        "topic": "transitions",
        "difficulty": 3,
        "choices": ["However", "Therefore", "For example", "Otherwise"],
        "answer": 0,
        "trap": "contrast between disruption and normal service",
        "explain": {
          "en": "The renovation causes disruption, but the cafeteria stays open. This is a contrast, so 'However' fits. 'Therefore' would show a result, which makes no sense here.",
          "th": "การปรับปรุงทำให้เกิดความไม่สะดวก แต่โรงอาหารยังเปิดตามปกติ เป็นการแสดงความขัดแย้ง จึงใช้ However ส่วน Therefore แสดงผลลัพธ์ ซึ่งไม่เข้ากับบริบท"
        }
      },
      {
        "topic": "word-form",
        "difficulty": 2,
        "choices": ["inconvenient", "inconvenience", "inconveniently", "inconvenienced"],
        "answer": 1,
        "trap": "noun after 'any'",
        "explain": {
          "en": "'apologize for any ____' needs a noun after 'any'. 'inconvenience' is the noun; 'inconvenient' is an adjective.",
          "th": "หลัง any ต้องใช้คำนาม คือ inconvenience (ความไม่สะดวก) ส่วน inconvenient เป็น adjective"
        }
      }
    ],
    "status": "approved"
  }
]
```

- [ ] **Step 6: Write the repository content test**

`tests/content/content.test.ts`:
```ts
import { readFileSync, readdirSync } from 'fs'
import { basename, join, resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../src/main/content'

const ROOT = resolve('content')

describe('repository content', () => {
  const { bank, errors } = loadContent(ROOT)

  it('has no invalid items', () => {
    expect(errors).toEqual([])
  })

  it('has at least one Part 5 item and one Part 6 set', () => {
    expect(bank.part5.length).toBeGreaterThan(0)
    expect(bank.part6.length).toBeGreaterThan(0)
  })

  it('stores each Part 5 item in the file named after its topic', () => {
    const dir = join(ROOT, 'grammar', 'part5')
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const items = JSON.parse(readFileSync(join(dir, file), 'utf8')) as { topic: string }[]
      for (const item of items) expect(item.topic).toBe(basename(file, '.json'))
    }
  })
})
```

- [ ] **Step 7: Run all tests**

Run: `npm test`
Expected: PASS, including `tests/content/content.test.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/main/content.ts content tests/unit/content.test.ts tests/content/content.test.ts
git commit -m "feat: add content loader and seed grammar questions"
```

---

### Task 7: IPC bridge (main wiring + preload + typed API)

**Files:**
- Create: `src/shared/api.ts`, `src/main/paths.ts`, `src/main/ipc.ts`, `src/renderer/src/env.d.ts`
- Modify: `src/main/index.ts` (full replacement below), `src/preload/index.ts` (full replacement below)

**Interfaces:**
- Consumes:
  - `createStore` / `Store` (Task 5) and `loadContent` (Task 6).
  - From `@shared/types`: `GrammarAttempt`, `MixedTestResult`, `SettingsPatch`.
- Produces:
  - `IPC` channel constants.
  - `interface Api` with `content.bank()`, `progress.get()`, `progress.recordGrammar(a)`, `progress.recordMixedTest(r)`, `settings.get()`, `settings.set(patch)`, `dev.isDev()`.
  - `window.api: Api` in the renderer.
  - `registerIpc(deps: IpcDeps)` where `IpcDeps = { store: Store; contentRoot: string; isDev: boolean }`.
  - `contentRoot(): string`.

- [ ] **Step 1: Create `src/shared/api.ts`** (type imports only)

```ts
import type {
  ContentBank,
  GrammarAttempt,
  MixedTestResult,
  Progress,
  Settings,
  SettingsPatch
} from './types'

export const IPC = {
  contentBank: 'content:bank',
  progressGet: 'progress:get',
  progressRecordGrammar: 'progress:recordGrammar',
  progressRecordMixed: 'progress:recordMixedTest',
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  devIsDev: 'dev:isDev'
} as const

export interface Api {
  content: { bank(): Promise<ContentBank> }
  progress: {
    get(): Promise<Progress>
    recordGrammar(a: GrammarAttempt): Promise<Progress>
    recordMixedTest(r: MixedTestResult): Promise<Progress>
  }
  settings: {
    get(): Promise<Settings>
    set(patch: SettingsPatch): Promise<Settings>
  }
  dev: { isDev(): Promise<boolean> }
}
```

- [ ] **Step 2: Create main-side files**

`src/main/paths.ts`:
```ts
import { app } from 'electron'
import { join } from 'path'

export function contentRoot(): string {
  return app.isPackaged ? join(process.resourcesPath, 'content') : join(app.getAppPath(), 'content')
}
```

`src/main/ipc.ts`:
```ts
import { ipcMain } from 'electron'
import { IPC } from '@shared/api'
import { GrammarAttempt, MixedTestResult, SettingsPatch } from '@shared/types'
import { loadContent } from './content'
import type { Store } from './store'

export interface IpcDeps {
  store: Store
  contentRoot: string
  isDev: boolean
}

export function registerIpc({ store, contentRoot, isDev }: IpcDeps): void {
  ipcMain.handle(IPC.contentBank, () => {
    const { bank, errors } = loadContent(contentRoot)
    for (const e of errors) console.error('[content]', e)
    return bank
  })
  ipcMain.handle(IPC.progressGet, () => store.getProgress())
  ipcMain.handle(IPC.progressRecordGrammar, (_e, a: unknown) =>
    store.recordGrammar(GrammarAttempt.parse(a))
  )
  ipcMain.handle(IPC.progressRecordMixed, (_e, r: unknown) =>
    store.recordMixedTest(MixedTestResult.parse(r))
  )
  ipcMain.handle(IPC.settingsGet, () => store.getSettings())
  ipcMain.handle(IPC.settingsSet, (_e, patch: unknown) => store.setSettings(SettingsPatch.parse(patch)))
  ipcMain.handle(IPC.devIsDev, () => isDev)
}
```

- [ ] **Step 3: Replace `src/main/index.ts`**

```ts
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerIpc } from './ipc'
import { contentRoot } from './paths'
import { createStore } from './store'

if (process.env.TOEIC_USER_DATA) app.setPath('userData', process.env.TOEIC_USER_DATA)

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  win.on('ready-to-show', () => win.show())
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerIpc({
    store: createStore(app.getPath('userData')),
    contentRoot: contentRoot(),
    isDev: !app.isPackaged
  })
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

- [ ] **Step 4: Replace `src/preload/index.ts`**

```ts
import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type Api } from '@shared/api'

const api: Api = {
  content: { bank: () => ipcRenderer.invoke(IPC.contentBank) },
  progress: {
    get: () => ipcRenderer.invoke(IPC.progressGet),
    recordGrammar: (a) => ipcRenderer.invoke(IPC.progressRecordGrammar, a),
    recordMixedTest: (r) => ipcRenderer.invoke(IPC.progressRecordMixed, r)
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC.settingsGet),
    set: (patch) => ipcRenderer.invoke(IPC.settingsSet, patch)
  },
  dev: { isDev: () => ipcRenderer.invoke(IPC.devIsDev) }
}

contextBridge.exposeInMainWorld('api', api)
```

- [ ] **Step 5: Declare `window.api` for the renderer**

`src/renderer/src/env.d.ts`:
```ts
import type { Api } from '@shared/api'

declare global {
  interface Window {
    api: Api
  }
}

export {}
```

- [ ] **Step 6: Typecheck, build, and verify the bridge manually**

Run: `npm run typecheck && npm run build`
Expected: both succeed. Then confirm `out/preload/index.js` does not contain `require("zod")`:

Run: `grep -c 'require("zod")' out/preload/index.js || true`
Expected: `0`.

Run: `npm run dev`. Open DevTools (Ctrl+Shift+I) and run `await window.api.content.bank()` in the console.
Expected: an object with `part5` (10 items) and `part6` (1 set). Then run `await window.api.settings.get()`, which should return `{language: 'th'}`. Close the app.

- [ ] **Step 7: Commit**

```bash
git add src/shared/api.ts src/main src/preload src/renderer/src/env.d.ts
git commit -m "feat: wire typed IPC bridge between main and renderer"
```

---

### Task 8: Renderer shell (context, i18n, routing, home, settings)

**Files:**
- Create: `src/renderer/src/app/i18n.ts`, `src/renderer/src/app/AppContext.tsx`, `src/renderer/src/app/App.tsx`, `src/renderer/src/styles.css`
- Create: `src/renderer/src/features/home/HomeScreen.tsx`, `src/renderer/src/features/settings/SettingsScreen.tsx`
- Modify: `src/renderer/src/main.tsx` (full replacement)
- Test: `tests/unit/renderer/i18n.test.ts`

**Interfaces:**
- Consumes:
  - `window.api` (Task 7).
  - `dueIds` (Task 2), `topicStats` and `weakestTopics` (Task 3), `localDate` (Task 2).
- Produces:
  - `type Lang = Language`
  - `t(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string`
  - `TOPIC_LABELS: Record<GrammarTopic, Record<Lang, string>>`
  - `topicLabel(topic: GrammarTopic, lang: Lang): string`
  - `useT(): { lang: Lang; t(key, vars?): string; topic(t: GrammarTopic): string }`
  - `AppProvider` and `useApp(): AppData`, where `AppData = { bank, progress, settings, isDev, recordGrammar(a), recordMixedTest(r), updateSettings(patch), reloadBank() }`. The four methods all return `Promise<void>`.
  - `App` component with routes `/` and `/settings`. Later tasks add more routes.

- [ ] **Step 1: Write the failing i18n test**

`tests/unit/renderer/i18n.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { GRAMMAR_TOPICS } from '@shared/types'
import { STRINGS, TOPIC_LABELS, t } from '@renderer/app/i18n'

describe('i18n', () => {
  it('interpolates variables', () => {
    expect(t('en', 'quizQuestionOf', { i: 1, n: 5 })).toBe('Question 1 of 5')
  })
  it('has the same keys in Thai and English', () => {
    expect(Object.keys(STRINGS.th).sort()).toEqual(Object.keys(STRINGS.en).sort())
  })
  it('labels every grammar topic in both languages', () => {
    for (const topic of GRAMMAR_TOPICS) {
      expect(TOPIC_LABELS[topic].th.length).toBeGreaterThan(0)
      expect(TOPIC_LABELS[topic].en.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/renderer/i18n.test.ts`
Expected: FAIL. `@renderer/app/i18n` is not found.

- [ ] **Step 3: Implement `src/renderer/src/app/i18n.ts`**

`useT` lives in `AppContext.tsx`, so this file stays free of React and context.

```ts
import type { GrammarTopic, Language } from '@shared/types'

export type Lang = Language

const en = {
  appTitle: 'TOEIC Trainer',
  navHome: 'Home',
  navTopics: 'Topic drills',
  navMixed: 'Mixed test',
  navReview: 'Review',
  navProgress: 'Progress',
  navSettings: 'Settings',
  homeTitle: 'Today',
  homeDue: '{n} items due for review',
  homeStartReview: 'Start review',
  homeWeakest: 'Your weakest topics',
  homeNoData: 'Do a topic drill to see your weak points.',
  topicsTitle: 'Topic drills (Part 5)',
  topicsCount: '{n} questions',
  quizQuestionOf: 'Question {i} of {n}',
  quizNext: 'Next',
  quizFinish: 'See results',
  quizScore: 'Score: {c} / {n}',
  quizAgain: 'Practice again',
  quizEmpty: 'No questions available yet.',
  trapLabel: 'Tested point',
  showOtherLang: 'Show Thai explanation',
  showMainLang: 'Show English explanation',
  yourAnswer: 'Your answer',
  correctAnswer: 'Correct answer',
  mixedTitle: 'Mixed test (Part 5 + 6)',
  mixedIntro:
    'Up to {p5} Part 5 questions and {p6} Part 6 passages. Aim for about 20 seconds per Part 5 question. Explanations are shown at the end.',
  mixedStart: 'Start test',
  reviewTitle: 'Review',
  reviewNothing: 'Nothing is due today. Great work!',
  progressTitle: 'Progress',
  progressTopic: 'Topic',
  progressAccuracy: 'Accuracy (last 20)',
  progressAvgTime: 'Avg. time',
  progressAttempts: 'Attempts',
  progressWeakest: 'Focus on these',
  progressDrill: 'Drill this',
  progressBand: 'Estimated Reading band: {low}–{high}',
  progressBandNote:
    'Estimate from your last 3 mixed tests, assuming similar Part 7 performance. Not an official score.',
  progressBandNone: 'Take a mixed test to see a score estimate.',
  progressNoData: 'No attempts yet.',
  settingsTitle: 'Settings',
  settingsLanguage: 'Explanation and menu language',
  seconds: '{s}s'
} as const

export type StringKey = keyof typeof en

const th: Record<StringKey, string> = {
  appTitle: 'TOEIC Trainer',
  navHome: 'หน้าแรก',
  navTopics: 'ฝึกตามหัวข้อ',
  navMixed: 'แบบทดสอบรวม',
  navReview: 'ทบทวน',
  navProgress: 'ความก้าวหน้า',
  navSettings: 'ตั้งค่า',
  homeTitle: 'วันนี้',
  homeDue: 'มี {n} ข้อที่ถึงเวลาทบทวน',
  homeStartReview: 'เริ่มทบทวน',
  homeWeakest: 'หัวข้อที่ยังอ่อน',
  homeNoData: 'ลองฝึกตามหัวข้อก่อน แล้วระบบจะบอกจุดที่ควรปรับปรุง',
  topicsTitle: 'ฝึกตามหัวข้อ (Part 5)',
  topicsCount: '{n} ข้อ',
  quizQuestionOf: 'ข้อ {i} จาก {n}',
  quizNext: 'ข้อต่อไป',
  quizFinish: 'ดูผลลัพธ์',
  quizScore: 'คะแนน: {c} / {n}',
  quizAgain: 'ฝึกอีกครั้ง',
  quizEmpty: 'ยังไม่มีข้อสอบในหัวข้อนี้',
  trapLabel: 'จุดที่ออกสอบ',
  showOtherLang: 'ดูคำอธิบายภาษาอังกฤษ',
  showMainLang: 'ดูคำอธิบายภาษาไทย',
  yourAnswer: 'คำตอบของคุณ',
  correctAnswer: 'คำตอบที่ถูก',
  mixedTitle: 'แบบทดสอบรวม (Part 5 + 6)',
  mixedIntro:
    'Part 5 สูงสุด {p5} ข้อ และ Part 6 สูงสุด {p6} บทความ พยายามทำ Part 5 ให้ได้ข้อละประมาณ 20 วินาที คำอธิบายจะแสดงตอนจบ',
  mixedStart: 'เริ่มทำแบบทดสอบ',
  reviewTitle: 'ทบทวน',
  reviewNothing: 'วันนี้ไม่มีข้อที่ต้องทบทวน เยี่ยมมาก!',
  progressTitle: 'ความก้าวหน้า',
  progressTopic: 'หัวข้อ',
  progressAccuracy: 'ความแม่นยำ (20 ข้อล่าสุด)',
  progressAvgTime: 'เวลาเฉลี่ย',
  progressAttempts: 'จำนวนที่ทำ',
  progressWeakest: 'ควรฝึกเพิ่ม',
  progressDrill: 'ฝึกหัวข้อนี้',
  progressBand: 'ประมาณคะแนน Reading: {low}–{high}',
  progressBandNote:
    'ประมาณจากแบบทดสอบรวม 3 ครั้งล่าสุด โดยสมมติว่า Part 7 ทำได้ใกล้เคียงกัน ไม่ใช่คะแนนอย่างเป็นทางการ',
  progressBandNone: 'ทำแบบทดสอบรวมเพื่อดูคะแนนโดยประมาณ',
  progressNoData: 'ยังไม่มีข้อมูล',
  settingsTitle: 'ตั้งค่า',
  settingsLanguage: 'ภาษาของเมนูและคำอธิบาย',
  seconds: '{s} วิ'
}

export const STRINGS: Record<Lang, Record<StringKey, string>> = { en, th }

export function t(lang: Lang, key: StringKey, vars: Record<string, string | number> = {}): string {
  return STRINGS[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
}

export const TOPIC_LABELS: Record<GrammarTopic, Record<Lang, string>> = {
  'word-form': { en: 'Word form', th: 'รูปคำ (Word form)' },
  'tense-voice': { en: 'Tense & voice', th: 'กาลและวอยซ์ (Tense & voice)' },
  'subject-verb-agreement': { en: 'Subject-verb agreement', th: 'ความสอดคล้องประธาน-กริยา' },
  prepositions: { en: 'Prepositions', th: 'คำบุพบท (Prepositions)' },
  'conj-vs-prep': { en: 'Conjunction vs preposition', th: 'คำสันธาน vs คำบุพบท' },
  pronouns: { en: 'Pronouns', th: 'คำสรรพนาม (Pronouns)' },
  'relative-clauses': { en: 'Relative clauses', th: 'ประโยคขยายคำนาม (Relative clauses)' },
  'reduced-clauses': { en: 'Reduced clauses', th: 'การลดรูปประโยค (Reduced clauses)' },
  conditionals: { en: 'Conditionals', th: 'ประโยคเงื่อนไข (Conditionals)' },
  inversion: { en: 'Inversion', th: 'การสลับประธาน-กริยา (Inversion)' },
  comparatives: { en: 'Comparatives & superlatives', th: 'ขั้นกว่าและขั้นสูงสุด' },
  'gerund-infinitive': { en: 'Gerund vs infinitive', th: 'Gerund กับ Infinitive' },
  collocations: { en: 'Collocations & vocabulary', th: 'คำที่มักใช้คู่กัน (Collocations)' },
  'sentence-insertion': { en: 'Sentence insertion', th: 'การเติมประโยค (Sentence insertion)' },
  transitions: { en: 'Transitions', th: 'คำเชื่อมความ (Transitions)' }
}

export const topicLabel = (topic: GrammarTopic, lang: Lang): string => TOPIC_LABELS[topic][lang]
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/renderer/i18n.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement the context**

`src/renderer/src/app/AppContext.tsx`:
```tsx
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type {
  ContentBank,
  GrammarAttempt,
  GrammarTopic,
  MixedTestResult,
  Progress,
  Settings,
  SettingsPatch
} from '@shared/types'
import { t as translate, topicLabel, type Lang, type StringKey } from './i18n'

interface Loaded {
  bank: ContentBank
  progress: Progress
  settings: Settings
  isDev: boolean
}

export interface AppData extends Loaded {
  recordGrammar(a: GrammarAttempt): Promise<void>
  recordMixedTest(r: MixedTestResult): Promise<void>
  updateSettings(patch: SettingsPatch): Promise<void>
  reloadBank(): Promise<void>
}

const AppCtx = createContext<AppData | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      window.api.content.bank(),
      window.api.progress.get(),
      window.api.settings.get(),
      window.api.dev.isDev()
    ])
      .then(([bank, progress, settings, isDev]) => setState({ bank, progress, settings, isDev }))
      .catch((e: unknown) => setError(String(e)))
  }, [])

  const recordGrammar = useCallback(async (a: GrammarAttempt) => {
    const progress = await window.api.progress.recordGrammar(a)
    setState((s) => s && { ...s, progress })
  }, [])
  const recordMixedTest = useCallback(async (r: MixedTestResult) => {
    const progress = await window.api.progress.recordMixedTest(r)
    setState((s) => s && { ...s, progress })
  }, [])
  const updateSettings = useCallback(async (patch: SettingsPatch) => {
    const settings = await window.api.settings.set(patch)
    setState((s) => s && { ...s, settings })
  }, [])
  const reloadBank = useCallback(async () => {
    const bank = await window.api.content.bank()
    setState((s) => s && { ...s, bank })
  }, [])

  if (error) return <p className="error">Failed to load: {error}</p>
  if (!state) return <p className="loading">Loading…</p>
  return (
    <AppCtx.Provider value={{ ...state, recordGrammar, recordMixedTest, updateSettings, reloadBank }}>
      {children}
    </AppCtx.Provider>
  )
}

export function useApp(): AppData {
  const value = useContext(AppCtx)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}

export function useT() {
  const lang: Lang = useApp().settings.language
  return {
    lang,
    t: (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    topic: (topic: GrammarTopic) => topicLabel(topic, lang)
  }
}
```

- [ ] **Step 6: Implement App, Home and Settings**

`src/renderer/src/app/App.tsx`:
```tsx
import { NavLink, Route, Routes } from 'react-router'
import { HomeScreen } from '../features/home/HomeScreen'
import { SettingsScreen } from '../features/settings/SettingsScreen'
import { useT } from './AppContext'

export function App() {
  const { t } = useT()
  return (
    <div className="app">
      <nav className="sidebar">
        <h2>{t('appTitle')}</h2>
        <NavLink to="/" end>
          {t('navHome')}
        </NavLink>
        <NavLink to="/settings">{t('navSettings')}</NavLink>
      </nav>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>
    </div>
  )
}
```

`src/renderer/src/features/home/HomeScreen.tsx`:
```tsx
import { Link } from 'react-router'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { topicStats, weakestTopics } from '@shared/scoring'
import { Part5Topic } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'

export function HomeScreen() {
  const { progress } = useApp()
  const { t, topic } = useT()
  const due = dueIds(progress.leitner, localDate()).length
  const weakest = weakestTopics(topicStats(progress.grammarAttempts))

  return (
    <section>
      <h1>{t('homeTitle')}</h1>
      <div className="card">
        <p>{t('homeDue', { n: due })}</p>
        {due > 0 && (
          <Link className="button primary" to="/review">
            {t('homeStartReview')}
          </Link>
        )}
      </div>
      <div className="card">
        <h3>{t('homeWeakest')}</h3>
        {weakest.length === 0 ? (
          <p className="muted">{t('homeNoData')}</p>
        ) : (
          <ul>
            {weakest.map((tp) => (
              <li key={tp}>
                {Part5Topic.safeParse(tp).success ? <Link to={`/drill/${tp}`}>{topic(tp)}</Link> : topic(tp)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
```

`src/renderer/src/features/settings/SettingsScreen.tsx`:
```tsx
import { useApp, useT } from '../../app/AppContext'

export function SettingsScreen() {
  const { settings, updateSettings } = useApp()
  const { t } = useT()
  return (
    <section>
      <h1>{t('settingsTitle')}</h1>
      <fieldset className="card">
        <legend>{t('settingsLanguage')}</legend>
        <label>
          <input
            type="radio"
            name="language"
            checked={settings.language === 'th'}
            onChange={() => void updateSettings({ language: 'th' })}
          />{' '}
          ภาษาไทย
        </label>
        <label>
          <input
            type="radio"
            name="language"
            checked={settings.language === 'en'}
            onChange={() => void updateSettings({ language: 'en' })}
          />{' '}
          English
        </label>
      </fieldset>
    </section>
  )
}
```

- [ ] **Step 7: Styles and entry point**

`src/renderer/src/styles.css`:
```css
:root {
  --bg: #f6f7f9;
  --surface: #ffffff;
  --text: #1d2330;
  --muted: #667085;
  --border: #d9dee7;
  --accent: #2456d6;
  --accent-text: #ffffff;
  --ok: #1f8a4c;
  --ok-bg: #e6f5ec;
  --bad: #c0362c;
  --bad-bg: #fbeae8;
  --mark: #fff3c4;
  font-family: 'Segoe UI', 'Leelawadee UI', 'Noto Sans Thai', sans-serif;
  color: var(--text);
  background: var(--bg);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #14171d;
    --surface: #1d2129;
    --text: #e7eaf0;
    --muted: #98a2b3;
    --border: #343a46;
    --accent: #6d95ff;
    --accent-text: #0d1220;
    --ok: #5fd08f;
    --ok-bg: #173323;
    --bad: #ff7b6e;
    --bad-bg: #3a1c19;
    --mark: #4a3f12;
  }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); line-height: 1.6; }
.app { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; }
.sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 20px 12px; display: flex; flex-direction: column; gap: 4px; }
.sidebar h2 { font-size: 18px; margin: 0 8px 16px; }
.sidebar a { color: var(--text); text-decoration: none; padding: 8px 10px; border-radius: 8px; }
.sidebar a.active { background: var(--accent); color: var(--accent-text); }
.content { padding: 28px 36px; max-width: 900px; }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; }
.muted { color: var(--muted); }
.error { color: var(--bad); }
button, .button { font: inherit; padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; text-decoration: none; display: inline-block; }
button.primary, .button.primary { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
button.link { border: none; background: none; color: var(--accent); padding: 0; }
button:disabled { cursor: default; }
.topic-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.topic-grid a { display: block; text-decoration: none; color: var(--text); }
.quiz-head { display: flex; justify-content: space-between; color: var(--muted); margin-bottom: 8px; }
.pace.slow { color: var(--bad); font-weight: 600; }
.stem { font-size: 20px; }
.passage { white-space: pre-line; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; }
.passage h3 { margin-top: 0; white-space: normal; }
mark.blank { background: transparent; color: inherit; font-weight: 600; }
mark.blank.current { background: var(--mark); }
.choices { list-style: none; padding: 0; display: grid; gap: 8px; }
.choice { width: 100%; text-align: left; }
.choice.selected { border-color: var(--accent); }
.choice.correct { background: var(--ok-bg); border-color: var(--ok); }
.choice.wrong { background: var(--bad-bg); border-color: var(--bad); }
.explain { background: var(--surface); border-left: 4px solid var(--accent); padding: 12px 16px; border-radius: 8px; margin: 12px 0; }
.review-list li { margin-bottom: 12px; padding-left: 8px; border-left: 4px solid var(--border); list-style-position: inside; }
.review-list li.ok { border-color: var(--ok); }
.review-list li.bad { border-color: var(--bad); }
table { border-collapse: collapse; width: 100%; }
th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); }
.draft textarea { width: 100%; font-family: Consolas, monospace; font-size: 13px; }
.draft .flag { color: var(--bad); margin-left: 8px; }
.actions { display: flex; gap: 8px; margin-top: 8px; }
fieldset label { display: block; margin: 6px 0; }
```

Replace `src/renderer/src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { App } from './app/App'
import { AppProvider } from './app/AppContext'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>
)
```

- [ ] **Step 8: Verify**

Run: `npm test && npm run typecheck`
Expected: PASS.

Run: `npm run dev`
Expected:
- Sidebar shows หน้าแรก and ตั้งค่า. Home shows "มี 0 ข้อที่ถึงเวลาทบทวน".
- Switching to English in Settings changes the menus immediately.
- After restarting the app, it is still in English (persisted). Switch back to Thai.

- [ ] **Step 9: Commit**

```bash
git add src/renderer tests/unit/renderer/i18n.test.ts
git commit -m "feat: add renderer shell with Thai/English i18n, home and settings"
```

---

### Task 9: Quiz engine UI (reducer, question view, runner)

**Files:**
- Create: `src/renderer/src/features/grammar/quizReducer.ts`, `QuestionView.tsx`, `QuizSummary.tsx`, `QuizRunner.tsx`
- Test: `tests/unit/renderer/quizReducer.test.ts`, `tests/unit/renderer/QuizRunner.test.tsx`

**Interfaces:**
- Consumes: `QuizEntry`, `entryId` and `entryFields` (Task 4); `t` and `Lang` (Task 8); `GrammarAttempt` and `GrammarTopic` from types.
- Produces:
  - `type QuizMode = 'instant' | 'deferred'`
  - `interface AnswerRecord { entryId: string; topic: GrammarTopic; choice: number; correct: boolean; ms: number }`
  - `interface QuizState { entries; index; selected: number | null; shownAt: number; records: AnswerRecord[]; mode; done: boolean }`
  - `initQuiz(entries: QuizEntry[], mode: QuizMode, now: number): QuizState`
  - `quizReducer(s: QuizState, a: QuizAction): QuizState`, where `QuizAction = { type: 'answer'; choice: number; now: number } | { type: 'next'; now: number }`
  - `toAttempt(r: AnswerRecord, at: string): GrammarAttempt`
  - `<QuizRunner entries mode lang onAnswer onFinish paceSeconds? now? />`
    - `onAnswer(r: AnswerRecord)` fires once per answer.
    - `onFinish(records)` fires once when done; it never fires for an empty quiz.
  - `<QuestionView entry lang selected reveal onChoose />`

- [ ] **Step 1: Write the failing reducer tests**

`tests/unit/renderer/quizReducer.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import type { QuizEntry } from '@shared/quiz'
import { initQuiz, quizReducer, toAttempt } from '@renderer/features/grammar/quizReducer'
import { makePart5 } from '../../fixtures/items'

const entries: QuizEntry[] = [
  { kind: 'p5', item: makePart5({ answer: 1 }) },
  { kind: 'p5', item: makePart5({ answer: 2 }) }
]

describe('quizReducer (instant)', () => {
  it('records an answer with time and reveals it', () => {
    const s = quizReducer(initQuiz(entries, 'instant', 1000), { type: 'answer', choice: 1, now: 4000 })
    expect(s.selected).toBe(1)
    expect(s.records).toEqual([
      { entryId: entries[0].kind === 'p5' ? entries[0].item.id : '', topic: 'word-form', choice: 1, correct: true, ms: 3000 }
    ])
  })
  it('ignores a second answer to the same question', () => {
    let s = quizReducer(initQuiz(entries, 'instant', 0), { type: 'answer', choice: 0, now: 1 })
    s = quizReducer(s, { type: 'answer', choice: 1, now: 2 })
    expect(s.records).toHaveLength(1)
    expect(s.records[0].correct).toBe(false)
  })
  it('ignores next before answering', () => {
    const s0 = initQuiz(entries, 'instant', 0)
    expect(quizReducer(s0, { type: 'next', now: 5 })).toBe(s0)
  })
  it('advances, resets the timer, and finishes after the last question', () => {
    let s = quizReducer(initQuiz(entries, 'instant', 0), { type: 'answer', choice: 1, now: 1 })
    s = quizReducer(s, { type: 'next', now: 500 })
    expect(s.index).toBe(1)
    expect(s.selected).toBeNull()
    expect(s.shownAt).toBe(500)
    s = quizReducer(s, { type: 'answer', choice: 2, now: 600 })
    s = quizReducer(s, { type: 'next', now: 700 })
    expect(s.done).toBe(true)
  })
})

describe('quizReducer (deferred)', () => {
  it('advances immediately after each answer and finishes', () => {
    let s = quizReducer(initQuiz(entries, 'deferred', 0), { type: 'answer', choice: 1, now: 10 })
    expect(s.index).toBe(1)
    expect(s.selected).toBeNull()
    s = quizReducer(s, { type: 'answer', choice: 0, now: 20 })
    expect(s.done).toBe(true)
    expect(s.records.map((r) => r.correct)).toEqual([true, false])
  })
})

describe('initQuiz and toAttempt', () => {
  it('marks an empty quiz as done', () => {
    expect(initQuiz([], 'instant', 0).done).toBe(true)
  })
  it('converts a record into a grammar attempt', () => {
    expect(
      toAttempt({ entryId: 'p6-0001#2', topic: 'transitions', choice: 0, correct: true, ms: 5 }, 'T')
    ).toEqual({ itemId: 'p6-0001#2', topic: 'transitions', correct: true, ms: 5, at: 'T' })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/renderer/quizReducer.test.ts`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement `quizReducer.ts`**

`src/renderer/src/features/grammar/quizReducer.ts`:
```ts
import { entryFields, entryId, type QuizEntry } from '@shared/quiz'
import type { GrammarAttempt, GrammarTopic } from '@shared/types'

export type QuizMode = 'instant' | 'deferred'

export interface AnswerRecord {
  entryId: string
  topic: GrammarTopic
  choice: number
  correct: boolean
  ms: number
}

export interface QuizState {
  entries: QuizEntry[]
  index: number
  selected: number | null
  shownAt: number
  records: AnswerRecord[]
  mode: QuizMode
  done: boolean
}

export type QuizAction = { type: 'answer'; choice: number; now: number } | { type: 'next'; now: number }

export function initQuiz(entries: QuizEntry[], mode: QuizMode, now: number): QuizState {
  return { entries, index: 0, selected: null, shownAt: now, records: [], mode, done: entries.length === 0 }
}

function advance(s: QuizState, now: number): QuizState {
  const index = s.index + 1
  if (index >= s.entries.length) return { ...s, selected: null, done: true }
  return { ...s, index, selected: null, shownAt: now }
}

export function quizReducer(s: QuizState, a: QuizAction): QuizState {
  if (s.done) return s
  if (a.type === 'answer') {
    if (s.selected !== null) return s
    const entry = s.entries[s.index]
    const f = entryFields(entry)
    const record: AnswerRecord = {
      entryId: entryId(entry),
      topic: f.topic,
      choice: a.choice,
      correct: a.choice === f.answer,
      ms: Math.max(0, a.now - s.shownAt)
    }
    const next = { ...s, records: [...s.records, record] }
    return s.mode === 'deferred' ? advance(next, a.now) : { ...next, selected: a.choice }
  }
  if (s.mode === 'deferred' || s.selected === null) return s
  return advance(s, a.now)
}

export function toAttempt(r: AnswerRecord, at: string): GrammarAttempt {
  return { itemId: r.entryId, topic: r.topic, correct: r.correct, ms: r.ms, at }
}
```

- [ ] **Step 4: Run the reducer test to verify it passes**

Run: `npx vitest run tests/unit/renderer/quizReducer.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing runner tests**

`tests/unit/renderer/QuizRunner.test.tsx`:
```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { QuizEntry } from '@shared/quiz'
import { QuizRunner } from '@renderer/features/grammar/QuizRunner'
import { makePart5, makePart6 } from '../../fixtures/items'

const p5a = makePart5({ stem: 'First ____ stem.', choices: ['w', 'x', 'y', 'z'], answer: 1 })
const p5b = makePart5({ stem: 'Second ____ stem.', choices: ['k', 'l', 'm', 'n'], answer: 0 })
const entries: QuizEntry[] = [
  { kind: 'p5', item: p5a },
  { kind: 'p5', item: p5b }
]

describe('QuizRunner', () => {
  it('instant mode: reveals the explanation, then moves to the next question', () => {
    const onAnswer = vi.fn()
    render(<QuizRunner entries={entries} mode="instant" lang="en" onAnswer={onAnswer} onFinish={() => {}} />)
    expect(screen.getByText('Question 1 of 2')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '(B) x' }))
    expect(onAnswer).toHaveBeenCalledWith(expect.objectContaining({ entryId: p5a.id, correct: true }))
    expect(screen.getByText(p5a.explain.en)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Show Thai explanation' }))
    expect(screen.getByText(p5a.explain.th)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Second ____ stem.')).toBeTruthy()
  })

  it('deferred mode: shows the score and calls onFinish once', () => {
    const onFinish = vi.fn()
    render(<QuizRunner entries={entries} mode="deferred" lang="en" onAnswer={() => {}} onFinish={onFinish} />)
    fireEvent.click(screen.getByRole('button', { name: '(A) w' }))
    fireEvent.click(screen.getByRole('button', { name: '(A) k' }))
    expect(screen.getByText('Score: 1 / 2')).toBeTruthy()
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onFinish.mock.calls[0][0]).toHaveLength(2)
  })

  it('renders a Part 6 passage with the current blank marked', () => {
    const set = makePart6()
    const { container } = render(
      <QuizRunner entries={[{ kind: 'p6', set, blank: 1 }]} mode="instant" lang="en" onAnswer={() => {}} onFinish={() => {}} />
    )
    expect(screen.getByText(set.title)).toBeTruthy()
    expect(container.querySelector('mark.blank.current')?.textContent).toBe('[2] ____')
  })

  it('shows an empty message and does not finish when there are no entries', () => {
    const onFinish = vi.fn()
    render(<QuizRunner entries={[]} mode="instant" lang="en" onAnswer={() => {}} onFinish={onFinish} />)
    expect(screen.getByText('No questions available yet.')).toBeTruthy()
    expect(onFinish).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx vitest run tests/unit/renderer/QuizRunner.test.tsx`
Expected: FAIL. `QuizRunner` is not found.

- [ ] **Step 7: Implement the components**

`src/renderer/src/features/grammar/QuestionView.tsx`:
```tsx
import { useState } from 'react'
import { entryFields, type QuizEntry } from '@shared/quiz'
import type { Part6Set } from '@shared/types'
import { t, type Lang } from '../../app/i18n'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  entry: QuizEntry
  lang: Lang
  selected: number | null
  reveal: boolean
  onChoose(choice: number): void
}

function Passage({ set, current }: { set: Part6Set; current: number }) {
  const parts = set.passage.split(/(\{\{[1-4]\}\})/)
  return (
    <div className="passage">
      <h3>{set.title}</h3>
      <p>
        {parts.map((part, i) => {
          const m = /^\{\{([1-4])\}\}$/.exec(part)
          if (!m) return <span key={i}>{part}</span>
          const n = Number(m[1])
          return (
            <mark key={i} className={n - 1 === current ? 'blank current' : 'blank'}>
              [{n}] ____
            </mark>
          )
        })}
      </p>
    </div>
  )
}

export function QuestionView({ entry, lang, selected, reveal, onChoose }: Props) {
  const [showOther, setShowOther] = useState(false)
  const f = entryFields(entry)
  const explainLang: Lang = showOther ? (lang === 'th' ? 'en' : 'th') : lang

  return (
    <div className="question">
      {entry.kind === 'p5' ? <p className="stem">{entry.item.stem}</p> : <Passage set={entry.set} current={entry.blank} />}
      <ol className="choices">
        {f.choices.map((choice, i) => {
          const state = reveal
            ? i === f.answer
              ? 'correct'
              : i === selected
                ? 'wrong'
                : ''
            : i === selected
              ? 'selected'
              : ''
          return (
            <li key={i}>
              <button
                type="button"
                className={`choice ${state}`}
                disabled={selected !== null}
                onClick={() => onChoose(i)}
              >
                ({LETTERS[i]}) {choice}
              </button>
            </li>
          )
        })}
      </ol>
      {reveal && (
        <div className="explain">
          <p>
            <strong>{t(lang, 'trapLabel')}:</strong> {f.trap}
          </p>
          <p>{f.explain[explainLang]}</p>
          <button type="button" className="link" onClick={() => setShowOther((v) => !v)}>
            {t(lang, showOther ? 'showMainLang' : 'showOtherLang')}
          </button>
        </div>
      )}
    </div>
  )
}
```

`src/renderer/src/features/grammar/QuizSummary.tsx`:
```tsx
import { entryFields, entryId, type QuizEntry } from '@shared/quiz'
import { t, type Lang } from '../../app/i18n'
import type { AnswerRecord } from './quizReducer'

interface Props {
  entries: QuizEntry[]
  records: AnswerRecord[]
  lang: Lang
  showReview: boolean
}

export function QuizSummary({ entries, records, lang, showReview }: Props) {
  const correct = records.filter((r) => r.correct).length
  return (
    <div className="summary">
      <h2>{t(lang, 'quizScore', { c: correct, n: records.length })}</h2>
      {showReview && (
        <ol className="review-list">
          {entries.map((entry, i) => {
            const r = records[i]
            const f = entryFields(entry)
            return (
              <li key={entryId(entry)} className={r?.correct ? 'ok' : 'bad'}>
                {entry.kind === 'p5' ? entry.item.stem : `${entry.set.title} [${entry.blank + 1}]`}
                <div>
                  {t(lang, 'yourAnswer')}: {r ? f.choices[r.choice] : '—'} · {t(lang, 'correctAnswer')}:{' '}
                  {f.choices[f.answer]}
                </div>
                <div className="muted">{f.explain[lang]}</div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
```

`src/renderer/src/features/grammar/QuizRunner.tsx`:
```tsx
import { useEffect, useReducer, useRef, useState } from 'react'
import { entryId, type QuizEntry } from '@shared/quiz'
import { t, type Lang } from '../../app/i18n'
import { QuestionView } from './QuestionView'
import { QuizSummary } from './QuizSummary'
import { initQuiz, quizReducer, type AnswerRecord, type QuizMode } from './quizReducer'

interface Props {
  entries: QuizEntry[]
  mode: QuizMode
  lang: Lang
  onAnswer(record: AnswerRecord): void
  onFinish(records: AnswerRecord[]): void
  /** Pace target in seconds for Part 5 questions. Omit to hide the timer. */
  paceSeconds?: number
  now?: () => number
}

function Elapsed({ since, limit, lang, now }: { since: number; limit: number; lang: Lang; now: () => number }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const s = Math.floor((now() - since) / 1000)
  return <span className={s > limit ? 'pace slow' : 'pace'}>{t(lang, 'seconds', { s })}</span>
}

export function QuizRunner({ entries, mode, lang, onAnswer, onFinish, paceSeconds, now = Date.now }: Props) {
  const [state, dispatch] = useReducer(quizReducer, undefined, () => initQuiz(entries, mode, now()))
  const reported = useRef(0)
  const finished = useRef(false)

  useEffect(() => {
    while (reported.current < state.records.length) {
      onAnswer(state.records[reported.current])
      reported.current++
    }
  }, [state.records, onAnswer])

  useEffect(() => {
    if (state.done && entries.length > 0 && !finished.current) {
      finished.current = true
      onFinish(state.records)
    }
  }, [state.done, state.records, entries.length, onFinish])

  if (entries.length === 0) return <p className="muted">{t(lang, 'quizEmpty')}</p>
  if (state.done) {
    return <QuizSummary entries={entries} records={state.records} lang={lang} showReview={mode === 'deferred'} />
  }

  const entry = state.entries[state.index]
  const isLast = state.index + 1 === entries.length
  return (
    <div className="quiz">
      <div className="quiz-head">
        <span>{t(lang, 'quizQuestionOf', { i: state.index + 1, n: entries.length })}</span>
        {paceSeconds !== undefined && entry.kind === 'p5' && (
          <Elapsed key={state.shownAt} since={state.shownAt} limit={paceSeconds} lang={lang} now={now} />
        )}
      </div>
      <QuestionView
        key={entryId(entry)}
        entry={entry}
        lang={lang}
        selected={state.selected}
        reveal={mode === 'instant' && state.selected !== null}
        onChoose={(choice) => dispatch({ type: 'answer', choice, now: now() })}
      />
      {mode === 'instant' && state.selected !== null && (
        <button type="button" className="primary" onClick={() => dispatch({ type: 'next', now: now() })}>
          {isLast ? t(lang, 'quizFinish') : t(lang, 'quizNext')}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx vitest run tests/unit/renderer`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/renderer/src/features/grammar tests/unit/renderer/quizReducer.test.ts tests/unit/renderer/QuizRunner.test.tsx
git commit -m "feat: add quiz engine with instant and deferred feedback"
```

---

### Task 10: Topic drill screens

**Files:**
- Create: `src/renderer/src/features/grammar/TopicListScreen.tsx`, `src/renderer/src/features/grammar/DrillScreen.tsx`
- Modify: `src/renderer/src/app/App.tsx` (add nav link and routes)

**Interfaces:**
- Consumes: `useApp`, `useT` (Task 8); `pickTopicDrill` (Task 4); `QuizRunner`, `toAttempt` and `AnswerRecord` (Task 9); `PART5_TOPICS` and `Part5Topic` (Task 1).
- Produces: routes `/topics` and `/drill/:topic`.

- [ ] **Step 1: Implement the screens**

`src/renderer/src/features/grammar/TopicListScreen.tsx`:
```tsx
import { Link } from 'react-router'
import { PART5_TOPICS } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'

export function TopicListScreen() {
  const { bank } = useApp()
  const { t, topic } = useT()
  return (
    <section>
      <h1>{t('topicsTitle')}</h1>
      <div className="topic-grid">
        {PART5_TOPICS.map((tp) => {
          const count = bank.part5.filter((i) => i.topic === tp).length
          const body = (
            <div className="card">
              <strong>{topic(tp)}</strong>
              <div className="muted">{t('topicsCount', { n: count })}</div>
            </div>
          )
          return count > 0 ? (
            <Link key={tp} to={`/drill/${tp}`}>
              {body}
            </Link>
          ) : (
            <div key={tp} aria-disabled="true" style={{ opacity: 0.5 }}>
              {body}
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

`src/renderer/src/features/grammar/DrillScreen.tsx`:
```tsx
import { useCallback, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { pickTopicDrill } from '@shared/quiz'
import { Part5Topic } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'
import { QuizRunner } from './QuizRunner'
import { toAttempt, type AnswerRecord } from './quizReducer'

export function DrillScreen() {
  const parsed = Part5Topic.safeParse(useParams().topic)
  const topicId = parsed.success ? parsed.data : null
  const { bank, recordGrammar } = useApp()
  const { lang, t, topic } = useT()
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)

  const entries = useMemo(
    () => (topicId ? pickTopicDrill(bank, topicId, 10) : []),
    // `run` is a dependency on purpose: bumping it reshuffles a fresh drill.
    [bank, topicId, run]
  )
  const onAnswer = useCallback(
    (r: AnswerRecord) => void recordGrammar(toAttempt(r, new Date().toISOString())),
    [recordGrammar]
  )
  const onFinish = useCallback(() => setDone(true), [])

  if (!topicId) return <Navigate to="/topics" replace />
  return (
    <section>
      <h1>{topic(topicId)}</h1>
      <QuizRunner
        key={`${topicId}-${run}`}
        entries={entries}
        mode="instant"
        lang={lang}
        onAnswer={onAnswer}
        onFinish={onFinish}
        paceSeconds={20}
      />
      {done && (
        <button
          type="button"
          onClick={() => {
            setDone(false)
            setRun((r) => r + 1)
          }}
        >
          {t('quizAgain')}
        </button>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Register the routes in `App.tsx`**

Add these imports:
```tsx
import { DrillScreen } from '../features/grammar/DrillScreen'
import { TopicListScreen } from '../features/grammar/TopicListScreen'
```

Add this nav link after the Home link:
```tsx
        <NavLink to="/topics">{t('navTopics')}</NavLink>
```

Add these routes inside `<Routes>`:
```tsx
          <Route path="/topics" element={<TopicListScreen />} />
          <Route path="/drill/:topic" element={<DrillScreen />} />
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm test`
Expected: PASS.

Run: `npm run dev`. Go to ฝึกตามหัวข้อ → รูปคำ (Word form).
Expected:
- "ข้อ 1 จาก 5" with a seconds counter.
- Answering shows green/red choices and a Thai explanation, with a toggle to English.
- After 5 questions the score appears, and ฝึกอีกครั้ง starts a reshuffled drill.
- Topics with 0 questions are greyed out.

Then check persistence: close the app and open `%APPDATA%\toeic-trainer\progress.json`. It should contain 5 `grammarAttempts`. (The folder name follows `package.json` `name`.)

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/features/grammar/TopicListScreen.tsx src/renderer/src/features/grammar/DrillScreen.tsx src/renderer/src/app/App.tsx
git commit -m "feat: add Part 5 topic list and drill screens"
```

---

### Task 11: Review queue and progress dashboard

**Files:**
- Create: `src/renderer/src/features/review/ReviewScreen.tsx`, `src/renderer/src/features/progress/ProgressView.tsx`, `src/renderer/src/features/progress/ProgressScreen.tsx`
- Modify: `src/renderer/src/app/App.tsx`
- Test: `tests/unit/renderer/ProgressView.test.tsx`

**Interfaces:**
- Consumes:
  - `dueIds`, `localDate` (Task 2); `resolveIds` (Task 4).
  - `topicStats`, `weakestTopics`, `estimateBand`, `TopicStat`, `Band` (Task 3).
  - `QuizRunner`, `toAttempt` (Task 9); `t`, `topicLabel`, `Lang` (Task 8).
- Produces:
  - Routes `/review` and `/progress`.
  - `<ProgressView stats weakest band lang onDrill />`

- [ ] **Step 1: Write the failing ProgressView test**

`tests/unit/renderer/ProgressView.test.tsx`:
```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProgressView } from '@renderer/features/progress/ProgressView'

describe('ProgressView', () => {
  const stats = [
    { topic: 'prepositions' as const, count: 10, accuracy: 0.5, avgMs: 15000 },
    { topic: 'transitions' as const, count: 6, accuracy: 0.4, avgMs: 20000 }
  ]

  it('shows the band estimate, topic rows and drill buttons only for Part 5 topics', () => {
    const onDrill = vi.fn()
    render(
      <ProgressView
        stats={stats}
        weakest={['transitions', 'prepositions']}
        band={{ low: 300, high: 350 }}
        lang="en"
        onDrill={onDrill}
      />
    )
    expect(screen.getByText('Estimated Reading band: 300–350')).toBeTruthy()
    expect(screen.getByText('50%')).toBeTruthy()
    expect(screen.getByText('15s')).toBeTruthy()
    const buttons = screen.getAllByRole('button', { name: 'Drill this' })
    expect(buttons).toHaveLength(1)
    fireEvent.click(buttons[0])
    expect(onDrill).toHaveBeenCalledWith('prepositions')
  })

  it('shows empty states', () => {
    render(<ProgressView stats={[]} weakest={[]} band={null} lang="en" onDrill={() => {}} />)
    expect(screen.getByText('Take a mixed test to see a score estimate.')).toBeTruthy()
    expect(screen.getByText('No attempts yet.')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/renderer/ProgressView.test.tsx`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement the progress files**

`src/renderer/src/features/progress/ProgressView.tsx`:
```tsx
import type { Band, TopicStat } from '@shared/scoring'
import { Part5Topic, type GrammarTopic } from '@shared/types'
import { t, topicLabel, type Lang } from '../../app/i18n'

interface Props {
  stats: TopicStat[]
  weakest: GrammarTopic[]
  band: Band | null
  lang: Lang
  onDrill(topic: Part5Topic): void
}

export function ProgressView({ stats, weakest, band, lang, onDrill }: Props) {
  return (
    <section>
      <h1>{t(lang, 'progressTitle')}</h1>
      <div className="card">
        {band ? (
          <>
            <h3>{t(lang, 'progressBand', { low: band.low, high: band.high })}</h3>
            <p className="muted">{t(lang, 'progressBandNote')}</p>
          </>
        ) : (
          <p className="muted">{t(lang, 'progressBandNone')}</p>
        )}
      </div>
      {weakest.length > 0 && (
        <div className="card">
          <h3>{t(lang, 'progressWeakest')}</h3>
          <ul>
            {weakest.map((topic) => {
              const p5 = Part5Topic.safeParse(topic)
              return (
                <li key={topic}>
                  {topicLabel(topic, lang)}{' '}
                  {p5.success && (
                    <button type="button" onClick={() => onDrill(p5.data)}>
                      {t(lang, 'progressDrill')}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
      <div className="card">
        {stats.length === 0 ? (
          <p className="muted">{t(lang, 'progressNoData')}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t(lang, 'progressTopic')}</th>
                <th>{t(lang, 'progressAccuracy')}</th>
                <th>{t(lang, 'progressAvgTime')}</th>
                <th>{t(lang, 'progressAttempts')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.topic}>
                  <td>{topicLabel(s.topic, lang)}</td>
                  <td>{Math.round(s.accuracy * 100)}%</td>
                  <td>{t(lang, 'seconds', { s: Math.round(s.avgMs / 1000) })}</td>
                  <td>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
```

`src/renderer/src/features/progress/ProgressScreen.tsx`:
```tsx
import { useNavigate } from 'react-router'
import { estimateBand, topicStats, weakestTopics } from '@shared/scoring'
import { useApp } from '../../app/AppContext'
import { ProgressView } from './ProgressView'

export function ProgressScreen() {
  const { progress, settings } = useApp()
  const navigate = useNavigate()
  const stats = topicStats(progress.grammarAttempts)
  return (
    <ProgressView
      stats={stats}
      weakest={weakestTopics(stats)}
      band={estimateBand(progress.mixedTests)}
      lang={settings.language}
      onDrill={(topic) => void navigate(`/drill/${topic}`)}
    />
  )
}
```

- [ ] **Step 4: Implement the review screen**

`src/renderer/src/features/review/ReviewScreen.tsx`:
```tsx
import { useCallback, useState } from 'react'
import { localDate } from '@shared/dates'
import { dueIds } from '@shared/leitner'
import { resolveIds } from '@shared/quiz'
import { useApp, useT } from '../../app/AppContext'
import { QuizRunner } from '../grammar/QuizRunner'
import { toAttempt, type AnswerRecord } from '../grammar/quizReducer'

export function ReviewScreen() {
  const { bank, progress, recordGrammar } = useApp()
  const { lang, t } = useT()
  // Freeze the queue when the screen opens so answering does not reshuffle it mid-session.
  const [entries] = useState(() => resolveIds(bank, dueIds(progress.leitner, localDate())))
  const onAnswer = useCallback(
    (r: AnswerRecord) => void recordGrammar(toAttempt(r, new Date().toISOString())),
    [recordGrammar]
  )
  const onFinish = useCallback(() => {}, [])

  return (
    <section>
      <h1>{t('reviewTitle')}</h1>
      {entries.length === 0 ? (
        <p className="muted">{t('reviewNothing')}</p>
      ) : (
        <QuizRunner entries={entries} mode="instant" lang={lang} onAnswer={onAnswer} onFinish={onFinish} />
      )}
    </section>
  )
}
```

- [ ] **Step 5: Register the routes in `App.tsx`**

Add these imports:
```tsx
import { ProgressScreen } from '../features/progress/ProgressScreen'
import { ReviewScreen } from '../features/review/ReviewScreen'
```

Add these nav links after the Topic drills link:
```tsx
        <NavLink to="/review">{t('navReview')}</NavLink>
        <NavLink to="/progress">{t('navProgress')}</NavLink>
```

Add these routes:
```tsx
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
```

- [ ] **Step 6: Verify**

Run: `npm test && npm run typecheck`
Expected: PASS.

Run: `npm run dev`. Answer a word-form question wrong in a drill. Then open `progress.json` and set that item's `leitner` `due` to today's date (YYYY-MM-DD). Restart the app.
Expected:
- Home shows "มี 1 ข้อที่ถึงเวลาทบทวน" with a เริ่มทบทวน button.
- The review shows that question. Answering it correctly moves it to box 2.
- The Progress page lists the topic with accuracy and average time.

- [ ] **Step 7: Commit**

```bash
git add src/renderer/src/features/review src/renderer/src/features/progress src/renderer/src/app/App.tsx tests/unit/renderer/ProgressView.test.tsx
git commit -m "feat: add Leitner review queue and progress dashboard"
```

---

### Task 12: Mixed test (Part 5 + Part 6)

**Files:**
- Create: `src/renderer/src/features/grammar/MixedTestScreen.tsx`
- Modify: `src/renderer/src/app/App.tsx`

**Interfaces:**
- Consumes: `pickMixedTest` and `QuizEntry` (Task 4); `QuizRunner`, `toAttempt`, `AnswerRecord` (Task 9); `recordGrammar`, `recordMixedTest` and `useT` (Task 8).
- Produces: route `/mixed`. Each completed test is saved as a `MixedTestResult`.

- [ ] **Step 1: Implement the screen**

`src/renderer/src/features/grammar/MixedTestScreen.tsx`:
```tsx
import { useCallback, useRef, useState } from 'react'
import { pickMixedTest, type QuizEntry } from '@shared/quiz'
import { useApp, useT } from '../../app/AppContext'
import { QuizRunner } from './QuizRunner'
import { toAttempt, type AnswerRecord } from './quizReducer'

const P5_COUNT = 30
const P6_COUNT = 4

export function MixedTestScreen() {
  const { bank, recordGrammar, recordMixedTest } = useApp()
  const { lang, t } = useT()
  const [entries, setEntries] = useState<QuizEntry[] | null>(null)
  const [run, setRun] = useState(0)
  const startedAt = useRef(0)

  const start = () => {
    startedAt.current = Date.now()
    setEntries(pickMixedTest(bank, Math.random, P5_COUNT, P6_COUNT))
    setRun((r) => r + 1)
  }
  const onAnswer = useCallback(
    (r: AnswerRecord) => void recordGrammar(toAttempt(r, new Date().toISOString())),
    [recordGrammar]
  )
  const onFinish = useCallback(
    (records: AnswerRecord[]) =>
      void recordMixedTest({
        at: new Date().toISOString(),
        correct: records.filter((r) => r.correct).length,
        total: records.length,
        ms: Date.now() - startedAt.current
      }),
    [recordMixedTest]
  )

  return (
    <section>
      <h1>{t('mixedTitle')}</h1>
      {entries === null ? (
        <div className="card">
          <p>{t('mixedIntro', { p5: P5_COUNT, p6: P6_COUNT })}</p>
          <button type="button" className="primary" onClick={start}>
            {t('mixedStart')}
          </button>
        </div>
      ) : (
        <>
          <QuizRunner
            key={run}
            entries={entries}
            mode="deferred"
            lang={lang}
            onAnswer={onAnswer}
            onFinish={onFinish}
            paceSeconds={20}
          />
          <button type="button" onClick={start}>
            {t('quizAgain')}
          </button>
        </>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Register the route in `App.tsx`**

Add this import:
```tsx
import { MixedTestScreen } from '../features/grammar/MixedTestScreen'
```

Add this nav link after the Topic drills link:
```tsx
        <NavLink to="/mixed">{t('navMixed')}</NavLink>
```

Add this route:
```tsx
          <Route path="/mixed" element={<MixedTestScreen />} />
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm test`
Expected: PASS.

Run: `npm run dev`. Open แบบทดสอบรวม and start the test.
Expected:
- With the seed bank: 10 Part 5 questions, then 4 blanks of the renovation email, each showing the passage with the current blank highlighted.
- No explanations appear until the end. The summary lists every answer with explanations.
- The Progress page now shows an estimated Reading band.

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/features/grammar/MixedTestScreen.tsx src/renderer/src/app/App.tsx
git commit -m "feat: add timed mixed Part 5 and Part 6 test"
```

---

### Task 13: End-to-end smoke test (Playwright + Electron)

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/grammar.spec.ts`
- Modify: `package.json` (add the `test:e2e` script)

**Interfaces:**
- Consumes:
  - The `TOEIC_USER_DATA` env override (Task 7 `src/main/index.ts`).
  - Seed word-form content (Task 6). English labels (Task 8).

- [ ] **Step 1: Install Playwright and add the script**

Run: `npm install -D @playwright/test`

Add to `package.json` `scripts`:
```json
    "test:e2e": "electron-vite build && playwright test"
```

- [ ] **Step 2: Write the E2E test**

`playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1
})
```

`tests/e2e/grammar.spec.ts`:
```ts
import { mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { _electron as electron, expect, test } from '@playwright/test'

test('a topic drill answer is saved to progress', async () => {
  const userData = mkdtempSync(join(tmpdir(), 'toeic-e2e-'))
  writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))

  const app = await electron.launch({ args: ['.'], env: { ...process.env, TOEIC_USER_DATA: userData } })
  const page = await app.firstWindow()

  await page.locator('nav').getByRole('link', { name: 'Topic drills' }).click()
  await page.getByRole('link', { name: /Word form/ }).click()
  await expect(page.getByText(/Question 1 of \d+/)).toBeVisible()
  await page.locator('button.choice').first().click()
  await expect(page.locator('.explain')).toBeVisible()

  await app.close()
  const progress = JSON.parse(readFileSync(join(userData, 'progress.json'), 'utf8'))
  expect(progress.grammarAttempts).toHaveLength(1)
  expect(progress.grammarAttempts[0].topic).toBe('word-form')
})
```

- [ ] **Step 3: Run the E2E test**

Run: `npm run test:e2e`
Expected: `1 passed`.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/e2e package.json package-lock.json
git commit -m "test: add Electron end-to-end smoke test for topic drill"
```

---

### Task 14: Content generation pipeline (Claude)

**Files:**
- Create: `scripts/lib/gen.ts`, `scripts/lib/claude.ts`, `scripts/generate.ts`
- Modify: `package.json` (add the `gen` script)
- Test: `tests/unit/gen.test.ts`

**Interfaces:**
- Consumes:
  - From types: `Part5Item`, `Part6Set`, `Part5Topic`, `GRAMMAR_TOPICS`, `formatIssues`.
  - `loadContent` (Task 6).
- Produces:
  - Schemas `GenPart5`, `GenPart6`, `CheckResult`.
  - `nextNumber(ids: string[]): number`
  - `toPart5Drafts(gen: GenPart5, topic: Part5Topic, start: number): { items: Part5Item[]; errors: string[] }`
  - `toPart6Drafts(gen: GenPart6, start: number): { items: Part6Set[]; errors: string[] }`
  - `part5Prompt(topic, count, difficulty, examples: Part5Item[], avoidStems: string[]): Prompt`
  - `part6Prompt(count, difficulty, examples: Part6Set[]): Prompt`
  - `checkPrompt(items: unknown[]): Prompt`
  - `applyVerdicts<T extends { flag?: string }>(items: T[], verdicts: CheckResult['verdicts']): T[]`
  - `ask<T>(schema, system, user): Promise<T>`
  - CLI: `npm run gen -- --part 5 --topic <topic> --count <n> --difficulty <1-5>` and `npm run gen -- --part 6 --count <n> --difficulty <1-5>`. Output is written to `content/drafts/`.
  - `Prompt` is `{ system: string; user: string }`.

- [ ] **Step 1: Install dependencies and add the script**

Run: `npm install -D @anthropic-ai/sdk tsx`

Add to `package.json` `scripts`:
```json
    "gen": "tsx scripts/generate.ts"
```

- [ ] **Step 2: Write the failing tests for the pure helpers**

`tests/unit/gen.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import {
  applyVerdicts,
  checkPrompt,
  nextNumber,
  part5Prompt,
  toPart5Drafts,
  toPart6Drafts,
  type GenPart5,
  type GenPart6
} from '../../scripts/lib/gen'
import { makePart5 } from '../fixtures/items'

const genItem = (over: Partial<GenPart5['items'][number]> = {}): GenPart5['items'][number] => ({
  stem: 'The manager ____ approved the budget.',
  choices: ['final', 'finally', 'finalize', 'finality'],
  answer: 1,
  trap: 'adverb before verb',
  explain_en: 'An adverb modifies approved.',
  explain_th: 'ต้องใช้ adverb ขยาย approved',
  difficulty: 3,
  ...over
})

describe('nextNumber', () => {
  it('returns one more than the highest 4-digit suffix', () => {
    expect(nextNumber(['p5-word-form-0003', 'p5-word-form-0010'])).toBe(11)
    expect(nextNumber([])).toBe(1)
  })
})

describe('toPart5Drafts', () => {
  it('assigns sequential ids to valid items and reports invalid ones', () => {
    const gen: GenPart5 = { items: [genItem(), genItem({ choices: ['a', 'b'] }), genItem()] }
    const { items, errors } = toPart5Drafts(gen, 'word-form', 7)
    expect(items.map((i) => i.id)).toEqual(['p5-word-form-0007', 'p5-word-form-0008'])
    expect(items[0]).toMatchObject({ part: 5, topic: 'word-form', status: 'draft', explain: { en: expect.any(String), th: expect.any(String) } })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/^item 1: choices/)
  })
})

describe('toPart6Drafts', () => {
  it('builds a valid draft set', () => {
    const blank = (topic: string) => ({ topic, ...genItem(), stem: undefined })
    const gen: GenPart6 = {
      sets: [
        {
          title: 'Notice: Parking',
          passage: 'A {{1}} B {{2}} C {{3}} D {{4}}',
          blanks: [blank('word-form'), blank('sentence-insertion'), blank('transitions'), blank('prepositions')]
        }
      ]
    }
    const { items, errors } = toPart6Drafts(gen, 3)
    expect(errors).toEqual([])
    expect(items[0].id).toBe('p6-0003')
    expect(items[0].status).toBe('draft')
  })
})

describe('applyVerdicts', () => {
  it('flags rejected and unreviewed items, keeps approved ones unchanged', () => {
    const items = [makePart5(), makePart5(), makePart5()]
    const out = applyVerdicts(items, [
      { index: 0, ok: true, reason: 'fine' },
      { index: 1, ok: false, reason: 'two correct answers' }
    ])
    expect(out[0].flag).toBeUndefined()
    expect(out[1].flag).toBe('two correct answers')
    expect(out[2].flag).toBe('not reviewed by self-check')
  })
})

describe('prompts', () => {
  it('includes topic, count, difficulty and stems to avoid', () => {
    const p = part5Prompt('word-form', 10, 3, [makePart5()], ['Avoid this ____ stem.'])
    expect(p.user).toContain('10')
    expect(p.user).toContain('"word-form"')
    expect(p.user).toContain('difficulty 3')
    expect(p.user).toContain('Avoid this ____ stem.')
    expect(p.system).toContain('____')
  })
  it('numbers items for the self-check', () => {
    expect(checkPrompt([{ a: 1 }, { b: 2 }]).user).toContain('"index": 1')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run tests/unit/gen.test.ts`
Expected: FAIL. `../../scripts/lib/gen` is not found.

- [ ] **Step 4: Implement `scripts/lib/gen.ts`**

```ts
import { z } from 'zod'
import {
  GRAMMAR_TOPICS,
  Part5Item,
  Part6Set,
  formatIssues,
  type Part5Topic
} from '../../src/shared/types'

// Generation schemas are deliberately loose (no length/regex limits) so they work with
// structured outputs; strict validation happens afterwards with the app's own schemas.
const genChoiceFields = {
  choices: z.array(z.string()),
  answer: z.number().int(),
  trap: z.string(),
  explain_en: z.string(),
  explain_th: z.string(),
  difficulty: z.number().int()
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
      blanks: z.array(z.object({ topic: z.string(), ...genChoiceFields }))
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
        explain: { en: b.explain_en, th: b.explain_th }
      })),
      status: 'draft'
    })
    if (r.success) items.push(r.data)
    else errors.push(`set ${i}: ${formatIssues(r.error)}`)
  })
  return { items, errors }
}

export function applyVerdicts<T extends { flag?: string }>(items: T[], verdicts: CheckResult['verdicts']): T[] {
  return items.map((item, i) => {
    const v = verdicts.find((x) => x.index === i)
    if (!v) return { ...item, flag: 'not reviewed by self-check' }
    return v.ok ? item : { ...item, flag: v.reason }
  })
}

const DIFFICULTY_GUIDE = `Difficulty scale for TOEIC 600–850+ learners:
1 = very easy, basic form
2 = common pattern; distractors are clearly wrong to an intermediate learner
3 = typical TOEIC item with one tempting distractor
4 = advanced; two plausible distractors, the whole sentence must be read carefully
5 = hardest TOEIC items; subtle collocation, register or structure differences`

const EXPLAIN_RULES = `- "trap": a short English label naming exactly what is tested, e.g. "adverb modifies the verb 'implemented'".
- "explain_en": 1–3 sentences on why the answer is right and why the most tempting distractor is wrong.
- "explain_th": the same explanation in natural, friendly Thai for Thai learners. Keep key grammar terms in English in parentheses, e.g. คำกริยาวิเศษณ์ (adverb).
- "answer" is the 0-based index of the correct choice. Vary the position of the correct answer across items.
- Never copy real ETS TOEIC questions; write original items.`

export function part5Prompt(
  topic: Part5Topic,
  count: number,
  difficulty: number,
  examples: Part5Item[],
  avoidStems: string[]
): Prompt {
  const system = `You write original practice questions in the style of TOEIC Reading Part 5 (incomplete sentences) for Thai learners targeting a score of 600–850+.
Rules:
- Business or workplace context: offices, hiring, travel, shipping, finance, events, customer service. Natural professional English.
- Each stem contains exactly one blank written as ____ (four underscores).
- Exactly four choices. Exactly one choice is correct in both grammar and meaning; each other choice must be clearly wrong for a specific reason.
- For word-form items, all four choices come from the same word family.
${EXPLAIN_RULES}
${DIFFICULTY_GUIDE}`
  const user = `Write ${count} new Part 5 questions that test the grammar topic "${topic}" at difficulty ${difficulty}.

Match the style and quality of these approved examples:
${JSON.stringify(
  examples.map((e) => ({ stem: e.stem, choices: e.choices, answer: e.answer, trap: e.trap })),
  null,
  2
)}

Do not reuse or closely paraphrase any of these existing stems:
${avoidStems.map((s) => `- ${s}`).join('\n') || '- (none)'}`
  return { system, user }
}

export function part6Prompt(count: number, difficulty: number, examples: Part6Set[]): Prompt {
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

Use different subjects from the examples.`
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
```

- [ ] **Step 5: Run the helper tests to verify they pass**

Run: `npx vitest run tests/unit/gen.test.ts`
Expected: PASS.

- [ ] **Step 6: Implement the Claude call and the CLI**

`scripts/lib/claude.ts`:
```ts
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { z } from 'zod'

export const MODEL = 'claude-opus-5-5'

// Credentials resolve from ANTHROPIC_API_KEY or an `ant auth login` profile.
const client = new Anthropic()

export async function ask<S extends z.ZodType>(schema: S, system: string, user: string): Promise<z.infer<S>> {
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { effort: 'high', format: zodOutputFormat(schema) }
  })
  if (res.stop_reason === 'refusal') throw new Error('Claude declined this request; try again or change the topic.')
  if (res.stop_reason === 'max_tokens') throw new Error('Output was truncated (max_tokens). Use a smaller --count.')
  if (!res.parsed_output) throw new Error('Claude returned output that did not match the schema.')
  return res.parsed_output
}
```
(If TypeScript rejects the generic `zodOutputFormat(schema)` call, change the signature to accept a concrete schema per call site. Let the compiler error guide the fix; do not guess other SDK names.)

`scripts/generate.ts`:
```ts
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { loadContent } from '../src/main/content'
import { Part5Topic, type Part5Item, type Part6Set } from '../src/shared/types'
import { ask } from './lib/claude'
import {
  CheckResult,
  GenPart5,
  GenPart6,
  applyVerdicts,
  checkPrompt,
  nextNumber,
  part5Prompt,
  part6Prompt,
  toPart5Drafts,
  toPart6Drafts
} from './lib/gen'

const CONTENT = 'content'
const DRAFTS = join(CONTENT, 'drafts')
const P5_BATCH = 10
const P6_BATCH = 3

function draftIds(): string[] {
  if (!existsSync(DRAFTS)) return []
  return readdirSync(DRAFTS)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => (JSON.parse(readFileSync(join(DRAFTS, f), 'utf8')) as { id: string }[]).map((x) => x.id))
}

async function selfCheck<T extends { flag?: string }>(items: T[]): Promise<T[]> {
  if (items.length === 0) return items
  const p = checkPrompt(items)
  const result = await ask(CheckResult, p.system, p.user)
  return applyVerdicts(items, result.verdicts)
}

function save(name: string, items: { flag?: string }[]): void {
  const file = join(DRAFTS, name)
  writeFileSync(file, JSON.stringify(items, null, 2) + '\n', 'utf8')
  const flagged = items.filter((i) => i.flag).length
  console.log(`Wrote ${items.length} drafts (${flagged} flagged) to ${file}`)
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      part: { type: 'string' },
      topic: { type: 'string' },
      count: { type: 'string', default: '10' },
      difficulty: { type: 'string', default: '3' }
    }
  })
  const count = Number(values.count)
  const difficulty = Number(values.difficulty)
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new Error('--count must be an integer from 1 to 50')
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    throw new Error('--difficulty must be an integer from 1 to 5')
  }

  const { bank } = loadContent(CONTENT)
  mkdirSync(DRAFTS, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const known = [...bank.part5.map((i) => i.id), ...bank.part6.map((s) => s.id), ...draftIds()]

  if (values.part === '5') {
    const topic = Part5Topic.parse(values.topic)
    const existing = bank.part5.filter((i) => i.topic === topic)
    const examples = (existing.length > 0 ? existing : bank.part5).slice(0, 3)
    let start = nextNumber(known.filter((id) => id.startsWith(`p5-${topic}-`)))
    const all: Part5Item[] = []
    for (let left = count; left > 0; left -= P5_BATCH) {
      const n = Math.min(P5_BATCH, left)
      const p = part5Prompt(topic, n, difficulty, examples, [...existing, ...all].map((i) => i.stem))
      const { items, errors } = toPart5Drafts(await ask(GenPart5, p.system, p.user), topic, start)
      for (const e of errors) console.warn('[invalid, skipped]', e)
      start += items.length
      all.push(...items)
    }
    save(`part5-${topic}-${stamp}.json`, await selfCheck(all))
  } else if (values.part === '6') {
    const examples = bank.part6.slice(0, 2)
    let start = nextNumber(known.filter((id) => id.startsWith('p6-')))
    const all: Part6Set[] = []
    for (let left = count; left > 0; left -= P6_BATCH) {
      const n = Math.min(P6_BATCH, left)
      const p = part6Prompt(n, difficulty, examples)
      const { items, errors } = toPart6Drafts(await ask(GenPart6, p.system, p.user), start)
      for (const e of errors) console.warn('[invalid, skipped]', e)
      start += items.length
      all.push(...items)
    }
    save(`part6-${stamp}.json`, await selfCheck(all))
  } else {
    throw new Error('--part must be 5 or 6')
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
```

- [ ] **Step 7: Typecheck and run a small live generation**

Run: `npm run typecheck && npm test`
Expected: PASS.

Run (needs `ANTHROPIC_API_KEY` or an `ant auth login` profile; costs a few cents):
`npm run gen -- --part 5 --topic conditionals --count 3 --difficulty 3`
Expected: prints `Wrote 3 drafts (N flagged) to content\drafts\part5-conditionals-<stamp>.json`. The file holds 3 items with ids `p5-conditionals-0001`…`0003` and `status: "draft"`. `npm test` still passes, because drafts are not loaded.

- [ ] **Step 8: Commit**

Commit the code only. Do not commit the trial draft file.

```bash
git add scripts tests/unit/gen.test.ts package.json package-lock.json
git commit -m "feat: add Claude-powered question generation with self-check"
```

---

### Task 15: Dev-only content review screen

**Files:**
- Create: `src/main/drafts.ts`, `src/renderer/src/features/content-review/ContentReviewScreen.tsx`
- Modify: `src/shared/api.ts`, `src/main/ipc.ts`, `src/preload/index.ts`, `src/renderer/src/app/App.tsx`
- Test: `tests/unit/drafts.test.ts`

**Interfaces:**
- Consumes:
  - `writeJsonAtomic` (Task 5); `Part5Item`, `Part6Set`, `formatIssues` (Task 1).
  - `registerIpc` / `IpcDeps` (Task 7); `useApp().reloadBank` and `isDev` (Task 8).
- Produces:
  - `interface DraftEntry { file: string; id: string; item: Record<string, unknown> }`
  - `type DraftResult = { ok: true } | { ok: false; error: string }`
  - `listDrafts(root: string): DraftEntry[]`
  - `approveDraft(root: string, file: string, id: string, edited: unknown): DraftResult`
    - p5 items go into `grammar/part5/<topic>.json`; p6 sets go into `grammar/part6/sets.json`.
    - The item is removed from the draft file, and the draft file is deleted when empty.
  - `rejectDraft(root: string, file: string, id: string): void`
  - `Api.dev` gains `listDrafts()`, `approveDraft(file, id, item)` and `rejectDraft(file, id)`.
  - Route `/dev/content`, shown only when `isDev`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/drafts.test.ts`:
```ts
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'
import { approveDraft, listDrafts, rejectDraft } from '../../src/main/drafts'
import { makePart5, makePart6 } from '../fixtures/items'

let root: string
const draftFile = 'part5-word-form-x.json'
const readJson = (rel: string) => JSON.parse(readFileSync(join(root, rel), 'utf8'))

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'toeic-drafts-'))
  mkdirSync(join(root, 'drafts'))
})

describe('drafts', () => {
  it('lists draft items with their file', () => {
    const a = makePart5({ status: 'draft' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a]))
    expect(listDrafts(root)).toEqual([{ file: draftFile, id: a.id, item: a }])
  })

  it('approves a Part 5 draft into its topic file and deletes the empty draft file', () => {
    const a = makePart5({ status: 'draft', flag: 'check me' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a]))
    expect(approveDraft(root, draftFile, a.id, a)).toEqual({ ok: true })
    const saved = readJson('grammar/part5/word-form.json')
    expect(saved).toHaveLength(1)
    expect(saved[0].status).toBe('approved')
    expect(saved[0].flag).toBeUndefined()
    expect(existsSync(join(root, 'drafts', draftFile))).toBe(false)
  })

  it('approves a Part 6 draft into sets.json and keeps the other drafts', () => {
    const s1 = makePart6({ status: 'draft' })
    const s2 = makePart6({ status: 'draft' })
    writeFileSync(join(root, 'drafts', 'part6-x.json'), JSON.stringify([s1, s2]))
    expect(approveDraft(root, 'part6-x.json', s1.id, s1)).toEqual({ ok: true })
    expect(readJson('grammar/part6/sets.json')).toHaveLength(1)
    expect(readJson('drafts/part6-x.json').map((x: { id: string }) => x.id)).toEqual([s2.id])
  })

  it('rejects an invalid edit and leaves files unchanged', () => {
    const a = makePart5({ status: 'draft' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a]))
    const r = approveDraft(root, draftFile, a.id, { ...a, choices: ['only one'] })
    expect(r.ok).toBe(false)
    expect(existsSync(join(root, 'grammar/part5/word-form.json'))).toBe(false)
    expect(readJson(`drafts/${draftFile}`)).toHaveLength(1)
  })

  it('refuses to change the id', () => {
    const a = makePart5({ status: 'draft' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a]))
    const r = approveDraft(root, draftFile, a.id, { ...a, id: 'p5-word-form-9999' })
    expect(r).toEqual({ ok: false, error: 'id must not be changed' })
  })

  it('rejectDraft removes the item', () => {
    const a = makePart5({ status: 'draft' })
    const b = makePart5({ status: 'draft' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a, b]))
    rejectDraft(root, draftFile, a.id)
    expect(readJson(`drafts/${draftFile}`).map((x: { id: string }) => x.id)).toEqual([b.id])
  })

  it('refuses file names outside the drafts folder', () => {
    expect(() => rejectDraft(root, '../grammar/x.json', 'p5-word-form-0001')).toThrow(/invalid draft file/)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/drafts.test.ts`
Expected: FAIL. `../../src/main/drafts` is not found.

- [ ] **Step 3: Add the draft types to `src/shared/api.ts`**

Add these exports after the imports:
```ts
export interface DraftEntry {
  file: string
  id: string
  item: Record<string, unknown>
}

export type DraftResult = { ok: true } | { ok: false; error: string }
```

Add these entries to `IPC`:
```ts
  devListDrafts: 'dev:listDrafts',
  devApproveDraft: 'dev:approveDraft',
  devRejectDraft: 'dev:rejectDraft'
```

Replace the `dev` member of `Api` with:
```ts
  dev: {
    isDev(): Promise<boolean>
    listDrafts(): Promise<DraftEntry[]>
    approveDraft(file: string, id: string, item: unknown): Promise<DraftResult>
    rejectDraft(file: string, id: string): Promise<void>
  }
```

- [ ] **Step 4: Implement `src/main/drafts.ts`**

```ts
import { existsSync, readFileSync, readdirSync, unlinkSync } from 'fs'
import { basename, join } from 'path'
import type { DraftEntry, DraftResult } from '@shared/api'
import { Part5Item, Part6Set, formatIssues } from '@shared/types'
import { writeJsonAtomic } from './jsonFile'

type Raw = Record<string, unknown>

const draftsDir = (root: string) => join(root, 'drafts')

function safeFile(file: string): string {
  if (basename(file) !== file || !file.endsWith('.json')) throw new Error(`invalid draft file name: ${file}`)
  return file
}

function readArray(path: string): Raw[] {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Raw[]) : []
}

function removeFromDraft(root: string, file: string, id: string): void {
  const path = join(draftsDir(root), safeFile(file))
  const rest = readArray(path).filter((x) => x.id !== id)
  if (rest.length === 0) {
    if (existsSync(path)) unlinkSync(path)
  } else {
    writeJsonAtomic(path, rest)
  }
}

export function listDrafts(root: string): DraftEntry[] {
  const dir = draftsDir(root)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((file) => readArray(join(dir, file)).map((item) => ({ file, id: String(item.id), item })))
}

export function approveDraft(root: string, file: string, id: string, edited: unknown): DraftResult {
  safeFile(file)
  if (typeof edited !== 'object' || edited === null) return { ok: false, error: 'item must be an object' }
  const candidate = { ...(edited as Raw), status: 'approved', flag: undefined }

  let parsedId: string
  let target: string
  let data: unknown
  if (id.startsWith('p5-')) {
    const r = Part5Item.safeParse(candidate)
    if (!r.success) return { ok: false, error: formatIssues(r.error) }
    parsedId = r.data.id
    target = join(root, 'grammar', 'part5', `${r.data.topic}.json`)
    data = r.data
  } else if (id.startsWith('p6-')) {
    const r = Part6Set.safeParse(candidate)
    if (!r.success) return { ok: false, error: formatIssues(r.error) }
    parsedId = r.data.id
    target = join(root, 'grammar', 'part6', 'sets.json')
    data = r.data
  } else {
    return { ok: false, error: `unknown id prefix: ${id}` }
  }
  if (parsedId !== id) return { ok: false, error: 'id must not be changed' }

  const existing = readArray(target)
  if (existing.some((x) => x.id === id)) return { ok: false, error: `${id} already exists in ${basename(target)}` }
  writeJsonAtomic(target, [...existing, data])
  removeFromDraft(root, file, id)
  return { ok: true }
}

export function rejectDraft(root: string, file: string, id: string): void {
  removeFromDraft(root, file, id)
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/unit/drafts.test.ts`
Expected: PASS.

- [ ] **Step 6: Wire IPC and preload**

In `src/main/ipc.ts`, add this import:
```ts
import { approveDraft, listDrafts, rejectDraft } from './drafts'
```

Append this at the end of `registerIpc`:
```ts
  if (isDev) {
    ipcMain.handle(IPC.devListDrafts, () => listDrafts(contentRoot))
    ipcMain.handle(IPC.devApproveDraft, (_e, file: string, id: string, item: unknown) =>
      approveDraft(contentRoot, file, id, item)
    )
    ipcMain.handle(IPC.devRejectDraft, (_e, file: string, id: string) => rejectDraft(contentRoot, file, id))
  }
```

In `src/preload/index.ts`, replace the `dev` member with:
```ts
  dev: {
    isDev: () => ipcRenderer.invoke(IPC.devIsDev),
    listDrafts: () => ipcRenderer.invoke(IPC.devListDrafts),
    approveDraft: (file, id, item) => ipcRenderer.invoke(IPC.devApproveDraft, file, id, item),
    rejectDraft: (file, id) => ipcRenderer.invoke(IPC.devRejectDraft, file, id)
  }
```

- [ ] **Step 7: Implement the review screen**

The screen is a developer tool, so its labels are English only.

`src/renderer/src/features/content-review/ContentReviewScreen.tsx`:
```tsx
import { useCallback, useEffect, useState } from 'react'
import type { DraftEntry } from '@shared/api'
import { useApp } from '../../app/AppContext'

function DraftCard({ draft, onDone }: { draft: DraftEntry; onDone(): void }) {
  const [text, setText] = useState(() => JSON.stringify(draft.item, null, 2))
  const [error, setError] = useState<string | null>(null)

  async function approve() {
    let item: unknown
    try {
      item = JSON.parse(text)
    } catch {
      setError('Invalid JSON')
      return
    }
    const r = await window.api.dev.approveDraft(draft.file, draft.id, item)
    if (r.ok) onDone()
    else setError(r.error)
  }

  async function reject() {
    await window.api.dev.rejectDraft(draft.file, draft.id)
    onDone()
  }

  return (
    <article className="card draft">
      <header>
        <strong>{draft.id}</strong> <small className="muted">{draft.file}</small>
        {typeof draft.item.flag === 'string' && <span className="flag">⚠ {draft.item.flag}</span>}
      </header>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={18} spellCheck={false} />
      <div className="actions">
        <button type="button" className="primary" onClick={() => void approve()}>
          Approve
        </button>
        <button type="button" onClick={() => void reject()}>
          Reject
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </article>
  )
}

export function ContentReviewScreen() {
  const { reloadBank } = useApp()
  const [drafts, setDrafts] = useState<DraftEntry[] | null>(null)
  const refresh = useCallback(() => {
    void window.api.dev.listDrafts().then(setDrafts)
  }, [])
  useEffect(refresh, [refresh])

  const onDone = () => {
    refresh()
    void reloadBank()
  }

  return (
    <section>
      <h1>Content review</h1>
      {drafts === null ? (
        <p className="muted">Loading…</p>
      ) : drafts.length === 0 ? (
        <p className="muted">No drafts. Generate some with npm run gen.</p>
      ) : (
        drafts.map((d) => <DraftCard key={`${d.file}:${d.id}`} draft={d} onDone={onDone} />)
      )}
    </section>
  )
}
```

- [ ] **Step 8: Register the dev-only route in `App.tsx`**

Add this import:
```tsx
import { ContentReviewScreen } from '../features/content-review/ContentReviewScreen'
```

Change the destructuring at the top of `App` to:
```tsx
  const { isDev } = useApp()
  const { t } = useT()
```
and change the context import to `import { useApp, useT } from './AppContext'`.

Add this as the last nav link:
```tsx
        {isDev && <NavLink to="/dev/content">Content review</NavLink>}
```

Add this route:
```tsx
          {isDev && <Route path="/dev/content" element={<ContentReviewScreen />} />}
```

- [ ] **Step 9: Verify**

Run: `npm test && npm run typecheck`
Expected: PASS.

Run: `npm run dev` and open Content review. It shows the 3 conditionals drafts from Task 14, with flags if any.
- Edit one draft's Thai explanation and click Approve. The card disappears and `content/grammar/part5/conditionals.json` now exists.
- Reject another draft. It disappears from the draft file.
- Topic drills shows ประโยคเงื่อนไข with 1 question.
- `npm test` still passes, since the content test validates the newly approved item.

- [ ] **Step 10: Commit**

```bash
git add src/main/drafts.ts src/main/ipc.ts src/preload/index.ts src/shared/api.ts src/renderer/src/features/content-review src/renderer/src/app/App.tsx tests/unit/drafts.test.ts content/grammar
git commit -m "feat: add dev-only draft review screen for generated questions"
```

---

### Task 16: Build the initial grammar bank

A content task, not a code task. Run by the developer or teacher. Spec target: about 20 Part 5 items per topic (roughly 260 in total) and 30 Part 6 sets.

**Files:**
- Create/Modify: `content/grammar/part5/<topic>.json` for all 13 topics, `content/grammar/part6/sets.json`

- [ ] **Step 1: Generate Part 5 drafts for every topic**

Run, one topic at a time (each run costs roughly a few tens of cents):
```bash
npm run gen -- --part 5 --topic word-form --count 15 --difficulty 3
npm run gen -- --part 5 --topic tense-voice --count 20 --difficulty 3
npm run gen -- --part 5 --topic subject-verb-agreement --count 20 --difficulty 3
npm run gen -- --part 5 --topic prepositions --count 15 --difficulty 3
npm run gen -- --part 5 --topic conj-vs-prep --count 20 --difficulty 3
npm run gen -- --part 5 --topic pronouns --count 20 --difficulty 3
npm run gen -- --part 5 --topic relative-clauses --count 20 --difficulty 4
npm run gen -- --part 5 --topic reduced-clauses --count 20 --difficulty 4
npm run gen -- --part 5 --topic conditionals --count 20 --difficulty 4
npm run gen -- --part 5 --topic inversion --count 20 --difficulty 4
npm run gen -- --part 5 --topic comparatives --count 20 --difficulty 3
npm run gen -- --part 5 --topic gerund-infinitive --count 20 --difficulty 3
npm run gen -- --part 5 --topic collocations --count 20 --difficulty 4
```
Expected: one draft file per run in `content/drafts/`.

- [ ] **Step 2: Generate Part 6 drafts**

Run: `npm run gen -- --part 6 --count 30 --difficulty 3`
Expected: `content/drafts/part6-<stamp>.json` with up to 30 sets.

- [ ] **Step 3: Review in the app**

Run `npm run dev` and open Content review.
- Look at flagged items first. Fix them or reject them.
- For unflagged items, check: one correct answer, natural Thai, sensible business context.
- Approve the good ones.

- [ ] **Step 4: Verify**

Run: `npm test && npm run test:e2e`
Expected: PASS. Content shows no validation errors, and every topic file name matches its items' topic.

Run: `npm run dev`
Expected: every Part 5 topic card shows about 20 questions, and the mixed test runs 30 Part 5 questions + 4 Part 6 passages.

- [ ] **Step 5: Commit**

```bash
git add content/grammar
git commit -m "content: add initial reviewed Part 5 and Part 6 question bank"
```

---

## Self-Review Notes

- **Spec coverage (steps 1–5):**
  - Scaffold and security: T1, T7. Zod schemas: T1. Content loading and validation: T6.
  - Part 5 topic drill: T9, T10. Leitner review: T2, T11. Dashboard and band estimate: T3, T11. Part 6 and mixed test: T4, T9, T12.
  - Pipeline with self-check: T14. Dev review screen: T15. Initial bank: T16.
  - Thai/English i18n: T8. Atomic local data: T5. Unit, content and E2E tests: throughout, plus T13.
- **Deferred to later plans:**
  - Writing module, API key / `safeStorage`, and grading model: Plan 2.
  - Study guide, Today card, `electron-builder` installer and `extraResources: content`: Plan 3.
- **Type names used across tasks:** `QuizEntry`, `AnswerRecord`, `toAttempt`, `DraftEntry`, `DraftResult`, `IpcDeps`, `Store`, `LoadResult`, `TopicStat`, `Band`. Each is defined once, in the task that produces it.
