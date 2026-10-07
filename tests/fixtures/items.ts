import type { Part5Item, Part6Blank, Part6Set, Part7Question, Part7Set } from '@shared/types'

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

function question(over: Partial<Part7Question> = {}): Part7Question {
  return {
    type: 'detail',
    prompt: 'When will the office reopen?',
    difficulty: 3,
    choices: ['On Monday', 'On Tuesday', 'On Friday', 'Next month'],
    answer: 0,
    evidence: [{ doc: 0, quote: 'reopen on Monday' }],
    explain: { en: 'The notice says it will reopen on Monday.', th: 'ประกาศบอกว่าจะเปิดอีกครั้งวันจันทร์' },
    ...over
  }
}

export function makePart7(over: Partial<Part7Set> = {}): Part7Set {
  n++
  return {
    id: `p7-${pad(n)}`,
    part: 7,
    format: 'single',
    docs: [{ kind: 'notice', title: 'Notice: Office closure', body: 'The office is closed for cleaning and will reopen on Monday at 9 a.m.' }],
    questions: [question(), question({ type: 'inference', prompt: 'Why is the office closed?', choices: ['Cleaning', 'A holiday', 'A move', 'Repairs'], evidence: [{ doc: 0, quote: 'closed for cleaning' }] })],
    status: 'approved',
    ...over
  }
}
