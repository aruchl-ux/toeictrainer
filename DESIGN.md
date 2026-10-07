---
name: TOEIC Trainer
description: A Thai-first TOEIC grammar trainer printed as a risograph poster studio, with four inks on cream stock.
colors:
  paper: "#f3ead7"
  paper-lift: "#f8f2e5"
  paper-deep: "#eadfc6"
  rule-soft: "#d8c9ab"
  ink: "#1c2559"
  ink-soft: "#4a4f7a"
  blue: "#2340b0"
  pink: "#ea4580"
  pink-ink: "#c42563"
  pink-wash: "#f8d3df"
  yellow: "#f6c433"
  violet: "#7457ae"
typography:
  display-poster:
    fontFamily: "Kanit, Anuphan Variable, Leelawadee UI, sans-serif"
    fontSize: "clamp(56px, 6.2vw, 96px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  display-score:
    fontFamily: "Kanit, Anuphan Variable, Leelawadee UI, sans-serif"
    fontSize: "clamp(56px, 6.2vw, 96px)"
    fontWeight: 800
    lineHeight: 1.1
    fontFeature: "tnum"
  headline:
    fontFamily: "Kanit, Anuphan Variable, Leelawadee UI, sans-serif"
    fontSize: "60px"
    fontWeight: 800
    lineHeight: 1.15
  title:
    fontFamily: "Kanit, Anuphan Variable, Leelawadee UI, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
  subtitle:
    fontFamily: "Kanit, Anuphan Variable, Leelawadee UI, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.4
  stem:
    fontFamily: "Anuphan Variable, Leelawadee UI, Noto Sans Thai, Segoe UI, sans-serif"
    fontSize: "25px"
    fontWeight: 500
    lineHeight: 1.55
  choice:
    fontFamily: "Anuphan Variable, Leelawadee UI, Noto Sans Thai, Segoe UI, sans-serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.3
  lead:
    fontFamily: "Anuphan Variable, Leelawadee UI, Noto Sans Thai, Segoe UI, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Anuphan Variable, Leelawadee UI, Noto Sans Thai, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  explain:
    fontFamily: "Anuphan Variable, Leelawadee UI, Noto Sans Thai, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Anuphan Variable, Leelawadee UI, Noto Sans Thai, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.3
  button-display:
    fontFamily: "Kanit, Anuphan Variable, Leelawadee UI, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.25
  timer:
    fontFamily: "Kanit, Anuphan Variable, Leelawadee UI, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  meta:
    fontFamily: "Anuphan Variable, Leelawadee UI, Noto Sans Thai, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  none: "0"
  dot: "50%"
spacing:
  hair: "4px"
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "30px"
  page: "44px"
components:
  button-primary:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    typography: "{typography.button-display}"
    rounded: "{rounded.none}"
    padding: "13px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "10px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.yellow}"
  text-link:
    backgroundColor: "transparent"
    textColor: "{colors.pink-ink}"
    typography: "{typography.label}"
    padding: "0 0 3px"
  text-link-hover:
    textColor: "{colors.blue}"
  topic-tile:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
    rounded: "{rounded.none}"
    padding: "14px"
    height: "138px"
  topic-tile-hover:
    backgroundColor: "{colors.yellow}"
  choice:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
    typography: "{typography.choice}"
    rounded: "{rounded.none}"
    padding: "10px 16px 10px 12px"
    height: "58px"
  choice-correct:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
  choice-wrong:
    backgroundColor: "{colors.pink-wash}"
    textColor: "{colors.ink}"
  choice-letter:
    textColor: "{colors.blue}"
    rounded: "{rounded.dot}"
    size: "34px"
  question-sheet:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.ink}"
    typography: "{typography.stem}"
    rounded: "{rounded.none}"
    padding: "26px 32px"
  explain-slip:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.explain}"
    rounded: "{rounded.none}"
    padding: "18px 22px 16px"
  stamp:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    padding: "2px 10px"
  frame:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "18px 20px 0"
  ink-panel:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "24px 26px"
  rail:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.blue}"
    width: "232px"
    padding: "26px 22px 22px 26px"
  doc-tab:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.blue}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  doc-tab-active:
    backgroundColor: "{colors.paper-lift}"
    textColor: "{colors.blue}"
  evidence-mark:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    padding: "0 2px"
  insert-marker:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0 4px"
  type-chip:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  type-chip-on:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
  set-row:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
    rounded: "{rounded.none}"
    padding: "12px 4px"
  set-row-hover:
    backgroundColor: "{colors.yellow}"
  qmap-cell:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    width: "30px"
    height: "24px"
  qmap-cell-answered:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.paper}"
  test-timer:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
  test-timer-warn:
    textColor: "{colors.pink-ink}"
  test-timer-urgent:
    backgroundColor: "{colors.pink-ink}"
    textColor: "{colors.paper}"
    padding: "4px 8px"
  confirm-bar:
    backgroundColor: "{colors.pink-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
  part-scores:
    backgroundColor: "transparent"
    textColor: "{colors.blue}"
