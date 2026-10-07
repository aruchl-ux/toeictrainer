// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flattenPart7 } from '@shared/quiz'
import { buildReadingTest } from '@shared/reading'
import { emptyProgress } from '@shared/types'
import { makePart5, makePart7 } from '../../fixtures/items'

const p5a = makePart5({ id: 'p5-0001' })
const p5b = makePart5({ id: 'p5-0002' })
vi.mock('../../../src/renderer/src/app/AppContext', () => ({
  useApp: () => ({
    bank: { part5: [p5a, p5b], part6: [], part7: [] },
    progress: emptyProgress(),
    saveActiveTest: vi.fn().mockResolvedValue(undefined)
  }),
  useT: () => ({
    lang: 'en',
    t: (k: string, v?: Record<string, unknown>) =>
      k === 'testMapLabel' && v ? `Question ${v.i}, ${v.state}` : v ? `${k}:${JSON.stringify(v)}` : k,
    topic: (s: string) => s
  })
}))
import { ReadingTestRunner } from '../../../src/renderer/src/features/reading-test/ReadingTestRunner'

describe('ReadingTestRunner', () => {
  it('jumps via the map, changes answers, and confirms before submitting with blanks', () => {
    const entries = buildReadingTest({ part5: [p5a, p5b], part6: [], part7: [] }, 'half', () => 0.2)
    const onDone = vi.fn()
    render(<ReadingTestRunner entries={entries} length="half" onDone={onDone} />)
    fireEvent.click(screen.getByRole('button', { name: /Question 2, unanswered/ }))
    fireEvent.click(screen.getAllByRole('button', { name: /^\(\s*A\s*\)/ })[0])
    expect(screen.getByRole('button', { name: /Question 2, answered/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'testSubmit' }))
    expect(screen.getByText(/^testConfirm:/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'testConfirmYes' }))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const p5Entries = () => buildReadingTest({ part5: [p5a, p5b], part6: [], part7: [] }, 'half', () => 0.2)

  it('caps each clock tick so a long system sleep cannot run the timer out', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<ReadingTestRunner entries={p5Entries()} length="half" onDone={onDone} />)
    vi.setSystemTime(Date.now() + 2 * 60 * 60_000) // laptop slept for two hours
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByRole('timer').textContent).toContain('37:55')
  })

  it('answers with letter keys even when focus is on a test control', () => {
    render(<ReadingTestRunner entries={p5Entries()} length="half" onDone={vi.fn()} />)
    const next = screen.getByRole('button', { name: /testNext/ })
    next.focus()
    fireEvent.keyDown(next, { key: 'b' })
    expect(screen.getByRole('button', { name: /Question 1, answered/ })).toBeTruthy()
  })

  it('still ignores letter keys typed into a text field', () => {
    render(<ReadingTestRunner entries={p5Entries()} length="half" onDone={vi.fn()} />)
    const input = document.createElement('input')
    document.body.appendChild(input)
    fireEvent.keyDown(input, { key: 'b' })
    expect(screen.getByRole('button', { name: /Question 1, unanswered/ })).toBeTruthy()
    input.remove()
  })

  it('keeps the chosen document tab when moving to the next question of the same set', () => {
    const set = makePart7({
      format: 'double',
      docs: [
        { kind: 'ad', title: 'Ad: Room rental', body: 'Rooms from $90 per day.' },
        { kind: 'email', title: 'Email: Booking', body: 'We booked the large room for Tuesday.' }
      ]
    })
    render(<ReadingTestRunner entries={flattenPart7(set)} length="half" onDone={vi.fn()} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Email: Booking' }))
    fireEvent.click(screen.getByRole('button', { name: /testNext/ }))
    expect(screen.getByText(/Why is the office closed/)).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Email: Booking' }).getAttribute('aria-selected')).toBe('true')
  })
})
