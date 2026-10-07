// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { flattenPart7 } from '@shared/quiz'
import { QuizSummary } from '../../../src/renderer/src/features/grammar/QuizSummary'
import { makePart5, makePart7 } from '../../fixtures/items'

describe('QuizSummary with gaps and Part 7', () => {
  it('scores only answered items and shows evidence for Part 7', () => {
    const entries = [{ kind: 'p5' as const, item: makePart5() }, ...flattenPart7(makePart7())]
    const records = [undefined, { entryId: 'x', topic: 'detail' as const, choice: 0, correct: true, ms: 1 }, undefined]
    render(<QuizSummary entries={entries} records={records} lang="en" showReview />)
    expect(screen.getByText('Score: 1 / 3')).toBeTruthy()
    expect(screen.getByText(/“reopen on Monday”/)).toBeTruthy()
  })
})

describe('QuizSummary missed list', () => {
  it('names the question type for a wrong Part 7 answer and prints no blank rows', () => {
    const entries = flattenPart7(makePart7())
    const records = [
      { entryId: 'a', topic: 'detail' as const, choice: 1, correct: false, ms: 1 },
      { entryId: 'b', topic: 'inference' as const, choice: 1, correct: false, ms: 1 }
    ]
    const { container } = render(<QuizSummary entries={entries} records={records} lang="en" showReview={false} />)
    const items = [...container.querySelectorAll('.summary-missed li')].map((li) => li.textContent)
    expect(items).toEqual(['Detail', 'Inference'])
  })

  it('dedupes repeated points', () => {
    const entries = [{ kind: 'p5' as const, item: makePart5() }, { kind: 'p5' as const, item: makePart5() }]
    const wrong = { entryId: 'x', topic: 'word-form' as const, choice: 0, correct: false, ms: 1 }
    const { container } = render(<QuizSummary entries={entries} records={[wrong, wrong]} lang="en" showReview={false} />)
    expect(container.querySelectorAll('.summary-missed li')).toHaveLength(1)
  })
})
