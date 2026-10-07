---
name: TOEIC Trainer, Office view
description: The trainer's second renderer, scoped to src/renderer/office only, where study runs as a dim warm-graphite agent session with one periwinkle accent.
colors:
  bg: "#161615"
  side: "#111110"
  raise: "#1e1e1c"
  raise-2: "#282825"
  line: "#2b2a27"
  line-2: "#3b3a36"
  text: "#dad7cf"
  text-2: "#a9a69d"
  text-3: "#8a877f"
  accent: "#9da6e6"
  accent-wash: "rgb(157 166 230 / 0.14)"
  ok: "#8fbf96"
  ok-wash: "rgb(143 191 150 / 0.11)"
  bad: "#e39d86"
  bad-wash: "rgb(227 157 134 / 0.11)"
  warn: "#d9b36c"
  bg-light: "#f7f6f3"
  side-light: "#efeee9"
  raise-light: "#ffffff"
  raise-2-light: "#e9e8e2"
  line-light: "#e2e0d9"
  line-2-light: "#d1cec5"
  text-light: "#272622"
  text-2-light: "#57544d"
  text-3-light: "#6b6860"
  accent-light: "#4651b0"
  accent-wash-light: "rgb(70 81 176 / 0.1)"
  ok-light: "#2c7542"
  ok-wash-light: "rgb(44 117 66 / 0.09)"
  bad-light: "#ab452c"
  bad-wash-light: "rgb(171 69 44 / 0.08)"
  warn-light: "#85600f"
typography:
  heading:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Anuphan Variable, Leelawadee UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  stem:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Anuphan Variable, Leelawadee UI, system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.6
  explain:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Anuphan Variable, Leelawadee UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  option:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Anuphan Variable, Leelawadee UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Anuphan Variable, Leelawadee UI, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  chrome:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Anuphan Variable, Leelawadee UI, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Anuphan Variable, Leelawadee UI, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Segoe UI Variable Text, Segoe UI, Anuphan Variable, Leelawadee UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
  data:
    fontFamily: "Cascadia Mono, Cascadia Code, Consolas, Anuphan Variable, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1
    fontFeature: "tnum"
  command:
    fontFamily: "Cascadia Mono, Cascadia Code, Consolas, Anuphan Variable, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  mark: "3px"
  key: "5px"
  chip: "6px"
  row: "7px"
  control: "8px"
  note: "10px"
  menu: "12px"
  pill: "13px"
  field: "14px"
  round: "50%"
spacing:
  hair: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  row: "10px"
  lg: "14px"
  msg: "20px"
  indent: "28px"
  section: "30px"
components:
  button:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.text}"
    typography: "{typography.chrome}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "32px"
  button-hover:
    backgroundColor: "{colors.raise-2}"
  button-primary:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.accent}"
    typography: "{typography.chrome}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "32px"
  text-action:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.row}"
    padding: "0 8px"
    height: "28px"
  text-action-hover:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.text}"
  sidebar-row:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    typography: "{typography.chrome}"
    rounded: "{rounded.row}"
    padding: "0 8px"
    height: "28px"
  sidebar-row-on:
    backgroundColor: "{colors.raise-2}"
    textColor: "{colors.text}"
  option:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.option}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
  option-selected:
    backgroundColor: "{colors.accent-wash}"
  option-correct:
    backgroundColor: "{colors.ok-wash}"
    textColor: "{colors.ok}"
  option-wrong:
    backgroundColor: "{colors.bad-wash}"
    textColor: "{colors.bad}"
  keycap:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-2}"
    typography: "{typography.data}"
    rounded: "{rounded.key}"
    padding: "0 5px"
    height: "22px"
  user-bubble:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "7px 14px"
  composer:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "10px 10px 8px 14px"
  send:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.accent}"
    rounded: "{rounded.round}"
    size: "30px"
  status-chip:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.text-2}"
    rounded: "{rounded.chip}"
    padding: "0 8px"
    height: "24px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "26px"
  filter-chip-on:
    backgroundColor: "{colors.raise-2}"
    textColor: "{colors.text}"
  note:
    backgroundColor: "{colors.raise}"
    textColor: "{colors.text}"
    rounded: "{rounded.note}"
    padding: "10px 14px"
  doc-tab:
    backgroundColor: "transparent"
    textColor: "{colors.text-3}"
    padding: "0 14px"
    height: "44px"
  doc-tab-on:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
  evidence-line:
    backgroundColor: "{colors.ok-wash}"
    textColor: "{colors.text}"
  qmap-cell:
    backgroundColor: "transparent"
    textColor: "{colors.text-3}"
    rounded: "{rounded.chip}"
    width: "32px"
    height: "26px"
  qmap-cell-answered:
    backgroundColor: "{colors.raise-2}"
    textColor: "{colors.text}"
  badge:
    backgroundColor: "{colors.accent-wash}"
    textColor: "{colors.accent}"
    rounded: "9px"
    padding: "0 6px"
    height: "18px"
