import { mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/main/jsonFile', async (orig) => {
  const actual = await orig<typeof import('../../src/main/jsonFile')>()
  return {
    ...actual,
    writeJsonAtomic: vi.fn(() => {
      throw new Error('disk full')
    })
  }
})

import { createStore } from '../../src/main/store'

describe('createStore write failure', () => {
  it('leaves in-memory state unchanged when a save fails', () => {
    const store = createStore(mkdtempSync(join(tmpdir(), 'toeic-store-')), () => '2026-10-05')
    expect(() =>
      store.recordGrammar({
        itemId: 'p5-word-form-0001',
        topic: 'word-form',
        correct: true,
        ms: 1,
        at: '2026-10-05T03:00:00.000Z'
      })
    ).toThrow('disk full')
    expect(store.getProgress().grammarAttempts).toEqual([])
    expect(() => store.setSettings({ language: 'en' })).toThrow('disk full')
    expect(store.getSettings()).toEqual({ language: 'th' })
  })
})