---

# Design System: TOEIC Trainer

> Scope: this system governs the trainer renderer (src/renderer/src). The Office view (src/renderer/office) is a separate, dark-first system documented in [DESIGN.office.md](DESIGN.office.md) with its sidecar .impeccable/design.office.json; neither system's rules apply to the other.

## Overview

**Creative North Star: "The Riso Poster Studio"**

The app is a print studio's poster wall turned into a study desk. Everything sits on cream paper stock with visible grain, printed in four risograph inks: fluorescent pink, medium blue, yellow, and the violet that appears where pink overprints blue. Shapes are flat geometric ink (circle, square, triangle, half-disc) composited with multiply, run through a grain filter, and allowed to sit slightly off-register. Frames are 1.5px hairlines with square corners. Kanit, heavy, carries display; Anuphan carries everything read.

The world has two volumes. Home, Topics, Progress, the mixed-test intro and results pages are posters: a giant two-ink headline naming today's next step, overprinted shapes behind it, a framed tile grid of topic marks, yellow ink panels. While a question is live, the poster steps back. Paper, ink and type stay, but the sentence and its four choices own the page, the rail recedes, and color appears only to carry state (yellow for "now", blue for right, hatched pink for wrong) and the yellow explanation slip.

It is paper-only by user decision; there is no dark theme. It refuses the white-card study dashboard with progress rings, drop shadows and rounded cards.

**Key Characteristics:**
- Cream grained stock under everything; a fixed multiply grain layer covers the whole window.
- Four inks only, overprinting with multiply; violet is an overprint result, never a paint.
- 1.5px hairline frames, squared corners; the only circles are ink shapes, answer-letter rings, radio dots and result marks.
- Kanit 800 posters and Anuphan text, both bundled offline.
- Misregistration is earned: an offset pink plate on display lines and an offset blue plate under the primary button, nowhere else.
- Right and wrong always pair color with a shape, icon, label, hatch or strikethrough.

## Colors

A restricted riso ink set on warm cream stock: two hot inks that do the talking, one yellow that marks "now" and "the why", and dark blue-black ink for reading.

### Primary
- **Fluoro Pink** (pink): the hot ink. First line of poster headlines, the primary button plate, rail and section rules, topic tile frames, the misregistration shadow on display type, ink shapes. Only used as text at display size (its contrast on paper is too low for small text).
- **Plate Blue** (blue): the structural ink. Second poster line, every h1–h3, nav links, blue frames and table rules, the primary button's off-register under-plate, correct answers, done ticks, accuracy bars, focus rings, the stamp; in reading, document-tab frames, insertion markers, the selected type chip, answered question-map cells and the test timer.

### Secondary
- **Riso Yellow** (yellow): the "now" ink. Hover fill for buttons, tiles and panel feet; the current tick and current blank; the explanation slip; the mixed-test and band panels; text selection; the evidence highlight in Part 7 passages and the fill of the current (unanswered) question-map cell.
- **Overprint Violet** (violet): the color pink and blue produce where they overlap under multiply. Recorded so it can be recognized and matched, not painted; no surface or text is filled with it.

### Tertiary
- **Deep Pink Ink** (pink-ink): pink that is legible at text size. Text links, active nav item, error text, wrong-answer borders, letters and strikethrough, hatched wrong ticks, slow pace warning, caret, the flag bar on question-map cells, and the test timer under five minutes (as text) and under one minute (as a solid block with paper text).
- **Pink Wash** (pink-wash): the background of a wrong choice, the save-error strip and the submit-confirm bar. Always paired with a pink-ink border.

