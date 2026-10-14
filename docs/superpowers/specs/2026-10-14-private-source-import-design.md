# Private source import (Part 5) and style-guided generation — design

Date: 2026-10-14
Branch: `plan1-foundation-grammar`
Scope: sub-projects **A** (private Part 5 import) and **B** (style-guided generator). Vocabulary module (C) and scanned Simulation tests (D) get their own specs later.

## Goal

The user has 31 TOEIC prep PDFs in `toeic_source/` (tutor worksheets, commercial books, simulation tests). We want:

- **A.** Their real Part 5 questions available in the app for the user's own practice, with answers and Thai/English explanations, without ever shipping them in the installer or committing them to git.
- **B.** The shipped, AI-written question bank to follow the same trap patterns and difficulty, using the source items only as style references, never copying them.

## Copyright boundary (binding)

- Source PDFs and anything extracted from them (raw text, items, cached work files, the private pack) never enter git and never enter the installer.
- `toeic_source/`, `content-private-work/` are added to `.gitignore`.
- The private pack lives only in `%APPDATA%\toeic-trainer\private-content\` on the user's machine.
- Generator output (B) is checked for overlap with private stems before it is saved as a draft (see B).

## Source inventory

| Kind | Files | Text | Notes |
|---|---|---|---|
| Grammar worksheets | `UNIT_1..11.pdf`, `Toeic_Grammar_Krubird.pdf` | yes | Krubird is a compilation of the units; dedupe collapses them |
| Grammar books | `Toeic_gold_2019_book.pdf`, `Home_work_toeic_2019.pdf`, `update_live_7_july_19.pdf` | yes (English only; Thai glyphs extract empty) | Also contain listening/reading/vocab sections, skipped |
| Vocab themes | `UNIT_*_TRAVEL…ENTERTAINMENT.pdf`, `All_Vocab.pdf` | yes | Fill-in items become `word-choice` topic; word lists are for sub-project C |
| Simulation tests | `Sim_A*`, `SimA_3`, `SIMA_4`, `Sim_B*` | no (scanned) | Out of scope (D) |
| `toeic-korea.pdf` | | garbled Thai | Out of scope |

Answer keys are mostly absent, so every item is solved by Claude.

## A. Import pipeline (`npm run import`)

Script `scripts/import.ts`, helpers in `scripts/lib/import/`. Runs locally with the same credentials as `npm run gen` (`scripts/lib/claude.ts`).

```
toeic_source/*.pdf
  1 extract  pdftotext per page → Claude → raw items {stem, choices[4], source}
             bad page → page cut out with pdf-lib → Claude PDF document block (vision) retry
  2 dedupe   normalised stem + choices → hash
  3 solve    batches of 10 → answer, topic, difficulty, trap, explain {th, en}
  4 check    blind re-solve (answer hidden) → agree / disagree
  5 write    agree → approved; disagree or odd → draft with flag
```

### Stage details

1. **Extract.**
   - `pdftotext -f N -l N -enc UTF-8 <file> -` (raw mode, not `-layout`, which keeps two-column reading order). Binary resolved from `PDFTOTEXT` env var, then `PATH`, then `C:\Program Files\Git\mingw64\bin\pdftotext.exe`; clear error if none found.
   - Claude receives one page of text and returns `{ items: [{ no, stem, choices }], pageKind }` where `pageKind ∈ part5 | other`. Blanks of any form (`____`, `-----`, `______`) are normalised to `____`. Choice prefixes like `(A)`, `B)` are stripped.
   - A page is **bad** if Claude reports `part5` but any item fails the raw schema (exactly 4 non-empty choices, exactly one `____`). Bad pages are retried once: the single page is copied into a new PDF with `pdf-lib` and sent as a `document` content block so Claude sees the page image. Still bad → those questions are logged to `content-private-work/broken.json` (file, page, text, problem) for a manual look, not imported.
   - `other` pages are logged to `content-private-work/skipped.json` with file and page, for later Part 6/7/vocab work.
2. **Dedupe.** Key = lowercase stem with whitespace and blank variants collapsed + sorted lowercase choices. First occurrence wins; later ones are recorded as extra `sources` on the same item (so the UI can say "also in UNIT 3 #12").
3. **Solve.** Batches of 10 items. Claude returns for each: `answer` (0–3), `topic` (one of the 17 Part 5 topics below), `difficulty` (1–5), `trap`, `explain_en`, `explain_th`, and `problem` (empty, or a reason the item is broken: no single right answer, garbled text, typo that changes the answer). Thai explanation follows the existing style rules in `scripts/lib/gen.ts`.
4. **Check.** Separate call with the same items, answers removed: Claude re-solves and returns `{ answer, confident }`. Item is **approved** only if the re-solve matches, `confident` is true, and `problem` is empty. Otherwise it becomes a draft with `flag` explaining which test failed.
5. **Write.** Items are validated with the app's `Part5Item` schema. Approved items append to `private-content/grammar/part5/<topic>.json`; flagged items go to `private-content/drafts/import-<stamp>.json`. Existing approved ids are never rewritten.

### Resumability and cost control

- Every stage caches its output in `content-private-work/` keyed by file + page (extract) or batch content hash (solve, check). A rerun skips cached work, so a crash or Ctrl-C never repays finished calls.
- Flags: `--file <name>` (one PDF), `--pages 3-10`, `--dry-run` (extract with pdftotext only, print page and estimated batch counts, no API calls), `--out <dir>` (default `%APPDATA%\toeic-trainer\private-content`).
- Recommended first run: `npm run import -- --file UNIT_1.pdf`, check output in the app, then the rest.

### Ids and data shape

- Private ids: `p5x-<topic>-0001`. Shipped ids stay `p5-<topic>-0001`. No collision, and Leitner/progress keys stay stable across reruns because numbering continues from the highest existing id per topic.
- `Part5Item` gains one optional field:
  ```ts
  source: z.array(z.object({ file: z.string(), page: z.number().int(), no: z.number().int().optional() })).min(1).optional()
  ```
- Id regex widens to `^p5x?-[a-z-]+-\d{4}$`. Shipped content check (`scripts/check-content.ts`) rejects `p5x-` ids and `source` inside `content/` so private items cannot leak into the shipped bank by mistake.

## Topics

Four Part 5 topics are added (17 total):

| Topic id | Covers |
|---|---|
| `word-choice` | word meaning / context choice between unrelated words of the same part of speech (not `vocabulary`: that id is already a Part 7 question type, and progress groups attempts by skill id) |
| `determiners` | articles, quantifiers (each/every/all/most/few/little), `another/other` |
| `modals` | can/could/must/should/might + have V3 |
| `noun-clauses` | that/what/whether/if clauses as subject or object |

Causative verbs fold into `gerund-infinitive`.

Each new topic needs, like existing ones: Thai/English label in `i18n.ts` (`TOPIC_LABELS`), a topic mark in `Ink.tsx` (`TOPIC_SHAPES`), a cheat sheet in `src/shared/cheatsheet/<topic>.ts` (same format, written by Claude during implementation, listed in `npm run cheatsheet:review`), and Office view support (it already iterates `PART5_TOPICS`).

Topics with zero loaded items are hidden from the topic list, Home topic picker and drills; their cheat sheets still show. Until B fills them, shipped users without a private pack see no change.

## App integration

- **Loader.** `loadContent(root)` gains an optional second root: `loadContent(contentRoot, privateRoot?)`. Both share one `seen` id set so duplicate ids are reported. Private root = `join(app.getPath('appData'), 'toeic-trainer', 'private-content')` — a fixed folder name, so the installed app and `npm run dev` see the same pack. Env var `TOEIC_PRIVATE_CONTENT` overrides the path. When `TOEIC_USER_DATA` is set (unpackaged runs, E2E tests) the pack is read from `<TOEIC_USER_DATA>/private-content`, so tests never read the real pack. Missing folder = empty pack, no error.
- **Everywhere else** (drills, mixed test, review queue, progress) works unchanged: private items are ordinary `Part5Item`s in `bank.part5`.
- **Source line.** When an item has `source`, the explanation panel (Trainer and Office views) shows one small line, e.g. `From: UNIT_3.pdf p.2 #12`. No other visual difference.
- **Content Review screen (dev).** `listDrafts` reads drafts from both roots; each entry carries `private: boolean` and the screen shows a "Private" tag. Approve and reject route by id prefix: `p5x-` ids use the private root (`drafts/` and `grammar/part5/<topic>.json` there), all others the shipped root. The IPC signatures do not change.
- No settings toggle in this round.

## B. Style-guided generator

- New flag: `npm run gen -- --part 5 --topic <topic> --style private`.
- With `--style private`, examples sent to Claude come from the private pack for that topic (up to 6, mixed difficulty) instead of shipped items, with the instruction: use these only as a model of trap type, sentence length and difficulty; write entirely new sentences, names, companies and contexts; never reuse a stem or a distinctive phrase.
- **Overlap guard.** After generation, each new stem is compared against every private stem using word-trigram Jaccard similarity. Score ≥ 0.5 → item dropped and logged. Score ≥ 0.3 → item kept but flagged `similar to <p5x-id>` for manual review.
- Generator accepts the four new topics automatically (it validates against `PART5_TOPICS`).
- Without `--style private`, behaviour is unchanged.

## Error handling

- Missing `pdftotext`, missing credentials, unreadable PDF: clear message, exit 1, cache kept.
- Claude refusal or truncated output on one batch: batch logged and skipped, rest continue; rerun retries only failed batches.
- Corrupt JSON in the private pack: reported via the existing `[content]` error log, other files still load (current `collect` behaviour).
- Private pack writes use `writeJsonAtomic`.

## Testing

- Unit (vitest): blank/choice normalisation, page-badness rules, dedupe key and source merging, id numbering continuing from existing private ids, verdict merge (approve vs flag), trigram overlap scoring, loader merging two roots with a shared id set, `check-content` rejecting `p5x-`/`source` in shipped content, drafts routing by root.
- Fixtures: small hand-written page-text samples (not copied from source PDFs) covering two-column order, `B)` typo, `-----` blanks.
- Claude calls are behind the existing `ask()` seam and mocked in tests.
- Existing cheat sheet and i18n tests extend automatically to the new topics.
- E2E: one test that seeds a temporary private-content folder and checks a private item appears in a drill with its source line.
- Manual: `npm run import -- --file UNIT_1.pdf` end to end before the full run.

## Out of scope

Vocabulary word-list module (C), scanned Simulation tests and OCR (D), Part 6/7 extraction, listening, an in-app import button, a settings toggle for the private pack.
