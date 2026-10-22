import { resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../src/main/content'

describe('shipped content', () => {
  const { bank } = loadContent(resolve('content'))

  it('has no private (p5x-) ids', () => {
    expect(bank.part5.filter((i) => i.id.startsWith('p5x-')).map((i) => i.id)).toEqual([])
  })

  it('has no private (p6x- / p7x-) sets', () => {
    expect([...bank.part6, ...bank.part7].filter((s) => /^p[67]x-/.test(s.id)).map((s) => s.id)).toEqual([])
  })

  it('has no exams', () => {
    expect(bank.exams).toEqual([])
  })

  it('has no source fields', () => {
    expect(bank.part5.filter((i) => i.source).map((i) => i.id)).toEqual([])
  })
})
