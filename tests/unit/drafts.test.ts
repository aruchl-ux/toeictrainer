import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'
import { approveDraft, listDrafts, rejectDraft } from '../../src/main/drafts'
import { makePart5, makePart6 } from '../fixtures/items'

let root: string
const draftFile = 'part5-word-form-x.json'
const readJson = (rel: string) => JSON.parse(readFileSync(join(root, rel), 'utf8'))

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'toeic-drafts-'))
  mkdirSync(join(root, 'drafts'))
})

describe('drafts', () => {
  it('lists draft items with their file', () => {
    const a = makePart5({ status: 'draft' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a]))
    expect(listDrafts(root)).toEqual([{ file: draftFile, id: a.id, item: a }])
  })

  it('approves a Part 5 draft into its topic file and deletes the empty draft file', () => {
    const a = makePart5({ status: 'draft', flag: 'check me' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a]))
    expect(approveDraft(root, draftFile, a.id, a)).toEqual({ ok: true })
    const saved = readJson('grammar/part5/word-form.json')
    expect(saved).toHaveLength(1)
    expect(saved[0].status).toBe('approved')
    expect(saved[0].flag).toBeUndefined()
    expect(existsSync(join(root, 'drafts', draftFile))).toBe(false)
  })

  it('approves a Part 6 draft into sets.json and keeps the other drafts', () => {
    const s1 = makePart6({ status: 'draft' })
    const s2 = makePart6({ status: 'draft' })
    writeFileSync(join(root, 'drafts', 'part6-x.json'), JSON.stringify([s1, s2]))
    expect(approveDraft(root, 'part6-x.json', s1.id, s1)).toEqual({ ok: true })
    expect(readJson('grammar/part6/sets.json')).toHaveLength(1)
    expect(readJson('drafts/part6-x.json').map((x: { id: string }) => x.id)).toEqual([s2.id])
  })

  it('rejects an invalid edit and leaves files unchanged', () => {
    const a = makePart5({ status: 'draft' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a]))
    const r = approveDraft(root, draftFile, a.id, { ...a, choices: ['only one'] })
    expect(r.ok).toBe(false)
    expect(existsSync(join(root, 'grammar/part5/word-form.json'))).toBe(false)
    expect(readJson(`drafts/${draftFile}`)).toHaveLength(1)
  })

  it('refuses to change the id', () => {
    const a = makePart5({ status: 'draft' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a]))
    const r = approveDraft(root, draftFile, a.id, { ...a, id: 'p5-word-form-9999' })
    expect(r).toEqual({ ok: false, error: 'id must not be changed' })
  })

  it('rejectDraft removes the item', () => {
    const a = makePart5({ status: 'draft' })
    const b = makePart5({ status: 'draft' })
    writeFileSync(join(root, 'drafts', draftFile), JSON.stringify([a, b]))
    rejectDraft(root, draftFile, a.id)
    expect(readJson(`drafts/${draftFile}`).map((x: { id: string }) => x.id)).toEqual([b.id])
  })

  it('refuses file names outside the drafts folder', () => {
    expect(() => rejectDraft(root, '../grammar/x.json', 'p5-word-form-0001')).toThrow(/invalid draft file/)
  })
})
