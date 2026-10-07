# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Electron desktop app (Windows first). The renderer is a Vite + React + TypeScript web UI; there is no native OS design language to follow.

## Users

Thai adults preparing for TOEIC with a target of roughly 600–850+. A mixed audience: working professionals who need a score for a job or promotion, and university students facing graduation or job-hunt requirements. They study alone on their own Windows machine, in sessions that range from a short after-work drill to a longer weekend block.

Their job: get reliably faster and more accurate on TOEIC L&R Part 5 (incomplete sentences) and Part 6 (text completion), and later on S&W Writing Q1–8, by following an 8-week plan, drilling weak grammar topics and reviewing missed items until they stick.

A secondary, internal audience is the developer, who uses the dev-only Content Review screen to approve AI-generated questions before they ship.

## Product Purpose

A local study trainer that turns TOEIC grammar and writing practice into a daily routine: topic drills with instant explanations, timed mixed tests, spaced review of missed items, progress by topic, and (planned) AI feedback on writing.

Success means a learner can follow the whole 8-week plan inside the app, understands *why* each answer is right in their own language, and sees weak topics improve over time.

## Positioning

- **Thai-first explanations.** Every answer is explained in natural Thai by default, with an English toggle. Explanations and the planned "Thai-speaker common mistakes" guide are written for how Thai speakers actually go wrong in English, not translated from a generic bank.
- **Offline and private.** No account, no sign-in, no server. Questions ship with the app, progress lives in a local JSON file on the learner's machine, and everything except AI writing feedback works without internet. Writing feedback uses the learner's own Claude API key, stored encrypted on their machine.

## Operating Context

- Desktop window on Windows; keyboard and mouse.
- Core loop: Home ("Today") → topic drill (10 items, explanation after each answer) or mixed test (30 Part 5 items + 4 Part 6 passages, ~20s per Part 5 item pace target, explanations at end) → summary → spaced review of missed items (Leitner, boxes at 1/3/7/14/30 days) → progress dashboard (accuracy over last 20 attempts, average time, 3 weakest topics with "Drill this").
- Each item records the tested point ("trap") and time taken.
- Score estimates are always labelled "estimate — not an official score".

## Capabilities and Constraints

Built today (branch `plan1-foundation-grammar`): Home, Topic drills (Part 5), Mixed test (Part 5 + 6), Reading (Part 7) drills over single, double and triple passage sets with evidence highlighting, Reading test (Half: 50 questions / 38 min by default; Full: 100 questions / 75 min; free navigation, question map and flags; the clock pauses while the app is closed; resumable; per-part score plus an estimated band), Review queue, Progress, Settings (language), dev-only Content Review, question generation script with self-check.

Planned (spec `docs/superpowers/specs/2026-10-05-toeic-grammar-writing-design.md`): writing module (picture sentence, email reply, opinion essay) with timers, autosaved drafts and inline Thai error highlights; API key settings; 8-week study guide with a Today card; phrase bank and templates; Windows NSIS installer.

Constraints:

- Renderer has no Node or network access; all side effects go through the typed `window.api` bridge.
- UI language defaults to Thai (`th`), English (`en`) available. Every UI string exists in both; Thai text must render well (Thai script line height, tone marks, no clipped glyphs).
- Content is AI-generated and human-reviewed; only `status: "approved"` items load.
- Grammar topics: word-form, tense-voice, subject-verb-agreement, prepositions, conj-vs-prep, pronouns, relative-clauses, reduced-clauses, conditionals, inversion, comparatives, gerund-infinitive, collocations; Part 6 adds sentence-insertion and transitions.
- Out of scope for v1: accounts/sync, Listening, Speaking, mobile, live in-app question generation, official score guarantees.

## Brand Commitments

- Name in UI: "TOEIC Trainer". No logo exists yet.
- **Binding visual reference (whole app):** the user supplied `Screenshot 2026-10-06 095846.png` (repo root), a risograph print-studio website ("Inkwell Press"), and made it the committed visual direction for the full app redesign. Interpretation and adaptation to a study tool belong to the design phase, not here. "Inkwell Press" is the reference's own brand; do not reuse its name, logo, or copy.
- **Binding Thai fonts (user-chosen 2026-10-06):** Kanit (heavy weights) for display/headlines and Anuphan (variable) for UI text and explanations. Both are open-licence (OFL) and must be bundled with the app (`@fontsource/kanit`, `@fontsource-variable/anuphan`), never loaded from a CDN, so the app stays fully offline.

## Evidence on Hand

- Approved content: 130 Part 5 items (10 per topic), 16 Part 6 passages, and 30 Part 7 sets (20 single, 4 double, 6 triple passage). All of it is AI-written and AI-verified, pending a human spot-check via `docs/content-review/answer-sheet.md`.
- No testimonials, user counts, score-improvement data, or partner logos exist. Do not invent learner results, success rates, or official TOEIC/ETS endorsement.

## Product Principles

1. **Explain the why, in Thai.** Correctness feedback is never just right/wrong; the tested point and a clear Thai explanation come with it.
2. **The learner's data is theirs.** Nothing leaves the machine except the writing text sent with the learner's own key; no feature may require an account.
3. **Daily habit over cramming.** Surfaces should make today's next step obvious and small: due reviews, the weakest topic, the next drill.
4. **Honest scoring.** Estimates are always labelled as estimates; no inflated or official-sounding scores.
5. **Never lose work.** Progress and drafts survive errors, failed saves, and failed API calls.

## Accessibility & Inclusion

- Thai and English must both be first-class: Thai script needs generous line height and fonts with full Thai coverage (current stack includes Leelawadee UI and Noto Sans Thai).
- Right/wrong feedback must not rely on color alone (learners include color-blind users); timed pace warnings need a non-color cue.
- Full keyboard operation for answering questions during timed tests.
