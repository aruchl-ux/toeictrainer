import { describe, expect, it } from 'vitest'
import { sourceText } from '@shared/source'

describe('sourceText', () => {
  it('lists every place the question was printed', () => {
    expect(
      sourceText([
        { file: 'UNIT_3.pdf', page: 2, no: 12 },
        { file: 'Toeic_Grammar_Krubird.pdf', page: 9 }
      ])
    ).toBe('UNIT_3.pdf p.2 #12, Toeic_Grammar_Krubird.pdf p.9')
  })
})
