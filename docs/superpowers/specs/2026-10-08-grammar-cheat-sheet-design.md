# Grammar cheat sheet — design

Date: 2026-10-08 · Branch: `plan1-foundation-grammar`

## Goal

Give learners a formula-style summary of each Part 5 grammar topic, e.g.

> **Present simple** — `S + V(s/es) + Obj`

so the structure behind a drill question is visible at a glance, in Thai by default with an English toggle.

## Decisions (agreed in chat)

- **Scope:** all 13 Part 5 topics (`PART5_TOPICS`). Part 6-only topics (sentence-insertion, transitions) are out of scope.
- **Entry detail:** formula + short use + one TOEIC-style example with the produced part highlighted + optional clue words.
- **Placement:** own page in the trainer rail, a link from each topic tile, and an in-drill link that opens the topic's sheet without leaving the quiz. The Office view gets it too, as a doc in its document pane.
- **Storage:** typed TS data bundled with the app (approach A). No IPC, no zod loader.

## Data

`src/shared/cheatsheet/` — one file per topic plus `index.ts`.

```ts
interface CheatEntry {
  id: string            // kebab-case, unique across all sheets
  name: Explain         // { en, th }
  formula: string[]     // 1–3 lines, parts joined by ' + '
  use: Explain
  example: Explain      // en marks the produced part with {{…}}; th is a translation
  clues?: string[]      // signal words / positions that point to this entry
}
interface CheatSheet { topic: Part5Topic; intro: Explain; entries: CheatEntry[] }
export const CHEAT_SHEETS: Record<Part5Topic, CheatSheet>
```

Helpers in the same module:

- `formulaParts(line)` splits on ` + ` and tags each part `subject | verb | slot | word`, so the same slot (S, V…, Obj/N/Adj/Adv/Clause) looks the same on every sheet. Literal English words (have, will, if, than…) are `word`.
- `exampleParts(text)` splits on `{{…}}` into `{ text, hit }` pieces.

## UI — trainer view

- Rail item **สูตรไวยากรณ์ / Cheat sheet** → `/cheatsheet`: a tile grid of the 13 topics (TopicMark, name, entry count).
- `/cheatsheet/:topic`: page head (topic name + intro), one card per entry (name, formula chips, use, highlighted example + translation, clue words), a "Drill this topic" link and a topic switcher. Unknown topic redirects to `/cheatsheet`.
- Topic drills page: each tile gets a small "Formulas" link under it.
- In a drill, the explanation panel gets a "Formulas" button that opens the topic's sheet in a modal `<dialog>`; the quiz state is untouched. Esc or the close button returns to the question. Only shown when the topic has a sheet.

## UI — Office view

- Global command `/cheat [topic]` and a sidebar row under Part 5.
- `/cheat` thread: the agent lists the topics; picking one shows its sheet in the doc pane, formatted like a code doc (formula lines as code, examples with the produced part marked).
- Part 5 drill threads show the drill topic's sheet in the doc pane (toggle with the existing pane button).

## Testing

- Unit: every Part 5 topic has a sheet with ≥ 1 entry; ids unique; every `en`/`th` non-empty; every example has exactly one `{{…}}`; every formula part is a known slot or a lowercase literal; `formulaParts` / `exampleParts` behaviour.
- Component: sheet page renders entries and switches language; drill dialog opens and closes without changing the question.
- E2E: rail link opens the cheat sheet; navigation spec gains the new screen.
- Human review: `npm run cheatsheet:review` writes `docs/content-review/cheatsheet.md` for a spot-check of formulas and Thai.