### Neutral
- **Cream Stock** (paper): the page and the rail. The only ground.
- **Lifted Stock** (paper-lift): question sheet, answer choices, table row hover, radio fill. A slightly brighter sheet laid on the stock.
- **Shadowed Stock** (paper-deep): unfilled bar tracks, the scrollbar track and inactive document tabs.
- **Soft Rule** (rule-soft): secondary 1px dividers in dense lists and tables (including Part 7 set rows), dimmed choice borders.
- **Reading Ink** (ink): body text, button borders and labels.
- **Faded Ink** (ink-soft): leads, meta, counts, legend, dimmed choices, receded nav (6.5:1 on paper).

### Named Rules
**The Four Inks Rule.** Pink, blue, yellow on cream, plus ink for reading. Nothing else: no greens for correct, no reds for wrong, no grays. A new color is a new ink and needs a user decision.

**The Overprint Rule.** Ink shapes use `mix-blend-mode: multiply` and the grain filter, so overlaps make violet and dark tones on their own. Never fake an overlap with a flat violet fill.

**The Small Pink Rule.** Pink as text appears only at display size. Anything at body or label size uses pink-ink.

**The Second Cue Rule.** Every state ink carries a non-color cue beside it: right a check and label, wrong a cross, hatch or strikethrough, a flagged question a 4px inset bar along its foot, the current question a 2px ink ring, a timer warning a line of text, the active document tab heavier type on lifted paper. A state readable only by its hue is unfinished.

## Typography

**Display Font:** Kanit 600–800 (Thai + Latin subsets only) (with Anuphan Variable, Leelawadee UI)
**Body Font:** Anuphan Variable (with Leelawadee UI, Noto Sans Thai, Segoe UI)

**Character:** Kanit at 800 is a blunt, poster-weight Thai-and-Latin face that holds up when printed huge in two inks; Anuphan is a calm, open text face with full Thai coverage for stems, choices and explanations. Both are binding user choices, bundled with the app via `@fontsource/kanit` and `@fontsource-variable/anuphan`, never loaded from a CDN.

### Hierarchy
- **Display poster** (Kanit 800, clamp(56px, 6.2vw, 96px), 1.12; EN uppercase at 0.98): the Home and mixed-test headline, two lines, pink then blue, with the riso-text grain filter.
- **Display score** (Kanit 800, same size as the poster, 1.1, tabular figures): the result score on summary posters.
- **Headline** (Kanit 800, 60px, 1.15; 44px under 900px): page titles on Topics, Progress, Settings.
- **Title** (Kanit 700, 30px, 1.15–1.25): quiz topic title, mixed-test panel, band panel.
- **Subtitle** (Kanit 600, 22px, 1.3–1.5): empty-state lines, language labels, field legends, "no band yet".
- **Stem** (Anuphan 500, 25px, 1.55): the question sentence. The largest reading text in the app.
- **Prompt** (19px): answer choices and Part 7 prompts in Anuphan 500–600; the primary button in Kanit 600.
- **Lead** (Anuphan 400 / Kanit 600, 20px, 1.4–1.6): poster and page leads, max 28–40em.
- **Body** (Anuphan 400, 16px, 1.65): default.
- **Reading** (Anuphan 400, 17px, 1.75; Thai 1.85, max 70ch): explanation slips, Part 6/7 passages, review stems.
- **Label** (Anuphan 600–700, 15px, 1.3; EN uppercase drops to Meta 14px, 0.05–0.07em tracking): section headings inside frames, text links, panel feet, nav (600).
- **Timer** (Kanit 700, 26px, 1, tabular figures): the reading-test countdown, with a 14px Anuphan 600 cue line beneath when time is short.
- **Meta** (Anuphan 400–600, 14px — the floor: Thai tone marks blur below it): tile meta, keys hint, table heads, recent dates (Kanit 600 uppercase).

### Named Rules
**The Role Token Rule.** Every font size in the stylesheet is a `--type-*` role token on `:root` (poster, headline, title, timer, stem, subtitle, lead, prompt, reading, body, label, meta, plus the brand wordmark). No literal sizes; a new size means a new role, documented here first. Under 900px only `--type-headline` changes (44px).

**The Two Voices Rule.** Kanit is for things that are looked at (posters, titles, scores, the primary button, letters in answer rings); Anuphan is for things that are read. A stem, choice or explanation is never set in Kanit.

