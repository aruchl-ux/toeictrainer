# Private Source Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import the real Part 5 questions from the user's TOEIC prep PDFs into a private, local-only question pack (answered and explained by Claude), and let the shipped-question generator copy their style without copying their text.

**Architecture:** A local script (`npm run import`) extracts questions page by page (pdftotext → Claude, with a PDF-page vision retry), dedupes them, has Claude solve and blind-re-check them, and writes items with `p5x-` ids into `%APPDATA%\toeic-trainer\private-content`. The Electron main process loads that folder as a second content root next to the bundled `content/`, so drills, tests, review and progress work unchanged. Four new Part 5 topics hold items that don't fit the existing 13.

**Tech Stack:** Electron + React + TypeScript, zod 4, vitest, Playwright (Electron), `@anthropic-ai/sdk` (structured outputs via `messages.parse` + `zodOutputFormat`), `pdf-lib` (new devDependency), `pdftotext` from Git for Windows.

**Spec:** `docs/superpowers/specs/2026-10-14-private-source-import-design.md`

## Global Constraints

- Nothing from `toeic_source/` (raw text, items, cache, private pack) is ever committed or bundled. `toeic_source/` and `content-private-work/` are gitignored (already done in commit `975085b`). Test fixtures are hand-written, never copied from the PDFs.
- Private item ids match `^p5x-[a-z-]+-\d{4}$`; shipped ids stay `p5-…`. `scripts/check-content.ts` fails if a `p5x-` id or a `source` field appears in `content/`.
- Private pack path: `TOEIC_PRIVATE_CONTENT` env if set; else `<TOEIC_USER_DATA>/private-content` if `TOEIC_USER_DATA` is set (unpackaged runs only); else `%APPDATA%\toeic-trainer\private-content`.
- New Part 5 topic ids, in this order after `collocations`: `word-choice`, `determiners`, `modals`, `noun-clauses`. Never `vocabulary` (already a Part 7 question type).
- Every UI string exists in English and Thai.
- Model is `claude-opus-5-5` via the existing `scripts/lib/claude.ts`; never change it.
- Explanations never refer to a choice by letter or position (the app shuffles choices).
- Run `npm run typecheck` and `npm test` before every commit; both must pass.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File Structure

| File | Responsibility |
|---|---|
| `src/shared/types.ts` (modify) | `ItemSource`, widened Part 5 id, `source` field, 4 new topics |
| `src/shared/source.ts` (new) | `sourceText()` formats where a private item came from |
| `src/shared/cheatsheet/{word-choice,determiners,modals,noun-clauses}.ts` (new) | Cheat sheets for the new topics |
| `src/shared/cheatsheet/index.ts`, `src/renderer/src/app/i18n.ts`, `src/renderer/src/app/Ink.tsx` (modify) | Register new topics (sheet, label, topic mark) |
| `src/renderer/src/features/grammar/TopicListScreen.tsx`, `home/HomeScreen.tsx`, `office/commands.ts` (modify) | Hide topics with no questions |
| `src/main/privateRoot.ts` (new) | Resolve the private pack folder |
| `src/main/content.ts`, `src/main/ipc.ts`, `src/main/index.ts` (modify) | Load both roots |
| `src/main/drafts.ts`, `src/shared/api.ts`, `features/content-review/ContentReviewScreen.tsx` (modify) | Drafts from both roots, routed by id prefix |
| `features/grammar/QuestionView.tsx`, `office/Task.tsx`, styles (modify) | "From: …" source line |
| `scripts/check-content.ts` (modify) | Leak guard |
| `scripts/lib/claude.ts` (modify) | `ask()` accepts content blocks and an effort level |
| `scripts/lib/gen.ts` (modify) | Export shared prompt rules; overlap guard; example picker; style option |
| `scripts/lib/import/normalize.ts` (new) | Clean, validate, dedupe extracted items (pure) |
| `scripts/lib/import/args.ts` (new) | `--pages` parsing, chunking (pure) |
| `scripts/lib/import/pdf.ts` (new) | pdftotext lookup, page text, page count, single-page PDF |
| `scripts/lib/import/cache.ts` (new) | JSON work cache, hashing, concurrency pool |
| `scripts/lib/import/prompts.ts` (new) | Extract / solve / blind-check schemas and prompts |
| `scripts/lib/import/build.ts` (new) | Turn solved batches into `Part5Item`s; id numbering |
| `scripts/lib/import/store.ts` (new) | Append to the private pack; ledger of imported items |
| `scripts/import.ts` (new) | CLI orchestrator |
| `scripts/generate.ts` (modify) | `--style private` |

---

### Task 1: Private item fields and the leak guard

**Files:**
- Modify: `src/shared/types.ts` (the `Part5Item` schema, around line 40)
- Modify: `scripts/check-content.ts`
- Test: `tests/unit/types.test.ts`

**Interfaces:**
- Produces: `ItemSource` zod schema + type `{ file: string; page: number; no?: number }`; `Part5Item` accepts `id` `p5x-…` and optional `source: ItemSource[]` (min 1).

- [ ] **Step 1: Write the failing tests** — append to `tests/unit/types.test.ts` inside the existing `describe('Part5Item', …)` block:

```ts
  it('accepts a private id with a source list', () => {
    const item = makePart5({ id: 'p5x-word-form-0001', source: [{ file: 'UNIT_1.pdf', page: 2, no: 12 }] })
    expect(Part5Item.safeParse(item).success).toBe(true)
  })
  it('rejects an empty source list and a page below 1', () => {
    expect(Part5Item.safeParse(makePart5({ source: [] })).success).toBe(false)
    expect(Part5Item.safeParse(makePart5({ source: [{ file: 'a.pdf', page: 0 }] })).success).toBe(false)
  })
  it('rejects other id prefixes', () => {
    expect(Part5Item.safeParse(makePart5({ id: 'p5y-word-form-0001' })).success).toBe(false)
  })
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/types.test.ts`
Expected: FAIL — typecheck error/`source` unknown and the `p5x-` id rejected.

- [ ] **Step 3: Implement** — in `src/shared/types.ts`, add above `Part5Item`:

```ts
/** Where a private (imported) item was printed in the user's own books. */
export const ItemSource = z.object({
  file: z.string().min(1),
  page: z.number().int().positive(),
  no: z.number().int().positive().optional()
})
export type ItemSource = z.infer<typeof ItemSource>
```

and change `Part5Item` to:

```ts
export const Part5Item = z.object({
  // p5x- marks items imported into the user's private pack; they never ship.
  id: z.string().regex(/^p5x?-[a-z-]+-\d{4}$/),
  part: z.literal(5),
  topic: Part5Topic,
  stem: z.string().includes('____'),
  ...choiceFields,
  source: z.array(ItemSource).min(1).optional(),
  status: ItemStatus,
  flag: z.string().optional()
})
```

- [ ] **Step 4: Add the leak guard** — in `scripts/check-content.ts`, directly after the `for (const item of bank.part5) { … checkChoices(…) }` loop, add:

```ts
// Imported items belong only in the user's private pack, never in shipped content.
for (const item of bank.part5) {
  if (item.id.startsWith('p5x-')) problems.push(`${item.id}: private id in shipped content`)
  if (item.source) problems.push(`${item.id}: source field in shipped content`)
}
```

- [ ] **Step 5: Verify**

Run: `npx vitest run tests/unit/types.test.ts && npm run typecheck && npx tsx scripts/check-content.ts`
Expected: tests PASS, typecheck clean, check-content ends with `OK: no problems found`.

- [ ] **Step 6: Commit**

```bash
git add src/shared/types.ts scripts/check-content.ts tests/unit/types.test.ts
git commit -m "feat: allow private p5x items with a source and guard shipped content

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Four new Part 5 topics with labels, marks and cheat sheets

**Files:**
- Modify: `src/shared/types.ts` (`PART5_TOPICS`)
- Modify: `src/renderer/src/app/i18n.ts` (`TOPIC_LABELS`, line ~300)
- Modify: `src/renderer/src/app/Ink.tsx` (`TOPIC_SHAPES`, line ~60)
- Create: `src/shared/cheatsheet/word-choice.ts`, `determiners.ts`, `modals.ts`, `noun-clauses.ts`
- Modify: `src/shared/cheatsheet/index.ts`
- Regenerate: `docs/content-review/cheatsheet.md`
- Test: existing `tests/unit/cheatsheet.test.ts`, `tests/unit/renderer/i18n.test.ts` (they iterate `PART5_TOPICS`)

**Interfaces:**
- Produces: `PART5_TOPICS` ends with `'collocations', 'word-choice', 'determiners', 'modals', 'noun-clauses'`. `CHEAT_SHEETS`, `TOPIC_LABELS`, `TOPIC_SHAPES` have entries for all four.

- [ ] **Step 1: Add the topics (this makes the build fail until the records are filled)** — in `src/shared/types.ts`:

```ts
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
  'collocations',
  'word-choice',
  'determiners',
  'modals',
  'noun-clauses'
] as const
```

- [ ] **Step 2: Verify failure**

Run: `npm run typecheck`
Expected: FAIL — missing properties `word-choice`, `determiners`, `modals`, `noun-clauses` in `TOPIC_LABELS`, `TOPIC_SHAPES` and `CHEAT_SHEETS`.

- [ ] **Step 3: Labels** — in `TOPIC_LABELS` (`i18n.ts`), after `collocations`:

```ts
  'word-choice': { en: 'Word choice (meaning)', th: 'เลือกคำตามความหมาย (Word choice)' },
  determiners: { en: 'Determiners & quantifiers', th: 'คำนำหน้านามและคำบอกปริมาณ' },
  modals: { en: 'Modal verbs', th: 'กริยาช่วย (Modal verbs)' },
  'noun-clauses': { en: 'Noun clauses', th: 'ประโยคที่ทำหน้าที่เป็นคำนาม (Noun clauses)' },
```

- [ ] **Step 4: Topic marks** — in `TOPIC_SHAPES` (`Ink.tsx`), after `collocations`:

```ts
  'word-choice': [c(22, 24, 14, PINK), r(30, 30, 26, 26, BLUE)],
  determiners: [r(8, 8, 20, 48, YELLOW), c(42, 34, 16, BLUE)],
  modals: [p('M8 56 L32 8 L56 56 Z', YELLOW), c(32, 40, 12, PINK)],
  'noun-clauses': [r(8, 18, 48, 30, PINK), r(18, 28, 28, 10, BLUE)],
```

- [ ] **Step 5: Cheat sheet `src/shared/cheatsheet/word-choice.ts`**

```ts
import type { CheatSheet } from './types'

export const wordChoice: CheatSheet = {
  topic: 'word-choice',
  intro: {
    en: 'All four choices are the same part of speech, so grammar cannot decide. Read the whole sentence, find the word the blank must fit with, and pick the meaning that makes sense at work.',
    th: 'ตัวเลือกทั้งสี่เป็นคำชนิดเดียวกัน ไวยากรณ์ช่วยตัดไม่ได้ ต้องอ่านทั้งประโยค หาคำที่ช่องว่างต้องเข้าคู่ด้วย แล้วเลือกความหมายที่เข้ากับบริบทการทำงาน'
  },
  entries: [
    {
      id: 'word-choice-verb-object',
      name: { en: 'Verb that fits its object', th: 'กริยาที่เข้ากับกรรม' },
      formula: ['V + Obj'],
      words: [
        { w: 'board', en: 'get on a plane, train or ship', th: 'ขึ้น (เครื่องบิน รถไฟ เรือ)' },
        { w: 'claim', en: 'ask for something that is yours', th: 'ขอรับ / เรียกร้องสิ่งที่เป็นของเรา' }
      ],
      use: {
        en: 'Look at the object after the blank and ask which action people really do to that thing at work.',
        th: 'ดูกรรมหลังช่องว่าง แล้วถามตัวเองว่าในการทำงานจริง เราทำกริยาไหนกับสิ่งนั้น'
      },
      example: {
        en: 'Passengers should {{board}} the train ten minutes before it leaves.',
        th: 'ผู้โดยสารควรขึ้นรถไฟก่อนรถออกสิบนาที'
      },
      clues: ['board a plane', 'claim baggage', 'place an order', 'submit a report']
    },
    {
      id: 'word-choice-noun-context',
      name: { en: 'Noun that fits the context', th: 'คำนามที่เข้ากับบริบท' },
      formula: ['Det + (Adj) + N'],
      words: [
        { w: 'itinerary', en: 'a plan of a trip', th: 'กำหนดการเดินทาง' },
        { w: 'beverage', en: 'a drink', th: 'เครื่องดื่ม' }
      ],
      use: {
        en: 'Read the words around the blank. Describing words like detailed, hot or extra show which thing is meant.',
        th: 'อ่านคำรอบช่องว่าง คำขยายอย่าง detailed, hot, extra ช่วยบอกว่าหมายถึงสิ่งไหน'
      },
      example: {
        en: 'The agency sent each guest a detailed {{itinerary}} for the conference week.',
        th: 'บริษัทส่งกำหนดการแบบละเอียดของสัปดาห์การประชุมให้แขกทุกคน'
      },
      clues: ['a hot beverage', 'a detailed itinerary', 'a full refund']
    },
    {
      id: 'word-choice-adjective-noun',
      name: { en: 'Adjective that fits the noun', th: 'คำคุณศัพท์ที่เข้ากับคำนาม' },
      formula: ['be + Adj', 'Adj + N'],
      words: [
        { w: 'valid', en: 'officially usable, not expired', th: 'ใช้ได้ ยังไม่หมดอายุ' },
        { w: 'eligible', en: 'allowed to have or do something', th: 'มีสิทธิ์' },
        { w: 'reasonable', en: 'fair, not too high', th: 'สมเหตุสมผล (ราคาไม่แพงเกินไป)' }
      ],
      use: {
        en: 'Check what the adjective describes: a ticket or permit is valid, a person is eligible, a price is reasonable.',
        th: 'ดูว่าคำคุณศัพท์ขยายอะไร ตั๋วหรือใบอนุญาตใช้ valid คนที่มีสิทธิ์ใช้ eligible ราคาที่เหมาะสมใช้ reasonable'
      },
      example: {
        en: 'Your parking permit is no longer {{valid}} after March 31.',
        th: 'บัตรจอดรถของคุณใช้ไม่ได้แล้วหลังวันที่ 31 มีนาคม'
      },
      clues: ['valid ticket', 'eligible for', 'reasonable price']
    },
    {
      id: 'word-choice-partner-preposition',
      name: { en: 'Word chosen by the preposition after it', th: 'เลือกคำจากบุพบทที่ตามมา' },
      formula: ['V + Obj + from + V-ing', 'be + Adj + for + N'],
      words: [
        { w: 'from', en: 'goes with prohibit, prevent, stop', th: 'ใช้คู่กับ prohibit, prevent, stop' },
        { w: 'for', en: 'goes with responsible, eligible, famous', th: 'ใช้คู่กับ responsible, eligible, famous' }
      ],
      use: {
        en: 'When two choices mean almost the same, the word after the blank often decides. Only one of them is used with that preposition.',
        th: 'ถ้ามีสองตัวเลือกความหมายใกล้กัน ให้ดูคำหลังช่องว่าง มักมีแค่คำเดียวที่ใช้คู่กับบุพบทนั้นได้'
      },
      example: {
        en: 'Signs {{prohibit}} drivers from parking in the loading area.',
        th: 'ป้ายห้ามผู้ขับขี่จอดรถในบริเวณขนถ่ายสินค้า'
      },
      clues: ['prohibit … from', 'responsible for', 'eligible for', 'interested in']
    }
  ]
}
```

- [ ] **Step 6: Cheat sheet `src/shared/cheatsheet/determiners.ts`**

```ts
import type { CheatSheet } from './types'