---

# Design System: TOEIC Trainer, Office view

Scope: `src/renderer/office` only (entry `src/renderer/office.html`, styles `src/renderer/office/office.css`). The trainer renderer (`src/renderer/src`) stays under the risograph system in `DESIGN.md`; no rule here applies there, and no riso rule (paper-only, four inks, square corners, no grays) applies here.

## Overview

**Creative North Star: "The Quiet Agent Session"**

The Office view is study disguised as everyday agent work. It borrows the layout language of a desktop coding agent: a thread sidebar, a breadcrumb bar, a centered transcript and a bottom composer. Every drill is a thread, each question arrives as the agent's task, the learner's answer is a short reply bubble, and the why comes back as a tool result hanging off the task under a 1px rule. Nothing in it looks like a quiz card or a study app.

The ground is warm graphite, dim enough not to glow at a desk, with text held near 85% luminance and never pure white. A single cool periwinkle is the only accent; muted sage and muted brick carry right and wrong, always beside an icon and a word. Density is desktop-app density: 13.5px chrome, 28px rows, hairline rules, unboxed prose in the transcript. A light theme mirrors every role on warm off-white for users who prefer it; dark is the default.

It never reuses another agent product's name, marks or starburst; it borrows only the topology.

**Key Characteristics:**
- Warm graphite ground with a darker sidebar and pane; depth by tone steps, not shadows.
- One periwinkle accent for focus, caret, current item, primary action and send.
- Sage and brick for right and wrong, each paired with a check or cross icon and a word.
- Segoe UI for chrome and reading, Anuphan for Thai, Cascadia Mono for data only.
- Transcript is unboxed prose in a 760px column; the composer, user bubbles, notes and the slash menu are the only bounded containers.
- Authored 16px stroke icons, one family.

## Colors

Warm, near-neutral graphites (or warm off-whites in light) with one cool accent and two muted state tints. Each token has a light-theme twin with the `-light` suffix; components name the dark (default) token and swap by role under `[data-theme='light']`.

### Primary
- **Periwinkle** (accent / accent-light): focus outline (2px, offset 2px), caret, the agent mark, the current question-map cell, the current Part 6 blank, the active document tab's underline, links, the selected option's keycap, checked radios, and the text and border of primary actions and send. Text selection is periwinkle at 34%.
- **Periwinkle Wash** (accent-wash / accent-wash-light): the fill behind primary buttons, send, the due-count badge, the selected option and the current blank.

### Secondary
- **Muted Sage** (ok / ok-light): correct verdicts and options, the `+` side of diff stats, evidence lines in the document pane (sign, line number, underline) and the evidence note.
- **Muted Brick** (bad / bad-light): wrong verdicts and options, the `−` side of diff stats, weak-topic meters, the save-error strip.
- **Sage Wash / Brick Wash** (ok-wash, bad-wash and their `-light` twins): the line tint under a correct or wrong option and under evidence lines.

### Tertiary
- **Ochre** (warn / warn-light): pending and pressed states only: the running-test pulse dot, a flagged cell's flag, a pressed Flag action, the slow and warning timer chips, composer notices.

