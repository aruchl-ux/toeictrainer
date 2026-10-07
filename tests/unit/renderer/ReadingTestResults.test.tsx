// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { entryFields, entryId, flattenPart7, flattenSet, type QuizEntry } from '@shared/quiz'
import { initTest, type TestState } from '@shared/reading'
import { makePart5, makePart6, makePart7 } from '../../fixtures/items'

vi.mock('../../../src/renderer/src/app/AppContext', () => ({
  useApp: () => ({ finishReadingTest: vi.fn().mockResolvedValue(undefined) }),
  useT: () => ({
    lang: 'en',
    t: (k: string, v?: Record<string, unknown>) => (v ? `${k}:${JSON.stringify(v)}` : k),
    topic: (s: string) => s
  })
}))
import { ReadingTestResults } from '../../../src/renderer/src/features/reading-test/ReadingTestResults'

/** A finished test where `wrong` entries were answered wrong and the rest right. */
function finished(entries: QuizEntry[], wrong: number[]): TestState {
  const answers: Record<string, number> = {}
  entries.forEach((e, i) => {
    const a = entryFields(e).answer
    answers[entryId(e)] = wrong.includes(i) ? (a + 1) % 4 : a
  })
  return { ...initTest(entries, 'half'), answers, done: true }
}

const renderResults = (s: TestState) => render(<MemoryRouter><ReadingTestResults state={s} /></MemoryRouter>)

describe('ReadingTestResults drill-weakest link', () => {
  it('links the Part 7 type with the most wrong answers to the reading drill', () => {
    const entries = [{ kind: 'p5' as const, item: makePart5() }, ...flattenPart7(makePart7()), ...flattenPart7(makePart7())]
    // p5 wrong once; 'inference' (entries 2 and 4) wrong twice.
    renderResults(finished(entries, [0, 2, 4]))
    const link = screen.getByRole('link', { name: /testDrillWeakest/ })
    expect(link.textContent).toContain('"skill":"Inference"')
    expect(link.getAttribute('href')).toBe('/reading?type=inference')
  })

  it('breaks ties by test order and links a Part 5 topic to its drill', () => {
    const entries = [{ kind: 'p5' as const, item: makePart5() }, ...flattenPart7(makePart7())]
    renderResults(finished(entries, [0, 1]))
    const link = screen.getByRole('link', { name: /testDrillWeakest/ })
    expect(link.getAttribute('href')).toBe('/drill/word-form')
  })

  it('shows no link for a Part 6-only topic or when nothing was wrong', () => {
    const p6 = flattenSet(makePart6()) // topics: word-form, sentence-insertion, transitions, prepositions
    const { unmount } = renderResults(finished(p6, [2]))
    expect(screen.queryByRole('link', { name: /testDrillWeakest/ })).toBeNull()
    unmount()
    renderResults(finished(p6, []))
    expect(screen.queryByRole('link', { name: /testDrillWeakest/ })).toBeNull()
  })
})
