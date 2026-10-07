// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { emptyProgress } from '@shared/types'
import { makePart7 } from '../../fixtures/items'

const set = makePart7({ id: 'p7-0001' })
vi.mock('../../../src/renderer/src/app/AppContext', () => ({
  useApp: () => ({ bank: { part5: [], part6: [], part7: [set] }, progress: emptyProgress(), recordGrammar: vi.fn(), recordReading: vi.fn() }),
  useT: () => ({ lang: 'en', t: (k: string, v?: Record<string, unknown>) => (v ? `${k}:${JSON.stringify(v)}` : k), topic: (s: string) => s })
}))
import { ReadingScreen } from '../../../src/renderer/src/features/reading/ReadingScreen'

describe('ReadingScreen', () => {
  it('lists sets and starts a drill with the passage', () => {
    render(<MemoryRouter initialEntries={['/reading']}><ReadingScreen /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /Office closure/ }))
    expect(screen.getByText(/reopen on Monday/)).toBeTruthy()
  })
  it('filters sets by question type', () => {
    render(<MemoryRouter initialEntries={['/reading?type=vocabulary']}><ReadingScreen /></MemoryRouter>)
    expect(screen.getByText('readingEmpty')).toBeTruthy()
  })
  it('marks the selected type chip as pressed', () => {
    render(<MemoryRouter initialEntries={['/reading?type=detail']}><ReadingScreen /></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'readingAllTypes' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: /^detail/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /^inference/ }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: 'readingAllTypes' }))
    expect(screen.getByRole('button', { name: 'readingAllTypes' }).getAttribute('aria-pressed')).toBe('true')
  })
})