### Neutral
- **Warm Graphite** (bg): the transcript ground and keycap face.
- **Sidebar Graphite** (side): the thread sidebar and the document pane, one step darker than the transcript.
- **Raised Graphite** (raise): hover fill for rows and actions, user bubbles, the composer, notes, status chips, buttons.
- **Selected Graphite** (raise-2): the open sidebar row, button hover, answered cells, meter tracks, the blank chip.
- **Hairline** (line): every 1px structural rule: sidebar edge, top bar, table rows, tabs.
- **Strong Hairline** (line-2): control borders, keycaps, the tool-result rule, crumb separators, scrollbar thumbs.
- **Primary Text** (text): reading text and current crumb (L ~88% in dark; never #fff).
- **Secondary Text** (text-2): sidebar rows, meta in messages, inactive controls.
- **Tertiary Text** (text-3): group labels, timestamps, line numbers, placeholders, dimmed options.

### Named Rules
**The Never-Brightest Rule.** Nothing on the dim screen is the brightest object. Primary actions and send are an accent tint (accent-wash fill, accent text, accent border mixed 45% into line-2), never a light or solid fill, and text stops at the `text` token.

**The One Accent Rule.** Periwinkle is the only hue that means "here" or "act". Sage, brick and ochre mean state, never decoration.

**The Icon-And-Word Rule.** Right and wrong always pair the color with a check or cross icon and the word (Correct / Wrong, ถูก / ผิด); wrong option text is also struck through. Diff stats carry `+` and `−` signs; a flagged cell carries a flag icon; a running test carries its count.

## Typography

**Chrome and reading font:** Segoe UI Variable Text (with Segoe UI, then Anuphan Variable, Leelawadee UI, system-ui)
**Thai font:** Anuphan Variable, bundled offline via `@fontsource-variable/anuphan`, reached through the stack for every Thai glyph.
**Data font:** Cascadia Mono (with Cascadia Code, Consolas, Anuphan Variable), the Windows system mono; not bundled.

**Character:** The stack is the operating system's own desktop voice, so the window reads as an ordinary work tool; Anuphan keeps Thai calm and open, and the mono marks the things a machine would print.

### Hierarchy
- **Heading** (600, 26px, 1.3, -0.01em, balanced, centered): the Home thread's next-step line only.
- **Stem** (400, 16.5px, 1.6, max 68ch): the task sentence; the largest reading text in a thread.
- **Option** (400, 15px): answer rows. The composer input is also 15px (16px on Home).
- **Explain** (400, 15px, 1.75; Thai 1.85; max 68ch): the explanation inside the tool result.
- **Body** (400, 14px, 1.5; Thai 1.6; message bodies 1.65): default. User bubbles 14.5px.
- **Chrome** (400, 13.5px): sidebar rows, buttons, folded task rows, tables, trap line. Text actions and crumbs 13px.
- **Meta** (400, 12.5px, text-3): message meta, row meta, system lines, pills, slash hints.
- **Label** (600, 12px, text-3, sentence case, no tracking): sidebar group names, in-message section headings, table heads.
- **Data** (Cascadia Mono, tabular figures): keycaps 12px (11px small), commands and blanks 13px, slash names 13px, gutter line numbers and diff stats 11.5px, tab kind 11px.

### Named Rules
**The Mono-Is-Data Rule.** Cascadia Mono sets only things a machine would print: numerals that change (counts, timers, accuracy, seconds), keycaps, IDs, slash commands, line numbers and diff stats. Prose, labels and Thai text are never mono.

**The Thai Leading Rule.** Under `lang='th'` body leading rises to 1.6 and explanations to 1.85 so tone marks never touch.

## Layout

A full-height flex shell: a 252px sidebar, then the stage. The stage stacks a 44px top bar (breadcrumbs left, status chips right) over the transcript and the composer dock. The transcript centers a 760px column (padding 26px 28px 40px); agent message bodies indent 28px under a 20px agent mark so tasks, options and results align on one edge. Messages separate by 20px; in-message sections open with a label 30px above. The composer dock pads 28px sides and 16px below and caps at the column width minus 56px. Home centers vertically at 680px.

When a Part 6 or 7 task is open, the thread becomes a two-column grid: transcript, then the document pane at clamp(320px, 45%, 660px) behind a 1px rule.

Below 1024px the sidebar becomes a fixed drawer over a 35% black scrim, the transcript pads 18px, message indents drop to 0, and the breadcrumbs keep only the workspace and the last crumb.

**The First-Viewport Sidebar Rule.** At 1366×768 the whole sidebar (Review and Status at the top, then Part 5, Reading and Tests) fits without scrolling. Part 5 folds to the open topic plus the weakest practised, four in all, with an "All N topics" row that expands the rest. Clipped rows fade under a 28px mask instead of cutting a glyph.

**The Unboxed Transcript Rule.** The transcript is prose on the ground. Tasks, verdicts and reports are not cards; only the user bubble, the composer, notes and the slash menu are bounded.

## Elevation & Depth

Flat by tone. Sidebar and pane sit one step darker than the transcript, raised surfaces one step lighter, all separated by 1px hairlines. One soft shadow exists, for the things that float over the transcript.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 10px 28px rgb(0 0 0 / 0.38), 0 1px 2px rgb(0 0 0 / 0.3)`; light `0 10px 28px rgb(40 36 28 / 0.1), 0 1px 2px rgb(40 36 28 / 0.08)`): the composer box and the slash-command menu only.
- **Drawer** (`0 16px 48px rgb(0 0 0 / 0.45)`): the sidebar drawer under 1024px.
- **Ring** (`inset 0 0 0 1px` accent): the current question-map cell's doubled border; `inset 0 0 0 4px` bg makes the radio dot.

### Named Rules
**The Float-Only Rule.** A shadow means "this floats above the thread". Rows, notes, bubbles, options and the pane never cast one.

## Shapes

Gently rounded controls, square structure. Rows and small actions are 7px, buttons, options and folded rows 8px, notes 10px, the slash menu 12px, the composer and user bubbles 14px; filter chips and pills are full pills (13px on 26px); keycaps 5px with a 2px bottom border; status chips and question cells 6px; send and dots are circles. Panes, the top bar, tables and the tool-result rule are square hairlines. Icons are one authored family: 16px viewBox, 1.4 stroke, round caps and joins, currentColor.

## Components

### Buttons and actions
Quiet, keyboard-first.
- **Button:** 32px tall, padding 0 12px, 1px line-2 border, raise fill, 8px radius, 13.5px; hover raise-2; disabled at 45% opacity. A pressed toggle turns its border and text ochre.
- **Primary:** periwinkle wash, periwinkle text, border accent mixed 45% into line-2; hover deepens the wash to 22%. Its keycap goes transparent with an accent border. At most one per message.
- **Text action:** borderless 28px, padding 0 8px, text-2, 7px radius, hover raise; a trailing small keycap names its shortcut. The Reading test's Previous, Flag, Next and Submit are text actions, not buttons; Submit trails its `/submit` command in mono.
- **Link:** periwinkle 13px, underline on hover at 3px offset (the explanation language toggle).

### Keycaps
22px (18px small) Cascadia Mono, 1px line-2 border with a 2px foot, bg face, 5px radius. Every option starts with one (A–D); shortcuts in the sidebar, toolbar and settings print as keycaps.

### Answer options
Borderless 8px rows (padding 6px 10px, gap 12px, 15px text) on a 2px stack; hover shows raise with a line border. Selected: accent wash and accent keycap, a quiet "your answer" at the right. Correct: sage wash, sage keycap, check icon and word. Wrong: brick wash, brick keycap, struck text, cross icon and word. Others dim to text-3 after the reveal.

### Tool result (verdict)
The current task's result renders expanded, hanging 14px off a 1px line-2 left rule: the verdict line (icon, bold word, the right answer if wrong, seconds in mono), the tested point as label plus bold trap, the explanation at 15px/1.75, then the language link. A fresh verdict shows a 320ms "checking…" shimmer, then clips in from the top over 420ms on the expo-out ease; reduced motion skips both. The explanation is the lesson and is never folded while its task is current.

### Folded task rows
Earlier tasks fold into one 13.5px row (padding 5px 8px, 8px radius, hover raise): chevron, icon mark (or a dot before reveal), `#n` in mono, the stem truncated, the pick, the seconds. The chevron rotates 90° on open and the full task with its result appears indented 32px.

### Sidebar
252px on side graphite. Top: workspace row, New thread with its Ctrl N keycap. Then Review (accent due badge) and Status, ungrouped at the top. Groups open with a 12px semibold text-3 label and a 16px icon; rows indent 33px under a group, 28px tall, text-2, hover raise, open row raise-2 with text. Topic and format rows end in a mono diff stat (`+right −wrong`, sage and brick); tests end in a mono score or a pulsing ochre dot with the answered count. The foot holds Settings and the view switch above a hairline.

### Top bar and status chips
44px, hairline below. Breadcrumbs at 13px text-3 joined by line-2 slashes, the last crumb in text and the only one that truncates. Status chips sit at the right: 24px, 1px line border, raise fill, 6px radius, 12px; the timer chip turns ochre when slow and brick when urgent, with a cue line beside it.

### Composer
The signature control. A 14px-radius raise box with a line-2 border and the float shadow; focus mixes 55% accent into the border; caret periwinkle. Below the input a row holds the explanation-language pill, any ochre notice, and the 30px round send (accent wash on accent, raise-2 and text-3 when empty). Typing `/` opens the slash menu: a 12px-radius raise list with the float shadow, mono command names at 150px, hints in text-2, the highlighted row raise-2.

### Document pane
Side graphite behind a hairline. 44px tabs: 13px text-3, hairline between, the open tab on bg with a periwinkle underline and text, kind in 11px mono. The passage is a line-numbered buffer at 14px/1.75 with a 54px mono gutter.
- **Evidence:** reads as a diff addition: a sage `+` in the gutter, the line tinted sage wash with its number in sage, the quoted span marked with sage at 24%, text color and a sage underline. A note row under the tabs ("+ Evidence") names the convention.
- **Blanks and markers:** blanks are mono chips on raise-2 in periwinkle; the current blank adds an accent outline and wash; insertion markers are periwinkle mono.

### Reading-test question navigator
A `<details>` row collapsed by default, showing title and progress; open, it lists one row per Part (11.5px label column) of 32×26px cells: dashed line-2 when unanswered, solid with raise-2 when answered, periwinkle border plus inset ring when current, an ochre flag badge when flagged. Every cell names its state in its accessible label.

### Notes, tables, meters, inputs
- **Note:** raise box, 1px line, 10px radius, padding 10px 14px, semibold head; used for score bands and the resume prompt.
- **Table:** 13.5px rows on hairlines, 12px semibold text-3 heads, mono right-aligned numbers.
- **Meter:** 6px raise-2 track with a text-3 fill, brick for weak rows; always beside a mono figure.
- **Radio rows:** 16px custom radios (line-2 ring on bg; checked fills periwinkle with a 4px bg inset), 8px-radius rows with hover raise.
- **Filter chips:** 26px pills, line-2 border, text-2; on: text-3 border, raise-2, text.

## Do's and Don'ts

### Do:
- **Do** keep primary actions and send as an accent tint (accent-wash fill, accent text); the screen's brightest object is reading text at most.
- **Do** pair every right or wrong with a check or cross icon and the word, and strike through a wrong option.
- **Do** render the current task's explanation expanded under its 1px rule and fold only earlier tasks into one-line rows.
- **Do** mark document-pane evidence as a diff addition: `+` in the gutter, sage-tinted line, underlined mark.
- **Do** set every changing number, keycap, command, ID and line number in Cascadia Mono with tabular figures, and nothing else.
- **Do** give every new shortcut a visible keycap and keep every action keyboard-operable with the 2px periwinkle focus outline.
- **Do** keep the whole sidebar in the first viewport at 1366×768; fold long groups behind an "All N topics" row.
- **Do** draw new icons in the one family: 16px, 1.4 stroke, round caps, currentColor.
- **Do** switch off all animation and transition under reduced motion.

### Don't:
- **Don't** give a primary action or send a light or solid fill, or set text in pure white.
- **Don't** box the transcript into cards; tasks, verdicts and reports sit on the ground.
- **Don't** add a second accent hue; sage, brick and ochre are state only.
- **Don't** cast shadows from anything but the composer, the slash menu and the narrow-window drawer.
- **Don't** reuse any agent product's name, logo, marks or starburst.
- **Don't** carry riso devices (paper grain, ink shapes, offset plates, square-only corners) into this view, or Office devices into the trainer.