export const determiners: CheatSheet = {
  topic: 'determiners',
  intro: {
    en: 'Determiners come before a noun and must match it: countable or uncountable, singular or plural.',
    th: 'คำนำหน้านาม (determiner) อยู่หน้าคำนาม และต้องเข้ากับคำนามนั้น ทั้งนับได้หรือนับไม่ได้ เอกพจน์หรือพหูพจน์'
  },
  entries: [
    {
      id: 'each-every-noun',
      name: { en: 'Each / every + singular noun', th: 'each / every + นามเอกพจน์' },
      formula: ['each/every + N(singular) + V(s/es)'],
      words: [
        { w: 'each', en: 'every one, seen one by one', th: 'แต่ละ' },
        { w: 'every', en: 'all of them, as a group', th: 'ทุก ๆ' }
      ],
      use: {
        en: 'Each and every take a singular noun and a singular verb. Each of the takes a plural noun but still a singular verb.',
        th: 'each และ every ตามด้วยนามเอกพจน์และกริยาเอกพจน์ ส่วน each of the ตามด้วยนามพหูพจน์ แต่กริยายังเป็นเอกพจน์'
      },
      example: {
        en: 'Every new {{employee}} receives a copy of the handbook.',
        th: 'พนักงานใหม่ทุกคนได้รับคู่มือคนละเล่ม'
      },
      clues: ['each', 'every', 'each of the + plural noun']
    },
    {
      id: 'all-most-some',
      name: { en: 'All / most / some + plural or uncountable', th: 'all / most / some + นามพหูพจน์หรือนามนับไม่ได้' },
      formula: ['all/most/some + N(plural)', 'most of the + N'],
      words: [
        { w: 'all', en: 'every one', th: 'ทั้งหมด' },
        { w: 'most', en: 'nearly all', th: 'ส่วนใหญ่' },
        { w: 'some', en: 'a number of, not all', th: 'บางส่วน / จำนวนหนึ่ง' }
      ],
      use: {
        en: 'All, most and some take a plural countable noun or an uncountable noun. Before the or a possessive, add of: most of the staff.',
        th: 'all, most, some ตามด้วยนามพหูพจน์หรือนามนับไม่ได้ ถ้าข้างหลังมี the หรือคำแสดงความเป็นเจ้าของ ต้องเติม of เช่น most of the staff'
      },
      example: {
        en: '{{Most}} applicants have at least two years of experience.',
        th: 'ผู้สมัครส่วนใหญ่มีประสบการณ์อย่างน้อยสองปี'
      },
      clues: ['most + noun', 'most of the + noun', 'almost all']
    },
    {
      id: 'few-little',
      name: { en: '(A) few vs (a) little', th: '(a) few กับ (a) little' },
      formula: ['a few/few + N(plural)', 'a little/little + N(uncountable)'],
      words: [
        { w: 'a few', en: 'some, a small number', th: 'มีอยู่บ้าง (นับได้)' },
        { w: 'few', en: 'almost none', th: 'แทบไม่มี (นับได้)' },
        { w: 'a little', en: 'some, a small amount', th: 'มีอยู่บ้าง (นับไม่ได้)' },
        { w: 'little', en: 'almost none', th: 'แทบไม่มี (นับไม่ได้)' }
      ],
      use: {
        en: 'Few and a few go with plural countable nouns; little and a little with uncountable nouns. Without a, the meaning is negative: almost none.',
        th: 'few / a few ใช้กับนามนับได้พหูพจน์ ส่วน little / a little ใช้กับนามนับไม่ได้ ถ้าไม่มี a ความหมายเป็นลบ คือแทบไม่มี'
      },
      example: {
        en: 'There is {{little}} time left before the deadline, so please hurry.',
        th: 'เหลือเวลาก่อนถึงกำหนดส่งน้อยมาก กรุณารีบหน่อย'
      },
      clues: ['information', 'equipment', 'advice', 'furniture (uncountable)']
    },
    {
      id: 'another-other',
      name: { en: 'Another / other / the other', th: 'another / other / the other' },
      formula: ['another + N(singular)', 'other + N(plural)', 'the other + N'],
      words: [
        { w: 'another', en: 'one more, or a different one', th: 'อีกหนึ่ง / อีกอันหนึ่ง' },
        { w: 'other', en: 'more, different ones', th: 'อื่น ๆ' },
        { w: 'the other', en: 'the last one or ones that remain', th: 'อันที่เหลือ' }
      ],
      use: {
        en: 'Another takes a singular noun; other takes a plural or uncountable noun; the other means the remaining one or ones.',
        th: 'another ตามด้วยนามเอกพจน์ other ตามด้วยนามพหูพจน์หรือนามนับไม่ได้ ส่วน the other หมายถึงอันที่เหลืออยู่'
      },
      example: {
        en: 'Please use {{another}} meeting room; this one is booked.',
        th: 'กรุณาใช้ห้องประชุมห้องอื่น ห้องนี้มีคนจองแล้ว'
      },
      clues: ['another + singular', 'other + plural', 'one … the other']
    }
  ]
}
```

- [ ] **Step 7: Cheat sheet `src/shared/cheatsheet/modals.ts`**

```ts
import type { CheatSheet } from './types'

export const modals: CheatSheet = {
  topic: 'modals',
  intro: {
    en: 'A modal (can, must, should, may, might, could, would, will) is always followed by the base verb (V1), never V-ing, to V or V(s).',
    th: 'กริยาช่วยแสดงทัศนคติ (modal) เช่น can, must, should, may ต้องตามด้วยกริยารูปเดิม (V1) เสมอ ห้ามตามด้วย V-ing, to V หรือกริยาเติม s'
  },
  entries: [
    {
      id: 'modal-base-verb',
      name: { en: 'Modal + V1', th: 'modal + V1' },
      formula: ['S + modal + V1', 'S + modal + be + V3'],
      words: [
        { w: 'can', en: 'is able to', th: 'สามารถ' },
        { w: 'must', en: 'has to; it is required', th: 'ต้อง' },
        { w: 'should', en: 'it is a good idea to', th: 'ควร' },
        { w: 'may', en: 'possibly; or polite permission', th: 'อาจจะ / ได้รับอนุญาตให้' }
      ],
      use: {
        en: 'After any modal, use V1. For the passive, use modal + be + V3.',
        th: 'หลัง modal ทุกตัวใช้ V1 ถ้าเป็นรูปถูกกระทำ ใช้ modal + be + V3'
      },
      example: {
        en: 'All visitors must {{sign}} in at the front desk.',
        th: 'ผู้มาติดต่อทุกคนต้องลงชื่อที่โต๊ะต้อนรับ'
      },
      clues: ['must', 'should', 'can', 'will', 'may']
    },
    {
      id: 'modal-have-v3',
      name: { en: 'Modal + have + V3 (about the past)', th: 'modal + have + V3 (พูดถึงอดีต)' },
      formula: ['S + must/might/should/could + have + V3'],
      words: [
        { w: 'must have', en: 'I am sure it happened', th: 'ต้อง…แน่ ๆ (สรุปจากหลักฐาน)' },
        { w: 'might have', en: 'maybe it happened', th: 'อาจจะ…แล้ว' },
        { w: 'should have', en: 'it was the right thing, but it did not happen', th: 'น่าจะ… (แต่ไม่ได้ทำ)' },
        { w: 'could have', en: 'it was possible, but it did not happen', th: '…ได้ (แต่ไม่ได้ทำ)' }
      ],
      use: {
        en: 'Use modal + have + V3 for the past: a guess (must have, might have) or a regret (should have, could have).',
        th: 'ใช้ modal + have + V3 พูดถึงอดีต เป็นการเดา (must have, might have) หรือความเสียดาย (should have, could have)'
      },
      example: {
        en: 'The lights are off, so the staff {{must have}} gone home.',
        th: 'ไฟปิดหมดแล้ว พนักงานคงกลับบ้านกันไปแล้วแน่ ๆ'
      },
      clues: ['already', 'yesterday', 'last week', 'by now']
    },
    {
      id: 'modal-phrases',
      name: { en: 'Have to / be able to / used to + V1', th: 'have to / be able to / used to + V1' },
      formula: ['S + have to/be able to/used to + V1'],
      words: [
        { w: 'have to', en: 'must', th: 'ต้อง' },
        { w: 'be able to', en: 'can', th: 'สามารถ' },
        { w: 'used to', en: 'did regularly in the past, but not now', th: 'เคย… (แต่ตอนนี้ไม่แล้ว)' }
      ],
      use: {
        en: 'These phrases work like modals and take V1. Be used to + V-ing is different: it means accustomed to.',
        th: 'วลีเหล่านี้ทำงานเหมือน modal และตามด้วย V1 แต่ be used to + V-ing ต่างกัน แปลว่า คุ้นเคยกับ'
      },
      example: {
        en: 'We were not able to {{finish}} the report on time.',
        th: 'เราไม่สามารถทำรายงานเสร็จทันเวลาได้'
      },
      clues: ['be used to + V-ing', 'used to + V1']
    }
  ]
}
```

- [ ] **Step 8: Cheat sheet `src/shared/cheatsheet/noun-clauses.ts`**

```ts
import type { CheatSheet } from './types'

