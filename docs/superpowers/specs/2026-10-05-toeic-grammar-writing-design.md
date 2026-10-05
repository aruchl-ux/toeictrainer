# TOEIC Grammar & Writing Trainer — Design Spec

- **Date:** 2026-10-05
- **Status:** Approved in brainstorming, pending written-spec review
- **Author:** aruch.l@poontana.co.th (with Claude)

## 1. Goal

A local desktop app that helps Thai learners targeting TOEIC 600–850+ prepare for:

1. **Grammar** — TOEIC Listening & Reading, Part 5 (incomplete sentences) and Part 6 (text completion).
2. **Writing** — TOEIC Speaking & Writing, Writing section Q1–8.

Success criteria for v1:

- A learner can follow an 8-week plan entirely inside the app.
- Grammar drills give instant, bilingual (Thai/English) explanations and resurface missed items via spaced review.
- Writing answers receive rubric-based AI feedback with inline error highlights in Thai.
- Everything except AI writing feedback works offline and without an API key.

## 2. Decisions

| Topic | Decision |
|---|---|
| Platform | Electron desktop app, runs locally (Windows first) |
| Frontend | Vite + React + TypeScript (scaffold with `electron-vite`) |
| Audience | Thai learners; UI and explanations Thai-first with English toggle |
| Level | TOEIC 600–850+ (question difficulty mostly 2–4 on a 1–5 scale) |
| Writing feedback | Claude API called from Electron main process |
| API key | Each user enters their own key; stored encrypted with Electron `safeStorage` |
| Progress storage | Local JSON file in Electron `userData`; no accounts |
| Content | AI-generated question bank, human-reviewed, shipped as JSON in repo |
| Packaging | `electron-builder`, Windows NSIS installer |

Out of scope for v1: accounts/sync, Listening, Speaking, Reading Part 7, mobile, official score guarantees, live in-app question generation.

## 3. Architecture

### 3.1 Process model

- **Renderer (React UI)** — all screens. Has no Node or network access. Talks only through `window.api`.
- **Preload** — exposes a narrow, typed `window.api` via `contextBridge`. `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- **Main (Node)** — owns every side effect: Claude calls, file I/O, secrets, content loading.

### 3.2 Folder layout

```
toeic_preparation/
  content/
    grammar/part5/<topic>.json
    grammar/part6/<set>.json
    writing/q1-5/<set>.json
    writing/q6-7/<set>.json
    writing/q8/<set>.json
    writing/images/           license-free photos (attribution in JSON)
    drafts/                   generated, not yet reviewed (not loaded by app)
  scripts/
    generate.ts               question generation + self-check
  src/
    main/
      index.ts                window creation, security settings
      ipc.ts                  registers IPC handlers
      claude.ts               writing feedback (prompt build, call, parse)
      store.ts                progress.json read/write (atomic writes)
      secrets.ts              API key via safeStorage
      content.ts              loads + validates approved content
    preload/
      index.ts                window.api
    renderer/
      app/                    routing, layout, i18n (th/en)
      features/grammar/       Part 5 drill, Part 6 passage, mixed test
      features/writing/       picture, email, essay editors, timer, feedback view
      features/review/        Leitner review queue
      features/progress/      topic dashboard, score estimate
      features/guide/         8-week plan, Thai mistakes, templates, test info
      features/settings/      API key, language, timer defaults
      features/content-review/  dev-only draft review screen
    shared/
      types.ts                zod schemas + inferred types
      leitner.ts              review scheduling (pure)
      scoring.ts              score-band estimate (pure)
      highlight.ts            quote-to-range matcher (pure)
  tests/
    unit/  content/  e2e/
