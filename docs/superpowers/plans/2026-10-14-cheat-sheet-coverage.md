# Cheat Sheet Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every point a drill tests shows on that topic's cheat sheet, in plain Thai a beginner can read.

**Architecture:** Each question (Part 5 item, Part 6 blank) gets an optional `point` field: a short key, Thai and English meaning, and wrong pairs. A pure `sheetPoints(topic, bank)` collects them into an auto list under the hand-written entries, on every surface that shows a sheet. The hand-written sheets gain a common mistake per entry, Thai meanings for clues and a symbol key. A `npm run points` script backfills points with Claude; `gen` and `import` write them for new questions.

**Tech Stack:** TypeScript, zod 4, React 19, Vitest + Testing Library (jsdom), Playwright (Electron), `@anthropic-ai/sdk` (scripts only).

**Spec:** `docs/superpowers/specs/2026-10-14-cheat-sheet-coverage-design.md`

## Global Constraints

- Every UI string exists in both `en` and `th` in `src/renderer/src/app/i18n.ts`; Thai is the default language.
- Right/wrong must not rely on colour alone: wrong pairs are shown with a literal `✗` character.
- `point.th` / `point.en`: one short line each, target 60 characters or less; hard limit 80 (tested).
- `point.wrong`: 0–3 whole wrong phrases.
- Renderer has no Node or network access; it reads questions only from the bank in app context.
- Nothing from `toeic_source/` or the private pack is ever committed. Test fixtures are hand-written.
- Part 6-only topics (`sentence-insertion`, `transitions`) have no sheet and need no point.
- Run `npm run typecheck` and `npm test` before every commit; both must pass.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File map

| File | Responsibility |
|---|---|
| `src/shared/types.ts` | `Point` schema; `point` on `choiceFields` |
| `src/shared/cheatsheet/points.ts` (new) | `sheetPoints`, `uncoveredPoints`, `SheetPoint` |
| `src/shared/cheatsheet/symbols.ts` (new) | `SYMBOLS`, `symbolsIn` |
| `src/shared/cheatsheet/types.ts` | `CheatMistake`, `mistake`, clue meanings |
| `src/shared/cheatsheet/*.ts` (17 sheets) | Sheet content |
| `src/renderer/src/features/cheatsheet/CheatSheetView.tsx` | Points block, mistake line, clue meanings, symbol key |
| `src/renderer/src/features/cheatsheet/CheatSheetScreen.tsx`, `CheatSheetDialog.tsx` | Pass points |
| `src/renderer/src/features/grammar/QuestionView.tsx` | Pass points to the drill dialog |
| `src/renderer/src/app/AppContext.tsx` | `useMaybeApp` |
| `src/renderer/office/CheatPane.tsx` | Same additions in the office UI |
| `scripts/lib/points.ts` (new) | Point prompt rules, targets, write-back, JSON formatting |
| `scripts/points.ts` (new) | `npm run points` |
| `scripts/lib/gen.ts`, `scripts/lib/import/prompts.ts`, `scripts/lib/import/build.ts` | New questions carry a point |
| `scripts/answer-sheet.ts`, `scripts/cheatsheet-review.ts`, `scripts/check-content.ts` | Review output and the ship guard |
| `tests/unit/coverage.test.ts` (new) | Beginner rules and point coverage for finished topics |

---

### Task 1: `Point` schema on questions

**Files:**
- Modify: `src/shared/types.ts` (above `choiceFields`, and `choiceFields` itself)
- Test: `tests/unit/types.test.ts`

**Interfaces:**
- Produces: `Point` (zod schema) and `type Point = { key: string; th: string; en: string; wrong?: string[] }` exported from `@shared/types`. `Part5Item` and `Part6Blank` gain `point?: Point`.

- [ ] **Step 1: Write the failing test** — append to `tests/unit/types.test.ts`:

```ts
describe('point', () => {
  const point = { key: 'exercise caution', th: 'ใช้ความระมัดระวัง', en: 'be careful', wrong: ['perform caution'] }

  it('is optional on Part 5 items and Part 6 blanks', () => {
    expect(Part5Item.safeParse(makePart5()).success).toBe(true)
    expect(Part5Item.safeParse(makePart5({ point })).success).toBe(true)
    const set = makePart6()
    set.blanks[0] = { ...set.blanks[0], point }
    expect(Part6Set.safeParse(set).success).toBe(true)
  })

  it('rejects an empty or blank key, th or en', () => {
    expect(Part5Item.safeParse(makePart5({ point: { ...point, key: '' } })).success).toBe(false)
    expect(Part5Item.safeParse(makePart5({ point: { ...point, th: '   ' } })).success).toBe(false)
    expect(Part5Item.safeParse(makePart5({ point: { ...point, en: '' } })).success).toBe(false)
  })

  it('allows at most three wrong pairs, none empty', () => {
    expect(Part5Item.safeParse(makePart5({ point: { ...point, wrong: ['a', 'b', 'c', 'd'] } })).success).toBe(false)
    expect(Part5Item.safeParse(makePart5({ point: { ...point, wrong: [''] } })).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/types.test.ts`
Expected: FAIL — the `point` cases fail type-checking in the fixture call or parse with unknown key stripped; the "rejects" cases return `true`.

- [ ] **Step 3: Write minimal implementation** — in `src/shared/types.ts`, directly above `const choiceFields = {`:

```ts
/** What a question tests, as one short line the topic's cheat sheet can list. */
export const Point = z.object({
  /** The phrase or pattern to remember, in English: "exercise caution", "If + had V3, would have V3". */
  key: z.string().trim().min(1),
  th: z.string().trim().min(1),
  en: z.string().trim().min(1),
  /** Whole wrong phrases a learner might write, e.g. "perform caution". */
  wrong: z.array(z.string().trim().min(1)).max(3).optional()
})
export type Point = z.infer<typeof Point>
```

and add one line at the end of `choiceFields`:

```ts
const choiceFields = {
  difficulty: z.number().int().min(1).max(5),
  choices: z.array(z.string().min(1)).length(4),
  answer: z.number().int().min(0).max(3),
  trap: z.string().min(1),
  explain: Explain,
  point: Point.optional()
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/types.test.ts && npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/shared/types.ts tests/unit/types.test.ts
git commit -m "feat: add an optional cheat-sheet point to questions"
```

---

### Task 2: `sheetPoints` and `uncoveredPoints`

**Files:**
- Create: `src/shared/cheatsheet/points.ts`
- Modify: `src/shared/cheatsheet/index.ts` (add `export * from './points'` under `export * from './types'`)
- Test: `tests/unit/points.test.ts`

**Interfaces:**
- Consumes: `Point`, `ContentBank`, `Part5Topic` from `@shared/types`; `CheatSheet` from `./types`.
- Produces:
  - `interface SheetPoint { key: string; th: string; en: string; wrong: string[] }`
  - `sheetPoints(topic: Part5Topic, bank: Pick<ContentBank, 'part5' | 'part6'>): SheetPoint[]`
  - `uncoveredPoints(sheet: CheatSheet, points: SheetPoint[]): SheetPoint[]` — points whose key no entry mentions.

- [ ] **Step 1: Write the failing test** — `tests/unit/points.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { CHEAT_SHEETS, sheetPoints, uncoveredPoints } from '../../src/shared/cheatsheet'
import type { Point } from '../../src/shared/types'
import { makePart5, makePart6 } from '../fixtures/items'

const pt = (key: string, wrong?: string[]): Point => ({ key, th: `th ${key}`, en: `en ${key}`, ...(wrong ? { wrong } : {}) })

describe('sheetPoints', () => {
  it('lists the points of one topic A–Z, from Part 5 items and Part 6 blanks', () => {
    const set = makePart6()
    set.blanks[3] = { ...set.blanks[3], topic: 'collocations', point: pt('meet the needs') }
    const bank = {
      part5: [
        makePart5({ topic: 'collocations', point: pt('place an order') }),
        makePart5({ topic: 'collocations', point: pt('exercise caution') }),
        makePart5({ topic: 'modals', point: pt('must + V1') })
      ],
      part6: [set]
    }
    expect(sheetPoints('collocations', bank).map((p) => p.key)).toEqual(['exercise caution', 'meet the needs', 'place an order'])
  })

  it('merges rows with the same key, ignoring case and spaces, and unions wrong pairs', () => {
    const bank = {
      part5: [
        makePart5({ topic: 'collocations', point: pt('exercise caution', ['perform caution']) }),
        makePart5({ topic: 'collocations', point: pt('Exercise  caution', ['execute caution', 'perform caution']) })
      ],
      part6: []
    }
    expect(sheetPoints('collocations', bank)).toEqual([
      { key: 'exercise caution', th: 'th exercise caution', en: 'en exercise caution', wrong: ['perform caution', 'execute caution'] }
    ])
  })

  it('skips questions without a point', () => {
    const bank = { part5: [makePart5({ topic: 'collocations' })], part6: [makePart6()] }
    expect(sheetPoints('collocations', bank)).toEqual([])
  })
})

describe('uncoveredPoints', () => {
  it('keeps only points that no entry formula, word, clue or example mentions', () => {
    const sheet = {
      topic: 'collocations' as const,
      intro: { en: 'x', th: 'x' },
      entries: [
        {
          id: 'a',
          name: { en: 'A', th: 'A' },
          formula: ['meet + a deadline'],
          use: { en: 'x', th: 'x' },
          example: { en: 'We {{place}} an order.', th: 'x' },
          clues: ['take effect']
        }
      ]
    }
    const points = [pt('meet a deadline'), pt('place an order'), pt('take effect'), pt('exercise caution')].map((p) => ({
      ...p,
      wrong: []
    }))
    expect(uncoveredPoints(sheet, points).map((p) => p.key)).toEqual(['exercise caution'])
  })

  it('works on a real sheet', () => {
    expect(uncoveredPoints(CHEAT_SHEETS.collocations, [])).toEqual([])
  })
})
```

Note: the `meet a deadline` case is covered because the formula `meet + a deadline` reads as `meet a deadline` once `+` and slashes are flattened; `place an order` is covered by the example once `{{…}}` is removed.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/points.test.ts`
Expected: FAIL with `sheetPoints is not a function` (or a missing export error).

- [ ] **Step 3: Write minimal implementation** — `src/shared/cheatsheet/points.ts`:

```ts
import type { ContentBank, Part5Topic, Point } from '../types'
import type { CheatSheet } from './types'

/** One row of a sheet's "points tested in drills" list. */
export interface SheetPoint {
  key: string
  th: string
  en: string
  wrong: string[]
}

const norm = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim()