export const nounClauses: CheatSheet = {
  topic: 'noun-clauses',
  intro: {
    en: 'A noun clause is a whole clause (S + V) used as a noun: the subject or object of the sentence. It starts with that, what, whether / if or a wh-word.',
    th: 'noun clause คือประโยคย่อย (S + V) ที่ทำหน้าที่เหมือนคำนาม เป็นประธานหรือกรรมของประโยค ขึ้นต้นด้วย that, what, whether / if หรือคำ wh-'
  },
  entries: [
    {
      id: 'that-clause',
      name: { en: 'That + complete clause', th: 'that + ประโยคสมบูรณ์' },
      formula: ['S + V + that + S + V'],
      words: [{ w: 'that', en: 'introduces a fact; adds no meaning', th: 'ว่า (นำข้อเท็จจริง ไม่มีความหมายเพิ่ม)' }],
      use: {
        en: 'That joins a complete clause after verbs like announce, confirm and ensure. Nothing is missing in the clause after that.',
        th: 'that เชื่อมประโยคสมบูรณ์หลังกริยาอย่าง announce, confirm, ensure ประโยคหลัง that ต้องครบ ไม่ขาดอะไร'
      },
      example: {
        en: 'The manager confirmed {{that}} the shipment had arrived.',
        th: 'ผู้จัดการยืนยันว่าสินค้ามาถึงแล้ว'
      },
      clues: ['announce', 'confirm', 'ensure', 'suggest']
    },
    {
      id: 'what-noun-clause',
      name: { en: 'What = the thing that', th: 'what = สิ่งที่' },
      formula: ['V + what + S + V'],
      words: [{ w: 'what', en: 'the thing that', th: 'สิ่งที่' }],
      use: {
        en: 'Use what when the clause after it is missing a noun (an object or a subject). What already means "the thing that".',
        th: 'ใช้ what เมื่อประโยคที่ตามมาขาดคำนาม (ขาดกรรมหรือประธาน) what แปลว่า สิ่งที่ อยู่แล้ว'
      },
      example: {
        en: 'Please tell us {{what}} you need for the event.',
        th: 'กรุณาบอกเราว่าคุณต้องการอะไรสำหรับงานนี้'
      },
      clues: ['clause missing an object → what', 'complete clause → that']
    },
    {
      id: 'whether-if',
      name: { en: 'Whether / if = whether or not', th: 'whether / if = ว่า…หรือไม่' },
      formula: ['V + whether/if + S + V', 'whether + to V'],
      words: [
        { w: 'whether', en: 'if or not', th: 'ว่า…หรือไม่' },
        { w: 'if', en: 'if or not; only right after a verb', th: 'ว่า…หรือไม่ (ใช้หลังกริยาเท่านั้น)' }
      ],
      use: {
        en: 'Use whether or if for a yes/no question inside a sentence. Only whether works at the start of a sentence, before to V, or with or not right after it.',
        th: 'ใช้ whether หรือ if กับคำถามแบบใช่/ไม่ใช่ที่อยู่ในประโยค แต่ถ้าขึ้นต้นประโยค ตามด้วย to V หรือมี or not ต่อท้ายทันที ใช้ได้แค่ whether'
      },
      example: {
        en: 'The board has not decided {{whether}} to open a new branch.',
        th: 'คณะกรรมการยังไม่ได้ตัดสินใจว่าจะเปิดสาขาใหม่หรือไม่'
      },
      clues: ['decide', 'wonder', 'ask', 'or not']
    },
    {
      id: 'wh-word-order',
      name: { en: 'Wh-word + S + V (statement order)', th: 'คำ wh- + S + V (เรียงแบบบอกเล่า)' },
      formula: ['V + where/when/how + S + V'],
      words: [
        { w: 'where', en: 'the place', th: 'ที่ไหน' },
        { w: 'when', en: 'the time', th: 'เมื่อไร' },
        { w: 'how', en: 'the way', th: 'อย่างไร' }
      ],
      use: {
        en: 'Inside a sentence, a wh-question uses normal order: subject before verb. Write where the meeting is, not where is the meeting.',
        th: 'เมื่อคำถาม wh- อยู่ในประโยค ให้เรียงแบบประโยคบอกเล่า ประธานมาก่อนกริยา เช่น where the meeting is ไม่ใช่ where is the meeting'
      },
      example: {
        en: 'Could you tell me {{where}} the training will be held?',
        th: 'ช่วยบอกได้ไหมว่าการอบรมจะจัดที่ไหน'
      },
      clues: ['tell me', 'know', 'ask', 'explain']
    }
  ]
}
```

- [ ] **Step 9: Register the sheets** — in `src/shared/cheatsheet/index.ts` add imports and entries:

```ts
import { determiners } from './determiners'
import { modals } from './modals'
import { nounClauses } from './noun-clauses'
import { wordChoice } from './word-choice'
```

and inside `CHEAT_SHEETS` after `collocations`:

```ts
  collocations,
  'word-choice': wordChoice,
  determiners,
  modals,
  'noun-clauses': nounClauses
```

- [ ] **Step 10: Verify**

Run: `npm run typecheck && npx vitest run tests/unit/cheatsheet.test.ts tests/unit/renderer/i18n.test.ts tests/unit/renderer/CheatSheet.test.tsx`
Expected: PASS. If the formula test fails on a part, the message names the entry id and line; fix the formula so every literal part is lowercase.

- [ ] **Step 11: Regenerate the review sheet and run all tests**

Run: `npm run cheatsheet:review && npm test`
Expected: `docs/content-review/cheatsheet.md` now includes the 4 new topics; all tests PASS.

- [ ] **Step 12: Commit**

```bash
git add src/shared/types.ts src/shared/cheatsheet src/renderer/src/app/i18n.ts src/renderer/src/app/Ink.tsx docs/content-review/cheatsheet.md
git commit -m "feat: add word-choice, determiners, modals and noun-clauses topics with cheat sheets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Hide topics that have no questions

**Files:**
- Modify: `src/renderer/src/features/grammar/TopicListScreen.tsx`
- Modify: `src/renderer/src/features/home/HomeScreen.tsx:23-24`
- Modify: `src/renderer/office/commands.ts` (`drill` command args)
- Test: `tests/e2e/navigation.spec.ts` NAV-06

**Interfaces:**
- Consumes: `PART5_TOPICS` with 17 topics (Task 2).

- [ ] **Step 1: Write the failing check** — in `tests/e2e/navigation.spec.ts` NAV-06, right after `await expect(tiles).toHaveCount(13)`, add:

```ts
    // Topics without questions (new topics, no private pack) are hidden, not shown as empty tiles.
    await expect(page.locator('ul.tile-grid .tile-empty')).toHaveCount(0)
```

Run: `npm run test:e2e -- -g "NAV-06"`
Expected: FAIL — 4 `.tile-empty` tiles (the new topics have no shipped questions).

- [ ] **Step 2: Topic list** — in `TopicListScreen.tsx` replace the body of the `<ul>` so only topics with questions render, and drop the now-unused empty-tile branch:

```tsx
export function TopicListScreen() {
  const { bank, progress } = useApp()
  const { t, topic } = useT()
  const stats = new Map(topicStats(progress.grammarAttempts).map((s) => [s.topic, s]))
  // Topics with no questions yet (e.g. new topics without a private pack) stay hidden.
  const topics = PART5_TOPICS.filter((tp) => bank.part5.some((i) => i.topic === tp))
  return (
    <section className="topics">
      <header className="page-head">
        <h1 className="page-title">{t('topicsTitle')}</h1>
        <p className="page-lead">{t('topicsIntro')}</p>
      </header>
      <ul className="tile-grid tile-grid-wide">
        {topics.map((tp) => {
          const count = bank.part5.filter((i) => i.topic === tp).length
          const stat = stats.get(tp)
          return (
            <li key={tp} className="tile-with-link">
              <Link className="tile" to={`/drill/${tp}`}>
                <TopicMark topic={tp} />
                <span className="tile-name" id={`tile-name-${tp}`}>
                  {topic(tp)}
                </span>
                <span className="tile-meta">
                  <span className="num">{t('topicsCount', { n: count })}</span>
                  {stat && <span className="num">{t('topicsAccuracy', { p: Math.round(stat.accuracy * 100) })}</span>}
                </span>
              </Link>
              {/* Named "Formulas"; the topic name is its description, so the drill tile keeps the only link named after the topic. */}
              <Link className="text-link tile-link" to={`/cheatsheet/${tp}`} aria-describedby={`tile-name-${tp}`}>
                {t('cheatOpen')}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
```

- [ ] **Step 3: Home tiles** — in `HomeScreen.tsx` change the tiles line so empty topics are no longer used as filler:

```ts
  // Tiles: weakest topics first, then other topics that have questions.
  const withItems = PART5_TOPICS.filter((tp) => bank.part5.some((i) => i.topic === tp))
  const tiles = [...new Set<Part5Topic>([...weakestP5, ...withItems])].slice(0, TILE_COUNT)
```

- [ ] **Step 4: Office drill command** — in `office/commands.ts`, read `bank` from `useApp()` and filter the drill args (cheat args stay unfiltered: cheat sheets exist for every topic):

```ts
  const { updateSettings, bank } = useApp()
```

```ts
      args: PART5_TOPICS.filter((tp) => bank.part5.some((i) => i.topic === tp)).map((tp) => ({
        value: tp,
        label: topicLabel(tp, lang)
      })),
```

(The first `args:` is the `drill` command's; leave the `cheat` command's `args` as is.)

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm test && npm run test:e2e -- -g "NAV-06|HOME"`
Expected: PASS; topic list shows 13 tiles, no empty tiles.

- [ ] **Step 6: Commit**

```bash
git add src/renderer/src/features/grammar/TopicListScreen.tsx src/renderer/src/features/home/HomeScreen.tsx src/renderer/office/commands.ts tests/e2e/navigation.spec.ts
git commit -m "feat: hide Part 5 topics that have no questions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Load the private pack as a second content root

**Files:**
- Create: `src/main/privateRoot.ts`
- Modify: `src/main/content.ts` (`loadContent`)
- Modify: `src/main/ipc.ts` (`IpcDeps`, `contentBank` handler)
- Modify: `src/main/index.ts` (`registerIpc` call)
- Test: `tests/unit/privateRoot.test.ts` (new), `tests/unit/content.test.ts`

**Interfaces:**
- Produces: `privateContentRoot(appData: string, env?: Record<string, string | undefined>): string`; `loadContent(root: string, privateRoot?: string): LoadResult`; `IpcDeps.privateRoot: string`.

- [ ] **Step 1: Write failing tests** — create `tests/unit/privateRoot.test.ts`:

```ts
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { privateContentRoot } from '../../src/main/privateRoot'

describe('privateContentRoot', () => {
  it('uses TOEIC_PRIVATE_CONTENT first', () => {
    expect(privateContentRoot('C:/AppData', { TOEIC_PRIVATE_CONTENT: 'D:/pack', TOEIC_USER_DATA: 'E:/u' })).toBe('D:/pack')
  })
  it('uses a folder inside TOEIC_USER_DATA next', () => {
    expect(privateContentRoot('C:/AppData', { TOEIC_USER_DATA: 'E:/u' })).toBe(join('E:/u', 'private-content'))
  })
  it('defaults to a fixed folder name under AppData', () => {
    expect(privateContentRoot('C:/AppData', {})).toBe(join('C:/AppData', 'toeic-trainer', 'private-content'))
  })
})
```

and append to `tests/unit/content.test.ts`:

```ts
describe('loadContent with a private root', () => {
  let priv: string
  const writePriv = (rel: string, data: unknown) => {
    const path = join(priv, rel)
    mkdirSync(join(path, '..'), { recursive: true })
    writeFileSync(path, JSON.stringify(data))
  }
  beforeEach(() => {
    priv = mkdtempSync(join(tmpdir(), 'toeic-private-'))
  })

  it('merges approved items from both roots', () => {
    write('grammar/part5/word-form.json', [makePart5()])
    writePriv('grammar/part5/word-form.json', [
      makePart5({ id: 'p5x-word-form-0001', source: [{ file: 'UNIT_1.pdf', page: 1 }] }),
      makePart5({ id: 'p5x-word-form-0002', status: 'draft' })
    ])
    const { bank, errors } = loadContent(root, priv)
    expect(errors).toEqual([])
    expect(bank.part5.map((i) => i.id)).toEqual([expect.stringMatching(/^p5-/), 'p5x-word-form-0001'])
  })

  it('reports an id that appears in both roots', () => {
    const item = makePart5()
    write('grammar/part5/word-form.json', [item])
    writePriv('grammar/part5/word-form.json', [item])
    const { bank, errors } = loadContent(root, priv)
    expect(bank.part5).toHaveLength(1)
    expect(errors[0]).toMatch(/duplicate id/)
  })

  it('treats a missing private root as empty', () => {
    write('grammar/part5/word-form.json', [makePart5()])
    expect(loadContent(root, join(priv, 'nope')).bank.part5).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/privateRoot.test.ts tests/unit/content.test.ts`
Expected: FAIL — module `privateRoot` not found; private items not loaded.

- [ ] **Step 3: Implement `src/main/privateRoot.ts`** (no electron import, so scripts can use it):

```ts
import { join } from 'path'

/**
 * Folder of the user's private question pack (imported from their own books; never shipped).
 * A fixed folder name, so the installed app and `npm run dev` share one pack.
 */
export function privateContentRoot(appData: string, env: Record<string, string | undefined> = process.env): string {
  if (env.TOEIC_PRIVATE_CONTENT) return env.TOEIC_PRIVATE_CONTENT
  // Test and dev profiles get their own pack, so E2E runs never read the real one.
  if (env.TOEIC_USER_DATA) return join(env.TOEIC_USER_DATA, 'private-content')
  return join(appData, 'toeic-trainer', 'private-content')
}
```

- [ ] **Step 4: Implement `loadContent`** — replace the function in `src/main/content.ts`:

```ts
/** Loads the bundled content, then the private pack if given; ids must be unique across both. */
export function loadContent(root: string, privateRoot?: string): LoadResult {
  const errors: string[] = []
  const seen = new Set<string>()
  const roots = privateRoot ? [root, privateRoot] : [root]
  const part5 = roots.flatMap((r) => collect(join(r, 'grammar', 'part5'), Part5Item, errors, seen))
  const part6 = roots.flatMap((r) => collect(join(r, 'grammar', 'part6'), Part6Set, errors, seen))
  const part7 = roots.flatMap((r) => collect(join(r, 'reading', 'part7'), Part7Set, errors, seen))
  return { bank: { part5, part6, part7 }, errors }
}
```

- [ ] **Step 5: Wire main** — in `src/main/ipc.ts` add to `IpcDeps` after `contentRoot: string`:

```ts
  /** The user's private question pack; may not exist. */
  privateRoot: string
```

destructure it in `registerIpc({ store, contentRoot, privateRoot, isDev, setMode, onSettings })` and change the bank handler to `loadContent(contentRoot, privateRoot)`.

In `src/main/index.ts` add `import { privateContentRoot } from './privateRoot'` and in the `registerIpc({…})` call, after `contentRoot: contentRoot(),`:

```ts
      // Dev-only env overrides (TOEIC_USER_DATA) are ignored in the installed app, as for userData.
      privateRoot: privateContentRoot(app.getPath('appData'), app.isPackaged ? {} : process.env),
```

- [ ] **Step 6: Verify**