**The Thai Leading Rule.** Thai text gets at least 1.55 line height in reading roles and 1.85 in explanations; display lines stay at 1.1 or more in Thai so tone marks are never clipped. Only English uppercase display tightens below 1.

**The Tabular Figures Rule.** Every number that can change (scores, counts, accuracy, pace, dates in lists) uses tabular figures.

**The Language Case Rule.** Uppercase and tracking apply only under English (`[data-lang='en']`) to nav, labels, headlines and the primary button. Thai is never letterspaced. Names (topic tiles, set titles) keep their own case in both languages, so long English words never break mid-word.

## Layout

A fixed left rail (232px) and a content column (padding 32px 48px 64px). The rail stacks brand mark and wordmark, nav, a pink rule, the ink legend (right, wrong, now) and the review-due box pinned to its foot; it is sticky at full height.

Home is a two-column grid (1.3fr poster / 1fr side, gap 32px 40px; rows auto / 1fr so recent results sit right under the poster when the side column runs taller): poster headline with shapes bleeding behind its right edge, primary action row, recent results below; the side column holds the blue-framed topic tiles and the yellow mixed-test panel. Topic tiles run three across on Home and auto-fill at 196px minimum on Topics. Progress opens with a yellow band panel beside a pink-framed weak-topics list, then a stats table ranked by weight rather than size.

Quiz screens cap at 1080px. A Part 5 question is sheet, then a 2×2 choice grid, then the slip, then a foot row with the keys hint and Next; Part 6 places the passage sheet beside a single choice column. At 1366×768 a whole question fits without scrolling.

Part 7 reuses the Part 6 split (passage sheet 1.25fr beside a single choice column, gap 24px); the passage sheet scrolls an inner layer (max height 100vh minus 220px) while the sheet and its corner crosses stay fixed so the choices never leave the viewport, with document tabs across its top when a set has two or three texts. The reading start page is a headline, a wrapping row of type chips (weakest type first), then one group per format: a label-weight heading on a pink hairline with a random-pick text link at its right, then full-width set rows. The reading test pins a test bar to the top of the window: the timer in an auto column beside the question map (grouped by Part), ruled off below in blue; passages scroll inside the remaining height (100vh minus 340px). Test results lead with the title, part scores and band, then a next-steps row (Practice again, Drill weakest), then the review list.

**The Spacing Scale Rule.** Every gap, padding and margin is a `--space-*` token on one 4px scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Tight steps (4–12) group things that belong together; 16–24 pad panels and separate siblings (frames use `--frame-pad`, 20, and panel feet bleed by the same amount); 32–64 separate major regions. Only 1–2px optical offsets stay literal.

Responsive: at 1080px Home and Progress collapse to one column and Parts 6 and 7 stack; at 900px the rail becomes a top bar (brand row, wrapped nav, pink bottom rule; legend and due box hidden) and page titles drop to 44px; at 640px choices go single column, tiles go two across, and the recent bar hides.

**The Receding Rail Rule.** While a question is on screen, the brand, legend art and due box fade to 40% and non-active nav drops to ink-soft; hover or focus inside the rail restores it. Poster energy never competes with a live question.

## Elevation & Depth

There are no drop shadows and no blur. Depth is print depth: grained stock, sheets of lifted paper laid on it, and inks overprinting each other. Two offset devices exist, both literal misregistration of a second ink plate, both hard-edged and in-world.

### Shadow Vocabulary
- **Off-register blue plate** (a blue pseudo-layer translated 5px 5px under the pink button face; face nudges 2px on hover, lands on the plate at 5px on press): the primary button only.
- **Pink misregistration on display** (`text-shadow: -3px 2px 0 rgb(234 69 128 / 0.8)` on headlines; `-4px 3px 0 rgb(234 69 128 / 0.85)` on the blue poster line and display score): blue display type only.
- **Radio inset** (`box-shadow: inset 0 0 0 4px` paper-lift): the checked dot in language options.
- **Flag bar** (`box-shadow: inset 0 -4px 0` pink-ink): a solid ink bar printed along the foot of a flagged question-map cell. Inset and hard, it is a mark, not a lift.

### Named Rules
**The Earned Misregistration Rule.** An offset is a second ink plate printed slightly off, so it is always pink-under-blue or blue-under-pink, solid, and only on the primary button and display lines. It is never a gray or black shadow, never on cards, tiles, sheets or panels.