/** Every point the bank's questions test for one topic: one row per distinct key, sorted A–Z. */
export function sheetPoints(topic: Part5Topic, bank: Pick<ContentBank, 'part5' | 'part6'>): SheetPoint[] {
  const points = [
    ...bank.part5.filter((i) => i.topic === topic).map((i) => i.point),
    ...bank.part6.flatMap((s) => s.blanks).filter((b) => b.topic === topic).map((b) => b.point)
  ].filter((p): p is Point => p !== undefined)
  const rows = new Map<string, SheetPoint>()
  for (const p of points) {
    const k = norm(p.key)
    const row = rows.get(k) ?? { key: p.key.trim(), th: p.th, en: p.en, wrong: [] }
    for (const w of p.wrong ?? []) if (!row.wrong.some((x) => norm(x) === norm(w))) row.wrong.push(w.trim())
    rows.set(k, row)
  }
  return [...rows.values()].sort((a, b) => norm(a.key).localeCompare(norm(b.key)))
}

/** All the English a sheet shows, flattened so "meet + a deadline/a demand" contains "meet a deadline". */
function sheetText(sheet: CheatSheet): string[] {
  return sheet.entries.flatMap((e) => {
    const formulas = e.formula.flatMap((line) => {
      const parts = line.split(' + ').map((p) => p.split('/'))
      // Every combination of the slash alternatives, e.g. "meet a deadline", "meet a demand".
      return parts.reduce<string[]>((acc, alts) => acc.flatMap((a) => alts.map((x) => `${a} ${x}`)), [''])
    })
    return [...formulas, ...(e.words ?? []).map((w) => w.w), ...(e.clues ?? []), e.example.en.replace(/\{\{|\}\}/g, '')].map(norm)
  })
}