Run: `npm run typecheck && npm test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/main/privateRoot.ts src/main/content.ts src/main/ipc.ts src/main/index.ts tests/unit/privateRoot.test.ts tests/unit/content.test.ts
git commit -m "feat: load the private question pack as a second content root

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Content Review handles private drafts

**Files:**
- Modify: `src/main/drafts.ts`
- Modify: `src/shared/api.ts` (`DraftEntry`)
- Modify: `src/main/ipc.ts` (dev draft handlers)
- Modify: `src/renderer/src/features/content-review/ContentReviewScreen.tsx`
- Test: `tests/unit/drafts.test.ts`

**Interfaces:**
- Consumes: `IpcDeps.privateRoot` (Task 4).
- Produces: `interface DraftRoots { content: string; private: string }`; `listDrafts(roots)`, `approveDraft(roots, file, id, edited)`, `rejectDraft(roots, file, id)`; `DraftEntry.private: boolean`. Ids starting `p5x-` live under `roots.private`; all others under `roots.content`.

- [ ] **Step 1: Update existing tests to the new signature** — in `tests/unit/drafts.test.ts`:
  - add `let roots: { content: string; private: string }` next to `let root`, and at the end of `beforeEach`:

```ts
  roots = { content: root, private: mkdtempSync(join(tmpdir(), 'toeic-drafts-private-')) }
