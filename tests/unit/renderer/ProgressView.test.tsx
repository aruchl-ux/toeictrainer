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
        bandSource="mixed"
        readingStats={[]}
        lang="en"
        onDrill={onDrill}
        onDrillReading={vi.fn()}
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
    render(<ProgressView stats={[]} weakest={[]} band={null} bandSource={null} readingStats={[]} lang="en" onDrill={() => {}} onDrillReading={() => {}} />)
    expect(screen.getByText('Take a Reading test or mixed test to see a score estimate.')).toBeTruthy()
    expect(screen.getByText('No attempts yet.')).toBeTruthy()
  })

  it('uses the Reading-test note when the band comes from a test', () => {
    render(
      <ProgressView
        stats={[]}
        weakest={[]}
        band={{ low: 300, high: 350 }}
        bandSource="test"
        readingStats={[]}
        lang="en"
        onDrill={() => {}}
        onDrillReading={() => {}}
      />
    )
    expect(screen.getByText('Estimate from your latest Reading test. Not an official score.')).toBeTruthy()
  })

  it('shows a dash for average time when a skill has only untimed (test) attempts', () => {
    const { container } = render(
      <ProgressView
        stats={[]}
        weakest={[]}
        band={null}
        bandSource={null}
        readingStats={[{ topic: 'detail', count: 4, accuracy: 0.75, avgMs: 0 }]}
        lang="en"
        onDrill={() => {}}
        onDrillReading={() => {}}
      />
    )
    const row = [...container.querySelectorAll('tbody tr')].find((tr) => tr.textContent?.includes('Detail'))!
    expect(row.querySelectorAll('td')[1].textContent).toBe('—')
    expect(row.textContent).not.toContain('0s')
  })
})

