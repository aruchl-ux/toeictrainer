import type { Part5Item, Part6Blank, Part6Set } from '@shared/types'

let n = 0
const pad = (x: number) => String(x).padStart(4, '0')

export function makePart5(over: Partial<Part5Item> = {}): Part5Item {
  n++
  return {
    id: `p5-word-form-${pad(n)}`,
    part: 5,
    topic: 'word-form',
    difficulty: 3,
    stem: `Report ${n} was ____ written.`,
    choices: ['clear', 'clearly', 'clarity', 'clarify'],
    answer: 1,
    trap: 'adverb modifies verb',
    explain: { en: 'An adverb modifies the verb.', th: 'ต้องใช้ adverb ขยายกริยา' },
    status: 'approved',
    ...over
  }
}

function blank(topic: Part6Blank['topic'], answer = 0): Part6Blank {
  return {
    topic,
    difficulty: 3,
    choices: ['a', 'b', 'c', 'd'],
    answer,
    trap: 'trap',
    explain: { en: 'Because.', th: 'เพราะว่า' }
  }
}

export function makePart6(over: Partial<Part6Set> = {}): Part6Set {
  n++
  return {
    id: `p6-${pad(n)}`,
    part: 6,
    title: 'Email: Test',
    passage: 'One {{1}} two {{2}} three {{3}} four {{4}}.',
    blanks: [blank('word-form'), blank('sentence-insertion', 2), blank('transitions'), blank('prepositions', 3)],
    status: 'approved',
    ...over
  }
}
