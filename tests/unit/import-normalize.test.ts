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
