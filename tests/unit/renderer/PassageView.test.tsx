// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PassageView } from '../../../src/renderer/src/features/reading/PassageView'

const docs = [
  { kind: 'ad' as const, title: 'Ad: Room rental', body: 'Rooms from $90 per day.' },
  { kind: 'email' as const, title: 'Email: Booking', body: 'We booked the large room for Tuesday.' }
]

describe('PassageView', () => {
  it('shows one doc at a time with tabs', () => {
    render(<PassageView docs={docs} evidence={null} />)
    expect(screen.getByText('Rooms from $90 per day.')).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'Email: Booking' }))
    expect(screen.getByText(/We booked the large room/)).toBeTruthy()
  })

  it('switches to the evidence doc and highlights the quote', () => {
    const { container, rerender } = render(<PassageView docs={docs} evidence={null} />)
    rerender(<PassageView docs={docs} evidence={[{ doc: 1, quote: 'large room' }]} />)
    expect(container.querySelector('mark.evidence')?.textContent).toBe('large room')
    expect(screen.getByRole('tab', { name: 'Email: Booking' }).getAttribute('aria-selected')).toBe('true')
  })
})

describe('PassageView layout', () => {
  it('scrolls an inner layer, not the sheet, so the corner crosses stay put', () => {
    const { container } = render(<PassageView docs={docs} evidence={null} />)
    const sheet = container.querySelector('.sheet.p7-passage')!
    const scroller = sheet.querySelector(':scope > .p7-scroll')
    expect(scroller).toBeTruthy()
    expect(scroller!.querySelector('[role="tablist"]')).toBeTruthy()
    expect(scroller!.querySelector('h3')?.textContent).toBe('Ad: Room rental')
  })
})
