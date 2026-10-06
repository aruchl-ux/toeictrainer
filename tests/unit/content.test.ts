import { mkdirSync, mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'
import { loadContent } from '../../src/main/content'
import { makePart5, makePart6 } from '../fixtures/items'

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
    expect(loadContent(root)).toEqual({ bank: { part5: [], part6: [] }, errors: [] })
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
})
