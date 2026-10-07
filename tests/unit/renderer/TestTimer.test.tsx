// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TestTimer } from '../../../src/renderer/src/features/reading-test/TestTimer'

describe('TestTimer', () => {
  it('announces the time cue through a polite live region, never the ticking digits', () => {
    const { container, rerender } = render(<TestTimer remainingMs={400_000} lang="en" />)
    const live = () => container.querySelector('[aria-live="polite"]')
    // The live region exists before the cue appears, so the cue is announced when it is added.
    expect(live()).toBeTruthy()
    expect(live()!.textContent).toBe('')
    rerender(<TestTimer remainingMs={250_000} lang="en" />)
    expect(live()!.textContent).toBe('5 minutes left')
    expect(live()!.textContent).not.toMatch(/\d\d:\d\d/)
    expect(container.querySelectorAll('[aria-live="polite"]')).toHaveLength(1)
    rerender(<TestTimer remainingMs={50_000} lang="en" />)
    expect(live()!.textContent).toBe('1 minute left')
  })
})
