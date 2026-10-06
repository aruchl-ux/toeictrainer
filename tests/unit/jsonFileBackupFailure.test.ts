import { mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('fs', async (orig) => {
  const actual = await orig<typeof import('fs')>()
  return {
    ...actual,
    renameSync: vi.fn(() => {
      throw Object.assign(new Error('locked'), { code: 'EPERM' })
    }),
    copyFileSync: vi.fn(() => {
      throw Object.assign(new Error('locked'), { code: 'EPERM' })
    })
  }
})

import { createStore } from '../../src/main/store'

describe('corrupt file that cannot be backed up', () => {
  it('refuses to overwrite it on a later save', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const dir = mkdtempSync(join(tmpdir(), 'toeic-store-'))
    const file = join(dir, 'progress.json')
    writeFileSync(file, '{not json')
    const store = createStore(dir, () => '2026-10-05')
    expect(store.getProgress().grammarAttempts).toEqual([])
    expect(() => store.recordMixedTest({ at: 'x', correct: 1, total: 2, ms: 3 })).toThrow(
      /refusing to overwrite/
    )
    expect(store.getProgress().mixedTests).toEqual([])
    expect(readFileSync(file, 'utf8')).toBe('{not json')
    spy.mockRestore()
  })
})