```

  - replace every `listDrafts(root)` with `listDrafts(roots)`, every `approveDraft(root,` with `approveDraft(roots,`, every `rejectDraft(root,` with `rejectDraft(roots,`.
  - in the first test change the expectation to `toEqual([{ file: draftFile, id: a.id, item: a, private: false }])`.

- [ ] **Step 2: Add failing tests for private drafts** — append inside `describe('drafts', …)`:

```ts
  it('lists private drafts with private: true', () => {
    const a = makePart5({ id: 'p5x-word-form-0001', status: 'draft' })
    mkdirSync(join(roots.private, 'drafts'))
    writeFileSync(join(roots.private, 'drafts', 'import-x.json'), JSON.stringify([a]))
    expect(listDrafts(roots)).toEqual([{ file: 'import-x.json', id: a.id, item: a, private: true }])
  })

  it('approves a private draft into the private pack, not shipped content', () => {
    const a = makePart5({ id: 'p5x-word-form-0001', status: 'draft', flag: 're-check not confident' })
    mkdirSync(join(roots.private, 'drafts'))
    writeFileSync(join(roots.private, 'drafts', 'import-x.json'), JSON.stringify([a]))
    expect(approveDraft(roots, 'import-x.json', a.id, a)).toEqual({ ok: true })
    const saved = JSON.parse(readFileSync(join(roots.private, 'grammar/part5/word-form.json'), 'utf8'))
    expect(saved.map((x: { id: string }) => x.id)).toEqual([a.id])
    expect(existsSync(join(root, 'grammar/part5/word-form.json'))).toBe(false)
    expect(existsSync(join(roots.private, 'drafts', 'import-x.json'))).toBe(false)
  })

  it('rejects a private draft from the private drafts folder', () => {
    const a = makePart5({ id: 'p5x-word-form-0001', status: 'draft' })
    const b = makePart5({ id: 'p5x-word-form-0002', status: 'draft' })
    mkdirSync(join(roots.private, 'drafts'))
    writeFileSync(join(roots.private, 'drafts', 'import-x.json'), JSON.stringify([a, b]))
    rejectDraft(roots, 'import-x.json', a.id)
    const left = JSON.parse(readFileSync(join(roots.private, 'drafts', 'import-x.json'), 'utf8'))
    expect(left.map((x: { id: string }) => x.id)).toEqual([b.id])
  })
```

- [ ] **Step 3: Run to verify failure**

Run: `npx vitest run tests/unit/drafts.test.ts`
Expected: FAIL — type errors / private drafts not found.

- [ ] **Step 4: Implement `src/main/drafts.ts`** — replace the exported functions (keep `safeFile`, `readArray`, `Raw`, `draftsDir`):

```ts
export interface DraftRoots {
  /** Shipped content folder (`content/`). */
  content: string
  /** The user's private pack; holds every `p5x-` item. */
  private: string
}

const rootFor = (roots: DraftRoots, id: string): string => (id.startsWith('p5x-') ? roots.private : roots.content)

function removeFromDraft(root: string, file: string, id: string): void {
  const path = join(draftsDir(root), safeFile(file))
  const rest = readArray(path).filter((x) => x.id !== id)
  if (rest.length === 0) {
    if (existsSync(path)) unlinkSync(path)
  } else {
    writeJsonAtomic(path, rest)
  }
}

function listIn(root: string, isPrivate: boolean): DraftEntry[] {
  const dir = draftsDir(root)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((file) =>
      readArray(join(dir, file)).map((item) => ({ file, id: String(item.id), item, private: isPrivate }))
    )
}

export function listDrafts(roots: DraftRoots): DraftEntry[] {
  return [...listIn(roots.content, false), ...listIn(roots.private, true)]
}

export function approveDraft(roots: DraftRoots, file: string, id: string, edited: unknown): DraftResult {
  safeFile(file)
  if (typeof edited !== 'object' || edited === null) return { ok: false, error: 'item must be an object' }
  const candidate = { ...(edited as Raw), status: 'approved', flag: undefined }
  const root = rootFor(roots, id)

  let parsedId: string
  let target: string
  let data: unknown
  if (/^p5x?-/.test(id)) {
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

export function rejectDraft(roots: DraftRoots, file: string, id: string): void {
  removeFromDraft(rootFor(roots, id), file, id)
}
```

- [ ] **Step 5: API type** — in `src/shared/api.ts`:

```ts
export interface DraftEntry {
  file: string
  id: string
  item: Record<string, unknown>
  /** True for items from the user's private pack (imported from their own books). */
  private: boolean
}
```

- [ ] **Step 6: IPC** — in `src/main/ipc.ts`, inside `if (isDev) {`:

```ts
    const roots = { content: contentRoot, private: privateRoot }
    ipcMain.handle(IPC.devListDrafts, () => listDrafts(roots))
    ipcMain.handle(IPC.devApproveDraft, (_e, file: string, id: string, item: unknown) =>
      approveDraft(roots, file, id, item)
    )
    ipcMain.handle(IPC.devRejectDraft, (_e, file: string, id: string) => rejectDraft(roots, file, id))
```

- [ ] **Step 7: Review screen** — in `ContentReviewScreen.tsx` change the card header and the empty-state text:

```tsx
      <header>
        <strong>{draft.id}</strong> <small className="muted">{draft.file}</small>
        {draft.private && <small className="muted"> · private pack</small>}
        {typeof draft.item.flag === 'string' && <span className="flag">⚠ {draft.item.flag}</span>}
      </header>
```

```tsx
        <p className="muted">
          No drafts. Generate some in a terminal with <code>npm run gen -- --part 5 --topic word-form</code> (or{' '}
          <code>--part 6</code>), or import your own books with <code>npm run import</code>, then reopen this screen.
          Run <code>npm run gen</code> alone to list every option.
        </p>
```

- [ ] **Step 8: Verify**

Run: `npm run typecheck && npm test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/main/drafts.ts src/shared/api.ts src/main/ipc.ts src/renderer/src/features/content-review/ContentReviewScreen.tsx tests/unit/drafts.test.ts
git commit -m "feat: review private-pack drafts alongside shipped drafts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Show where a private item came from

**Files:**
- Create: `src/shared/source.ts`
- Modify: `src/renderer/src/app/i18n.ts` (`en` and `th` string tables)
- Modify: `src/renderer/src/features/grammar/QuestionView.tsx` (`Explain`)
- Modify: `src/renderer/office/Task.tsx` (`Explain`)
- Modify: `src/renderer/src/styles.css`, `src/renderer/office/office.css`
- Test: `tests/unit/source.test.ts` (new), `tests/unit/renderer/QuestionView.test.tsx` (new)

**Interfaces:**
- Consumes: `ItemSource` (Task 1).
- Produces: `sourceText(sources: ItemSource[]): string`; string key `sourceFrom` (`{where}` variable).

- [ ] **Step 1: Write failing tests** — `tests/unit/source.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { sourceText } from '@shared/source'

describe('sourceText', () => {
  it('lists every place the question was printed', () => {
    expect(
      sourceText([
        { file: 'UNIT_3.pdf', page: 2, no: 12 },
        { file: 'Toeic_Grammar_Krubird.pdf', page: 9 }
      ])
    ).toBe('UNIT_3.pdf p.2 #12, Toeic_Grammar_Krubird.pdf p.9')
  })
})
```

`tests/unit/renderer/QuestionView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuestionView } from '../../../src/renderer/src/features/grammar/QuestionView'
import { makePart5 } from '../../fixtures/items'

describe('QuestionView source line', () => {
  it('shows where a private item came from after answering', () => {
    const item = makePart5({ id: 'p5x-word-form-0001', source: [{ file: 'UNIT_3.pdf', page: 2, no: 12 }] })
    render(<QuestionView entry={{ kind: 'p5', item }} lang="en" selected={1} reveal onChoose={() => {}} />)
    expect(screen.getByText('From: UNIT_3.pdf p.2 #12')).toBeTruthy()
  })

  it('shows no source line for shipped items', () => {
    render(<QuestionView entry={{ kind: 'p5', item: makePart5() }} lang="en" selected={1} reveal onChoose={() => {}} />)
    expect(screen.queryByText(/^From:/)).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/source.test.ts tests/unit/renderer/QuestionView.test.tsx`
Expected: FAIL — module `@shared/source` not found.

- [ ] **Step 3: Implement `src/shared/source.ts`**

```ts
import type { ItemSource } from './types'

/** "UNIT_3.pdf p.2 #12, …": where a private item was printed in the user's books. */
export function sourceText(sources: ItemSource[]): string {
  return sources.map((s) => `${s.file} p.${s.page}${s.no ? ` #${s.no}` : ''}`).join(', ')
}
```

- [ ] **Step 4: Strings** — in `i18n.ts`, add after `trapLabel` in `en`: `sourceFrom: 'From: {where}',` and after `trapLabel` in `th`: `sourceFrom: 'จาก: {where}',`.

- [ ] **Step 5: Trainer view** — in `QuestionView.tsx` add `import { sourceText } from '@shared/source'` and in `Explain`, right after the `<p className="explain-body" …>` line:

```tsx
      {entry.kind === 'p5' && entry.item.source && (
        <p className="explain-source">{t(lang, 'sourceFrom', { where: sourceText(entry.item.source) })}</p>
      )}
```

- [ ] **Step 6: Office view** — in `office/Task.tsx` add `import { sourceText } from '@shared/source'` and in its `Explain`, after the `</p>` closing `explain-body`:

```tsx
      {entry.kind === 'p5' && entry.item.source && (
        <p className="explain-source">{t('sourceFrom', { where: sourceText(entry.item.source) })}</p>
      )}
```

- [ ] **Step 7: Styles** — append to `src/renderer/src/styles.css`:

```css
.explain-source { color: var(--ink-soft); font-size: 0.875rem; margin: 0; }
```

and to `src/renderer/office/office.css`:

```css
.explain-source { opacity: 0.75; font-size: 0.875em; margin: 0; }
```

- [ ] **Step 8: Verify**

Run: `npm run typecheck && npm test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/shared/source.ts src/renderer/src/app/i18n.ts src/renderer/src/features/grammar/QuestionView.tsx src/renderer/office/Task.tsx src/renderer/src/styles.css src/renderer/office/office.css tests/unit/source.test.ts tests/unit/renderer/QuestionView.test.tsx
git commit -m "feat: show which book page a private question came from

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: E2E — a private item shows up in a drill

**Files:**
- Modify: `tests/e2e/helpers.ts` (`LaunchOptions`, `launchApp`)
- Create: `tests/e2e/private-pack.spec.ts`

**Interfaces:**
- Consumes: private root = `<TOEIC_USER_DATA>/private-content` (Task 4), source line (Task 6), hidden empty topics (Task 3).
- Produces: `LaunchOptions.privateContent?: Record<string, unknown>` — relative path under the private pack → JSON written before launch.

- [ ] **Step 1: Helper option** — in `tests/e2e/helpers.ts` add to `LaunchOptions`:

```ts
  /** Files for the private question pack, keyed by path relative to it (e.g. "grammar/part5/modals.json"). */
  privateContent?: Record<string, unknown>
```

add `mkdirSync` and `dirname` to the existing `fs`/`path` imports, and in `launchApp` right after the `progress` write:

```ts
      for (const [rel, data] of Object.entries(opts.privateContent ?? {})) {
        const file = join(userData, 'private-content', rel)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, JSON.stringify(data))
      }
```

- [ ] **Step 2: Write the test** — `tests/e2e/private-pack.spec.ts`:

```ts
import { expect, nav, test } from './helpers'

const item = {
  id: 'p5x-modals-0001',
  part: 5,
  topic: 'modals',
  difficulty: 2,
  stem: 'All guests must ____ their badges at the entrance.',
  choices: ['show', 'showing', 'to show', 'shows'],
  answer: 0,
  trap: 'modal + base verb',
  explain: {
    en: 'After the modal must, use the base verb show.',
    th: 'หลัง must ต้องใช้กริยารูปเดิม show'
  },
  source: [{ file: 'UNIT_9.pdf', page: 3, no: 7 }],
  status: 'approved'
}

test.describe('Private question pack', () => {
  test('PRV-01 a private item adds its topic and shows its source after answering', async ({ launchApp }) => {
    const { page, errors } = await launchApp({ privateContent: { 'grammar/part5/modals.json': [item] } })
    await nav(page, 'Topic drills')
    await expect(page.locator('ul.tile-grid a.tile')).toHaveCount(14)
    await page.getByRole('link', { name: /Modal verbs/ }).click()
    await expect(page.getByText('Question 1 of 1')).toBeVisible()
    await page.locator('button.choice').first().click()
    await expect(page.locator('.explain-source')).toHaveText('From: UNIT_9.pdf p.3 #7')
    expect(errors).toEqual([])
  })

  test('PRV-02 without a private pack the new topics stay hidden', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Topic drills')
    await expect(page.getByRole('link', { name: /Modal verbs/ })).toHaveCount(0)
  })
})
```

- [ ] **Step 3: Run**

Run: `npm run test:e2e -- tests/e2e/private-pack.spec.ts`
Expected: PASS (both). If the drill heading text differs for a 1-item drill, read the current drill screen copy and use the exact string shown.

- [ ] **Step 4: Full E2E regression**

Run: `npm run test:e2e`
Expected: PASS, including NAV-06 (13 tiles without a pack).

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/helpers.ts tests/e2e/private-pack.spec.ts
git commit -m "test: e2e for the private question pack

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Import helpers — clean, validate and dedupe extracted items

**Files:**
- Create: `scripts/lib/import/normalize.ts`
- Create: `scripts/lib/import/args.ts`
- Test: `tests/unit/import-normalize.test.ts`

**Interfaces:**
- Produces (normalize.ts): `ExtractedItem { no: number; stem: string; choices: string[] }`, `RawItem { stem: string; choices: string[]; source: ItemSource[] }`, `normalizeStem(s)`, `cleanChoice(s)`, `cleanItem(e)`, `problemOf(item): string | null`, `dedupeKey(item)`, `dedupe(pages: { file: string; page: number; items: ExtractedItem[] }[]): RawItem[]`.
- Produces (args.ts): `parsePages(spec?: string): { from: number; to: number } | null`, `pageNumbers(count: number, range: {from,to} | null): number[]`, `chunk<T>(xs: T[], n: number): T[][]`.

- [ ] **Step 1: Write failing tests** — `tests/unit/import-normalize.test.ts` (hand-written fixtures, not copied from the PDFs):

```ts
import { describe, expect, it } from 'vitest'
import { chunk, pageNumbers, parsePages } from '../../scripts/lib/import/args'
import { cleanChoice, cleanItem, dedupe, dedupeKey, normalizeStem, problemOf } from '../../scripts/lib/import/normalize'

describe('normalizeStem', () => {
  it('turns any dash or underscore blank into ____', () => {
    expect(normalizeStem('The fee is ------- by Friday.')).toBe('The fee is ____ by Friday.')
    expect(normalizeStem('Send the ______ now.')).toBe('Send the ____ now.')
  })
  it('joins a blank split across lines and tidies spaces', () => {
    expect(normalizeStem('A cold -----\n-- was served .')).toBe('A cold ____ was served.')
  })
  it('separates a blank glued to a word', () => {
    expect(normalizeStem('a chance of_____to lead')).toBe('a chance of ____ to lead')
  })
  it('keeps single hyphens in words', () => {
    expect(normalizeStem('A well-known ____ firm.')).toBe('A well-known ____ firm.')
  })
})

describe('cleanChoice', () => {
  it('strips letter prefixes in any style', () => {
    expect(['(A) choose', 'B) chosen', 'C. choosing', ' (d)  chose '].map(cleanChoice)).toEqual([
      'choose',
      'chosen',
      'choosing',
      'chose'
    ])
  })
})

describe('problemOf', () => {
  const ok = { no: 1, stem: 'We ____ it.', choices: ['a', 'b', 'c', 'd'] }
  it('accepts one blank and four choices', () => expect(problemOf(ok)).toBeNull())
  it('names the problem otherwise', () => {
    expect(problemOf({ ...ok, stem: 'No blank.' })).toBe('stem has 0 blanks')
    expect(problemOf({ ...ok, choices: ['a', 'b', 'c'] })).toBe('3 choices')
    expect(problemOf({ ...ok, choices: ['a', '', 'c', 'd'] })).toBe('empty choice')
  })
})

describe('dedupe', () => {
  const q = (stem: string, choices: string[], no = 1) => cleanItem({ no, stem, choices })
  it('merges the same question from two files and keeps every source', () => {
    const a = q('The office ____ at 9 a.m.', ['(A) opens', '(B) open', '(C) opening', '(D) opened'], 4)
    const b = q('The office  ____ at 9 a.m. ', ['opened', 'opens', 'open', 'opening'], 0)
    const out = dedupe([
      { file: 'UNIT_1.pdf', page: 1, items: [a] },
      { file: 'Book.pdf', page: 7, items: [b] }
    ])
    expect(out).toEqual([
      {
        stem: 'The office ____ at 9 a.m.',
        choices: ['opens', 'open', 'opening', 'opened'],
        source: [{ file: 'UNIT_1.pdf', page: 1, no: 4 }, { file: 'Book.pdf', page: 7 }]
      }
    ])
    expect(dedupeKey(a)).toBe(dedupeKey(b))
  })
  it('keeps questions with the same stem but different choices apart', () => {
    const out = dedupe([
      { file: 'a.pdf', page: 1, items: [q('We ____ it.', ['a', 'b', 'c', 'd']), q('We ____ it.', ['a', 'b', 'c', 'e'], 2)] }
    ])
    expect(out).toHaveLength(2)
  })
})

describe('args', () => {
  it('parses page ranges', () => {
    expect(parsePages(undefined)).toBeNull()
    expect(parsePages('5')).toEqual({ from: 5, to: 5 })
    expect(parsePages('3-10')).toEqual({ from: 3, to: 10 })
    expect(() => parsePages('x')).toThrow(/--pages/)
    expect(() => parsePages('9-2')).toThrow(/--pages/)
  })
  it('lists pages inside the document', () => {
    expect(pageNumbers(4, null)).toEqual([1, 2, 3, 4])
    expect(pageNumbers(4, { from: 3, to: 10 })).toEqual([3, 4])
  })
  it('chunks', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/import-normalize.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement `scripts/lib/import/normalize.ts`**

```ts
import type { ItemSource } from '../../../src/shared/types'

/** One question as Claude read it off a page. `no` is the printed number, 0 if none. */
export interface ExtractedItem {
  no: number
  stem: string
  choices: string[]
}

/** A unique question with every place it was printed. */
export interface RawItem {
  stem: string
  choices: string[]
  source: ItemSource[]
}

/** Books print blanks as ----, ____ or both split over a line break; the app uses ____. */
export function normalizeStem(stem: string): string {
  return stem
    .replace(/[_\-–—]{2,}(?:\s*[_\-–—]{2,})*/g, ' ____ ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:?!])/g, '$1')
    .trim()
}

export function cleanChoice(choice: string): string {
  return choice
    .replace(/^\s*\(?[A-Da-d][).]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function cleanItem(e: ExtractedItem): ExtractedItem {
  return { no: e.no, stem: normalizeStem(e.stem), choices: e.choices.map(cleanChoice) }
}

/** Why an item cannot become a Part 5 question, or null if it can. */
export function problemOf(item: { stem: string; choices: string[] }): string | null {
  const blanks = item.stem.split('____').length - 1
  if (blanks !== 1) return `stem has ${blanks} blanks`
  if (item.choices.length !== 4) return `${item.choices.length} choices`
  if (item.choices.some((c) => c === '')) return 'empty choice'
  return null
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/____/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** The same question printed in two books gets the same key, whatever the choice order or spacing. */
export function dedupeKey(item: { stem: string; choices: string[] }): string {
  return `${norm(item.stem)}|${item.choices.map(norm).sort().join('|')}`
}

/** First printing wins; later printings are added to its sources. Input order is kept. */
export function dedupe(pages: { file: string; page: number; items: ExtractedItem[] }[]): RawItem[] {
  const byKey = new Map<string, RawItem>()
  for (const p of pages) {
    for (const it of p.items) {
      const src: ItemSource = it.no > 0 ? { file: p.file, page: p.page, no: it.no } : { file: p.file, page: p.page }
      const prev = byKey.get(dedupeKey(it))
      if (prev) prev.source.push(src)
      else byKey.set(dedupeKey(it), { stem: it.stem, choices: it.choices, source: [src] })
    }
  }
  return [...byKey.values()]
}
```

- [ ] **Step 4: Implement `scripts/lib/import/args.ts`**

```ts
export interface PageRange {
  from: number
  to: number
}

export function parsePages(spec?: string): PageRange | null {
  if (spec === undefined) return null
  const m = /^(\d+)(?:-(\d+))?$/.exec(spec.trim())
  const from = m ? Number(m[1]) : NaN
  const to = m ? Number(m[2] ?? m[1]) : NaN
  if (!m || from < 1 || to < from) throw new Error(`--pages must look like 5 or 3-10 (got "${spec}")`)
  return { from, to }
}

export function pageNumbers(count: number, range: PageRange | null): number[] {
  const from = range?.from ?? 1
  const to = Math.min(range?.to ?? count, count)
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)
}

export function chunk<T>(xs: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < xs.length; i += n) out.push(xs.slice(i, i + n))
  return out
}
```

- [ ] **Step 5: Verify**

Run: `npx vitest run tests/unit/import-normalize.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/import/normalize.ts scripts/lib/import/args.ts tests/unit/import-normalize.test.ts
git commit -m "feat: clean, validate and dedupe questions extracted from PDFs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Import helpers — PDF access and the work cache

**Files:**
- Modify: `package.json` (devDependency `pdf-lib`)
- Create: `scripts/lib/import/pdf.ts`
- Create: `scripts/lib/import/cache.ts`
- Test: `tests/unit/import-pdf.test.ts`

**Interfaces:**
- Produces (pdf.ts): `findPdftotext(env?, onPath?: () => boolean, exists?: (p: string) => boolean): string`, `pageText(bin: string, file: string, page: number): string`, `pageCount(file: string): Promise<number>`, `singlePagePdf(file: string, page: number): Promise<string>` (base64), `forgetPdf(file: string): void`.
- Produces (cache.ts): `hashOf(x: unknown): string`, `cached<T>(dir: string, key: string, make: () => Promise<T>): Promise<T>`, `pool<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]>`.

- [ ] **Step 1: Install pdf-lib**

Run: `npm install --save-dev pdf-lib@1.17.1`
Expected: `package.json` devDependencies gains `"pdf-lib": "^1.17.1"`.

- [ ] **Step 2: Write failing tests** — `tests/unit/import-pdf.test.ts`:

```ts
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { cached, hashOf, pool } from '../../scripts/lib/import/cache'
import { findPdftotext, pageCount, singlePagePdf } from '../../scripts/lib/import/pdf'

const GIT = 'C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe'

describe('findPdftotext', () => {
  it('prefers PDFTOTEXT', () => {
    expect(findPdftotext({ PDFTOTEXT: 'X:/pdftotext.exe' }, () => true, () => true)).toBe('X:/pdftotext.exe')
  })
  it('uses the one on PATH next', () => {
    expect(findPdftotext({}, () => true, () => true)).toBe('pdftotext')
  })
  it('falls back to the copy shipped with Git for Windows', () => {
    expect(findPdftotext({}, () => false, (p) => p === GIT)).toBe(GIT)
  })
  it('explains how to fix a missing pdftotext', () => {
    expect(() => findPdftotext({}, () => false, () => false)).toThrow(/Git for Windows/)
  })
})

describe('pdf pages', () => {
  it('counts pages and cuts one page out as its own PDF', async () => {
    const doc = await PDFDocument.create()
    for (let i = 0; i < 3; i++) doc.addPage([200, 200])
    const file = join(mkdtempSync(join(tmpdir(), 'toeic-pdf-')), 'three.pdf')
    writeFileSync(file, await doc.save())
    expect(await pageCount(file)).toBe(3)
    const one = await PDFDocument.load(Buffer.from(await singlePagePdf(file, 2), 'base64'))
    expect(one.getPageCount()).toBe(1)
  })
})

describe('cache', () => {
  it('runs make once per key and reads the saved value after', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'toeic-cache-'))
    let calls = 0
    const make = async () => ({ n: ++calls })
    expect(await cached(dir, 'a/b', make)).toEqual({ n: 1 })
    expect(await cached(dir, 'a/b', make)).toEqual({ n: 1 })
    expect(calls).toBe(1)
  })
  it('hashes equal values equally', () => {
    expect(hashOf(['x', 1])).toBe(hashOf(['x', 1]))
    expect(hashOf(['x', 1])).not.toBe(hashOf(['x', 2]))
  })
  it('pool keeps result order and respects the limit', async () => {
    let running = 0
    let peak = 0
    const out = await pool([30, 10, 20, 5], 2, async (ms, i) => {
      running++
      peak = Math.max(peak, running)
      await new Promise((r) => setTimeout(r, ms))
      running--
      return i
    })
    expect(out).toEqual([0, 1, 2, 3])
    expect(peak).toBe(2)
  })
})
```

- [ ] **Step 3: Run to verify failure**

Run: `npx vitest run tests/unit/import-pdf.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement `scripts/lib/import/pdf.ts`**

```ts
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { PDFDocument } from 'pdf-lib'

const GIT_PDFTOTEXT = 'C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe'
const onPathDefault = () => !spawnSync('pdftotext', ['-v']).error

/** pdftotext from PDFTOTEXT, then PATH, then the copy Git for Windows ships. */
export function findPdftotext(
  env: Record<string, string | undefined> = process.env,
  onPath: () => boolean = onPathDefault,
  exists: (p: string) => boolean = existsSync
): string {
  if (env.PDFTOTEXT) return env.PDFTOTEXT
  if (onPath()) return 'pdftotext'
  if (exists(GIT_PDFTOTEXT)) return GIT_PDFTOTEXT
  throw new Error('pdftotext not found. Install Git for Windows (it ships pdftotext) or set PDFTOTEXT to its full path.')
}

/** Text of one page (1-based) in reading order; raw mode keeps two-column pages readable. */
export function pageText(bin: string, file: string, page: number): string {
  return execFileSync(bin, ['-f', String(page), '-l', String(page), '-enc', 'UTF-8', file, '-'], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024
  })
}

// Parsed documents are kept per file, since some books are hundreds of MB.
const docs = new Map<string, Promise<PDFDocument>>()

function load(file: string): Promise<PDFDocument> {
  let doc = docs.get(file)
  if (!doc) {
    doc = PDFDocument.load(readFileSync(file), { ignoreEncryption: true })
    docs.set(file, doc)
  }
  return doc
}

/** Frees a parsed document once its pages are done. */
export function forgetPdf(file: string): void {
  docs.delete(file)
}

export async function pageCount(file: string): Promise<number> {
  return (await load(file)).getPageCount()
}

/** One page (1-based) as a standalone PDF, base64, for Claude's PDF document input. */
export async function singlePagePdf(file: string, page: number): Promise<string> {
  const out = await PDFDocument.create()
  const [copied] = await out.copyPages(await load(file), [page - 1])
  out.addPage(copied)
  return Buffer.from(await out.save()).toString('base64')
}
```

- [ ] **Step 5: Implement `scripts/lib/import/cache.ts`**

```ts
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const hashOf = (x: unknown): string => createHash('sha1').update(JSON.stringify(x)).digest('hex').slice(0, 16)

/** Runs `make` once per key; later runs read the saved JSON, so finished API calls are never paid twice. */
export async function cached<T>(dir: string, key: string, make: () => Promise<T>): Promise<T> {
  const file = join(dir, `${key}.json`)
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')) as T
  const value = await make()
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(value, null, 2), 'utf8')
  return value
}

/** Maps with at most `limit` calls in flight; results keep input order. */
export async function pool<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}
```

- [ ] **Step 6: Verify**

Run: `npx vitest run tests/unit/import-pdf.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Smoke-check pdftotext on a real file (local only, nothing committed)**

Run: `npx tsx -e "import { findPdftotext, pageText } from './scripts/lib/import/pdf'; console.log(pageText(findPdftotext(), 'toeic_source/UNIT_1.pdf', 1).slice(0, 300))"`
Expected: the first lines of UNIT 1 questions print.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json scripts/lib/import/pdf.ts scripts/lib/import/cache.ts tests/unit/import-pdf.test.ts
git commit -m "feat: PDF page access and a resumable work cache for the importer

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Import prompts, Claude call options and item building

**Files:**
- Modify: `scripts/lib/claude.ts` (`ask` options)
- Modify: `scripts/lib/gen.ts` (export shared prompt rules)
- Create: `scripts/lib/import/prompts.ts`
- Create: `scripts/lib/import/build.ts`
- Create: `scripts/lib/import/store.ts`
- Test: `tests/unit/import-build.test.ts`

**Interfaces:**
- Consumes: `RawItem`, `dedupeKey` (Task 8); `Part5Item`, `ItemSource` (Task 1); `PART5_TOPICS` (Task 2).
- Produces:
  - `ask(schema, system, user: string | Anthropic.MessageParam['content'], opts?: { effort?: Effort })` where `type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'` (default `'high'`, unchanged for `npm run gen`).
  - gen.ts exports `DIFFICULTY_GUIDE`, `EXPLAIN_FIELD_RULES`.
  - prompts.ts: `ExtractResult`, `SolveResult`, `BlindResult` zod schemas; `extractSystem: string`; `solvePrompt(items: { index: number; stem: string; choices: string[] }[]): Prompt`; `blindPrompt(same): Prompt`.
  - build.ts: `makeNumberer(usedIds: string[]): (topic: Part5Topic) => string`; `verdictFlag(raw, solved, blind?)`; `buildItems(batch: RawItem[], solved: Solved[], blind: Blind[], nextId): Built` with `Built { approved: Part5Item[]; flagged: Part5Item[]; errors: string[] }`.
  - store.ts: `appendItems(path: string, items: unknown[]): void`; `writeBuilt(outRoot: string, built: Built, draftFile: string): void`; `readLedger(path): Record<string, string>`; `saveLedger(path, ledger)`.

- [ ] **Step 1: Write failing tests** — `tests/unit/import-build.test.ts`:

```ts
import { mkdtempSync, readFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { buildItems, makeNumberer, verdictFlag } from '../../scripts/lib/import/build'
import type { RawItem } from '../../scripts/lib/import/normalize'
import { blindPrompt, solvePrompt } from '../../scripts/lib/import/prompts'
import { readLedger, saveLedger, writeBuilt } from '../../scripts/lib/import/store'

const raw = (over: Partial<RawItem> = {}): RawItem => ({
  stem: 'All visitors must ____ in at the desk.',
  choices: ['sign', 'signing', 'to sign', 'signs'],
  source: [{ file: 'UNIT_2.pdf', page: 4, no: 3 }],
  ...over
})
const solved = (over = {}) => ({
  index: 0,
  answer: 0,
  topic: 'modals' as const,
  difficulty: 2,
  trap: 'modal + base verb',
  explain_en: 'After the modal must, use the base verb sign.',
  explain_th: 'หลัง must ต้องใช้กริยารูปเดิม sign',
  problem: '',
  ...over
})

describe('makeNumberer', () => {
  it('continues after the highest used id per topic', () => {
    const next = makeNumberer(['p5x-modals-0003', 'p5x-modals-0001', 'p5x-word-form-0009', 'p5-modals-0050'])
    expect(next('modals')).toBe('p5x-modals-0004')
    expect(next('modals')).toBe('p5x-modals-0005')
    expect(next('word-form')).toBe('p5x-word-form-0010')
    expect(next('determiners')).toBe('p5x-determiners-0001')
  })
})

describe('verdictFlag', () => {
  it('approves only when the blind re-check agrees and is confident', () => {
    expect(verdictFlag(raw(), solved(), { index: 0, answer: 0, confident: true })).toBeNull()
    expect(verdictFlag(raw(), solved(), { index: 0, answer: 2, confident: true })).toBe(
      're-check chose "to sign", solver chose "sign"'
    )
    expect(verdictFlag(raw(), solved(), { index: 0, answer: 0, confident: false })).toBe('re-check not confident')
    expect(verdictFlag(raw(), solved(), undefined)).toBe('not re-checked')
    expect(verdictFlag(raw(), solved({ problem: 'two answers fit' }), { index: 0, answer: 0, confident: true })).toBe(
      'solver: two answers fit'
    )
  })
})

describe('buildItems', () => {
  it('approves agreed items and flags the rest as drafts', () => {
    const batch = [raw(), raw({ stem: 'Staff should ____ early.', choices: ['leave', 'leaving', 'left', 'leaves'] })]
    const out = buildItems(
      batch,
      [solved(), solved({ index: 1 })],
      [
        { index: 0, answer: 0, confident: true },
        { index: 1, answer: 1, confident: true }
      ],
      makeNumberer([])
    )
    expect(out.errors).toEqual([])
    expect(out.approved.map((i) => [i.id, i.status, i.source])).toEqual([
      ['p5x-modals-0001', 'approved', [{ file: 'UNIT_2.pdf', page: 4, no: 3 }]]
    ])
    expect(out.flagged.map((i) => [i.id, i.status, i.flag])).toEqual([
      ['p5x-modals-0002', 'draft', 're-check chose "leaving", solver chose "leave"']
    ])
  })

  it('clamps difficulty and reports items the schema rejects', () => {
    const out = buildItems(
      [raw(), raw()],
      [solved({ difficulty: 9 }), solved({ index: 1, answer: 7 })],
      [
        { index: 0, answer: 0, confident: true },
        { index: 1, answer: 7, confident: true }
      ],
      makeNumberer([])
    )
    expect(out.approved[0].difficulty).toBe(5)
    expect(out.errors).toHaveLength(1)
  })
})

describe('prompts', () => {
  it('sends items without answers to the blind check', () => {
    const p = blindPrompt([{ index: 0, stem: 'We ____ it.', choices: ['a', 'b', 'c', 'd'] }])
    expect(p.user).toContain('We ____ it.')
    expect(p.user).not.toContain('answer')
  })
  it('lists every Part 5 topic for the solver', () => {
    expect(solvePrompt([]).system).toMatch(/noun-clauses/)
    expect(solvePrompt([]).system).toMatch(/word-choice/)
  })
})

describe('store', () => {
  it('appends approved items per topic, flagged items to one draft file, and keeps a ledger', () => {
    const out = mkdtempSync(join(tmpdir(), 'toeic-store-'))
    const built = buildItems(
      [raw(), raw({ stem: 'Staff should ____ early.' })],
      [solved(), solved({ index: 1 })],
      [
        { index: 0, answer: 0, confident: true },
        { index: 1, answer: 0, confident: false }
      ],
      makeNumberer([])
    )
    writeBuilt(out, built, 'import-x.json')
    writeBuilt(out, { approved: [{ ...built.approved[0], id: 'p5x-modals-0003' }], flagged: [], errors: [] }, 'import-x.json')
    const approved = JSON.parse(readFileSync(join(out, 'grammar/part5/modals.json'), 'utf8'))
    expect(approved.map((i: { id: string }) => i.id)).toEqual(['p5x-modals-0001', 'p5x-modals-0003'])
    expect(JSON.parse(readFileSync(join(out, 'drafts/import-x.json'), 'utf8'))).toHaveLength(1)

    const ledgerFile = join(out, 'ledger.json')
    expect(readLedger(ledgerFile)).toEqual({})
    saveLedger(ledgerFile, { k: 'p5x-modals-0001' })
    expect(readLedger(ledgerFile)).toEqual({ k: 'p5x-modals-0001' })
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/import-build.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: `ask()` options** — replace `scripts/lib/claude.ts`:

```ts
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import type { z } from 'zod'

export const MODEL = 'claude-opus-5-5'

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

// Credentials resolve from ANTHROPIC_API_KEY or an `ant auth login` profile.
const client = new Anthropic()

/** `user` is plain text or content blocks (e.g. a PDF document block before the text). */
export async function ask<S extends z.ZodType>(
  schema: S,
  system: string,
  user: string | Anthropic.MessageParam['content'],
  opts: { effort?: Effort } = {}
): Promise<z.infer<S>> {
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { effort: opts.effort ?? 'high', format: zodOutputFormat(schema) }
  })
  if (res.stop_reason === 'refusal') throw new Error('Claude declined this request; try again or change the topic.')
  if (res.stop_reason === 'max_tokens') throw new Error('Output was truncated (max_tokens). Use a smaller --count.')
  if (!res.parsed_output) throw new Error('Claude returned output that did not match the schema.')
  return res.parsed_output
}
```

- [ ] **Step 4: Share prompt rules** — in `scripts/lib/gen.ts` replace the `DIFFICULTY_GUIDE` and `EXPLAIN_RULES` constants with:

```ts
export const DIFFICULTY_GUIDE = `Difficulty scale for TOEIC 600–850+ learners:
1 = very easy, basic form
2 = common pattern; distractors are clearly wrong to an intermediate learner
3 = typical TOEIC item with one tempting distractor
4 = advanced; two plausible distractors, the whole sentence must be read carefully
5 = hardest TOEIC items; subtle collocation, register or structure differences`

/** How to write the tested point and the two explanations; shared with the importer. */
export const EXPLAIN_FIELD_RULES = `- "trap": a short English label naming exactly what is tested, e.g. "adverb modifies the verb 'implemented'".
- "explain_en": 1–3 sentences on why the answer is right and why the most tempting distractor is wrong.
- "explain_th": the same explanation in natural, friendly Thai for Thai learners. Keep key grammar terms in English in parentheses, e.g. คำกริยาวิเศษณ์ (adverb).`

const EXPLAIN_RULES = `${EXPLAIN_FIELD_RULES}
- "answer" is the 0-based index of the correct choice. Vary the position of the correct answer across items.
- Never copy real ETS TOEIC questions; write original items.`
```

Run: `npx vitest run tests/unit/gen.test.ts` — Expected: PASS (prompt text is unchanged).

- [ ] **Step 5: `scripts/lib/import/prompts.ts`**

```ts
import { z } from 'zod'
import { Part5Topic } from '../../../src/shared/types'
import { DIFFICULTY_GUIDE, EXPLAIN_FIELD_RULES, type Prompt } from '../gen'

// Loose shapes for structured outputs; strict validation happens with Part5Item afterwards.
export const ExtractResult = z.object({
  pageKind: z.enum(['part5', 'other']),
  items: z.array(z.object({ no: z.number().int(), stem: z.string(), choices: z.array(z.string()) }))
})
export type ExtractResult = z.infer<typeof ExtractResult>

export const SolveResult = z.object({
  items: z.array(
    z.object({
      index: z.number().int(),
      answer: z.number().int(),
      topic: Part5Topic,
      difficulty: z.number().int(),
      trap: z.string(),
      explain_en: z.string(),
      explain_th: z.string(),
      problem: z.string()
    })
  )
})
export type SolveResult = z.infer<typeof SolveResult>

export const BlindResult = z.object({
  items: z.array(z.object({ index: z.number().int(), answer: z.number().int(), confident: z.boolean() }))
})
export type BlindResult = z.infer<typeof BlindResult>

export const extractSystem = `You turn one page of a Thai TOEIC prep book into structured TOEIC Reading Part 5 questions.
- pageKind = "part5" if the page has incomplete-sentence multiple-choice questions (one sentence with one blank and four options A–D). Otherwise "other" (word lists, grammar explanations, listening, reading passages, answer keys, contents pages) with an empty items list.
- The page may be laid out in two columns, so a question's sentence and options can be split up or mixed with a neighbouring question. Rebuild each question from its number and options.
- "no": the question number printed in the book, or 0 if there is none.
- "stem": the sentence as printed, with the blank written as ____ whatever the book used (dashes, underscores, dots). Only repair line-break hyphenation and broken spacing; keep the book's wording.
- "choices": the four options in order A, B, C, D, without the letter and without grammar labels such as "(Adjective)".
- Skip any question that is not complete on this page. Never invent text. Do not answer the questions.
- Ignore Thai text, headers and page numbers.`

const TOPIC_GUIDE = `Topics (pick the one the item really tests):
- word-form: four forms of one word family; the position decides (noun, verb, adjective, adverb)
- tense-voice: verb tense, or active vs passive
- subject-verb-agreement: singular vs plural verb for the subject
- prepositions: choosing a preposition (in, on, at, by, for, during, within…)
- conj-vs-prep: conjunction vs preposition of similar meaning (although / despite, because / because of), paired conjunctions
- pronouns: personal, possessive, reflexive and indefinite pronouns
- relative-clauses: who, which, that, whose, whom, where
- reduced-clauses: V-ing or V3 phrases that replace a clause
- conditionals: if, unless, provided that, mixed conditionals
- inversion: inverted order (Should you…, Never have…, Only after…)
- comparatives: comparative and superlative forms, as … as
- gerund-infinitive: V-ing vs to V after a verb or preposition; causatives (have / make / let / get someone do)
- collocations: fixed word partnerships (meet a deadline, place an order)
- word-choice: the choices are the same part of speech with different meanings; context decides
- determiners: articles and quantifiers (each, every, all, most, few, little, another, other)
- modals: can, must, should, may, might; modal + have V3
- noun-clauses: that, what, whether / if, or wh-word clauses used as subject or object`

export function solvePrompt(items: { index: number; stem: string; choices: string[] }[]): Prompt {
  const system = `You are an expert TOEIC teacher for Thai learners. Each numbered item is a TOEIC Part 5 practice question printed in a Thai prep book; no answer key is available.
For each item return:
- "answer": the 0-based index of the one correct choice.
- "topic": the single grammar point it tests, from the list below.
- "difficulty": 1–5 on the scale below.
${EXPLAIN_FIELD_RULES}
- Never refer to a choice by letter or position ("A", "the first option"); the app shuffles choices. Name the words themselves.
- The English explanation must mention the correct choice.
- "problem": "" if the item is sound. Otherwise a short reason: no correct choice, more than one correct choice, garbled text, a typo that changes the answer, or not a Part 5 question. Still give your best answer.
${TOPIC_GUIDE}
${DIFFICULTY_GUIDE}`
  return { system, user: JSON.stringify(items, null, 2) }
}

export function blindPrompt(items: { index: number; stem: string; choices: string[] }[]): Prompt {
  const system = `Answer each TOEIC Part 5 question. Return the 0-based index of the one correct choice for each item index.
Set confident=false if more than one choice could be right, no choice is right, or the text is unclear.`
  return { system, user: JSON.stringify(items, null, 2) }
}
```

- [ ] **Step 6: `scripts/lib/import/build.ts`**

```ts
import { Part5Item, formatIssues, type Part5Topic } from '../../../src/shared/types'
import type { RawItem } from './normalize'
import type { BlindResult, SolveResult } from './prompts'

type Solved = SolveResult['items'][number]
type Blind = BlindResult['items'][number]

export interface Built {
  approved: Part5Item[]
  flagged: Part5Item[]
  errors: string[]
}

/** Next free private id per topic, continuing after every id ever used (approved, draft or rejected). */
export function makeNumberer(usedIds: string[]): (topic: Part5Topic) => string {
  const next = new Map<string, number>()
  for (const id of usedIds) {
    const m = /^p5x-([a-z-]+)-(\d{4})$/.exec(id)
    if (m) next.set(m[1], Math.max(next.get(m[1]) ?? 1, Number(m[2]) + 1))
  }
  return (topic) => {
    const n = next.get(topic) ?? 1
    next.set(topic, n + 1)
    return `p5x-${topic}-${String(n).padStart(4, '0')}`
  }
}

/** Why an item needs a human look, or null when the solver and the blind re-check agree. */
export function verdictFlag(raw: RawItem, solved: Solved, blind: Blind | undefined): string | null {
  if (solved.problem.trim()) return `solver: ${solved.problem.trim()}`
  if (!blind) return 'not re-checked'
  if (blind.answer !== solved.answer) {
    const name = (i: number) => raw.choices[i] ?? `#${i}`
    return `re-check chose "${name(blind.answer)}", solver chose "${name(solved.answer)}"`
  }
  if (!blind.confident) return 're-check not confident'
  return null
}

export function buildItems(
  batch: RawItem[],
  solved: Solved[],
  blind: Blind[],
  nextId: (topic: Part5Topic) => string
): Built {
  const out: Built = { approved: [], flagged: [], errors: [] }
  batch.forEach((raw, i) => {
    const s = solved.find((x) => x.index === i)
    if (!s) {
      out.errors.push(`no solution for "${raw.stem}"`)
      return
    }
    const flag = verdictFlag(raw, s, blind.find((x) => x.index === i))
    const r = Part5Item.safeParse({
      id: nextId(s.topic),
      part: 5,
      topic: s.topic,
      difficulty: Math.min(5, Math.max(1, s.difficulty)),
      stem: raw.stem,
      choices: raw.choices,
      answer: s.answer,
      trap: s.trap,
      explain: { en: s.explain_en, th: s.explain_th },
      source: raw.source,
      status: flag ? 'draft' : 'approved',
      ...(flag ? { flag } : {})
    })
    if (!r.success) {
      out.errors.push(`"${raw.stem}": ${formatIssues(r.error)}`)
      return
    }
    ;(flag ? out.flagged : out.approved).push(r.data)
  })
  return out
}
```

- [ ] **Step 7: `scripts/lib/import/store.ts`**

```ts
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { writeJsonAtomic } from '../../../src/main/jsonFile'
import type { Built } from './build'

export function appendItems(path: string, items: unknown[]): void {
  if (items.length === 0) return
  const prev = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as unknown[]) : []
  writeJsonAtomic(path, [...prev, ...items])
}

/** Approved items go to their topic file in the private pack; flagged ones to this run's draft file. */
export function writeBuilt(outRoot: string, built: Built, draftFile: string): void {
  const byTopic = new Map<string, unknown[]>()
  for (const item of built.approved) byTopic.set(item.topic, [...(byTopic.get(item.topic) ?? []), item])
  for (const [topic, items] of byTopic) appendItems(join(outRoot, 'grammar', 'part5', `${topic}.json`), items)
  appendItems(join(outRoot, 'drafts', draftFile), built.flagged)
}

/** dedupeKey → id of every item ever written, so reruns skip them even after a draft is rejected. */
export function readLedger(path: string): Record<string, string> {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>) : {}
}