/** Points no entry mentions yet; the audit lists these so they can be folded into an entry. */
export function uncoveredPoints(sheet: CheatSheet, points: SheetPoint[]): SheetPoint[] {
  const text = sheetText(sheet)
  return points.filter((p) => !text.some((t) => t.includes(norm(p.key))))
}
```

Note: clues are plain strings until Task 4, which switches this line to `(e.clues ?? []).map(clueText)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/points.test.ts && npm run typecheck`
Expected: PASS. (`works on a real sheet` passes trivially with no points.)

- [ ] **Step 5: Commit**

```bash
git add src/shared/cheatsheet/points.ts src/shared/cheatsheet/index.ts tests/unit/points.test.ts
git commit -m "feat: collect each topic's tested points for its cheat sheet"
```

---

### Task 3: Show the points on every sheet surface

**Files:**
- Modify: `src/renderer/src/app/i18n.ts` (en block after `cheatShowMain`, th block after `cheatShowMain`)
- Modify: `src/renderer/src/app/AppContext.tsx` (add `useMaybeApp` after `useApp`)
- Modify: `src/renderer/src/features/cheatsheet/CheatSheetView.tsx`
- Modify: `src/renderer/src/features/cheatsheet/CheatSheetDialog.tsx`
- Modify: `src/renderer/src/features/cheatsheet/CheatSheetScreen.tsx`
- Modify: `src/renderer/src/features/grammar/QuestionView.tsx:62-90` (the `Explain` component)
- Modify: `src/renderer/office/CheatPane.tsx`
- Modify: `src/renderer/src/styles.css` (after the `.cheat-clues li` rule), `src/renderer/office/office.css` (after `.cheat-doc-clues code`)
- Test: `tests/unit/renderer/CheatSheet.test.tsx`, `tests/e2e/private-pack.spec.ts`

**Interfaces:**
- Consumes: `sheetPoints`, `SheetPoint` (Task 2).
- Produces: `CheatSheetView` props `{ sheet: CheatSheet; lang: Lang; points?: SheetPoint[] }`; `CheatSheetDialog` props `{ sheet; lang; points?: SheetPoint[]; onClose }`; `useMaybeApp(): AppData | null`; i18n keys `cheatPoints` (`{n}`) and `cheatCountPoints` (`{n}`, `{p}`).

- [ ] **Step 1: Write the failing render tests** — append to `tests/unit/renderer/CheatSheet.test.tsx`:

```tsx
describe('Points tested in drills', () => {
  const points = [
    { key: 'exercise caution', th: 'ใช้ความระมัดระวัง', en: 'be careful', wrong: ['perform caution', 'execute caution'] }
  ]

  it('lists each point with its meaning and its wrong pairs as ✗ text', () => {
    render(<CheatSheetView sheet={CHEAT_SHEETS.collocations} lang="th" points={points} />)
    const list = screen.getByRole('region', { name: 'จุดที่ออกในแบบฝึก (1)' })
    expect(within(list).getByText('exercise caution')).toBeTruthy()
    expect(within(list).getByText('ใช้ความระมัดระวัง')).toBeTruthy()
    expect(within(list).getByText('✗ perform caution')).toBeTruthy()
    expect(within(list).getByText('✗ execute caution')).toBeTruthy()
  })

  it('switches the meanings with the language flip', () => {
    render(<CheatSheetView sheet={CHEAT_SHEETS.collocations} lang="th" points={points} />)
    fireEvent.click(screen.getByRole('button', { name: 'ดูเป็นภาษาอังกฤษ' }))
    expect(screen.getByText('be careful')).toBeTruthy()
    expect(screen.queryByText('ใช้ความระมัดระวัง')).toBeNull()
  })

  it('hides the block when no question has a point', () => {
    render(<CheatSheetView sheet={CHEAT_SHEETS.collocations} lang="en" points={[]} />)
    expect(screen.queryByRole('region')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/renderer/CheatSheet.test.tsx`
Expected: FAIL — no region named `จุดที่ออกในแบบฝึก (1)`.

- [ ] **Step 3: Add the i18n keys** — `src/renderer/src/app/i18n.ts`, en block after `cheatShowMain: 'Show in English',`:

```ts
  cheatPoints: 'Points tested in drills ({n})',
  cheatCountPoints: '{n} formulas · {p} points',
```

th block after `cheatShowMain: 'ดูเป็นภาษาไทย',`:

```ts
  cheatPoints: 'จุดที่ออกในแบบฝึก ({n})',
  cheatCountPoints: '{n} สูตร · {p} จุด',
```

- [ ] **Step 4: Render the block in `CheatSheetView.tsx`** — change the imports and add `PointList`, then use it:

```tsx
import { Fragment, useId, useState } from 'react'
import { exampleParts, formulaParts, type CheatEntry, type CheatSheet, type SheetPoint } from '@shared/cheatsheet'
import { t, type Lang } from '../../app/i18n'
```

Add above `CheatSheetView`:

```tsx
/** Every point the topic's questions test, so nothing in a drill is missing from its sheet. */
function PointList({ points, lang, uiLang }: { points: SheetPoint[]; lang: Lang; uiLang: Lang }) {
  const headId = useId()
  if (points.length === 0) return null
  return (
    <section className="cheat-points" aria-labelledby={headId}>
      <h3 id={headId} className="cheat-points-title" lang={uiLang}>
        {t(uiLang, 'cheatPoints', { n: points.length })}
      </h3>
      <ul>
        {points.map((p) => (
          <li key={p.key}>
            <span className="cheat-point-key" lang="en">
              {p.key}
            </span>
            <span className="cheat-point-meaning" lang={lang}>
              {p[lang]}
            </span>
            {p.wrong.length > 0 && (
              <span className="cheat-point-wrong" lang="en">
                {p.wrong.map((w) => (
                  <s key={w}>✗ {w}</s>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Change `CheatSheetView`'s signature and add the list after `.cheat-entries`:

```tsx
export function CheatSheetView({ sheet, lang, points = [] }: { sheet: CheatSheet; lang: Lang; points?: SheetPoint[] }) {
```

```tsx
      <div className="cheat-entries">
        {sheet.entries.map((e) => (
          <EntryCard key={e.id} entry={e} lang={shown} uiLang={lang} />
        ))}
      </div>
      <PointList points={points} lang={shown} uiLang={lang} />
```

- [ ] **Step 5: Run the render tests**

Run: `npx vitest run tests/unit/renderer/CheatSheet.test.tsx`
Expected: PASS

- [ ] **Step 6: Wire the callers**

`src/renderer/src/app/AppContext.tsx`, after `useApp`:

```tsx
/** App data when inside AppProvider, else null (e.g. a quiz rendered on its own in a test). */
export function useMaybeApp(): AppData | null {
  return useContext(AppCtx)
}
```

`CheatSheetDialog.tsx`: import `type SheetPoint` alongside `CheatSheet`, change the props to `{ sheet, lang, points = [], onClose }: { sheet: CheatSheet; lang: Lang; points?: SheetPoint[]; onClose(): void }` and render `<CheatSheetView sheet={sheet} lang={lang} points={points} />`.

`QuestionView.tsx`: change the cheatsheet import to `import { cheatSheetFor, sheetPoints } from '@shared/cheatsheet'`, add `import { useMaybeApp } from '../../app/AppContext'`, and in `Explain`:

```tsx
  const sheet = cheatSheetFor(f.topic)
  const bank = useMaybeApp()?.bank
  const points = sheet && bank ? sheetPoints(sheet.topic, bank) : []
```

```tsx
      {sheet && sheetOpen && (
        <CheatSheetDialog sheet={sheet} lang={lang} points={points} onClose={() => setSheetOpen(false)} />
      )}
```

`CheatSheetScreen.tsx`: import `sheetPoints` with `CHEAT_SHEETS`. In `CheatSheetIndexScreen` add `const { bank } = useApp()` and a helper above the `return`:

```tsx
  const count = (tp: Part5Topic) => {
    const n = CHEAT_SHEETS[tp].entries.length
    const p = sheetPoints(tp, bank).length
    return p ? t('cheatCountPoints', { n, p }) : t('cheatCount', { n })
  }
```

then replace the count span with `<span className="num">{count(tp)}</span>`.

In `CheatSheetScreen` pass the points:

```tsx
      <CheatSheetView key={tp} sheet={CHEAT_SHEETS[tp]} lang={lang} points={sheetPoints(tp, bank)} />
```

`src/renderer/office/CheatPane.tsx`: add `import { useApp } from '@renderer/app/AppContext'` and `sheetPoints` to the `@shared/cheatsheet` import. Inside `CheatPane`:

```tsx
  const points = sheetPoints(sheet.topic, useApp().bank)
```

After the `sheet.entries.map(...)` block, still inside `.doc-body`:

```tsx
        {points.length > 0 && (
          <section className="cheat-doc-points" aria-labelledby="oc-points">
            <h3 id="oc-points" lang={lang}>
              {t('cheatPoints', { n: points.length })}
            </h3>
            <ul>
              {points.map((p) => (
                <li key={p.key}>
                  <code>{p.key}</code> <span lang={shown}>{p[shown]}</span>
                  {p.wrong.map((w) => (
                    <s key={w} className="dim">
                      {' '}
                      ✗ {w}
                    </s>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        )}
```

- [ ] **Step 7: Styles** — `src/renderer/src/styles.css`, after the `.cheat-clues li` rule:

```css
.cheat-points { margin-top: var(--space-8); padding: var(--space-5) var(--space-6); background: var(--paper-lift); border: var(--rule) solid var(--blue); border-top: 6px solid var(--yellow); }
.cheat-points-title { margin: 0 0 var(--space-3); font: 700 var(--type-subtitle)/1.3 var(--display); color: var(--blue); }
.cheat-points ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: var(--space-2) var(--space-6); margin: 0; padding: 0; list-style: none; }
.cheat-points li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 var(--space-3); padding: var(--space-1) 0; border-bottom: 1px solid var(--rule-soft); }
.cheat-point-key { font-weight: 700; color: var(--blue); }
.cheat-point-meaning { font-size: var(--type-label); line-height: 1.7; }
.cheat-point-wrong { display: flex; flex-wrap: wrap; gap: 0 var(--space-3); font-size: var(--type-meta); color: var(--ink-soft); }
```

`src/renderer/office/office.css`, after `.cheat-doc-clues code { … }`:

```css
.cheat-doc-points ul {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
  line-height: 1.8;
}
.cheat-doc-points code {
  font: 12.5px/1.7 var(--mono);
  color: var(--accent);
}
```

- [ ] **Step 8: e2e for the private pack** — in `tests/e2e/private-pack.spec.ts`, give the existing `item` a point (add after `explain`):

```ts
  point: { key: 'must + V1', th: 'หลัง must ใช้กริยารูปเดิม', en: 'base verb after must', wrong: ['must showing'] },
```

and add a test inside the describe:

```ts
  test('PRV-03 a private item adds its point to the topic cheat sheet', async ({ launchApp }) => {
    const { page, errors } = await launchApp({ privateContent: { 'grammar/part5/modals.json': [item] } })
    await nav(page, 'Cheat sheet')
    await page.getByRole('link', { name: /Modal verbs/ }).click()
    const list = page.getByRole('region', { name: 'Points tested in drills (1)' })
    await expect(list.getByText('must + V1')).toBeVisible()
    await expect(list.getByText('base verb after must')).toBeVisible()
    await expect(list.getByText('✗ must showing')).toBeVisible()
    expect(errors).toEqual([])
  })
```

- [ ] **Step 9: Run everything**

Run: `npm run typecheck && npm test && npm run test:e2e -- tests/e2e/private-pack.spec.ts`
Expected: PASS (3 private-pack tests).

- [ ] **Step 10: Check the office UI by eye** — `npm run dev:office`, open `/cheat/modals` with the private item from Step 8 in the dev private pack (`TOEIC_PRIVATE_CONTENT` pointing at a temp folder), confirm the list renders in the side pane, then stop the app.

- [ ] **Step 11: Commit**

```bash
git add src/renderer tests/unit/renderer/CheatSheet.test.tsx tests/e2e/private-pack.spec.ts
git commit -m "feat: list every tested point on the cheat sheet, in drills and the office pane"
```

---

### Task 4: Beginner fields on sheets — mistake, clue meanings, symbol key

**Files:**
- Modify: `src/shared/cheatsheet/types.ts`
- Create: `src/shared/cheatsheet/symbols.ts`
- Modify: `src/shared/cheatsheet/index.ts` (add `export * from './symbols'`)
- Modify: `src/renderer/src/features/cheatsheet/CheatSheetView.tsx`, `src/renderer/office/CheatPane.tsx`, `src/renderer/src/app/i18n.ts`, both CSS files
- Modify: `tests/unit/cheatsheet.test.ts` (the `has no empty clue words` test)
- Create: `tests/unit/coverage.test.ts`
- Test: `tests/unit/renderer/CheatSheet.test.tsx`

**Interfaces:**
- Consumes: `formulaParts`, `CheatWord`, `Explain`.
- Produces:
  - `interface CheatMistake { wrong: string; right: string; why: Explain }`
  - `CheatEntry.mistake?: CheatMistake` (required for finished topics by `coverage.test.ts`; made required in the type in Task 10)
  - `CheatEntry.clues?: (string | CheatWord)[]` (narrowed to `CheatWord[]` in Task 10)
  - `clueText(c: string | CheatWord): string`
  - `SYMBOLS: Record<string, Explain>`, `symbolsIn(sheet: CheatSheet): string[]`
  - i18n keys `cheatMistake`, `cheatSymbols`
  - `tests/unit/coverage.test.ts` exporting nothing, with `const READY: Part5Topic[] = []` that Tasks 8–9 extend.

- [ ] **Step 1: Types** — `src/shared/cheatsheet/types.ts`, add above `CheatEntry`:

```ts
/** The error a Thai learner actually makes with this entry, shown as ✗ wrong → ✓ right. */
export interface CheatMistake {
  wrong: string
  right: string
  why: Explain
}
```

In `CheatEntry`, replace the `clues` line and add `mistake`:

```ts
  /** Signal words or pairs that point to this entry. Plain strings are being replaced by words with meanings. */
  clues?: (string | CheatWord)[]
  /** The common mistake for this entry. Every finished sheet has one (see tests/unit/coverage.test.ts). */
  mistake?: CheatMistake
```

and add below the interfaces:

```ts
/** The English of a clue, whether it is a plain string or a word with meanings. */
export const clueText = (c: string | CheatWord): string => (typeof c === 'string' ? c : c.w)
```

In `points.ts` (Task 2) replace `...(e.clues ?? [])` with `...(e.clues ?? []).map(clueText)` and import `clueText` from `./types`.

- [ ] **Step 2: Symbols** — `src/shared/cheatsheet/symbols.ts`:

```ts
import type { Explain } from '../types'
import { formulaParts } from './types'
import type { CheatSheet } from './types'

/** Every symbol a formula may use, explained once for beginners. Order is the order of the key. */
export const SYMBOLS: Record<string, Explain> = {
  S: { en: 'subject', th: 'ประธาน' },
  V: { en: 'verb', th: 'คำกริยา' },
  V1: { en: 'base verb (go, make)', th: 'กริยาช่อง 1 รูปเดิม (go, make)' },
  V2: { en: 'past simple verb (went, made)', th: 'กริยาช่อง 2 (went, made)' },
  V3: { en: 'past participle (gone, made)', th: 'กริยาช่อง 3 (gone, made)' },
  'V-ing': { en: 'verb + ing (going)', th: 'กริยาเติม -ing (going)' },
  'V-ed': { en: 'verb + ed (worked)', th: 'กริยาเติม -ed (worked)' },
  Obj: { en: 'object', th: 'กรรม (สิ่งที่ถูกกระทำ)' },
  N: { en: 'noun', th: 'คำนาม' },
  NP: { en: 'noun phrase (the new office)', th: 'กลุ่มคำนาม (the new office)' },
  Adj: { en: 'adjective', th: 'คำคุณศัพท์ (บอกลักษณะของคำนาม)' },
  Adv: { en: 'adverb', th: 'คำกริยาวิเศษณ์ (ขยายกริยาหรือคุณศัพท์)' },
  Clause: { en: 'clause (subject + verb)', th: 'อนุประโยค (มีประธาน + กริยา)' },
  Prep: { en: 'preposition (in, on, for)', th: 'คำบุพบท (in, on, for)' },
  Pron: { en: 'pronoun (he, it, they)', th: 'คำสรรพนาม (he, it, they)' },
  Det: { en: 'determiner (a, the, each)', th: 'คำนำหน้านาม (a, the, each)' }
}

const TOKEN = /\b(S|V1|V2|V3|V-ing|V-ed|V|Obj|NP|N|Adj|Adv|Clause|Prep|Pron|Det)(?=\d|\b|\()(?![a-z])/g

/** The symbols a sheet's formulas use, in key order; "S2" counts as S and "to V1" as V1. */
export function symbolsIn(sheet: CheatSheet): string[] {
  const found = new Set<string>()
  for (const e of sheet.entries)
    for (const line of e.formula)
      for (const p of formulaParts(line)) for (const m of p.text.matchAll(TOKEN)) found.add(m[1])
  return Object.keys(SYMBOLS).filter((s) => found.has(s))
}
```

- [ ] **Step 3: Write the failing tests**

In `tests/unit/cheatsheet.test.ts` replace the `has no empty clue words` test with:

```ts
  it('has no empty clue words', () => {
    for (const e of entries) for (const c of e.clues ?? []) expect(clueText(c).trim(), e.id).not.toBe('')
  })

  it('explains every symbol a formula uses', () => {
    for (const s of sheets) {
      const used = s.entries.flatMap((e) => e.formula.join(' ').match(/\b(?:S\d?|V[\w-]*|Obj|NP|N|Adj|Adv|Clause|Prep|Pron|Det)\b/g) ?? [])
      for (const u of used) {
        const base = u.replace(/^S\d$/, 'S').replace(/^V\(s\/es\)$/, 'V')
        expect(Object.keys(SYMBOLS), `${s.topic}: ${u}`).toContain(base)
      }
    }
  })
```

and extend its import: `import { CHEAT_SHEETS, SYMBOLS, clueText, exampleParts, formulaParts } from '../../src/shared/cheatsheet'`.

Create `tests/unit/coverage.test.ts`:

```ts
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../src/main/content'
import { CHEAT_SHEETS } from '../../src/shared/cheatsheet'
import type { Part5Topic, Point } from '../../src/shared/types'

/**
 * Topics whose sheet and questions are finished for beginners. Each content task adds its topics;
 * Task 10 replaces this list with every Part 5 topic.
 */
const READY: Part5Topic[] = []

const THAI = /[฀-๿]/
const { bank } = loadContent(resolve('content'))

// A loop, not describe.each, so an empty list is allowed.
for (const topic of READY) describe(`${topic} is ready for beginners`, () => {
  const sheet = CHEAT_SHEETS[topic]

  it('names every entry in Thai with the English term in brackets', () => {
    for (const e of sheet.entries) {
      expect(e.name.th, e.id).toMatch(THAI)
      expect(e.name.th, e.id).toMatch(/\([A-Za-z]/)
    }
  })

  it('gives every entry one common mistake', () => {
    for (const e of sheet.entries) {
      expect(e.mistake, e.id).toBeDefined()
      expect(e.mistake!.wrong.trim(), e.id).not.toBe('')
      expect(e.mistake!.right.trim(), e.id).not.toBe('')
      expect(e.mistake!.wrong, e.id).not.toBe(e.mistake!.right)
      expect(e.mistake!.why.th, e.id).toMatch(THAI)
      expect(e.mistake!.why.en.trim(), e.id).not.toBe('')
    }
  })

  it('gives every clue a Thai and English meaning', () => {
    for (const e of sheet.entries)
      for (const c of e.clues ?? []) {
        expect(typeof c, `${e.id}: ${JSON.stringify(c)}`).toBe('object')
        if (typeof c === 'string') continue
        expect(c.th, `${e.id}: ${c.w}`).toMatch(THAI)
        expect(c.en.trim(), `${e.id}: ${c.w}`).not.toBe('')
      }
  })

  it('has a short point on every shipped question', () => {
    const points: [string, Point | undefined][] = [
      ...bank.part5.filter((i) => i.topic === topic).map((i): [string, Point | undefined] => [i.id, i.point]),
      ...bank.part6.flatMap((s) =>
        s.blanks.flatMap((b, i): [string, Point | undefined][] => (b.topic === topic ? [[`${s.id}#${i + 1}`, b.point]] : []))
      )
    ]
    expect(points.length).toBeGreaterThan(0)
    for (const [ref, p] of points) {
      expect(p, ref).toBeDefined()
      expect(p!.th, ref).toMatch(THAI)
      expect(p!.th.length, ref).toBeLessThanOrEqual(80)
      expect(p!.en.length, ref).toBeLessThanOrEqual(80)
    }
  })
})

it('lists only real topics as ready', () => {
  for (const tp of READY) expect(CHEAT_SHEETS[tp], tp).toBeDefined()
})
```

Append to `tests/unit/renderer/CheatSheet.test.tsx`:

```tsx
describe('Beginner help on an entry', () => {
  const base = CHEAT_SHEETS.collocations
  const entry = {
    ...base.entries[0],
    clues: [{ w: 'place an order', en: 'order something', th: 'สั่งซื้อสินค้า' }],
    mistake: {
      wrong: 'do a decision',
      right: 'make a decision',
      why: { en: 'Decision goes with make.', th: 'decision ใช้คู่กับ make' }
    }
  }
  const sheet = { ...base, entries: [entry] }

  it('shows the common mistake as ✗ wrong and ✓ right, with the reason', () => {
    render(<CheatSheetView sheet={sheet} lang="th" />)
    const card = screen.getByRole('article', { name: entry.name.th })
    expect(within(card).getByText('✗ do a decision')).toBeTruthy()
    expect(within(card).getByText('✓ make a decision')).toBeTruthy()
    expect(within(card).getByText('decision ใช้คู่กับ make')).toBeTruthy()
  })

  it('shows each clue with its meaning', () => {
    render(<CheatSheetView sheet={sheet} lang="th" />)
    const card = screen.getByRole('article', { name: entry.name.th })
    expect(within(card).getByText('place an order')).toBeTruthy()
    expect(within(card).getByText('สั่งซื้อสินค้า')).toBeTruthy()
  })

  it('explains the symbols the sheet uses', () => {
    render(<CheatSheetView sheet={CHEAT_SHEETS['tense-voice']} lang="th" />)
    const key = screen.getByLabelText('สัญลักษณ์')
    expect(within(key).getByText('S')).toBeTruthy()
    expect(within(key).getByText('ประธาน')).toBeTruthy()
  })
})
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx vitest run tests/unit/cheatsheet.test.ts tests/unit/coverage.test.ts tests/unit/renderer/CheatSheet.test.tsx`
Expected: the three `Beginner help on an entry` tests FAIL (no ✗ line, no clue meaning, no symbol key). The `explains every symbol` test PASSES or names a missing symbol; if it names one, add it to `SYMBOLS` with a Thai and English meaning. `coverage.test.ts` passes with an empty `READY`.

- [ ] **Step 5: i18n keys** — en block after `cheatCountPoints`:

```ts
  cheatMistake: 'Common mistake',
  cheatSymbols: 'Symbols',
```

th block after `cheatCountPoints`:

```ts
  cheatMistake: 'ที่มักผิด',
  cheatSymbols: 'สัญลักษณ์',
```

- [ ] **Step 6: Render in `CheatSheetView.tsx`** — import `SYMBOLS`, `clueText`, `symbolsIn` from `@shared/cheatsheet`. Replace the clues block in `EntryCard` with:

```tsx
      {entry.mistake && (
        <p className="cheat-mistake">
          <span className="cheat-mistake-label" lang={uiLang}>
            {t(uiLang, 'cheatMistake')}
          </span>
          <span lang="en">
            <s>✗ {entry.mistake.wrong}</s> <strong>✓ {entry.mistake.right}</strong>
          </span>
          <span className="cheat-mistake-why" lang={lang}>
            {entry.mistake.why[lang]}
          </span>
        </p>
      )}
      {entry.clues && entry.clues.length > 0 && (
        <div className="cheat-clues">
          <span className="cheat-clues-label" lang={uiLang}>
            {t(uiLang, 'cheatClues')}
          </span>
          <ul>
            {entry.clues.map((c) => (
              <li key={clueText(c)}>
                <span lang="en">{clueText(c)}</span>
                {typeof c !== 'string' && (
                  <span className="cheat-clue-meaning" lang={lang}>
                    {c[lang]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
```

Add a `SymbolKey` component above `CheatSheetView`:

```tsx
/** What S, V3, Obj… mean, for only the symbols this sheet uses. */
function SymbolKey({ sheet, lang, uiLang }: { sheet: CheatSheet; lang: Lang; uiLang: Lang }) {
  const used = symbolsIn(sheet)
  if (used.length === 0) return null
  return (
    <dl className="cheat-symbols" aria-label={t(uiLang, 'cheatSymbols')}>
      {used.map((s) => (
        <div key={s}>
          <dt lang="en">{s}</dt>
          <dd lang={lang}>{SYMBOLS[s][lang]}</dd>
        </div>
      ))}
    </dl>
  )
}
```

and render it in `CheatSheetView` between `.cheat-sheet-head` and `.cheat-entries`:

```tsx
      <SymbolKey sheet={sheet} lang={shown} uiLang={lang} />
```

- [ ] **Step 7: Same in `CheatPane.tsx`** — import `SYMBOLS`, `clueText`, `symbolsIn`. Replace the clues `<code key={c}>{c}</code>` with:

```tsx
                {e.clues.map((c) => (
                  <code key={clueText(c)} title={typeof c === 'string' ? undefined : c[shown]}>
                    {clueText(c)}
                    {typeof c !== 'string' && <span className="dim" lang={shown}> {c[shown]}</span>}
                  </code>
                ))}
```

Add after the clues paragraph, inside the `article`:

```tsx
            {e.mistake && (
              <p className="cheat-doc-mistake">
                <s>✗ {e.mistake.wrong}</s> <strong>✓ {e.mistake.right}</strong>{' '}
                <span className="dim" lang={shown}>
                  {e.mistake.why[shown]}
                </span>
              </p>
            )}
```

and after `.cheat-doc-intro`:

```tsx
        {symbolsIn(sheet).length > 0 && (
          <dl className="cheat-doc-words" aria-label={t('cheatSymbols')}>
            {symbolsIn(sheet).map((s) => (
              <div key={s}>
                <dt className="mono">{s}</dt>
                <dd lang={shown}>{SYMBOLS[s][shown]}</dd>
              </div>
            ))}
          </dl>
        )}
```

- [ ] **Step 8: Styles** — `styles.css`, after the `.cheat-point-wrong` rule from Task 3:

```css
.cheat-symbols { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-5); margin: 0 0 var(--space-6); font-size: var(--type-label); }
.cheat-symbols > div { display: flex; gap: var(--space-2); }
.cheat-symbols dt { font-weight: 700; color: var(--blue); }
.cheat-symbols dd { margin: 0; }
.cheat-mistake { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--space-1) var(--space-3); margin: 0; padding: var(--space-2) var(--space-3); border-left: 3px solid var(--pink-ink); background: var(--paper); font-size: var(--type-label); line-height: 1.7; }
.cheat-mistake-label { font: 600 var(--type-meta)/1.5 var(--display); color: var(--pink-ink); }
.cheat-mistake s { color: var(--ink-soft); }
.cheat-mistake-why { flex-basis: 100%; }
.cheat-clue-meaning { margin-left: var(--space-2); color: var(--ink-soft); }
```

`office.css`, after `.cheat-doc-points code`:

```css
.cheat-doc-mistake {
  font-size: 12.5px;
  line-height: 1.7;
}
```

- [ ] **Step 9: Run tests**

Run: `npm run typecheck && npm test`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add src tests
git commit -m "feat: add common mistakes, clue meanings and a symbol key to cheat sheets"
```

---

### Task 5: `npm run points` backfill

**Files:**
- Create: `scripts/lib/points.ts`, `scripts/points.ts`
- Modify: `package.json` (`scripts`: add `"points": "tsx scripts/points.ts",` after `"import"`)
- Test: `tests/unit/points-script.test.ts`

**Interfaces:**
- Consumes: `Point`, `Part5Item`, `Part6Set`, `PART5_TOPICS`, `Part5Topic`; `Prompt` type from `scripts/lib/gen.ts`; `ask` from `scripts/lib/claude.ts`; `chunk` from `scripts/lib/import/args.ts`; `privateContentRoot` from `src/main/privateRoot.ts`.
- Produces (all from `scripts/lib/points.ts`):
  - `POINT_RULES: string` — prompt text for the `point` field (used by Task 6)
  - `GenPoint` — loose zod object `{ key, th, en, wrong: string[] }` for structured outputs
  - `toPoint(g: GenPoint-shaped): Point | null`
  - `interface ContentFile { path: string; text: string; data: unknown[] }`
  - `interface PointTarget { file; ref; topic; text; answer; wrong: string[]; trap }`
  - `findTargets(files: ContentFile[], topic?: Part5Topic): PointTarget[]`
  - `blankText(set: Part6Set, i: number): string`
  - `PointResult`, `pointPrompt(topic, targets): Prompt`
  - `applyPoints(data: unknown[], points: Map<string, Point>): unknown[]`
  - `formatLike(original: string, data: unknown[]): string`

- [ ] **Step 1: Write the failing test** — `tests/unit/points-script.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { applyPoints, blankText, findTargets, formatLike, pointPrompt, toPoint } from '../../scripts/lib/points'
import { makePart5, makePart6 } from '../fixtures/items'

const point = { key: 'exercise caution', th: 'ใช้ความระมัดระวัง', en: 'be careful' }

describe('findTargets', () => {
  it('finds Part 5 items and Part 5-topic blanks without a point, with the answer shown in brackets', () => {
    const p5 = makePart5({ id: 'p5-collocations-0009', topic: 'collocations', stem: 'Staff should ____ caution.', choices: ['exercise', 'perform', 'execute', 'train'], answer: 0 })
    const done = makePart5({ topic: 'collocations', point })
    const set = makePart6({ id: 'p6-0001' })
    const files = [
      { path: 'a.json', text: '', data: [p5, done] },
      { path: 'sets.json', text: '', data: [set] }
    ]
    const targets = findTargets(files)
    expect(targets.map((t) => t.ref)).toEqual(['p5-collocations-0009', 'p6-0001#1', 'p6-0001#4'])
    expect(targets[0]).toMatchObject({ topic: 'collocations', text: 'Staff should [exercise] caution.', answer: 'exercise', wrong: ['perform', 'execute', 'train'] })
  })

  it('filters by topic', () => {
    const files = [{ path: 'a.json', text: '', data: [makePart5({ topic: 'modals' }), makePart5({ topic: 'collocations' })] }]
    expect(findTargets(files, 'collocations')).toHaveLength(1)
  })
})

describe('blankText', () => {
  it('fills every blank and brackets the one asked about', () => {
    const set = makePart6()
    expect(blankText(set, 3)).toBe('One a two c three a four [d].')
  })
})

describe('toPoint', () => {
  it('keeps up to three wrong pairs and drops an empty list', () => {
    expect(toPoint({ ...point, wrong: [] })).toEqual(point)
    expect(toPoint({ ...point, wrong: ['a', 'b', 'c', 'd'] })?.wrong).toEqual(['a', 'b', 'c'])
  })
  it('returns null for an invalid point', () => {
    expect(toPoint({ ...point, key: ' ', wrong: [] })).toBeNull()
  })
})

describe('applyPoints', () => {
  it('writes the point after explain on items and blanks, leaving others alone', () => {
    const p5 = makePart5({ id: 'p5-collocations-0001' })
    const other = makePart5({ id: 'p5-collocations-0002' })
    const set = makePart6({ id: 'p6-0001' })
    const out = applyPoints([p5, other, set], new Map([['p5-collocations-0001', point], ['p6-0001#2', point]])) as any[]
    expect(Object.keys(out[0])).toEqual([...Object.keys(p5).slice(0, Object.keys(p5).indexOf('explain') + 1), 'point', ...Object.keys(p5).slice(Object.keys(p5).indexOf('explain') + 1)])
    expect(out[0].point).toEqual(point)
    expect(out[1]).toBe(other)
    expect(out[2].blanks[1].point).toEqual(point)
    expect(out[2].blanks[0].point).toBeUndefined()
  })
})

describe('formatLike', () => {
  it('keeps short string arrays on one line when the original did', () => {
    const original = '[\n  {\n    "choices": ["a", "b"]\n  }\n]\n'
    expect(formatLike(original, [{ choices: ['a', 'b'], point: { key: 'k', th: 't', en: 'e', wrong: ['x', 'y'] } }])).toBe(
      '[\n  {\n    "choices": ["a", "b"],\n    "point": {\n      "key": "k",\n      "th": "t",\n      "en": "e",\n      "wrong": ["x", "y"]\n    }\n  }\n]\n'
    )
  })
  it('keeps plain JSON.stringify layout when the original used it', () => {
    const original = '[\n  {\n    "choices": [\n      "a"\n    ]\n  }\n]\n'
    expect(formatLike(original, [{ choices: ['a'] }])).toBe(original)
  })
})

describe('pointPrompt', () => {
  it('numbers the items and includes the rules', () => {
    const p = pointPrompt('collocations', [
      { file: 'a.json', ref: 'x', topic: 'collocations', text: 'Staff should [exercise] caution.', answer: 'exercise', wrong: ['perform'], trap: "'exercise caution'" }
    ])
    expect(p.system).toContain('"key"')
    expect(JSON.parse(p.user)).toEqual([{ index: 0, text: 'Staff should [exercise] caution.', answer: 'exercise', wrong_choices: ['perform'], tested: "'exercise caution'" }])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/points-script.test.ts`
Expected: FAIL — cannot find module `../../scripts/lib/points`.

- [ ] **Step 3: Implement `scripts/lib/points.ts`**

```ts
import { z } from 'zod'
import { PART5_TOPICS, Part5Item, Part6Set, Point, type Part5Topic } from '../../src/shared/types'
import type { Prompt } from './gen'

/** How to write the cheat-sheet point; shared by gen, import and the backfill. */
export const POINT_RULES = `- "point": what the learner must remember, written for a Thai beginner. It is listed on the topic's cheat sheet.
  - "key": the exact English phrase or pattern tested, as short as possible, e.g. "exercise caution", "responsible for", "If + had V3, would have V3". Use the answer's base form when a whole phrase is tested.
  - "th": one short line of plain Thai, 60 characters or less, giving the meaning or the rule, e.g. "ใช้ความระมัดระวัง". Put a Thai word next to any grammar term.
  - "en": the same in one short line of simple English, e.g. "be careful".
  - "wrong": 1–3 wrong phrases built from the wrong choices in the same context, e.g. "perform caution". Only phrases a learner might really write; [] if none fit.`

/** Loose shape for structured outputs; `toPoint` validates it. */
export const GenPoint = z.object({ key: z.string(), th: z.string(), en: z.string(), wrong: z.array(z.string()) })
export type GenPoint = z.infer<typeof GenPoint>

export function toPoint(g: GenPoint): Point | null {
  const wrong = g.wrong.map((w) => w.trim()).filter(Boolean).slice(0, 3)
  const r = Point.safeParse({ key: g.key, th: g.th, en: g.en, ...(wrong.length ? { wrong } : {}) })
  return r.success ? r.data : null
}

export interface ContentFile {
  path: string
  /** The file as read, so the write keeps its layout. */
  text: string
  data: unknown[]
}

/** A question or Part 6 blank that has no point yet. */
export interface PointTarget {
  file: string
  /** Item id, or set id + "#" + blank number 1–4. */
  ref: string
  topic: Part5Topic
  /** The sentence or passage with the answer shown in [brackets]. */
  text: string
  answer: string
  wrong: string[]
  trap: string
}

const isPart5Topic = (t: string): t is Part5Topic => (PART5_TOPICS as readonly string[]).includes(t)
const others = (choices: string[], answer: number) => choices.filter((_, i) => i !== answer)

/** The passage with every blank filled; the one asked about is in [brackets]. */
export function blankText(set: Part6Set, i: number): string {
  return set.passage.replace(/\{\{([1-4])\}\}/g, (_, n: string) => {
    const b = set.blanks[Number(n) - 1]
    const word = b.choices[b.answer]
    return Number(n) - 1 === i ? `[${word}]` : word
  })
}

export function findTargets(files: ContentFile[], topic?: Part5Topic): PointTarget[] {
  const out: PointTarget[] = []
  for (const f of files) {
    for (const raw of f.data) {
      const p5 = Part5Item.safeParse(raw)
      if (p5.success) {
        const it = p5.data
        if (it.point || (topic && it.topic !== topic)) continue
        const answer = it.choices[it.answer]
        out.push({ file: f.path, ref: it.id, topic: it.topic, text: it.stem.replace('____', `[${answer}]`), answer, wrong: others(it.choices, it.answer), trap: it.trap })
        continue
      }
      const p6 = Part6Set.safeParse(raw)
      if (!p6.success) continue
      p6.data.blanks.forEach((b, i) => {
        if (b.point || !isPart5Topic(b.topic) || (topic && b.topic !== topic)) return
        out.push({ file: f.path, ref: `${p6.data.id}#${i + 1}`, topic: b.topic, text: blankText(p6.data, i), answer: b.choices[b.answer], wrong: others(b.choices, b.answer), trap: b.trap })
      })
    }
  }
  return out
}

export const PointResult = z.object({ points: z.array(GenPoint.extend({ index: z.number().int() })) })
export type PointResult = z.infer<typeof PointResult>

export function pointPrompt(topic: Part5Topic, targets: PointTarget[]): Prompt {
  const system = `You write cheat-sheet lines for Thai beginners preparing for TOEIC. Each numbered item is a "${topic}" question; its answer is shown in [brackets] in "text", "tested" says what it tests.
Return exactly one entry per input item, echoing its "index" unchanged, with the fields of "point" below.
${POINT_RULES}`
  const user = targets.map((t, index) => ({ index, text: t.text, answer: t.answer, wrong_choices: t.wrong, tested: t.trap }))
  return { system, user: JSON.stringify(user, null, 2) }
}

/** Puts `point` right after `explain`, replacing any earlier one. */
function withPoint(o: Record<string, unknown>, p: Point): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(o)) {
    if (k === 'point') continue
    out[k] = v
    if (k === 'explain') out.point = p
  }
  if (!('point' in out)) out.point = p
  return out
}

/** Writes each point into the item or blank its ref names; everything else is returned as it was. */
export function applyPoints(data: unknown[], points: Map<string, Point>): unknown[] {
  return data.map((raw) => {
    const obj = raw as Record<string, unknown>
    const id = obj?.id
    if (typeof id !== 'string') return raw
    const own = points.get(id)
    if (own) return withPoint(obj, own)
    const blanks = obj.blanks
    if (!Array.isArray(blanks) || !blanks.some((_, i) => points.has(`${id}#${i + 1}`))) return raw
    return {
      ...obj,
      blanks: blanks.map((b: Record<string, unknown>, i) => {
        const p = points.get(`${id}#${i + 1}`)
        return p ? withPoint(b, p) : b
      })
    }
  })
}

/** JSON in the original file's layout: the hand-written Part 5 files keep string arrays on one line. */
export function formatLike(original: string, data: unknown[]): string {
  const plain = JSON.stringify(data, null, 2) + '\n'
  if (/"choices": \[\n/.test(original)) return plain
  return plain.replace(/\[\n\s+("(?:[^"\\\n]|\\.)*"(?:,\n\s+"(?:[^"\\\n]|\\.)*")*)\n\s+\]/g, (_, body: string) => `[${body.replace(/,\n\s+/g, ', ')}]`)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/points-script.test.ts`
Expected: PASS. If `blankText` differs, check the fixture: `makePart6` blanks answer indexes are `0, 2, 0, 3` with choices `a b c d`.

- [ ] **Step 5: Implement `scripts/points.ts`**

```ts
/**
 * Adds a cheat-sheet point to every question and Part 6 blank that has none:
 *   npm run points                         shipped content
 *   npm run points -- --topic collocations one topic
 *   npm run points -- --private            the private pack
 * Rerunning only fills what is still missing.
 * Needs ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") or an `ant auth login` profile.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { privateContentRoot } from '../src/main/privateRoot'
import { Part5Topic, type Point } from '../src/shared/types'
import { ask } from './lib/claude'
import { chunk } from './lib/import/args'
import { PointResult, applyPoints, findTargets, formatLike, pointPrompt, toPoint, type ContentFile, type PointTarget } from './lib/points'

function parseArgs(argv: string[]): { topic?: Part5Topic; private: boolean } {
  const out: { topic?: Part5Topic; private: boolean } = { private: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--private') out.private = true
    else if (argv[i] === '--topic') {
      const r = Part5Topic.safeParse(argv[++i])
      if (!r.success) throw new Error(`--topic must be a Part 5 topic (got "${argv[i]}")`)
      out.topic = r.data
    } else throw new Error(`unknown argument "${argv[i]}"`)
  }
  return out
}

const jsonIn = (dir: string): string[] =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f)) : []

function readFiles(root: string): ContentFile[] {
  return [...jsonIn(join(root, 'grammar', 'part5')), ...jsonIn(join(root, 'grammar', 'part6'))].map((path) => {
    const text = readFileSync(path, 'utf8')
    return { path, text, data: JSON.parse(text) as unknown[] }
  })
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const root = args.private ? privateContentRoot(process.env.APPDATA ?? '') : resolve('content')
  const files = readFiles(root)
  const targets = findTargets(files, args.topic)
  console.log(`${targets.length} questions need a point in ${root}`)

  const byTopic = new Map<Part5Topic, PointTarget[]>()
  for (const t of targets) byTopic.set(t.topic, [...(byTopic.get(t.topic) ?? []), t])

  let done = 0
  let failed = 0
  for (const [topic, list] of byTopic) {
    for (const batch of chunk(list, 10)) {
      const p = pointPrompt(topic, batch)
      const res = await ask(PointResult, p.system, p.user, { effort: 'medium' })
      const points = new Map<string, Point>()
      batch.forEach((t, i) => {
        const r = res.points.find((x) => x.index === i)
        const point = r ? toPoint(r) : null
        if (point) points.set(t.ref, point)
        else {
          failed++
          console.warn(`  ${t.ref}: no valid point returned; rerun to retry`)
        }
      })
      // Write each touched file now, so a crash or Ctrl+C keeps what is done.
      for (const path of new Set(batch.map((t) => t.file))) {
        const f = files.find((x) => x.path === path)!
        f.data = applyPoints(f.data, points)
        writeFileSync(path, formatLike(f.text, f.data), 'utf8')
      }
      done += points.size
      console.log(`${topic}: ${done}/${targets.length}`)
    }
  }
  console.log(`\nDone. ${done} points written, ${failed} failed.`)
  if (failed) process.exitCode = 1
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  if (err instanceof Error && /authentication/i.test(err.message)) {
    console.error('\nNo Claude credentials found. Set ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") and run again.')
  }
  process.exit(1)
})
```

Add to `package.json` `scripts`, after `"import": …,`:

```json
    "points": "tsx scripts/points.ts",
```

- [ ] **Step 6: Check it runs without touching content** — run with a bad argument:

Run: `npm run points -- --topic nope`
Expected: exits 1 with `--topic must be a Part 5 topic (got "nope")`; `git status` shows no content change.

- [ ] **Step 7: Run all tests and commit**

Run: `npm run typecheck && npm test`

```bash
git add scripts/lib/points.ts scripts/points.ts package.json tests/unit/points-script.test.ts
git commit -m "feat: add npm run points to backfill cheat-sheet points"
```

---

### Task 6: New questions carry a point (gen and import)

**Files:**
- Modify: `scripts/lib/gen.ts` (`genChoiceFields`, `EXPLAIN_FIELD_RULES`, `toPart5Drafts`, `toPart6Drafts`)
- Modify: `scripts/lib/import/prompts.ts` (`SolveResult`)
- Modify: `scripts/lib/import/build.ts` (`buildItems`)
- Test: `tests/unit/gen.test.ts`, `tests/unit/import-build.test.ts`

**Interfaces:**
- Consumes: `POINT_RULES`, `GenPoint`, `toPoint` (Task 5).
- Produces: drafts from `toPart5Drafts` / `toPart6Drafts` and items from `buildItems` include `point` when Claude returns a valid one.

- [ ] **Step 1: Write the failing tests**

`tests/unit/gen.test.ts`: add `point` to `genItem`'s defaults:

```ts
  difficulty: 3,
  point: { key: 'Adv + V3', th: 'ใช้ adverb ขยายกริยา', en: 'an adverb describes the verb', wrong: ['final approved'] },
  ...over
```

and add to the `toPart5Drafts` describe:

```ts
  it('keeps the point on each draft', () => {
    const { items } = toPart5Drafts({ items: [genItem()] }, 'word-form', 1)
    expect(items[0].point).toEqual({ key: 'Adv + V3', th: 'ใช้ adverb ขยายกริยา', en: 'an adverb describes the verb', wrong: ['final approved'] })
  })

  it('drops an invalid point but keeps the draft', () => {
    const { items, errors } = toPart5Drafts({ items: [genItem({ point: { key: '', th: '', en: '', wrong: [] } })] }, 'word-form', 1)
    expect(errors).toEqual([])
    expect(items[0].point).toBeUndefined()
  })
```

and in the `toPart6Drafts` test add `expect(items[0].blanks[0].point?.key).toBe('Adv + V3')`.

Also add a test that the rules reach the prompt:

```ts
describe('EXPLAIN_FIELD_RULES', () => {
  it('asks for a beginner point', () => {
    expect(EXPLAIN_FIELD_RULES).toContain('"point"')
  })
})
```

(import `EXPLAIN_FIELD_RULES` from `../../scripts/lib/gen`).

`tests/unit/import-build.test.ts`: add to `solved`'s defaults `point: { key: 'must + V1', th: 'หลัง must ใช้กริยารูปเดิม', en: 'base verb after must', wrong: ['must signing'] },` and in the first `buildItems` test add:

```ts
    expect(out.approved[0].point?.key).toBe('must + V1')
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/gen.test.ts tests/unit/import-build.test.ts`
Expected: FAIL — type error on `point` in `genItem`/`solved`, and `point` undefined on drafts.

- [ ] **Step 3: Implement**

`scripts/lib/gen.ts`: add `import { GenPoint, POINT_RULES, toPoint } from './points'` and add `type Point` to the existing `../../src/shared/types` import. In `genChoiceFields` add `point: GenPoint`. Append the rules:

```ts
export const EXPLAIN_FIELD_RULES = `- "trap": a short English label naming exactly what is tested, e.g. "adverb modifies the verb 'implemented'".
- "explain_en": 1–3 sentences on why the answer is right and why the most tempting distractor is wrong.
- "explain_th": the same explanation in natural, friendly Thai for Thai learners. Keep key grammar terms in English in parentheses, e.g. คำกริยาวิเศษณ์ (adverb).
${POINT_RULES}`
```

In `toPart5Drafts`'s `safeParse` object, after `explain`:

```ts
      ...pointField(g.point),
```

and in `toPart6Drafts`'s blank mapping, after `explain`:

```ts
        ...pointField(b.point),
```

with a helper above `toPart5Drafts`:

```ts
/** A valid point as a field to spread in; an invalid one is dropped so the draft still saves. */
const pointField = (g: GenPoint): { point?: Point } => {
  const p = toPoint(g)
  return p ? { point: p } : {}
}
```

`scripts/lib/import/prompts.ts`: import `GenPoint` from `../points` and add `point: GenPoint,` to the `SolveResult` item object after `explain_th`. (`solvePrompt` already includes `EXPLAIN_FIELD_RULES`.)

`scripts/lib/import/build.ts`: import `toPoint` from `../points` and in `buildItems`'s `safeParse` object, after `explain`:

```ts
      ...(() => {
        const p = toPoint(s.point)
        return p ? { point: p } : {}
      })(),
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run typecheck && npm test`
Expected: PASS. If other tests build `SolveResult`/`GenPart5` objects without `point`, add the same `point` default there.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib tests/unit/gen.test.ts tests/unit/import-build.test.ts
git commit -m "feat: generated and imported questions include a cheat-sheet point"
```

---

### Task 7: Review output — answer sheet and cheat sheet audit

**Files:**
- Modify: `scripts/answer-sheet.ts` (Part 5 table, Part 6 table)
- Modify: `scripts/cheatsheet-review.ts`

**Interfaces:**
- Consumes: `sheetPoints`, `uncoveredPoints`, `symbolsIn`, `SYMBOLS`, `clueText` (Tasks 2, 4); `loadContent`.
- Produces: `docs/content-review/answer-sheet.md` with a `point` column; `docs/content-review/cheatsheet.md` with mistakes, clue meanings, symbol keys, the tested points and an "Not on any entry" list per topic.

- [ ] **Step 1: Answer sheet** — in `scripts/answer-sheet.ts` add a helper under `others`:

```ts
const pointCell = (p?: { key: string; th: string; wrong?: string[] }) =>
  p ? cell(`${p.key} = ${p.th}${p.wrong?.length ? ` · ✗ ${p.wrong.join(', ')}` : ''}`) : '**missing**'
```

Part 5 header and row become:

```ts
  lines.push(`## Part 5 · ${topic} (${items.length})`, '', '| id | sentence | wrong choices | tested point | point (cheat sheet) | คำอธิบาย |', '|---|---|---|---|---|---|')
```

```ts
      `| ${i.id.replace(`p5-${topic}-`, '')} | ${cell(filled(i.stem, i.choices[i.answer]))} | ${cell(others(i.choices, i.answer))} | ${cell(i.trap)} | ${pointCell(i.point)} | ${cell(i.explain.th)} |`
```

Part 6 header and row become:

```ts
  lines.push('| blank | topic | wrong choices | tested point | point (cheat sheet) | คำอธิบาย |', '|---|---|---|---|---|---|')
```

```ts
    lines.push(`| ${i + 1} | ${b.topic} | ${cell(others(b.choices, b.answer))} | ${cell(b.trap)} | ${b.topic === 'sentence-insertion' || b.topic === 'transitions' ? '' : pointCell(b.point)} | ${cell(b.explain.th)} |`)
```

- [ ] **Step 2: Cheat sheet review** — replace the body of `scripts/cheatsheet-review.ts` from `const lines` to the end of the `for` loop:

```ts
const { bank, errors } = loadContent(resolve('content'))
if (errors.length) console.warn(errors.join('\n'))

const lines: string[] = [
  '# Grammar cheat sheet',
  '',
  `${total} formulas across ${PART5_TOPICS.length} Part 5 topics. Check that each formula and example is correct English, the bold part is what the formula produces, the Thai reads naturally for a beginner, and each mistake is one Thai learners really make. "Not on any entry" lists points the drills test that only the auto list shows; fold general ones into an entry. Note the id of anything wrong.`,
  ''
]

for (const tp of PART5_TOPICS) {
  const sheet = CHEAT_SHEETS[tp]
  const points = sheetPoints(tp, bank)
  lines.push(`## ${tp}`, '', sheet.intro.en, '', sheet.intro.th, '')
  const syms = symbolsIn(sheet)
  if (syms.length) lines.push(`Symbols: ${syms.map((s) => `\`${s}\` = ${SYMBOLS[s].th}`).join(' · ')}`, '')
  for (const e of sheet.entries) {
    lines.push(`### ${e.name.en} · ${e.name.th} \`${e.id}\``, '')
    for (const f of e.formula) lines.push(`    ${f}`)
    if (e.words?.length) lines.push('', ...e.words.map((w) => `- \`${w.w}\` = ${w.th} (${w.en})`))
    lines.push('', `- ${e.use.en}`, `- ${e.use.th}`, `- ${bold(e.example.en)}`, `- ${e.example.th}`)
    if (e.mistake) lines.push(`- ✗ ${e.mistake.wrong} → ✓ ${e.mistake.right}: ${e.mistake.why.th} (${e.mistake.why.en})`)
    else lines.push('- **no common mistake yet**')
    if (e.clues?.length) {
      lines.push(`- Clues: ${e.clues.map((c) => (typeof c === 'string' ? `${c} (**no meaning**)` : `${c.w} = ${c.th}`)).join(' · ')}`)
    }
    lines.push('')
  }
  lines.push(`### Tested in drills (${points.length})`, '')
  for (const p of points) lines.push(`- \`${p.key}\` = ${p.th} (${p.en})${p.wrong.length ? ` · ✗ ${p.wrong.join(', ')}` : ''}`)
  const gaps = uncoveredPoints(sheet, points)
  lines.push('', `Not on any entry (${gaps.length}): ${gaps.map((p) => `\`${p.key}\``).join(', ') || 'none'}`, '')
}
```

Update the imports:

```ts
import { loadContent } from '../src/main/content'
import { CHEAT_SHEETS, SYMBOLS, sheetPoints, symbolsIn, uncoveredPoints } from '../src/shared/cheatsheet'
```

- [ ] **Step 3: Run both** — they must succeed on today's content (points still missing):

Run: `npx tsx scripts/answer-sheet.ts && npm run cheatsheet:review && npm run typecheck`
Expected: both write their files; the answer sheet shows `**missing**` in the point column; the cheat sheet shows `no common mistake yet` and `Tested in drills (0)`.

- [ ] **Step 4: Commit** (scripts and regenerated docs together)

```bash
git add scripts/answer-sheet.ts scripts/cheatsheet-review.ts docs/content-review
git commit -m "feat: show points, mistakes and uncovered drill points in the review docs"
```

---

### Task 8: Collocations — points and a beginner sheet

**Files:**
- Modify: `content/grammar/part5/collocations.json`, `content/grammar/part6/sets.json` (via `npm run points`)
- Modify: `src/shared/cheatsheet/collocations.ts`
- Modify: `tests/unit/coverage.test.ts` (`READY`)
- Modify: `tests/unit/renderer/CheatSheet.test.tsx` only if a test there reads collocations clues as strings
- Test: `tests/e2e/grammar.spec.ts` (new test at the end of its describe)
- Regenerate: `docs/content-review/answer-sheet.md`, `docs/content-review/cheatsheet.md`

**Interfaces:**
- Consumes: everything above.
- Produces: `READY = ['collocations']`.

- [ ] **Step 1: Mark the topic ready (failing test)** — in `tests/unit/coverage.test.ts`:

```ts
const READY: Part5Topic[] = ['collocations']
```

Run: `npx vitest run tests/unit/coverage.test.ts`
Expected: FAIL — entries have no mistake, clues are strings, questions have no point.

- [ ] **Step 2: Backfill the points**

Run: `npm run points -- --topic collocations`
Expected: `12 questions need a point` (10 Part 5 items + `p6-0007#3` + `p6-0015#1`), then `Done. 12 points written, 0 failed.`

If the script stops with "No Claude credentials found", do not guess at a key: write the 12 points by hand into the JSON, after each `explain`, following `POINT_RULES` in `scripts/lib/points.ts`. These are the expected values to check the script's output against (adjust wording only if the script's is clearly better):

| ref | key | th | en | wrong |
|---|---|---|---|---|
| p5-collocations-0001 | meet a deadline | ทำงานเสร็จทันกำหนด | finish on time | reach a deadline, achieve a deadline |
| p5-collocations-0002 | place an order | สั่งซื้อสินค้า | order something | put an order, do an order |
| p5-collocations-0003 | conduct a survey | ทำการสำรวจ | carry out a survey | make a survey, operate a survey |
| p5-collocations-0004 | raise awareness | สร้างความตระหนักรู้ | make people know more | rise awareness, arise awareness |
| p5-collocations-0005 | take effect | เริ่มมีผลบังคับใช้ | start to apply | make effect, give effect |
| p5-collocations-0006 | highly recommended | ได้รับการแนะนำอย่างมาก | strongly recommended | deeply recommended, greatly recommended |
| p5-collocations-0007 | comply with | ปฏิบัติตาม (กฎ, ข้อบังคับ) | follow (rules) | obey with, follow with |
| p5-collocations-0008 | adhere to | ยึดถือ ปฏิบัติตาม | follow closely | follow to, obey to |
| p5-collocations-0009 | exercise caution | ใช้ความระมัดระวัง | be careful | perform caution, execute caution |
| p5-collocations-0010 | address concerns | จัดการ/ตอบข้อกังวล | deal with worries | solve concerns, talk concerns |
| p6-0007#3 | meet the needs | ตอบสนองความต้องการ | give what is needed | make the needs, do the needs |
| p6-0015#1 | make someone aware of | ทำให้ใครรู้เรื่อง… | tell someone about | let someone aware of |

- [ ] **Step 3: Check the points** — `git diff content/` must show only added `"point"` blocks (no reformatted choices). Read every `th`: plain Thai, one line, no bare grammar terms.

- [ ] **Step 4: Rewrite `src/shared/cheatsheet/collocations.ts`**

```ts
import type { CheatSheet } from './types'

export const collocations: CheatSheet = {
  topic: 'collocations',
  intro: {
    en: 'Some words always go together, like make a decision. The test gives you four words that look right; only one goes with the word next to the blank. Translating from Thai word by word usually picks the wrong one, so learn each pair as one piece.',
    th: 'คำบางคำต้องใช้คู่กันเสมอ เช่น make a decision (ตัดสินใจ) ข้อสอบจะให้เลือกคำที่ "เข้าคู่" กับคำข้างช่องว่าง ถ้าแปลตรงจากภาษาไทยทีละคำมักเลือกผิด ให้จำเป็นคู่ทั้งก้อน'
  },
  entries: [
    {
      id: 'verb-noun-collocations',
      name: { en: 'Verb + noun', th: 'กริยา + คำนาม (verb + noun)' },
      formula: ['make + a decision/an effort/a reservation', 'take + place/part/action/effect', 'meet + a deadline/a demand/the needs'],
      use: {
        en: 'The verb is fixed by the noun after it. Look at the noun first, then pick the verb that goes with it.',
        th: 'คำนามข้างหลังเป็นตัวกำหนดว่าต้องใช้กริยาตัวไหน ให้ดูคำนามก่อน แล้วเลือกกริยาที่เป็นคู่ของมัน'
      },
      example: {
        en: 'Warehouse staff must {{exercise}} caution near the loading dock.',
        th: 'พนักงานคลังสินค้าต้องใช้ความระมัดระวังใกล้จุดขนถ่ายสินค้า'
      },
      clues: [
        { w: 'meet a deadline', en: 'finish on time', th: 'ทำงานเสร็จทันกำหนด' },
        { w: 'place an order', en: 'order something', th: 'สั่งซื้อสินค้า' },
        { w: 'conduct a survey', en: 'carry out a survey', th: 'ทำการสำรวจ' },
        { w: 'take effect', en: 'start to apply', th: 'เริ่มมีผลบังคับใช้' },
        { w: 'raise awareness', en: 'make people know more', th: 'สร้างความตระหนักรู้' },
        { w: 'exercise caution', en: 'be careful', th: 'ใช้ความระมัดระวัง' },
        { w: 'address concerns', en: 'deal with worries', th: 'จัดการ/ตอบข้อกังวล' },
        { w: 'reach an agreement', en: 'agree', th: 'ตกลงกันได้' },
        { w: 'raise funds', en: 'collect money', th: 'ระดมทุน' }
      ],
      mistake: {
        wrong: 'do a decision',
        right: 'make a decision',
        why: {
          en: 'Thai says "ทำ" for both, but decision always takes make.',
          th: 'ภาษาไทยใช้ "ทำ" ได้ทั้งคู่ แต่ decision ต้องใช้ make เสมอ ห้ามแปลตรงว่า do'
        }
      }
    },
    {
      id: 'adjective-preposition',
      name: { en: 'Adjective + preposition', th: 'คำคุณศัพท์ + คำบุพบท (adjective + preposition)' },
      formula: ['be + responsible/eligible + for', 'be + familiar/compatible + with', 'be + aware/capable + of'],
      use: {
        en: 'Each adjective has its own preposition. If the blank is right after the adjective, choose its partner.',
        th: 'คำคุณศัพท์แต่ละตัวมีคำบุพบทคู่ของมัน ถ้าช่องว่างอยู่หลังคำคุณศัพท์ ให้เลือกคำบุพบทที่เป็นคู่'
      },
      example: {
        en: 'Ms. Patel is responsible {{for}} training new staff.',
        th: 'คุณพาเทลรับผิดชอบการอบรมพนักงานใหม่'
      },
      clues: [
        { w: 'responsible for', en: 'in charge of', th: 'รับผิดชอบ' },
        { w: 'eligible for', en: 'allowed to get', th: 'มีสิทธิ์ได้รับ' },
        { w: 'familiar with', en: 'knowing well', th: 'คุ้นเคยกับ' },
        { w: 'aware of', en: 'knowing about', th: 'รู้ตัว/ตระหนักถึง' },
        { w: 'make someone aware of', en: 'tell someone about', th: 'ทำให้ใครรู้เรื่อง…' },
        { w: 'subject to', en: 'may be affected by', th: 'อาจมีการ… (เช่น เปลี่ยนแปลง)' }
      ],
      mistake: {
        wrong: 'responsible of',
        right: 'responsible for',
        why: { en: 'Responsible always takes for.', th: 'responsible ใช้กับ for เสมอ ไม่ใช่ of' }
      }
    },
    {
      id: 'noun-preposition',
      name: { en: 'Noun + preposition', th: 'คำนาม + คำบุพบท (noun + preposition)' },
      formula: ['increase/decrease/demand + in + N', 'access/approach/solution + to + N'],
      use: {
        en: 'Words for going up or down take in (an increase in sales). Access and solution take to.',
        th: 'คำที่บอกการเพิ่มหรือลดใช้ in (an increase in sales) ส่วน access และ solution ใช้ to'
      },
      example: {
        en: 'There has been a sharp increase {{in}} online sales.',
        th: 'ยอดขายออนไลน์เพิ่มขึ้นอย่างมาก'
      },
      clues: [
        { w: 'increase in', en: 'a rise in', th: 'การเพิ่มขึ้นของ' },
        { w: 'demand for', en: 'need for', th: 'ความต้องการ' },
        { w: 'access to', en: 'a way to use', th: 'สิทธิ์เข้าถึง/เข้าใช้' },
        { w: 'reason for', en: 'why', th: 'เหตุผลของ' },
        { w: 'effect on', en: 'change to', th: 'ผลกระทบต่อ' }
      ],
      mistake: {
        wrong: 'access for the database',
        right: 'access to the database',
        why: { en: 'Access always takes to.', th: 'access ใช้กับ to เสมอ' }
      }
    },
    {
      id: 'verb-preposition',
      name: { en: 'Verb + preposition', th: 'กริยา + คำบุพบท (verb + preposition)' },
      formula: ['comply + with', 'adhere + to', 'depend/rely + on'],
      use: {
        en: 'These verbs need a preposition before the object. Similar verbs like follow and obey do not, so they are the trap.',
        th: 'กริยาพวกนี้ต้องมีคำบุพบทก่อนกรรม ส่วนกริยาความหมายใกล้กันอย่าง follow และ obey ไม่ต้องมี จึงมักเป็นตัวหลอก'
      },
      example: {
        en: 'All visitors must comply {{with}} the safety rules.',
        th: 'ผู้มาเยือนทุกคนต้องปฏิบัติตามกฎความปลอดภัย'
      },
      clues: [
        { w: 'comply with', en: 'follow (rules)', th: 'ปฏิบัติตาม (กฎ, ข้อบังคับ)' },
        { w: 'adhere to', en: 'follow closely', th: 'ยึดถือ ปฏิบัติตาม' },
        { w: 'rely on', en: 'depend on', th: 'พึ่งพา' },
        { w: 'apply for (a job)', en: 'ask for (a job)', th: 'สมัคร (งาน)' },
        { w: 'respond to', en: 'reply to', th: 'ตอบกลับ' },
        { w: 'participate in', en: 'take part in', th: 'เข้าร่วม' }
      ],
      mistake: {
        wrong: 'comply the rules',
        right: 'comply with the rules',
        why: {
          en: 'Comply needs with. Follow the rules needs nothing, so do not mix them.',
          th: 'comply ต้องมี with เสมอ ส่วน follow the rules ไม่ต้องมี อย่าสลับกัน'
        }
      }
    },
    {
      id: 'adverb-collocations',
      name: { en: 'Adverb + adjective / V3', th: 'คำกริยาวิเศษณ์ + คำคุณศัพท์ / V3 (adverb + adjective)' },
      formula: ['highly + recommended/qualified', 'strictly + prohibited', 'conveniently + located'],
      use: {
        en: 'Some adverbs almost always go with certain words. Learn the pair: highly recommended, strictly prohibited.',
        th: 'adverb บางตัวมักใช้คู่กับคำบางคำเสมอ ให้จำเป็นคู่ เช่น highly recommended, strictly prohibited'
      },
      example: {
        en: 'Smoking is {{strictly}} prohibited in the building.',
        th: 'ห้ามสูบบุหรี่ในอาคารโดยเด็ดขาด'
      },
      clues: [
        { w: 'highly recommended', en: 'strongly recommended', th: 'ได้รับการแนะนำอย่างมาก' },
        { w: 'strictly prohibited', en: 'not allowed at all', th: 'ห้ามโดยเด็ดขาด' },
        { w: 'conveniently located', en: 'in an easy place to reach', th: 'ตั้งอยู่ในทำเลสะดวก' },
        { w: 'widely used', en: 'used by many people', th: 'ใช้กันอย่างแพร่หลาย' }
      ],
      mistake: {
        wrong: 'greatly recommended',
        right: 'highly recommended',
        why: { en: 'Recommended goes with highly, not greatly or deeply.', th: 'recommended ใช้คู่กับ highly ไม่ใช่ greatly หรือ deeply' }
      }
    }
  ]
}
```

- [ ] **Step 5: Run the unit tests**

Run: `npm run typecheck && npm test`
Expected: PASS. If `tests/unit/renderer/CheatSheet.test.tsx` or `cheatsheet.test.ts` assert on old collocations text, update those assertions to the new text.

- [ ] **Step 6: Check coverage in the review doc**

Run: `npm run cheatsheet:review && npx tsx scripts/answer-sheet.ts`
Expected: in `docs/content-review/cheatsheet.md`, collocations shows `Tested in drills (12)` and `Not on any entry (0): none`. If a key is listed, add it to the matching entry's clues and rerun.

- [ ] **Step 7: e2e** — append inside the main describe of `tests/e2e/grammar.spec.ts` (it already imports `expect, nav, test` from `./helpers`; add any missing import):

```ts
  test('GRM-CHEAT the collocations sheet lists every tested point in Thai', async ({ launchApp }) => {
    const { page, errors } = await launchApp({ language: 'th' })
    await nav(page, 'สูตรไวยากรณ์')
    await page.getByRole('link', { name: /คำที่มักใช้คู่กัน/ }).click()
    const list = page.getByRole('region', { name: 'จุดที่ออกในแบบฝึก (12)' })
    const row = list.getByRole('listitem').filter({ hasText: 'exercise caution' })
    await expect(row).toContainText('ใช้ความระมัดระวัง')
    await expect(row).toContainText('✗ perform caution')
    expect(errors).toEqual([])
  })
```

Check the Thai rail label first: `grep -n "navCheat" src/renderer/src/app/i18n.ts` and use the `th` value in `nav(...)`.

Run: `npm run test:e2e -- tests/e2e/grammar.spec.ts`
Expected: PASS

- [ ] **Step 8: Commit, then stop for user review**

```bash
git add content src/shared/cheatsheet/collocations.ts tests docs/content-review
git commit -m "content: beginner collocations sheet and points for every collocation question"
```

Then ask the user to open the app (`npm run dev` → สูตรไวยากรณ์ → คำที่มักใช้คู่กัน) and read `docs/content-review/cheatsheet.md` § collocations. Apply their fixes before Task 9; this sheet is the model for the other 16.

---

### Task 9: The other 16 topics, four batches

**Files (per topic `<t>`):**
- Modify: `content/grammar/part5/<t>.json`, `content/grammar/part6/sets.json`
- Modify: `src/shared/cheatsheet/<t>.ts`
- Modify: `tests/unit/coverage.test.ts` (`READY`)
- Regenerate: `docs/content-review/answer-sheet.md`, `docs/content-review/cheatsheet.md`

**Interfaces:**
- Consumes: the approved collocations sheet as the model for tone, length and structure.
- Produces: `READY` grows by four topics per batch.

Batches:
1. `word-form`, `word-choice`, `prepositions`, `conj-vs-prep`
2. `tense-voice`, `subject-verb-agreement`, `modals`, `gerund-infinitive`
3. `pronouns`, `determiners`, `comparatives`, `relative-clauses`
4. `reduced-clauses`, `noun-clauses`, `conditionals`, `inversion`

For each batch run these steps:

- [ ] **Step 1: Add the four topics to `READY`** and run `npx vitest run tests/unit/coverage.test.ts`. Expected: FAIL for those four (no mistakes, string clues, no points).

- [ ] **Step 2: Backfill:** `npm run points -- --topic <t>` for each of the four. Expected `0 failed` each. With no credentials, write points by hand per `POINT_RULES` (as in Task 8 Step 2). For grammar topics, `key` is the pattern, e.g. `Adj + N` (word-form), `has/have + V3` (tense-voice), `If + had V3, would have V3` (conditionals); `wrong` holds the wrong form in context, e.g. `a success plan`, `If I would have known`.

- [ ] **Step 3: Check the diff:** `git diff content/` shows only added `"point"` blocks; every `th` is plain Thai, one line, at most 60 characters.

- [ ] **Step 4: Rewrite each sheet** following the collocations model:
  - `intro`: says in plain Thai what the question looks like and what to look at first.
  - Every `name.th` is plain Thai with the English term in brackets, e.g. `กาลปัจจุบันธรรมดา (present simple)`.
  - Every `clues` item is `{ w, en, th }`.
  - Every entry has `mistake: { wrong, right, why }` with a mistake Thai learners really make on that entry (look at the wrong choices of the topic's questions for ideas).
  - Keep the existing `formula` lines and examples unless they are wrong; `tests/unit/cheatsheet.test.ts` rules still apply (1–3 formula lines, one `{{…}}` in each English example, lowercase literal words).

- [ ] **Step 5: Run** `npm run cheatsheet:review`. For every key under "Not on any entry" that is a general rule, add it to the matching entry (as a clue or in `words`). One-off items may stay in the auto list. Rerun until only one-offs remain.

- [ ] **Step 6: Run** `npm run typecheck && npm test`. Expected: PASS.

- [ ] **Step 7: Commit the batch**

```bash
git add content src/shared/cheatsheet tests/unit/coverage.test.ts docs/content-review
git commit -m "content: beginner sheets and points for <the four topics>"
```

- [ ] **Step 8: Ask the user to review the batch** in the app and in `docs/content-review/cheatsheet.md`. Apply fixes in a follow-up commit before the next batch.

---

### Task 10: Lock it in

**Files:**
- Modify: `tests/unit/coverage.test.ts`
- Modify: `src/shared/cheatsheet/types.ts`, `src/shared/cheatsheet/points.ts`, `CheatSheetView.tsx`, `CheatPane.tsx`, `scripts/cheatsheet-review.ts`
- Modify: `scripts/check-content.ts`

**Interfaces:**
- Produces: `CheatEntry.clues?: CheatWord[]`, `CheatEntry.mistake: CheatMistake` (required); `check-content` fails on any approved shipped question in a sheet topic without a point.

- [ ] **Step 1: All topics ready** — in `coverage.test.ts` replace the `READY` list and its comment with:

```ts
/** Every Part 5 topic is finished for beginners; a new topic must meet the same rules. */
const READY: Part5Topic[] = [...PART5_TOPICS]
```

and import `PART5_TOPICS` from `../../src/shared/types`. Run `npx vitest run tests/unit/coverage.test.ts`. Expected: PASS (all batches done).

- [ ] **Step 2: Narrow the types** — in `src/shared/cheatsheet/types.ts`:

```ts
  /** Signal words or pairs that point to this entry, each with its meaning. */
  clues?: CheatWord[]
  /** The common mistake for this entry, shown as ✗ wrong → ✓ right. */
  mistake: CheatMistake
```

and `export const clueText = (c: CheatWord): string => c.w`. Run `npm run typecheck`; remove every `typeof c === 'string'` / `typeof c !== 'string'` branch it now flags (in `CheatSheetView.tsx`, `CheatPane.tsx`, `cheatsheet-review.ts`, `coverage.test.ts`), keeping the object branch. In `CheatSheetView.tsx` and `CheatPane.tsx`, `entry.mistake &&` / `e.mistake &&` guards may stay or go; drop them for clarity. In `cheatsheet-review.ts` drop the `no common mistake yet` branch.

- [ ] **Step 3: Ship guard** — in `scripts/check-content.ts`, add `import { PART5_TOPICS } from '../src/shared/types'` and, after the Part 6 `checkChoices` loop:

```ts
// Every question in a topic with a cheat sheet must give the sheet its point.
const sheetTopic = (t: string) => (PART5_TOPICS as readonly string[]).includes(t)
for (const item of bank.part5) if (!item.point) problems.push(`${item.id}: no cheat-sheet point (npm run points)`)
for (const set of bank.part6) {
  set.blanks.forEach((b, i) => {
    if (sheetTopic(b.topic) && !b.point) problems.push(`${set.id}#${i + 1}: no cheat-sheet point (npm run points)`)
  })
}
```

Run: `npx tsx scripts/check-content.ts`
Expected: `OK: no problems found`.

- [ ] **Step 4: Full verification**

Run: `npm run typecheck && npm test && npm run test:e2e`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src scripts tests
git commit -m "feat: require a common mistake, clue meanings and a point for every sheet topic"
```

- [ ] **Step 6: Update `PRODUCT.md`** — under "Capabilities and Constraints", in the "Built today" paragraph, after "Settings (language)," add: `cheat sheets for all 17 Part 5 topics with a symbol key, a common mistake per formula and an auto list of every point the drills test (including private-pack questions),` and after the private-pack sentence add: `` `npm run points` backfills cheat-sheet points with Claude.`` Commit:

```bash
git add PRODUCT.md
git commit -m "docs: describe beginner cheat sheets and npm run points"
```
