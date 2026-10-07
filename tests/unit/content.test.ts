import { mkdirSync, mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'
import { loadContent } from '../../src/main/content'
import { makePart5, makePart6, makePart7 } from '../fixtures/items'

let root: string
const write = (rel: string, data: unknown) => {
  const path = join(root, rel)
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, typeof data === 'string' ? data : JSON.stringify(data))
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'toeic-content-'))
})

describe('loadContent', () => {
  it('returns an empty bank when folders are missing', () => {
    expect(loadContent(root)).toEqual({ bank: { part5: [], part6: [], part7: [] }, errors: [] })
  })

  it('loads approved items and skips drafts', () => {
    write('grammar/part5/word-form.json', [makePart5(), makePart5({ status: 'draft' })])
    write('grammar/part6/sets.json', [makePart6()])
    const { bank, errors } = loadContent(root)
    expect(errors).toEqual([])
    expect(bank.part5).toHaveLength(1)
    expect(bank.part6).toHaveLength(1)
  })

  it('reports an invalid item with file and index but keeps valid ones', () => {
    write('grammar/part5/word-form.json', [makePart5(), { ...makePart5(), choices: ['a'] }])
    const { bank, errors } = loadContent(root)
    expect(bank.part5).toHaveLength(1)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatch(/word-form\.json#1: choices/)
  })

  it('reports duplicate ids', () => {
    const item = makePart5()
    write('grammar/part5/word-form.json', [item, item])
    const { bank, errors } = loadContent(root)
    expect(bank.part5).toHaveLength(1)
    expect(errors[0]).toMatch(/duplicate id/)
  })

  it('reports invalid JSON and non-array files', () => {
    write('grammar/part5/a.json', '{oops')
    write('grammar/part5/b.json', { not: 'array' })
    const { errors } = loadContent(root)
    expect(errors).toHaveLength(2)
    expect(errors[0]).toMatch(/a\.json: invalid JSON/)
    expect(errors[1]).toMatch(/b\.json: expected an array/)
  })

  it('loads approved Part 7 sets from reading/part7 and skips invalid ones', () => {
    const ok = makePart7({ id: 'p7-0001' })
    const draft = makePart7({ id: 'p7-0002', status: 'draft' })
    const bad = { ...makePart7({ id: 'p7-0003' }), format: 'triple' }
    write('reading/part7/single.json', [ok, draft, bad])
    const { bank, errors } = loadContent(root)
    expect(bank.part7.map((s) => s.id)).toEqual(['p7-0001'])
    expect(errors.some((e) => e.includes('single.json#2'))).toBe(true)
  })
})
