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
  it('returns null when th or en is longer than 80 characters', () => {
    expect(toPoint({ ...point, th: 'ก'.repeat(81), wrong: [] })).toBeNull()
    expect(toPoint({ ...point, en: 'e'.repeat(81), wrong: [] })).toBeNull()
  })
  it('accepts th and en of exactly 80 characters, measured after trimming', () => {
    expect(toPoint({ ...point, th: ` ${'ก'.repeat(80)} `, en: 'e'.repeat(80), wrong: [] })).toEqual({ ...point, th: 'ก'.repeat(80), en: 'e'.repeat(80) })
  })
  it('returns null when th has no Thai', () => {
    expect(toPoint({ ...point, th: 'be careful', wrong: [] })).toBeNull()
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
