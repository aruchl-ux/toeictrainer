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
