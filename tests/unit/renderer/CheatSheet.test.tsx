// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CHEAT_SHEETS } from '@shared/cheatsheet'
import type { QuizEntry } from '@shared/quiz'
import { CheatSheetView } from '@renderer/features/cheatsheet/CheatSheetView'
import { QuizRunner } from '@renderer/features/grammar/QuizRunner'
import { makePart5, makePart6 } from '../../fixtures/items'

const sheet = CHEAT_SHEETS['tense-voice']
const simple = sheet.entries.find((e) => e.id === 'present-simple')!

describe('CheatSheetView', () => {
  it('shows each entry with its formula parts, use, highlighted example and clues', () => {
    const { container } = render(<CheatSheetView sheet={sheet} lang="en" />)
    expect(screen.getAllByRole('article')).toHaveLength(sheet.entries.length)
    const card = screen.getByRole('article', { name: simple.name.en })
    expect(within(card).getByText(simple.use.en)).toBeTruthy()
    const formula = card.querySelector('.formula')!
    expect([...formula.querySelectorAll('.fp')].map((p) => p.textContent)).toEqual(['S', 'V(s/es)', 'Obj'])
    expect(formula.querySelector('.fp-subject')?.textContent).toBe('S')
    expect(card.querySelector('mark')?.textContent).toBe('leaves')
    expect(within(card).getByText('every day')).toBeTruthy()
    // English mode shows no Thai translation line.
    expect(container.textContent).not.toContain(simple.example.th)
  })

  it('lists what each linking word means in the learner language', () => {
    render(<CheatSheetView sheet={CHEAT_SHEETS['conj-vs-prep']} lang="th" />)
    const card = screen.getByRole('article', { name: /because of/ })
    const words = within(card).getByLabelText('ความหมาย')
    const owing = within(words).getByText('owing to')
    expect(owing.nextElementSibling?.textContent).toBe('เนื่องจาก (ภาษาทางการ)')
  })

  it('opens in Thai with the translation, and flips to English', () => {
    render(<CheatSheetView sheet={sheet} lang="th" />)
    expect(screen.getByText(simple.use.th)).toBeTruthy()
    expect(screen.getByText(simple.example.th)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'ดูเป็นภาษาอังกฤษ' }))
    expect(screen.getByText(simple.use.en)).toBeTruthy()
  })
})

describe('Formulas in a drill', () => {
  it('opens the topic sheet over the question and closes back to it', () => {
    const p5 = makePart5({ topic: 'tense-voice', id: 'p5-tense-voice-0001' })
    const entries: QuizEntry[] = [{ kind: 'p5', item: p5 }]
    render(<QuizRunner entries={entries} mode="instant" lang="en" onAnswer={() => {}} onFinish={() => {}} />)
    expect(screen.queryByRole('button', { name: /Formulas/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '(B) clearly' }))
    fireEvent.click(screen.getByRole('button', { name: /Formulas/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('article', { name: simple.name.en })).toBeTruthy()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText(p5.stem)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'See results' })).toBeTruthy()
  })

  it('offers no formulas for Part 6-only topics', () => {
    const set = makePart6()
    set.blanks[0] = { ...set.blanks[0], topic: 'transitions' }
    render(
      <QuizRunner entries={[{ kind: 'p6', set, blank: 0 }]} mode="instant" lang="en" onAnswer={() => {}} onFinish={() => {}} />
    )
    fireEvent.click(screen.getAllByRole('button', { name: /^\(A\)/ })[0])
    expect(screen.queryByRole('button', { name: /Formulas/ })).toBeNull()
  })
})

describe('Points tested in drills', () => {
  const points = [
    { key: 'exercise caution', th: 'ใช้ความระมัดระวัง', en: 'be careful', wrong: ['perform caution', 'execute caution'] }
  ]

  it('lists each point with its meaning and its wrong pairs as ✗ text', () => {
    render(<CheatSheetView sheet={CHEAT_SHEETS.collocations} lang="th" points={points} />)
    const list = screen.getByRole('region', { name: 'จุดที่ออกในแบบฝึก (1)' })
    expect(within(list).getByText('exercise caution')).toBeTruthy()
    expect(within(list).getByText('ใช้ความระมัดระวัง')).toBeTruthy()
    expect(within(list).getByText('✗ perform caution')).toBeTruthy()
    expect(within(list).getByText('✗ execute caution')).toBeTruthy()
  })

  it('switches the meanings with the language flip', () => {
    render(<CheatSheetView sheet={CHEAT_SHEETS.collocations} lang="th" points={points} />)
    fireEvent.click(screen.getByRole('button', { name: 'ดูเป็นภาษาอังกฤษ' }))
    expect(screen.getByText('be careful')).toBeTruthy()
    expect(screen.queryByText('ใช้ความระมัดระวัง')).toBeNull()
  })

  it('hides the block when no question has a point', () => {
    render(<CheatSheetView sheet={CHEAT_SHEETS.collocations} lang="en" points={[]} />)
    expect(screen.queryByRole('region')).toBeNull()
  })
})
