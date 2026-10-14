# Cheat sheet coverage for beginners — design

Date: 2026-10-14
Branch: `plan1-foundation-grammar`
Scope: all 17 Part 5 cheat sheets, the `point` field on questions, the auto "tested points" list, and the content pipeline that feeds it.

## Problem

A learner opens a topic's cheat sheet during a drill and the question tests something the sheet never mentions. Collocations is the worst case: the drill tests 10 points and 5 are missing from the sheet (`exercise caution`, `address concerns`, `raise awareness`, `take effect`, `adhere to`). The sheet also assumes an advanced reader: clue pairs have no Thai meaning, there is no "wrong pair" warning even though the wrong pair is the trap, and labels use terms like `V3` and `Adverb + adjective` without explanation.

Collocations and word choice are open vocabulary, so a hand-written sheet can never list every pair, especially once the private pack and newly generated questions arrive.

## Goals

1. Every point a drill tests is visible on that topic's sheet, including private-pack and future questions.
2. A beginner can read every sheet: plain Thai first, a Thai meaning for every English word or pair, one common mistake per entry, no unexplained symbols.
3. A test fails if a shipped question has no point to show on its sheet.

Non-goals: hiding the current question's answer in the drill dialog (the sheet is meant to help), sheets for Part 6-only topics (`sentence-insertion`, `transitions`), Part 7.

## 1. Data: `point` on each question

```ts
export const Point = z.object({
  key: z.string().min(1),            // what to remember, in English: "exercise caution", "responsible for", "If + had V3, would have V3"
  th: z.string().min(1),             // short Thai meaning or rule: "ใช้ความระมัดระวัง"
  en: z.string().min(1),             // short English meaning: "be careful"
  wrong: z.array(z.string().min(1)).optional() // whole wrong pairs: ["perform caution", "execute caution"]
})
```

- Added to `choiceFields` in `src/shared/types.ts` as `point: Point.optional()`, so it exists on `Part5Item` and `Part6Blank`.
- Optional in the schema so drafts and old files still load. A unit test makes it required on every approved shipped item (Part 5 items, and Part 6 blanks whose topic is a Part 5 topic).
- `wrong` is written by the author (AI), not derived from the choices: "✗ perform caution" teaches more than "perform". For grammar topics it holds the wrong form in context, e.g. `"If I would have known"`.
- `th`/`en` are one short line each (target ≤ 60 characters), not a paragraph. The full explanation stays in `explain`.

Backfill scope: 130 shipped Part 5 items and 40 Part 6 blanks in Part 5 topics.

## 2. Hand-written sheets, rewritten for beginners

Type changes in `src/shared/cheatsheet/types.ts`:

- `clues?: string[]` becomes `clues?: CheatWord[]` (`{ w, en, th }`), so every clue pair carries a Thai meaning.
- New required `mistake: { wrong: string; right: string; why: Explain }` on every entry: the error a Thai learner actually makes, e.g. `wrong: "do a decision"`, `right: "make a decision"`.
- Entry `name.th` is plain Thai first with the term in brackets, e.g. `คำที่มักใช้คู่กัน: กริยา + คำนาม (verb + noun)`. `name.en` stays plain English.
- Symbol key: a shared `SYMBOLS: Record<string, Explain>` (S, V, V1, V3, V-ing, Obj, N, NP, Adj, Adv, Clause, Prep, Pron, Det…). Each sheet shows a small "สัญลักษณ์" key listing only the symbols its formulas use, computed from `formulaParts`. A unit test fails if a formula uses a symbol missing from `SYMBOLS`.

Audit: a script (part of `cheatsheet-review.ts`) lists every shipped `point.key` that no entry's formula, words or clues mention. Each gap is either folded into the right entry (a general rule, e.g. `take effect` under verb + noun) or left to the auto list (a one-off). Collocations is rewritten first, then the other 16 topics.

## 3. Auto list: "จุดที่ออกในแบบฝึก"

- `sheetPoints(topic, bank): SheetPoint[]` in `src/shared/cheatsheet/points.ts` (pure). It collects `point` from Part 5 items and Part 6 blanks with that topic, from whatever the bank holds (bundled plus private pack). It merges rows whose `key` matches after lowercasing and collapsing spaces, unions their `wrong` lists, keeps the first `th`/`en`, sorts A–Z by key, and skips items without a `point`.
- `CheatSheetView` takes a new `points: SheetPoint[]` prop and renders a block after the entries: heading `จุดที่ออกในแบบฝึก (N)` / `Points tested in drills (N)`, one row per point: key in English, meaning in the shown language, then `✗ wrong` items struck through. The `✗` is text, so meaning does not rely on colour. The block follows the sheet's Thai/English flip. Empty list: block hidden.
- Callers (`CheatSheetScreen`, `CheatSheetDialog` via `QuestionView`, office `CheatPane`) read the bank from app context and pass `sheetPoints(topic, bank)`.
- Index tile count: `5 สูตร · 12 จุด` (new i18n key, both languages).
- In the drill dialog the list includes the current question's answer. Intended.

## 4. Content pipeline

- `scripts/lib/gen.ts` `EXPLAIN_FIELD_RULES` and the import prompt schema in `scripts/lib/import/prompts.ts` require `point` on every new item, with rules: plain beginner Thai, one short line, `key` is the exact phrase or pattern tested, `wrong` holds 1–3 whole wrong phrases taken from the wrong choices in context.
- New `npm run points` (`scripts/points.ts`): finds items without `point` in `content/` (and the private pack with `--private`), asks Claude for the point in batches per topic, validates with `Point`, and writes back into the same JSON files without touching other fields. Resumable (skips items that already have a point), `--topic <t>` filter, uses the same credential lookup as `import`, and stops loudly when credentials are missing.
- `scripts/answer-sheet.ts` prints each item's point; `scripts/cheatsheet-review.ts` prints mistakes, clue meanings, and the audit gap list. The user spot-checks both before content ships.
- `scripts/check-content.ts` (run by `dist`) fails when an approved shipped item lacks `point`.

## Testing

- Unit `types`: `Part5Item`/`Part6Blank` accept and validate `point`; reject an empty `key`.
- Unit `content`: every approved shipped Part 5 item and every Part 6 blank in a Part 5 topic has a `point`.
- Unit `points`: `sheetPoints` merges by normalised key, unions `wrong`, sorts, skips items with no point, includes Part 6 blanks, ignores other topics.
- Unit `cheatsheet`: every entry has a `mistake`; every clue has `th`/`en`; every formula symbol is in `SYMBOLS`.
- Render `CheatSheet.test.tsx`: the auto block shows key, Thai meaning and `✗` text; the language flip switches meanings; empty list hides the block.
- e2e: in the collocations drill, open the sheet and see `exercise caution` with `ใช้ความระมัดระวัง`.

## Order of work

1. Schema, `sheetPoints`, UI block, tests (with fixture items).
2. `npm run points`, prompt changes, review scripts, `check-content` guard.
3. Collocations: backfill points, rewrite sheet, user review.
4. Remaining 16 topics: backfill and rewrite, user review per batch.
