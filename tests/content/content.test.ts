import { readFileSync, readdirSync } from 'fs'
import { basename, join, resolve } from 'path'
import { describe, expect, it } from 'vitest'
import { loadContent } from '../../src/main/content'

const ROOT = resolve('content')

describe('repository content', () => {
  const { bank, errors } = loadContent(ROOT)

  it('has no invalid items', () => {
    expect(errors).toEqual([])
  })

  it('has at least one Part 5 item and one Part 6 set', () => {
    expect(bank.part5.length).toBeGreaterThan(0)
    expect(bank.part6.length).toBeGreaterThan(0)
  })

  it('stores each Part 5 item in the file named after its topic', () => {
    const dir = join(ROOT, 'grammar', 'part5')
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const items = JSON.parse(readFileSync(join(dir, file), 'utf8')) as { topic: string }[]
      for (const item of items) expect(item.topic).toBe(basename(file, '.json'))
    }
  })
})
