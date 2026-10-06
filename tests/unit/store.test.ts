import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStore } from '../../src/main/store'

let dir: string
const today = () => '2026-10-05'
const attempt = {
  itemId: 'p5-word-form-0001',
  topic: 'word-form' as const,
  correct: false,
  ms: 9000,
  at: '2026-10-05T03:00:00.000Z'
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'toeic-store-'))
})

describe('createStore', () => {
  it('starts empty with default settings', () => {
    const store = createStore(dir, today)
    expect(store.getProgress().grammarAttempts).toEqual([])
    expect(store.getSettings()).toEqual({ language: 'th' })
  })

  it('persists grammar attempts and Leitner cards across instances', () => {
    createStore(dir, today).recordGrammar(attempt)
    const reopened = createStore(dir, today).getProgress()
    expect(reopened.grammarAttempts).toHaveLength(1)
    expect(reopened.leitner['p5-word-form-0001']).toEqual({ box: 1, due: '2026-10-06' })
  })

  it('persists mixed test results', () => {
    createStore(dir, today).recordMixedTest({ at: 'x', correct: 1, total: 2, ms: 3 })
    expect(createStore(dir, today).getProgress().mixedTests).toHaveLength(1)
  })

  it('persists a settings patch without dropping other fields', () => {
    createStore(dir, today).setSettings({ language: 'en' })
    expect(createStore(dir, today).getSettings()).toEqual({ language: 'en' })
    createStore(dir, today).setSettings({})
    expect(createStore(dir, today).getSettings()).toEqual({ language: 'en' })
  })

  it('moves a corrupt progress file aside and starts fresh', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    writeFileSync(join(dir, 'progress.json'), '{not json')
    const store = createStore(dir, today)
    expect(store.getProgress().grammarAttempts).toEqual([])
    expect(readdirSync(dir).some((f) => f.startsWith('progress.json.corrupt-'))).toBe(true)
    spy.mockRestore()
  })

  it('leaves no temp file after writing', () => {
    createStore(dir, today).recordGrammar(attempt)
    expect(existsSync(join(dir, 'progress.json.tmp'))).toBe(false)
  })
})

describe('createStore invalid data', () => {
  it('quarantines a parseable but schema-invalid progress file with contents intact', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    writeFileSync(join(dir, 'progress.json'), '{"version":2}')
    const store = createStore(dir, today)
    expect(store.getProgress().grammarAttempts).toEqual([])
    const backup = readdirSync(dir).find((f) => f.startsWith('progress.json.corrupt-'))
    expect(backup).toBeDefined()
    expect(readFileSync(join(dir, backup!), 'utf8')).toBe('{"version":2}')
    spy.mockRestore()
  })
})
