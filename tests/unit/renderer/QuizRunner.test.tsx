// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { QuizEntry } from '@shared/quiz'
import { flattenPart7 } from '@shared/quiz'
import { QuizRunner } from '@renderer/features/grammar/QuizRunner'
import { makePart5, makePart6, makePart7 } from '../../fixtures/items'

const p5a = makePart5({ stem: 'First ____ stem.', choices: ['w', 'x', 'y', 'z'], answer: 1 })
const p5b = makePart5({ stem: 'Second ____ stem.', choices: ['k', 'l', 'm', 'n'], answer: 0 })
const entries: QuizEntry[] = [
  { kind: 'p5', item: p5a },
  { kind: 'p5', item: p5b }
]

describe('QuizRunner', () => {
  it('instant mode: reveals the explanation, then moves to the next question', () => {
    const onAnswer = vi.fn()
    render(<QuizRunner entries={entries} mode="instant" lang="en" onAnswer={onAnswer} onFinish={() => {}} />)
    expect(screen.getByText('Question 1 of 2')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '(B) x' }))
    expect(onAnswer).toHaveBeenCalledWith(expect.objectContaining({ entryId: p5a.id, correct: true }))
    expect(screen.getByText(p5a.explain.en)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Show Thai explanation' }))
    expect(screen.getByText(p5a.explain.th)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Second ____ stem.')).toBeTruthy()
  })

  it('deferred mode: shows the score and calls onFinish once', () => {
    const onFinish = vi.fn()
    let clock = 0
    const now = () => (clock += 1000)
    render(<QuizRunner entries={entries} mode="deferred" lang="en" onAnswer={() => {}} onFinish={onFinish} now={now} />)
    fireEvent.click(screen.getByRole('button', { name: '(A) w' }))
    fireEvent.click(screen.getByRole('button', { name: '(A) k' }))
    expect(screen.getByText('Score: 1 / 2')).toBeTruthy()
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onFinish.mock.calls[0][0]).toHaveLength(2)
  })

  it('renders a Part 6 passage with the current blank marked', () => {
    const set = makePart6()
    const { container } = render(
      <QuizRunner entries={[{ kind: 'p6', set, blank: 1 }]} mode="instant" lang="en" onAnswer={() => {}} onFinish={() => {}} />
    )
    expect(screen.getByText(set.title)).toBeTruthy()
    expect(container.querySelector('mark.blank.current')?.textContent).toBe('[2] ____')
  })

  it('renders a Part 7 question and highlights the evidence on reveal', () => {
    const { container } = render(
      <QuizRunner entries={flattenPart7(makePart7())} mode="instant" lang="en" onAnswer={() => {}} onFinish={() => {}} />
    )
    expect(container.querySelector('mark.evidence')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /On Monday/ }))
    expect(container.querySelector('mark.evidence')?.textContent).toBe('reopen on Monday')
    expect(screen.getByText('Detail')).toBeTruthy()
  })

  it('shows an empty message and does not finish when there are no entries', () => {
    const onFinish = vi.fn()
    render(<QuizRunner entries={[]} mode="instant" lang="en" onAnswer={() => {}} onFinish={onFinish} />)
    expect(screen.getByText('No questions available yet.')).toBeTruthy()
    expect(onFinish).not.toHaveBeenCalled()
  })

  it('Part 7 drill: keeps the evidence tab and resets the explanation language on the next question of the set', () => {
    const set = makePart7({
      format: 'double',
      docs: [
        { kind: 'ad', title: 'Ad: Room rental', body: 'Rooms from $90 per day.' },
        { kind: 'email', title: 'Email: Booking', body: 'We booked the large room for Tuesday.' }
      ]
    })
    set.questions[0] = { ...set.questions[0], evidence: [{ doc: 1, quote: 'large room' }] }
    render(<QuizRunner entries={flattenPart7(set)} mode="instant" lang="en" onAnswer={() => {}} onFinish={() => {}} />)
    expect(screen.getByRole('tab', { name: 'Ad: Room rental' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getAllByRole('button', { name: /^\(\s*A\s*\)/ })[0])
    expect(screen.getByRole('tab', { name: 'Email: Booking' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Show Thai explanation' }))
    fireEvent.click(screen.getByRole('button', { name: /^Next/ }))
    expect(screen.getByText('Why is the office closed?')).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Email: Booking' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(screen.getAllByRole('button', { name: /^\(\s*A\s*\)/ })[0])
    expect(document.querySelector('.explain-body')?.getAttribute('lang')).toBe('en')
  })
})

