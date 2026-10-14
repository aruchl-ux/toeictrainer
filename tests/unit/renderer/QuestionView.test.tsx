// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuestionView } from '../../../src/renderer/src/features/grammar/QuestionView'
import { makePart5 } from '../../fixtures/items'

describe('QuestionView source line', () => {
  it('shows where a private item came from after answering', () => {
    const item = makePart5({ id: 'p5x-word-form-0001', source: [{ file: 'UNIT_3.pdf', page: 2, no: 12 }] })
    render(<QuestionView entry={{ kind: 'p5', item }} lang="en" selected={1} reveal onChoose={() => {}} />)
    expect(screen.getByText('From: UNIT_3.pdf p.2 #12')).toBeTruthy()
  })

  it('shows no source line for shipped items', () => {
    render(<QuestionView entry={{ kind: 'p5', item: makePart5() }} lang="en" selected={1} reveal onChoose={() => {}} />)
    expect(screen.queryByText(/^From:/)).toBeNull()
  })
})
