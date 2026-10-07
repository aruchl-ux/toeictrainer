// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { entryId } from '@shared/quiz'
import { buildReadingTest, initTest, toActive } from '@shared/reading'
import { emptyProgress, type ActiveReadingTest, type ContentBank } from '@shared/types'
import { makePart5, makePart6, makePart7 } from '../../fixtures/items'

const smallBank: ContentBank = { part5: [makePart5(), makePart5(), makePart5()], part6: [], part7: [] }
// Exactly meets the half blueprint (15 / 2 / 5 single / 1 double / 1 triple), but with
// 2-question sets the test has 15 + 8 + 14 = 37 questions, fewer than the nominal 50.
const halfBank: ContentBank = {
  part5: Array.from({ length: 15 }, () => makePart5()),
  part6: [makePart6(), makePart6()],
  part7: [
    ...Array.from({ length: 5 }, () => makePart7()),
    makePart7({ format: 'double' }),
    makePart7({ format: 'triple' })
  ]
}
let bank: ContentBank = smallBank
const saveActiveTest = vi.fn().mockResolvedValue(undefined)
let active: ActiveReadingTest | null = null

vi.mock('../../../src/renderer/src/app/AppContext', () => ({
  useApp: () => ({ bank, progress: { ...emptyProgress(), activeReadingTest: active }, saveActiveTest, finishReadingTest: vi.fn() }),
  useT: () => ({
    lang: 'en',
    t: (k: string, v?: Record<string, unknown>) =>
      k === 'testMapLabel' && v ? `Question ${v.i}, ${v.state}` : v ? `${k}:${JSON.stringify(v)}` : k,
    topic: (x: string) => x
  })
}))
import { ReadingTestScreen } from '../../../src/renderer/src/features/reading-test/ReadingTestScreen'

const renderScreen = () => render(<MemoryRouter><ReadingTestScreen /></MemoryRouter>)

describe('ReadingTestScreen resume', () => {
  beforeEach(() => {
    saveActiveTest.mockClear()
    bank = smallBank
    active = null
  })

  it('offers Resume and restores answers and remaining time', () => {
    const entries = buildReadingTest(bank, 'half', () => 0.5)
    active = toActive(initTest(entries, 'half', { answers: { [entryId(entries[0])]: 1 }, flags: [], index: 0, elapsedMs: 600_000 }))
    renderScreen()
    expect(screen.getByText(/testResumeTitle/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /testResume/ }))
    expect(screen.getByRole('timer').textContent).toContain('28:00')
    expect(screen.getByRole('button', { name: /Question 1, answered/ })).toBeTruthy()
  })

  it('keeps Resume as the only primary button while the resume panel shows', () => {
    const entries = buildReadingTest(bank, 'half', () => 0.5)
    active = toActive(initTest(entries, 'half'))
    renderScreen()
    expect(screen.getByRole('button', { name: /testResume/ }).className).toContain('primary')
    expect(screen.getByRole('button', { name: /testStart/ }).className).not.toContain('primary')
  })

  it('discards a saved test that can no longer be restored', () => {
    active = { length: 'half', ids: ['p5-word-form-9999'], orders: [[0, 1, 2, 3]], answers: {}, flags: [], index: 0, elapsedMs: 0 }
    renderScreen()
    expect(saveActiveTest).toHaveBeenCalledWith(null)
    expect(screen.getByText('testDiscarded')).toBeTruthy()
  })
})

describe('ReadingTestScreen start', () => {
  beforeEach(() => {
    active = null
  })

  it('does not call a bank that meets the blueprint small, and starts with the count it shows', () => {
    bank = halfBank
    renderScreen()
    expect(screen.queryByText(/testShortBank/)).toBeNull()
    expect(screen.getByText('testHalfMeta:{"n":37}')).toBeTruthy()
    expect(screen.getByRole('button', { name: /testStart/ }).className).toContain('primary')
    fireEvent.click(screen.getByRole('button', { name: /testStart/ }))
    expect(screen.getByText('quizQuestionOf:{"i":1,"n":37}')).toBeTruthy()
  })

  it('shows the short-bank notice with the real count when a blueprint count is not met', () => {
    bank = smallBank
    renderScreen()
    expect(screen.getByText('testShortBank:{"n":3}')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /testStart/ }))
    expect(screen.getByText('quizQuestionOf:{"i":1,"n":3}')).toBeTruthy()
  })
})
