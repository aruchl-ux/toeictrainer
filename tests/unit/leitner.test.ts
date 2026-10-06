import { describe, expect, it } from 'vitest'
import { addDays, localDate } from '@shared/dates'
import { dueIds, schedule } from '@shared/leitner'

const TODAY = '2026-10-05'

describe('dates', () => {
  it('formats a local date', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
  })
})

describe('schedule', () => {
  it('puts a new wrong item in box 1 due tomorrow', () => {
    expect(schedule(undefined, false, TODAY)).toEqual({ box: 1, due: '2026-10-06' })
  })
  it('keeps a new correct item out of the queue', () => {
    expect(schedule(undefined, true, TODAY)).toBeUndefined()
  })
  it('moves a correct item up one box with that box interval', () => {
    expect(schedule({ box: 1, due: TODAY }, true, TODAY)).toEqual({ box: 2, due: '2026-10-08' })
    expect(schedule({ box: 3, due: TODAY }, true, TODAY)).toEqual({ box: 4, due: '2026-10-19' })
  })
  it('caps at box 5 with a 30 day interval', () => {
    expect(schedule({ box: 5, due: TODAY }, true, TODAY)).toEqual({ box: 5, due: '2026-11-04' })
  })
  it('sends a wrong item back to box 1', () => {
    expect(schedule({ box: 4, due: TODAY }, false, TODAY)).toEqual({ box: 1, due: '2026-10-06' })
  })
})

describe('dueIds', () => {
  it('returns items due today or earlier, oldest first then by id', () => {
    const leitner = {
      b: { box: 1, due: '2026-10-05' },
      a: { box: 2, due: '2026-10-05' },
      c: { box: 1, due: '2026-10-01' },
      d: { box: 1, due: '2026-10-06' }
    }
    expect(dueIds(leitner, TODAY)).toEqual(['c', 'a', 'b'])
  })
})