export function saveLedger(path: string, ledger: Record<string, string>): void {
  writeJsonAtomic(path, ledger)
}
```

- [ ] **Step 8: Verify**

Run: `npx vitest run tests/unit/import-build.test.ts tests/unit/gen.test.ts && npm run typecheck`
Expected: PASS. If typecheck rejects `Anthropic.MessageParam['content']` or the `effort` literal type, use the type name the compiler error suggests (the SDK exports it); do not loosen to `any`.

- [ ] **Step 9: Commit**

```bash
git add scripts/lib/claude.ts scripts/lib/gen.ts scripts/lib/import/prompts.ts scripts/lib/import/build.ts scripts/lib/import/store.ts tests/unit/import-build.test.ts
git commit -m "feat: import prompts, blind re-check and private item building

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: The `npm run import` command

**Files:**
- Create: `scripts/import.ts`
- Modify: `package.json` (`"import": "tsx scripts/import.ts"`)

**Interfaces:**
- Consumes: everything in `scripts/lib/import/*` (Tasks 8–10), `privateContentRoot` (Task 4), `ask` (Task 10).

- [ ] **Step 1: Write `scripts/import.ts`**

```ts
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { privateContentRoot } from '../src/main/privateRoot'
import { ask } from './lib/claude'
import { chunk, pageNumbers, parsePages } from './lib/import/args'
import { buildItems, makeNumberer } from './lib/import/build'
import { cached, hashOf, pool } from './lib/import/cache'
import { cleanItem, dedupe, dedupeKey, problemOf, type ExtractedItem } from './lib/import/normalize'
import { findPdftotext, forgetPdf, pageCount, pageText, singlePagePdf } from './lib/import/pdf'
import { BlindResult, ExtractResult, SolveResult, blindPrompt, extractSystem, solvePrompt } from './lib/import/prompts'
import { readLedger, saveLedger, writeBuilt } from './lib/import/store'

const SOURCE_DIR = 'toeic_source'
const WORK = 'content-private-work'
// Scanned simulation books and the garbled-Thai booklet need OCR (a later sub-project).
const SKIP = /^(sim|toeic-korea)/i
const BATCH = 10
const MIN_TEXT = 40

const USAGE = `Usage:
  npm run import -- [--file UNIT_1.pdf [--pages 3-10]] [--dry-run] [--concurrency 4] [--out <folder>]

