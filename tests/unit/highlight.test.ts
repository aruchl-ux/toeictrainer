import { describe, expect, it } from 'vitest'
import { splitHighlights } from '@shared/highlight'

describe('splitHighlights', () => {
  it('marks each quote once, in text order', () => {
    expect(splitHighlights('one two three two', ['two', 'three'])).toEqual([
      { text: 'one ', hit: false },
      { text: 'two', hit: true },
      { text: ' ', hit: false },
      { text: 'three', hit: true },
      { text: ' two', hit: false }
    ])
  })
  it('ignores quotes that are missing or overlap an earlier hit', () => {
    expect(splitHighlights('abc def', ['zzz', 'abc d', 'c de'])).toEqual([
      { text: 'abc d', hit: true },
      { text: 'ef', hit: false }
    ])
  })
  it('returns the whole body when there are no quotes', () => {
    expect(splitHighlights('abc', [])).toEqual([{ text: 'abc', hit: false }])
  })
})
