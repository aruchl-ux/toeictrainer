# Part 7 Reading + Reading Test — Design Spec

- **Date:** 2026-10-06
- **Status:** Approved in brainstorming, pending written-spec review
- **Author:** aruch.l@poontana.co.th (with Claude)
- **Extends:** `2026-10-05-toeic-grammar-writing-design.md` (moves Part 7 from out-of-scope into v1)

## 1. Goal

Complete the TOEIC Reading section in the app:

1. **Part 7 drill** — reading comprehension practice (single, double and triple passages) with instant Thai explanations and the proving sentence highlighted in the passage.
2. **Reading test** — a timed test with the real exam structure (Part 5 + 6 + 7), free navigation, in two lengths: **Half** (default) and **Full**.

Success criteria:

- A learner can practise any Part 7 format and question type and see *where* the answer is proved.
- A learner can sit a half (50 Q / 38 min) or full (100 Q / 75 min) Reading test, leave and resume it, and get a per-part score plus an estimated band.
- Everything works offline; existing drills, mixed test and review keep working unchanged.

## 2. Decisions

| Topic | Decision |
|---|---|
| Scope | Part 7 drill **and** timed Reading test |
| Formats | Single, double and triple passages |
| Test length | Learner picks: Half (default) or Full |
| Navigation in test | Free: prev/next, jump via question map, flag, change answers, submit |
| Clock | One countdown per test; **pauses while the app is closed**; auto-submit at 0:00 |
| Feedback | Evidence highlight + question-type stamp + Thai explanation (EN toggle). No full passage translation |
| Existing Mixed test (Part 5+6) | Kept as the short one-way workout |
| Architecture | New `ReadingTestRunner` beside `QuizRunner`; Part 7 drill and Review reuse `QuizRunner` |

## 3. Content

### 3.1 Schema (`src/shared/types.ts`)

```ts
Part7Doc = {
  kind: 'email' | 'letter' | 'memo' | 'notice' | 'ad' | 'article' | 'chat' | 'form' | 'schedule' | 'review' | 'webpage'
  title: string            // e.g. "Email: Order #4417 delayed"
  body: string             // plain text, \n line breaks; insertion markers [1]–[4] allowed
}

Part7Question = {
  type: 'main-idea' | 'detail' | 'inference' | 'not-true' | 'vocabulary' | 'intent' | 'insertion' | 'cross-reference'
  prompt: string
  choices: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
  evidence: { doc: number; quote: string }[]   // ≥1; quote is an exact substring of docs[doc].body
  explain: { en: string; th: string }
  difficulty: 1..5
}

Part7Set = {
  id: string               // /^p7-\d{4}$/
  part: 7
  format: 'single' | 'double' | 'triple'
  docs: Part7Doc[]         // length 1 / 2 / 3 matching format
  questions: Part7Question[]  // single: 2–4; double and triple: exactly 5
  status: 'draft' | 'approved'
  flag?: string
}
```

Schema rules (zod `superRefine`):

- `docs.length` matches `format`.
- Question count matches `format`.
- Every `evidence.quote` is found in `docs[evidence.doc].body`.
- Double/triple sets contain at least one `cross-reference` question whose evidence spans ≥ 2 docs.
- An `insertion` question requires markers `[1]`–`[4]` in exactly one doc; its prompt quotes the sentence to insert.
- An `intent` question requires a `chat` doc and quotes a line from it.

Question ids for progress and review: `p7-0001#q3` (1-based question index).

### 3.2 Files

- `content/reading/part7/single.json`, `double.json`, `triple.json` (arrays of `Part7Set`).
- `scripts/check-content.ts` extended for Part 7: positional wording ban, duplicate choices, quote found, Thai present.
- `scripts/answer-sheet.ts` extended: each set's docs, then each question with answer, type, evidence and Thai explanation.

### 3.3 First content batch

Enough for two full tests without repeats: **20 single, 4 double, 6 triple** sets (~120 questions). Mix of all question types; Thai explanations written for Thai learners; choices shuffle on screen, so no positional references. Process as for Part 5/6: parallel writers → blind verification pass → fixes → answer sheet for human spot-check.

## 4. Learner experience

### 4.1 Navigation

Rail adds **Reading (Part 7)** (`/reading`) after Topic drills, and **Reading test** (`/reading-test`) after Mixed test.

### 4.2 Part 7 drill (`/reading`)

- **Start screen:** sets grouped by format; filters by question type; weakest question types listed first (same idea as weakest topics on Home).
- **Drill:** runs a set's questions through `QuizRunner` in instant mode. Layout: passage sheet on the left, current question on the right. Double/triple sets show docs as file-style tabs. The passage stays while the set's questions advance.
- **After each answer:** evidence quotes highlighted (yellow overprint); the tab switches to the doc holding the first quote; yellow slip shows the question-type stamp, the Thai explanation and the EN toggle. Choices shuffled; A–D keys; ✓/✕ with labels.
- **Results:** existing drill results layout (score, ✓/✕ strip, question types missed).

### 4.3 Reading test (`/reading-test`)

- **Start screen:** choose **Half** (default) or **Full**; shows the counts actually available and "explanations at the end". If an unfinished test exists, offers **Resume** or **Discard**.
- **During the test:**
  - Top bar: countdown (tabular figures), question map grouped by Part (cells: unanswered = outline, answered = blue, flagged = marked with a shape, current = yellow). Clicking a cell jumps there.
  - Part 5: one sentence per screen. Part 6 and Part 7: passage left, the set's current question right.
  - Prev / Next, Flag, Submit (confirms when questions are unanswered).
  - At 5:00 and 1:00 the timer changes style **and** shows a text cue. At 0:00 the test submits.