Reads ${SOURCE_DIR}/*.pdf, extracts Part 5 questions, has Claude answer, explain and re-check them,
and writes them to your private pack (default %APPDATA%\\toeic-trainer\\private-content).
Agreed items are approved; the rest wait in Content review (npm run dev → Content review).
Finished work is cached in ${WORK}/, so a rerun only pays for what is new.
Needs ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") or an \`ant auth login\` profile.`

class UsageError extends Error {}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e))
const pageKey = (file: string, page: number) => `${file}/p${String(page).padStart(4, '0')}`

interface PageResult {
  file: string
  page: number
  kind: 'part5' | 'other'
  items: ExtractedItem[]
  broken: { item: ExtractedItem; problem: string }[]
}

async function extractPage(bin: string, dir: string, file: string, page: number): Promise<PageResult> {
  const path = join(dir, file)
  const text = pageText(bin, path, page)
  const fromText =
    text.trim().length < MIN_TEXT
      ? null
      : await cached(join(WORK, 'extract'), pageKey(file, page), () =>
          ask(ExtractResult, extractSystem, text, { effort: 'medium' })
        )
  const bad = (r: ExtractResult | null) =>
    r === null || (r.pageKind === 'part5' && (r.items.length === 0 || r.items.some((i) => problemOf(cleanItem(i)))))
  // Pages with little text (scans) or broken questions are read again from the page image.
  const res = bad(fromText)
    ? await cached(join(WORK, 'extract-vision'), pageKey(file, page), async () =>
        ask(
          ExtractResult,
          extractSystem,
          [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: await singlePagePdf(path, page) }
            },
            { type: 'text', text: 'Extract the Part 5 questions on this PDF page.' }
          ],
          { effort: 'medium' }
        )
      )
    : (fromText as ExtractResult)
  const items = res.pageKind === 'part5' ? res.items.map(cleanItem) : []
  return {
    file,
    page,
    kind: res.pageKind,
    items: items.filter((i) => !problemOf(i)),
    broken: items.flatMap((i) => {
      const problem = problemOf(i)
      return problem ? [{ item: i, problem }] : []
    })
  }
}

async function main(): Promise<void> {
  let values
  try {
    ;({ values } = parseArgs({
      options: {
        file: { type: 'string' },
        pages: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
        concurrency: { type: 'string', default: '4' },
        out: { type: 'string' },
        help: { type: 'boolean', default: false }
      }
    }))
  } catch (e) {
    throw new UsageError(message(e))
  }
  if (values.help) {
    console.log(USAGE)
    return
  }
  const concurrency = Number(values.concurrency)
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) {
    throw new UsageError('--concurrency must be an integer from 1 to 16')
  }
  if (values.pages && !values.file) throw new UsageError('--pages needs --file')
  let range: ReturnType<typeof parsePages>
  try {
    range = parsePages(values.pages)
  } catch (e) {
    throw new UsageError(message(e))
  }

  const bin = findPdftotext()
  const out = values.out ?? privateContentRoot(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'))
  let files = readdirSync(SOURCE_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort()
  if (values.file) {
    if (!files.includes(values.file)) throw new UsageError(`No ${values.file} in ${SOURCE_DIR}/`)
    files = [values.file]
  } else {
    const skipped = files.filter((f) => SKIP.test(f))
    if (skipped.length) console.log(`Skipping (need OCR): ${skipped.join(', ')}`)
    files = files.filter((f) => !SKIP.test(f))
  }

  // 1. Extract, file by file (big books are parsed once and then freed).
  const pages: PageResult[] = []
  for (const file of files) {
    const path = join(SOURCE_DIR, file)
    const count = await cached(join(WORK, 'pages'), file, () => pageCount(path))
    const nums = pageNumbers(count, range)
    if (values['dry-run']) {
      const chars = nums.reduce((n, p) => n + pageText(bin, path, p).trim().length, 0)
      const scans = nums.filter((p) => pageText(bin, path, p).trim().length < MIN_TEXT).length
      console.log(`${file}: ${nums.length} pages, ${chars} characters of text, ${scans} pages need the image read`)
      forgetPdf(path)
      continue
    }
    console.log(`${file}: reading ${nums.length} pages…`)
    const results = await pool(nums, concurrency, (p) =>
      extractPage(bin, SOURCE_DIR, file, p).catch((e) => {
        console.warn(`[extract failed] ${file} p.${p}: ${message(e)}`)
        return null
      })
    )
    pages.push(...results.filter((r): r is PageResult => r !== null))
    forgetPdf(path)
  }
  if (values['dry-run']) {
    console.log('\nDry run: no API calls made. Run without --dry-run to import.')
    return
  }
  mkdirSync(WORK, { recursive: true })
  writeFileSync(
    join(WORK, 'skipped-pages.json'),
    JSON.stringify(pages.filter((p) => p.kind === 'other').map((p) => ({ file: p.file, page: p.page })), null, 2)
  )
  const broken = pages.flatMap((p) => p.broken.map((b) => ({ file: p.file, page: p.page, ...b })))
  writeFileSync(join(WORK, 'broken.json'), JSON.stringify(broken, null, 2))

  // 2. Dedupe and drop anything written by an earlier run.
  const ledgerFile = join(WORK, 'ledger.json')
  const ledger = readLedger(ledgerFile)
  const raws = dedupe(pages).filter((r) => !(dedupeKey(r) in ledger))
  console.log(`\n${pages.reduce((n, p) => n + p.items.length, 0)} questions read, ${raws.length} new after removing duplicates.`)

  // 3–5. Solve, blind re-check, write.
  const nextId = makeNumberer(Object.values(ledger))
  const draftFile = `import-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const totals = { approved: 0, flagged: 0, invalid: 0, failed: 0 }
  const batches = chunk(raws, BATCH)
  await pool(batches, concurrency, async (batch, b) => {
    const key = hashOf(batch.map(dedupeKey))
    const view = batch.map((r, index) => ({ index, stem: r.stem, choices: r.choices }))
    try {
      const sp = solvePrompt(view)
      const solved = await cached(join(WORK, 'solve'), key, () => ask(SolveResult, sp.system, sp.user))
      const bp = blindPrompt(view)
      const blind = await cached(join(WORK, 'check'), key, () => ask(BlindResult, bp.system, bp.user))
      const built = buildItems(batch, solved.items, blind.items, nextId)
      for (const e of built.errors) console.warn('[invalid, skipped]', e)
      writeBuilt(out, built, draftFile)
      for (const item of [...built.approved, ...built.flagged]) ledger[dedupeKey(item)] = item.id
      saveLedger(ledgerFile, ledger)
      totals.approved += built.approved.length
      totals.flagged += built.flagged.length
      totals.invalid += built.errors.length
      console.log(`batch ${b + 1}/${batches.length}: ${built.approved.length} approved, ${built.flagged.length} flagged`)
    } catch (e) {
      totals.failed += batch.length
      console.warn(`[batch ${b + 1} failed, rerun to retry] ${message(e)}`)
    }
  })

  console.log(`\nDone. ${totals.approved} approved, ${totals.flagged} flagged for review, ${totals.invalid} invalid, ${totals.failed} failed.`)
  console.log(`Private pack: ${out}`)
  if (broken.length) console.log(`${broken.length} questions could not be read cleanly; see ${join(WORK, 'broken.json')}.`)
  if (totals.flagged) console.log('Review flagged items: npm run dev → Content review.')
}

main().catch((err: unknown) => {
  console.error(message(err))
  if (err instanceof UsageError) console.error(`\n${USAGE}`)
  else if (err instanceof Error && /authentication/i.test(err.message)) {
    console.error('\nNo Claude credentials found. Set ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") and run again.')
  }
  process.exit(1)
})
```

- [ ] **Step 2: npm script** — in `package.json` `scripts`, after `"gen"`:

```json
    "import": "tsx scripts/import.ts",
```

- [ ] **Step 3: Typecheck and usage**

Run: `npm run typecheck && npm run import -- --help && npm run import -- --pages 2`
Expected: typecheck clean; usage text prints; second command exits 1 with `--pages needs --file` and the usage.

- [ ] **Step 4: Dry run (no API calls)**

Run: `npm run import -- --dry-run`
Expected: one line per non-Sim PDF with page count, text size and image-read pages; ends with `Dry run: no API calls made.`

- [ ] **Step 5: Commit**

```bash
git add scripts/import.ts package.json
git commit -m "feat: add npm run import for the private question pack

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: First real run on one file — ASK THE USER FIRST (spends API credit)**

Ask the user to approve, then run: `npm run import -- --file UNIT_1.pdf`
Expected: about 30–40 questions read; most approved, a few flagged; summary prints the private pack path. Then `npm run dev`, open Topic drills: new questions appear (counts go up), answering one shows `From: UNIT_1.pdf p.N #M`; Content review lists flagged items tagged "private pack". Rerun the same command: it should report `0 new after removing duplicates` and make no API calls. Report results to the user before importing the remaining files.

---

### Task 12: Style-guided generator (`npm run gen -- --style private`)

**Files:**
- Modify: `scripts/lib/gen.ts` (`part5Prompt`, new `overlapScore`, `guardOverlap`, `spreadPick`)
- Modify: `scripts/generate.ts`
- Test: `tests/unit/gen.test.ts`

**Interfaces:**
- Consumes: private pack via `loadContent(privateRoot)` (Task 4), `privateContentRoot` (Task 4).
- Produces: `overlapScore(a: string, b: string): number` (word-trigram Jaccard, 0–1); `guardOverlap<T extends { stem: string; flag?: string }>(items: T[], refs: { id: string; stem: string }[]): { kept: T[]; dropped: string[] }` (≥ 0.5 dropped, ≥ 0.3 flagged `similar to <id>`); `spreadPick<T extends { difficulty: number }>(items: T[], n: number): T[]`; `part5Prompt(topic, count, difficulty, examples, avoidStems, styleOnly = false)`.

- [ ] **Step 1: Write failing tests** — append to `tests/unit/gen.test.ts` (add `guardOverlap, overlapScore, spreadPick` to the import from `../../scripts/lib/gen`):

```ts
describe('overlapScore', () => {
  it('is 1 for the same sentence and 0 for unrelated ones', () => {
    expect(overlapScore('The report was ____ written by the team.', 'the report was ____ written by the team')).toBe(1)
    expect(overlapScore('The report was ____ written.', 'Guests may park behind the hotel.')).toBe(0)
  })
  it('is partial for a reworded sentence', () => {
    const s = overlapScore('All staff must ____ the safety form by Friday.', 'All staff must ____ the expense form by Monday.')
    expect(s).toBeGreaterThan(0)
    expect(s).toBeLessThan(0.5)
  })
})

describe('guardOverlap', () => {
  const refs = [{ id: 'p5x-modals-0001', stem: 'All guests must ____ their badges at the main entrance.' }]
  it('drops near copies, flags close ones, keeps new ones', () => {
    const items = [
      makePart5({ stem: 'All guests must ____ their badges at the main entrance.' }),
      makePart5({ stem: 'All guests must ____ their badges at all times.' }),
      makePart5({ stem: 'Drivers should ____ the loading area clear at all times.' })
    ]
    const { kept, dropped } = guardOverlap(items, refs)
    expect(dropped).toHaveLength(1)
    expect(kept.map((i) => i.flag)).toEqual(['similar to p5x-modals-0001', undefined])
  })
})

describe('spreadPick', () => {
  it('picks across the difficulty range', () => {
    const xs = [5, 1, 4, 2, 3, 1, 5, 2].map((d) => makePart5({ difficulty: d }))
    expect(spreadPick(xs, 4).map((i) => i.difficulty)).toEqual([1, 2, 3, 5])
    expect(spreadPick(xs.slice(0, 2), 4)).toHaveLength(2)
  })
})

describe('part5Prompt with styleOnly', () => {
  it('tells Claude to copy only the style of the examples', () => {
    const p = part5Prompt('modals', 5, 3, [makePart5()], [], true)
    expect(p.user).toMatch(/only as a model/)
    expect(p.user).toMatch(/Never reuse/)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/unit/gen.test.ts`
Expected: FAIL — `overlapScore` not exported.

- [ ] **Step 3: Implement in `scripts/lib/gen.ts`** — add:

```ts
const trigrams = (s: string): Set<string> => {
  const w = s
    .toLowerCase()
    .replace(/____/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
  const out = new Set<string>()
  for (let i = 0; i + 2 < w.length; i++) out.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`)
  return out
}

/** Word-trigram Jaccard similarity of two stems, 0–1. */
export function overlapScore(a: string, b: string): number {
  const x = trigrams(a)
  const y = trigrams(b)
  if (x.size === 0 || y.size === 0) return 0
  let both = 0
  for (const t of x) if (y.has(t)) both++
  return both / (x.size + y.size - both)
}

