// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProgressView } from '@renderer/features/progress/ProgressView'

describe('ProgressView', () => {
  const stats = [
    { topic: 'prepositions' as const, count: 10, accuracy: 0.5, avgMs: 15000 },
    { topic: 'transitions' as const, count: 6, accuracy: 0.4, avgMs: 20000 }
  ]

  it('shows the band estimate, topic rows and drill buttons only for Part 5 topics', () => {
    const onDrill = vi.fn()
    render(
      <ProgressView
        stats={stats}
        weakest={['transitions', 'prepositions']}
        band={{ low: 300, high: 350 }}
        lang="en"
        onDrill={onDrill}
      />
    )
    expect(screen.getByText('Estimated Reading band: 300–350')).toBeTruthy()
    expect(screen.getByText('50%')).toBeTruthy()
    expect(screen.getByText('15s')).toBeTruthy()
    const buttons = screen.getAllByRole('button', { name: 'Drill this' })
    expect(buttons).toHaveLength(1)
    fireEvent.click(buttons[0])
    expect(onDrill).toHaveBeenCalledWith('prepositions')
  })

  it('shows empty states', () => {
    render(<ProgressView stats={[]} weakest={[]} band={null} lang="en" onDrill={() => {}} />)
    expect(screen.getByText('Take a mixed test to see a score estimate.')).toBeTruthy()
    expect(screen.getByText('No attempts yet.')).toBeTruthy()
  })
})