**The Grain Rule.** Paper grain sits over the whole window (fixed SVG noise, multiply, 0.55); ink artwork uses the riso-grain filter and display spans use the lighter riso-text filter. Flat untextured fills of large ink areas are off-world.

## Shapes

Square corners everywhere (radius 0). Containers are drawn, not filled: 1.5px hairlines in pink (rail rule, topic tiles, weak list, section rules) or blue (frames, sheets, recent rows, due box), with ink-filled panels (yellow) as the only solid containers. Dashed blue marks an "unprinted plate": a topic with no questions yet, its mark drawn as outline only, and the empty due box.

Circles are reserved for ink geometry (topic marks, poster and rest shapes, the app mark), answer-letter rings (34px), result marks (30–40px), the pace clock and radio dots. Question sheets carry pink registration crosses (18px) at two opposite corners. Each grammar topic owns a small fixed composition of two or three overprinted shapes so it is recognizable at a glance. Line icons (arrow, check, cross) are 2px square-cap, miter-join strokes at 20px.

## Components

### Buttons
Printed, flat, decisive.
- **Shape:** squared (0).
- **Primary:** Kanit 600 19px, ink text on a pink face over a blue plate offset 5px 5px; padding 13px 24px; EN uppercase 0.04em. Hover slides the face 2px toward the plate; press lands it on the plate. Focus ring sits 8px out. One per view.
- **Secondary:** transparent with a 1.5px ink border, Anuphan 600 16px, padding 10px 18px; hover fills yellow. Small variant 6px 12px at 14px.
- **Text link:** pink-ink label weight with a 1.5px bottom rule in currentColor and a trailing arrow that nudges 3px on hover; hover turns blue. Inside yellow panels it is blue, hovering to ink.

### Topic tiles
- 1.5px pink frame, squared, min 138px (186px on Topics), the topic mark top-left, name in blue label weight, meta pinned to the foot in ink-soft 14px.
- Hover fills yellow and tilts the mark (-2px, -3deg).
- Empty topic: dashed blue frame, outline-only mark, faded name, not interactive.

### Frames and ink panels
- **Frame:** 1.5px blue (or pink) hairline, padding 18px 20px, a label-weight heading in blue, optional full-bleed foot row with a blue top rule that fills yellow on hover.
- **Ink panel:** solid yellow, no border, padding 20–26px, Kanit title. Used for the mixed-test entry and the score band.

### Question sheet
Lifted paper (paper-lift) in a 1.5px blue frame, padding 26px 32px, pink registration crosses at top-left and bottom-right, stem at 25px. The quietest poster piece; nothing decorative inside it.

### Answer choices
- Lifted paper, 1.5px ink border, min height 58px, a 34px blue-ringed Kanit letter, then the text.
- **Selected:** solid blue, paper text.
- **Correct:** blue ink rolls in left to right (0.32s), paper text, a check icon and "Correct" label at the right.
- **Wrong:** pink-wash ground, pink-ink border and letter, text struck through 2px pink-ink, cross icon and label.
- **Dim (other options after reveal):** ink-soft text, rule-soft border.
- Keyboard: A–D or 1–4 answers, Enter goes next; the keys hint is printed in the foot.

### Explanation slip and stamp
Yellow slip, padding 18px 22px 16px, slips in 6px (0.24s). It opens with a blue stamp (Kanit 600 14px, paper text, rotated -2deg, stamps in from 1.5×) naming the tested point, then the explanation at 17px, then a blue link to switch language.

### Progress ticks and bars
Ticks are 9px hairline-framed cells: blue fill for done or right, pink-ink 45° hatch for wrong, yellow for now. Bars are 10px blue on a paper-deep track; low accuracy (under 60%) prints pink.

### Part 7 passage
The question sheet, scrolling, at 17px reading text with 1.85 leading.
- **Document tabs:** squared tabs in a 1.5px blue frame sitting on a blue baseline rule, 14px, padding 6px 12px. Inactive tabs are shadowed stock; the active tab is lifted paper, bold, and merges into the sheet. Revealing an answer switches to the tab that holds its evidence.
- **Evidence highlight:** after an answer is revealed, the quoted evidence is marked in solid yellow with ink text (2px side padding): the same yellow that carries "the why" on the slip.
- **Insertion marker:** the [1]–[4] positions for sentence-insertion questions print as small solid blue blocks with paper Kanit 700 14px numerals, padding 0 4px, squared.
- **Prompt:** the question line above the choices is Anuphan 600 19px, 1.5.