const DROP_AT = 0.5
const FLAG_AT = 0.3

/** Keeps generated items from echoing the user's private (copyrighted) questions. */
export function guardOverlap<T extends { stem: string; flag?: string }>(
  items: T[],
  refs: { id: string; stem: string }[]
): { kept: T[]; dropped: string[] } {
  const kept: T[] = []
  const dropped: string[] = []
  for (const item of items) {
    let best = { id: '', score: 0 }
    for (const r of refs) {
      const score = overlapScore(item.stem, r.stem)
      if (score > best.score) best = { id: r.id, score }
    }
    if (best.score >= DROP_AT) dropped.push(`"${item.stem}" ≈ ${best.id}`)
    else if (best.score >= FLAG_AT) {
      const note = `similar to ${best.id}`
      kept.push({ ...item, flag: item.flag ? `${item.flag}; ${note}` : note })
    } else kept.push(item)
  }
  return { kept, dropped }
}

/** Up to n items spread from easiest to hardest. */
export function spreadPick<T extends { difficulty: number }>(items: T[], n: number): T[] {
  const sorted = [...items].sort((a, b) => a.difficulty - b.difficulty)
  if (sorted.length <= n) return sorted
  return Array.from({ length: n }, (_, i) => sorted[Math.floor((i * sorted.length) / n)])
}
```

and change `part5Prompt`'s signature and example block:

```ts
export function part5Prompt(
  topic: Part5Topic,
  count: number,
  difficulty: number,
  examples: Part5Item[],
  avoidStems: string[],
  styleOnly = false
): Prompt {
```

```ts
  const exampleIntro = styleOnly
    ? `Use these examples only as a model of trap type, sentence length and difficulty. Write entirely new sentences, names, companies and situations. Never reuse a stem or any distinctive phrase from them:`
    : `Match the style and quality of these approved examples:`
  const user = `Write ${count} new Part 5 questions that test the grammar topic "${topic}" at difficulty ${difficulty}.

${exampleIntro}
${JSON.stringify(
  examples.map((e) => ({ stem: e.stem, choices: e.choices, answer: e.answer, trap: e.trap })),
  null,
  2
)}

Do not reuse or closely paraphrase any of these existing stems:
${avoidStems.map((s) => `- ${s}`).join('\n') || '- (none)'}`
```

- [ ] **Step 4: Wire `scripts/generate.ts`**
  - imports: add `guardOverlap, spreadPick` to the `./lib/gen` import; add `import { homedir } from 'node:os'` and `import { privateContentRoot } from '../src/main/privateRoot'`.
  - `parseArgs` options: add `style: { type: 'string' }`.
  - after the difficulty check: `if (values.style !== undefined && values.style !== 'private') throw new UsageError('--style must be "private"')`.
  - `USAGE`: first line becomes `npm run gen -- --part 5 --topic <topic> [--count 10] [--difficulty 3] [--style private]` and add a line: `--style private: copy the trap style of your imported questions (npm run import) without copying their text.`
  - replace the start of the `if (values.part === '5') {` block up to the `for` loop with:

```ts
    const topic = Part5Topic.parse(values.topic)
    const existing = bank.part5.filter((i) => i.topic === topic)
    const styleOnly = values.style === 'private'
    const privateItems = styleOnly
      ? loadContent(privateContentRoot(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'))).bank.part5
      : []
    const privateOfTopic = privateItems.filter((i) => i.topic === topic)
    if (styleOnly && privateOfTopic.length === 0) {
      throw new UsageError(`No imported questions for "${topic}" yet. Run npm run import first.`)
    }
    const examples = styleOnly ? spreadPick(privateOfTopic, 6) : (existing.length > 0 ? existing : bank.part5).slice(0, 3)
```

  - in the batch loop, change the prompt call and save:

```ts
      const p = part5Prompt(topic, n, difficulty, examples, [...existing, ...generated].map((i) => i.stem).concat(draftStems), styleOnly)
      const { items, errors } = toPart5Drafts(await ask(GenPart5, p.system, p.user), topic, start)
      for (const e of errors) console.warn('[invalid, skipped]', e)
      const { kept, dropped } = guardOverlap(items, privateItems)
      for (const d of dropped) console.warn('[too close to an imported question, dropped]', d)
      start += items.length
      generated.push(...kept)
      save(`part5-${topic}-${stamp}-b${k}.json`, await selfCheck(kept))
```

- [ ] **Step 5: Verify**

Run: `npx vitest run tests/unit/gen.test.ts && npm run typecheck && npm test && npm run gen -- --part 5 --topic modals --style nope`
Expected: tests PASS; last command exits 1 with `--style must be "private"` and the usage.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/gen.ts scripts/generate.ts tests/unit/gen.test.ts
git commit -m "feat: generate original questions in the style of imported ones

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Docs

**Files:**
- Modify: `PRODUCT.md` (Capabilities and Constraints; Evidence on Hand)

- [ ] **Step 1: Update `PRODUCT.md`**
  - In "Built today", append: `Private question pack: \`npm run import\` turns Part 5 questions from the user's own TOEIC books (toeic_source/, never committed or shipped) into answered, explained items in %APPDATA%\toeic-trainer\private-content, loaded next to the bundled content; \`npm run gen -- --style private\` writes original questions in their style.`
  - In the topics constraint line, add `word-choice, determiners, modals, noun-clauses` to the Part 5 topic list and note `topics without questions are hidden`.
  - Replace the constraint `Content is AI-generated and human-reviewed; only \`status: "approved"\` items load.` with `Shipped content is AI-generated and human-reviewed; private-pack content is the user's own book questions, answered by Claude and auto-approved when a blind re-check agrees. Only \`status: "approved"\` items load.`

- [ ] **Step 2: Commit**

```bash
git add PRODUCT.md
git commit -m "docs: describe the private question pack

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
