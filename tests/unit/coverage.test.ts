import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../src/main/content'
import { CHEAT_SHEETS } from '../../src/shared/cheatsheet'
import { PART5_TOPICS, type Part5Topic, type Point } from '../../src/shared/types'
import { POINT_MAX, THAI } from '../../scripts/lib/points'

/** Every Part 5 topic is finished for beginners; a new topic must meet the same rules. */
const READY: Part5Topic[] = [...PART5_TOPICS]
/** Ready topics with no shipped question yet, so only their sheet is checked. Remove a topic once its questions ship. */
const NO_QUESTIONS: Part5Topic[] = ['word-choice', 'modals', 'determiners', 'noun-clauses']

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
      expect(e.mistake.wrong.trim(), e.id).not.toBe('')
      expect(e.mistake.right.trim(), e.id).not.toBe('')
      expect(e.mistake.wrong, e.id).not.toBe(e.mistake.right)
      expect(e.mistake.why.th, e.id).toMatch(THAI)
      expect(e.mistake.why.en.trim(), e.id).not.toBe('')
    }
  })

  it('gives every clue a Thai and English meaning', () => {
    for (const e of sheet.entries)
      for (const c of e.clues ?? []) {
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
    if (NO_QUESTIONS.includes(topic)) expect(points, 'questions arrived: remove the topic from NO_QUESTIONS').toEqual([])
    else expect(points.length).toBeGreaterThan(0)
    for (const [ref, p] of points) {
      expect(p, ref).toBeDefined()
      expect(p!.th, ref).toMatch(THAI)
      expect(p!.th.length, ref).toBeLessThanOrEqual(POINT_MAX)
      expect(p!.en.length, ref).toBeLessThanOrEqual(POINT_MAX)
    }
  })
})

it('lists only real topics as ready', () => {
  for (const tp of READY) expect(CHEAT_SHEETS[tp], tp).toBeDefined()
})