### Type chips and set list
- **Type chip:** a small secondary button (6px 12px, 14px) in a 1.5px blue border with blue text; the selected chip is solid blue with paper text. A chip with history appends its accuracy in tabular figures.
- **Set row:** a full-width borderless button with a 1px soft-rule divider below, padding 12px 4px; title in blue bold, meta (question count, question types) in ink-soft 14px. Hover fills yellow.

### Reading test bar
- **Timer:** Kanit 700 26px blue, tabular. Under five minutes it turns pink-ink and prints a cue line; under one minute it becomes a solid pink-ink block (padding 4px 8px) with paper text and the one-minute cue. Color never changes without the text.
- **Question map:** one group per Part, each headed by a small blue bold Part label, then wrapping 30×24px squared cells (gap 3px) with a 1.5px blue frame and the question number in 14px tabular figures. Answered cells are solid blue with paper numerals; flagged cells carry a 4px pink-ink inset bar along the foot; the current cell gets a 2px ink ring offset 1px (filled yellow while unanswered) and is marked as current for assistive tech. Every cell names its state (answered or unanswered, flagged) in its accessible label.
- **Foot:** Previous, Flag (a pressed toggle) and Next as secondary buttons, Submit as the view's primary button.

### Confirm bar
Submitting with unanswered questions swaps the Submit button for an inline bar in place: pink-wash ground, 1.5px pink-ink frame, padding 10px 14px, the unanswered count as text, then the primary confirm and a secondary cancel. It is announced as an alert; there is no modal.

### Test results
- **Part-score list:** an unbulleted wrapping row (gap 8px 24px) of per-Part scores and time used, Kanit 600 18px blue, tabular figures, above the yellow band panel.
- **Review evidence:** in the review list, Part 7 items quote their evidence on a lifted-paper strip (padding 4px 8px) at 15px.

### Resume panel
An in-progress test on the reading-test intro appears as a standard frame with a pink hairline, holding a label-weight title, the answered count and minutes left in tabular figures, and the resume and discard actions.

### Navigation (rail)
Blue Anuphan 600 15px links (EN uppercase 14px, 0.06em), 16px left inset. The active item turns pink-ink and an 8px pink square scales in at its left; hover underlines in pink. Below the nav sits a legend teaching the three state inks, then the due box (blue frame, yellow on hover) at the foot. Under 900px the rail becomes a wrapped top bar.

### Inputs
Language options are squared 1.5px ink-framed cards with a custom 22px radio (blue ring, blue dot inside a paper inset); the checked card fills yellow with a blue border.

## Do's and Don'ts

### Do:
- **Do** print on cream stock with the full-window grain layer; every new surface sits on paper or lifted paper.
- **Do** compose new artwork from flat circles, squares, triangles and half-discs in pink, blue and yellow, with multiply and the riso-grain filter.
- **Do** give every new grammar topic its own fixed two-or-three-shape mark.
- **Do** pair every right/wrong color with a check or cross icon, a text label, and for wrong a hatch or strikethrough.
- **Do** keep poster energy on Home, Topics, Progress and results, and let questions stay quiet with the rail receded.
- **Do** use tabular figures for every changing number and label every score estimate as an estimate.
- **Do** keep every interaction keyboard-operable and every focus ring 3px solid blue, offset 3px.
- **Do** give every state a shape or text cue beside its ink: a foot bar for flagged, a ring for current, a cue line for a timer warning.
- **Do** respect reduced motion: all animations and transitions switch off.

### Don't:
- **Don't** add a dark theme; the world is paper-only by user decision.
- **Don't** introduce a fifth ink, soft color-to-color gradients, grays, green-for-correct or red-for-wrong.
- **Don't** paint violet directly; it exists only where pink overprints blue.
- **Don't** round corners on containers or buttons, or use soft or gray drop shadows.
- **Don't** use the offset-plate device on anything but the primary button and display lines.
- **Don't** set stems, choices or explanations in Kanit, or load either font from a CDN.
- **Don't** set small text in pink; use pink-ink.
- **Don't** reuse the reference studio's name, logo or copy.
