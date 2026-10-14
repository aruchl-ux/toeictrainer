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
