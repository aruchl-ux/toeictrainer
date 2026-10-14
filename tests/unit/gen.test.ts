import { describe, expect, it } from 'vitest'
import {
  applyVerdicts,
  checkPrompt,
  guardOverlap,
  nextNumber,
  overlapScore,
  parseDraftFile,
  part5Prompt,
  part6Prompt,
  spreadPick,
  toPart5Drafts,
  toPart6Drafts,
  type GenPart5,
  type GenPart6
} from '../../scripts/lib/gen'
import type { GrammarTopic } from '../../src/shared/types'
import { makePart5 } from '../fixtures/items'

const genItem = (over: Partial<GenPart5['items'][number]> = {}): GenPart5['items'][number] => ({
  stem: 'The manager ____ approved the budget.',
  choices: ['final', 'finally', 'finalize', 'finality'],
  answer: 1,
  trap: 'adverb before verb',
  explain_en: 'An adverb modifies approved.',
  explain_th: 'ต้องใช้ adverb ขยาย approved',
  difficulty: 3,
  ...over
})

describe('nextNumber', () => {
  it('returns one more than the highest 4-digit suffix', () => {
    expect(nextNumber(['p5-word-form-0003', 'p5-word-form-0010'])).toBe(11)
    expect(nextNumber([])).toBe(1)
  })
})

describe('toPart5Drafts', () => {
  it('assigns sequential ids to valid items and reports invalid ones', () => {
    const gen: GenPart5 = { items: [genItem(), genItem({ choices: ['a', 'b'] }), genItem()] }
    const { items, errors } = toPart5Drafts(gen, 'word-form', 7)
    expect(items.map((i) => i.id)).toEqual(['p5-word-form-0007', 'p5-word-form-0008'])
    expect(items[0]).toMatchObject({ part: 5, topic: 'word-form', status: 'draft', explain: { en: expect.any(String), th: expect.any(String) } })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/^item 1: choices/)
  })
})

describe('toPart6Drafts', () => {
  it('builds a valid draft set', () => {
    const blank = (topic: GrammarTopic) => ({ topic, ...genItem(), stem: undefined })
    const gen: GenPart6 = {
      sets: [
        {
          title: 'Notice: Parking',
          passage: 'A {{1}} B {{2}} C {{3}} D {{4}}',
          blanks: [blank('word-form'), blank('sentence-insertion'), blank('transitions'), blank('prepositions')]
        }
      ]
    }
    const { items, errors } = toPart6Drafts(gen, 3)
    expect(errors).toEqual([])
    expect(items[0].id).toBe('p6-0003')
    expect(items[0].status).toBe('draft')
  })
})

describe('applyVerdicts', () => {
  it('flags rejected and unreviewed items, keeps approved ones unchanged', () => {
    const items = [makePart5(), makePart5(), makePart5()]
    const out = applyVerdicts(items, [
      { index: 0, ok: true, reason: 'fine' },
      { index: 1, ok: false, reason: 'two correct answers' }
    ])
    expect(out[0].flag).toBeUndefined()
    expect(out[1].flag).toBe('two correct answers')
    expect(out[2].flag).toBe('not reviewed by self-check')
  })
})

describe('prompts', () => {
  it('includes topic, count, difficulty and stems to avoid', () => {
    const p = part5Prompt('word-form', 10, 3, [makePart5()], ['Avoid this ____ stem.'])
    expect(p.user).toContain('10')
    expect(p.user).toContain('"word-form"')
    expect(p.user).toContain('difficulty 3')
    expect(p.user).toContain('Avoid this ____ stem.')
    expect(p.system).toContain('____')
  })
  it('numbers items for the self-check', () => {
    expect(checkPrompt([{ a: 1 }, { b: 2 }]).user).toContain('"index": 1')
  })
  it('lists titles to avoid in the part 6 prompt', () => {
    expect(part6Prompt(3, 3, [], ['Email: Old title']).user).toContain('- Email: Old title')
    expect(part6Prompt(3, 3, []).user).toContain('- (none)')
  })
})

describe('parseDraftFile', () => {
  it('returns the objects of a valid draft file', () => {
    expect(parseDraftFile('[{"id":"a"},{"id":"b"}]', 'x.json').items).toEqual([{ id: 'a' }, { id: 'b' }])
  })
  it('warns and skips malformed or non-array files', () => {
    for (const text of ['{oops', '{"id":"a"}']) {
      const r = parseDraftFile(text, 'bad.json')
      expect(r.items).toEqual([])
      expect(r.warning).toContain('bad.json')
    }
  })
})

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