- **Results:** score per Part and total, time used, estimated band (always labelled "estimate — not an official score"), then a review list per Part with evidence highlights and Thai explanations, and a "Drill weakest" link.

### 4.4 Style

Uses the existing riso world (DESIGN.md): quiet question screens with the rail receded; passages on framed sheets with registration marks; doc tabs styled as file tabs; evidence highlight in yellow overprint; question map cells as printed ticks.

## 5. Architecture

### 5.1 Shared logic (`src/shared/`, pure)

- `quiz.ts`: `QuizEntry` gains `{ kind: 'p7'; set: Part7Set; q: number; order?: number[] }`; `entryId`, `entryFields`, `resolveIds` and `shuffleChoices` support it.
- `reading.ts`:
  - `BLUEPRINT = { full: { p5: 30, p6: 4, single: 10, double: 2, triple: 3 }, half: { p5: 15, p6: 2, single: 5, double: 1, triple: 1 } }`; durations full 75 min, half 38 min.
  - `buildReadingTest(bank, length, rng)` → ordered entries (Part 5, then Part 6 sets, then Part 7 single, double, triple) with shuffled choices; uses what exists when the bank is short and reports actual counts.
  - `readingTestReducer` state: `entries`, `answers: Record<entryId, choice>`, `flags: Set<entryId>`, `index`, `elapsedMs`, `durationMs`, `done`. Actions: `answer`, `jump`, `next`, `prev`, `flag`, `tick(ms)`, `submit`. `tick` that reaches `durationMs` submits.
  - `scoreReadingTest(state)` → per-part correct/total, total, time used.
  - `estimateReadingBand(result)` → band from a raw-to-band table; half tests scaled ×2.
- `scoring.ts`: band display prefers the latest Reading tests and falls back to mixed tests.

### 5.2 Main process

- `content.ts` loads `content/reading/part7/` into `bank.part7` (approved only; invalid entries logged and skipped).
- `progress.json` stays `version: 1`; new fields default to empty, so old files load unchanged:
  - `readingAttempts: { itemId, qtype, correct, ms, at }[]`
  - `readingTests: { length, parts: { p5, p6, p7 }: { correct, total }, ms, at }[]`
  - `activeReadingTest?: { length, ids, orders, answers, flags, index, elapsedMs }`
- IPC additions: `progress.recordReading(attempt)`, `progress.saveActiveTest(state | null)`, `progress.finishReadingTest(result)`.
- Leitner: wrong Part 7 answers enter the review queue like Part 5/6 (id `p7-0001#q3`).

### 5.3 Clock and resume

- The countdown advances only while the test screen is open (`tick` from a 1 s interval, measured with `Date.now()` deltas).
- `activeReadingTest` is saved on every answer, flag and jump, and every 5 s while running, and on window close.
- On reopen, the test resumes at the saved `index` with `durationMs − elapsedMs` remaining.

### 5.4 Renderer

- `features/reading/ReadingScreen.tsx` (start + drill), `PassageView.tsx` (docs, tabs, insertion markers, evidence highlight; also used for Part 6 inside the test).
- `features/reading-test/ReadingTestScreen.tsx` (start/resume, runner, results), `ReadingTestRunner.tsx`, `QuestionMap.tsx`, `TestTimer.tsx`.
- `QuestionView` renders `PassageView` for `p6`/`p7` entries.

## 6. Error handling

| Condition | Behaviour |
|---|---|
| Invalid Part 7 content | Skipped at load and logged; the checker blocks it during development |
| Evidence quote not found at runtime | Explanation shown without highlight |
| Bank too small for chosen length | Start screen shows real counts; test runs with what exists |
| Save failure | Existing save-error alert; answers stay in memory; test can still be submitted |
| `activeReadingTest` references missing items or is malformed | Discarded with a short notice; learner starts a new test |

## 7. Testing

- **Unit:** Part 7 schema rules; `resolveIds`/`entryFields`/`shuffleChoices` for p7; `buildReadingTest` blueprints and short bank; `readingTestReducer` (answer, change answer, jump, prev/next, flag, tick, timeout submit, resume from `elapsedMs`); scoring and band table; progress store with new fields and old-file compatibility.
- **Component:** `QuestionMap` status and jump; submit confirmation with unanswered questions; `PassageView` highlight switches tabs.
- **Content:** all approved Part 7 sets pass schema and checker; ids unique; quotes found.
- **E2E (Playwright `_electron`):** answer a Part 7 drill question → attempt recorded and evidence highlighted; start a half test → answer → close app → reopen → same remaining time → submit → result recorded.

## 8. Build order

1. Part 7 schema, loader, checker and answer-sheet support.
2. `p7` quiz entries, `PassageView`, Part 7 drill screen.
3. Content batch 1 (20 single, 4 double, 6 triple) with verification.
4. `reading.ts` (blueprint, reducer, scoring) + `ReadingTestRunner`, question map, timer.
5. Test results and per-part review.
6. Progress fields, band preference, Leitner for p7, Progress screen question-type stats.
7. Resume (save/restore `activeReadingTest`, pause on close).
8. E2E tests; update PRODUCT.md (Part 7 now in scope) and DESIGN.md (new components).