```

Pure logic lives in `src/shared/` so it is unit-testable without Electron.

### 3.3 IPC surface (`window.api`)

```ts
content.list(filter: { part: 5 | 6 | 'w1-5' | 'w6-7' | 'w8'; topic?: string; difficulty?: number[] }): Promise<Question[]>
progress.get(): Promise<Progress>
progress.recordGrammar(attempt: GrammarAttempt): Promise<Progress>
progress.recordWriting(attempt: WritingAttempt): Promise<Progress>
progress.saveDraft(taskId: string, text: string): Promise<void>
progress.getDraft(taskId: string): Promise<string | null>
feedback.grade(req: GradeRequest): Promise<GradeResult>   // GradeResult = { ok: true, feedback } | { ok: false, error: 'no-key' | 'invalid-key' | 'network' | 'timeout' | 'parse' | 'rate-limit' }
settings.get(): Promise<Settings>
settings.set(patch: Partial<Settings>): Promise<Settings>
secrets.setApiKey(key: string): Promise<void>
secrets.hasApiKey(): Promise<boolean>
secrets.clearApiKey(): Promise<void>
```

The renderer never receives the API key back, only `hasApiKey`.

## 4. Grammar module (Part 5 + 6)

### 4.1 Topics

- **Core:** `word-form`, `tense-voice`, `subject-verb-agreement`, `prepositions`, `conj-vs-prep`, `pronouns`
- **Advanced:** `relative-clauses`, `reduced-clauses`, `conditionals`, `inversion`, `comparatives`, `gerund-infinitive`, `collocations`
- **Part 6 only:** `sentence-insertion`, `transitions`

### 4.2 Question schema

Part 5:

```json
{
  "id": "p5-word-form-0042",
  "part": 5,
  "topic": "word-form",
  "difficulty": 3,
  "stem": "The new policy will be ____ implemented next quarter.",
  "choices": ["full", "fully", "fullness", "fuller"],
  "answer": 1,
  "trap": "adverb modifies verb 'implemented'",
  "explain": { "en": "...", "th": "..." },
  "status": "approved"
}
```

Part 6: a `passage` (string with `{{1}}`–`{{4}}` blank markers) plus `blanks[]`, each blank shaped like a Part 5 item without `stem`. Exactly one blank per passage has topic `sentence-insertion`.

### 4.3 Drill modes

- **Topic drill** — 10 items from one topic, explanation shown immediately after each answer.
- **Mixed test** — 30 Part 5 items + 4 Part 6 passages. Pace indicator targets about 20s per Part 5 item. Explanations appear at the end.
- **Review** — items due in the Leitner queue.

### 4.4 Feedback

On a wrong answer: highlight the correct choice, show the `trap` label and the explanation (Thai default, English toggle). Time per item is recorded on every attempt.

### 4.5 Spaced review (Leitner)

- Five boxes with intervals of 1, 3, 7, 14 and 30 days.
- Wrong answer: move to box 1, due tomorrow.
- Right answer: move up one box (capped at box 5); due date = today + that box's interval.
- New items enter the queue only after they are first answered wrong.

### 4.6 Progress

- Per topic: accuracy over the last 20 attempts and average time per item.
- Dashboard shows the 3 weakest topics, each with a "Drill this" button.
- Estimated Part 5/6 band, derived from mixed-test accuracy, always labelled "estimate — not an official score".

## 5. Writing module (S&W Q1–8)

### 5.1 Tasks

| Task | Prompt | Time | Score |
|---|---|---|---|
| Q1–5 Picture sentence | Photo + 2 required words | 8 min total for 5 | 0–3 each |
| Q6–7 Email reply | Incoming email + 2–3 required actions | 10 min each | 0–4 |
| Q8 Opinion essay | Workplace/business question | 30 min, 300+ words recommended | 0–5 |

- **Test mode:** timer auto-submits at zero.
- **Practice mode:** timer is optional.
- Drafts autosave every 5 seconds via `progress.saveDraft`.

### 5.2 Images

Q1–5 images must be license-free: Unsplash/Pexels photos (attribution stored in the item JSON) or AI-generated images. Stored in `content/writing/images/`.

### 5.3 AI grading

- **Model:** `claude-sonnet-5-5`, structured JSON output, 60s timeout.
- **System prompt:** the rubric for the task type:
  - **Q1–5:** grammatical correctness, relevance to picture, both required words used correctly.
  - **Q6–7:** completion of every required action, organization, tone/register appropriate for business email.
  - **Q8:** clear opinion, supporting reasons, examples/details, organization, grammar and vocabulary range.
- **User content:** task prompt, required words/actions, the learner's answer, target level (600–850+). Explanations requested in Thai.

Response schema (validated with zod in `shared/types.ts`):

```json
{
  "score": 3,
  "maxScore": 4,
  "criteria": [{ "name": "Task completion", "met": true, "note_th": "..." }],
  "errors": [{ "quote": "I am agree", "fix": "I agree", "type": "verb-form", "explain_th": "..." }],
  "improved": "...",
  "tips_th": ["..."]
}
```

- Errors are located by `quote`, not by character offsets. `shared/highlight.ts` finds the first unclaimed occurrence of each quote in the answer.
- An error whose quote isn't found still appears in the error list, just without an inline highlight.
- `score` is clamped to `[0, maxScore]`.

### 5.4 Feedback view

- Answer with inline highlights (hover/click shows the fix and Thai explanation).
- Score + criteria checklist.
- "Improved version" tab with a word-level diff.
- Tips list.

### 5.5 Link to grammar progress

Each error `type` maps to a grammar topic through a fixed table in `shared/` (e.g. `verb-form` → `tense-voice`, `article` → `word-form`). Writing errors count toward topic weakness on the dashboard but not toward Leitner scheduling.

### 5.6 Error handling

| Condition | Behaviour |
|---|---|
| No API key | Self-check mode: model answer + rubric checklist the learner ticks |
| 401 / invalid key | Message with link to Settings |
| Network error / timeout | Draft kept; Retry button |
| 429 rate limit | Message asking to wait; Retry button |
| JSON fails zod parse | One automatic retry, then "Feedback failed, try again" |

The learner's text is never discarded on any failure.

## 6. Content pipeline

Run by the developer: `npm run gen -- --part 5 --topic word-form --count 20 --difficulty 3`

1. **Generate:** Claude produces items matching the zod schema, guided by few-shot examples.
2. **Self-check:** a second Claude pass verifies each item: exactly one defensible answer, explanation consistent with the answer, natural Thai. Failures get `"flag": "<reason>"`.
3. **Save:** items written to `content/drafts/` with `status: "draft"`.
4. **Review:** the dev-only Content Review screen (enabled when `!app.isPackaged`) shows drafts with Approve / Edit / Reject. Approve moves the item into `content/<module>/...` with `status: "approved"`. Reject deletes it from drafts.
5. **Load:** at startup `content.ts` loads only approved items and validates them. Invalid files are logged and skipped. The app does not crash.

v1 starting bank: roughly 300 Part 5 items (about 20 per topic), 30 Part 6 passages, 40 picture prompts, 20 email prompts, 20 essay prompts.

## 7. Study guide

- **8-week plan:**
  - Weeks 1–4: one grammar topic per day + daily review.
  - Weeks 5–8: grammar review + writing tasks.
  - Each week ends with a mixed test.
  - The home screen "Today" card shows the day's tasks and marks them done automatically when completed.
- **Thai-speaker common mistakes:** articles, plurals, tense with time expressions, `-ed`/`-ing` adjectives, word order. Each links to its drill topic.
- **Writing templates + phrase bank:**
  - Email: greeting → purpose → each required action → closing.
  - Essay: intro with opinion → two reasons with examples → conclusion.
- **Test info:** TOEIC L&R Part 5/6 and S&W Writing format, timing, scoring.

## 8. Local data

`userData/progress.json` (written atomically: write temp file, then rename):

```ts
{
  version: 1,
  grammarAttempts: { itemId, topic, correct, ms, at }[],
  leitner: Record<itemId, { box: 1-5, due: ISODate }>,
  writingAttempts: { taskId, type, text, feedback?, at }[],
  drafts: Record<taskId, string>,
  plan: { startDate: ISODate, completed: string[] }
}
```

- `settings.json` holds language and timer defaults.
- The API key is stored separately as a `safeStorage`-encrypted blob in `userData/key.bin`.
- A `version` field allows future migrations, including a later move to accounts.

## 9. Testing

- **Unit (Vitest):** `leitner.ts`, `scoring.ts`, `highlight.ts`, error-type → topic mapping, zod schemas, `store.ts` against a temp dir, `claude.ts` response parsing with recorded fixtures. No live API calls in tests.
- **Content tests:** every approved file passes its schema, IDs are unique, `answer` is in range, both `th` and `en` explanations are present, and referenced images exist.
- **E2E (Playwright `_electron`):** one happy path each for the grammar topic drill, a writing submission with mocked feedback, and the review queue.
- **Build check:** `electron-builder` produces a working Windows installer.

## 10. Build order

1. Scaffold (electron-vite, security settings, `window.api`, zod schemas).
2. Content loading + Part 5 topic drill + progress store.
3. Leitner review + progress dashboard.
4. Part 6 + mixed test.
5. Content pipeline script + dev review screen; generate and review the initial grammar bank.
6. Settings + secrets + writing editors and timer.
7. Claude grading + feedback view + error handling.
8. Study guide screens + Today card.
9. Writing content bank, E2E tests, installer.
