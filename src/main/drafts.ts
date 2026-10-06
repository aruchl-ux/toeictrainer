import { existsSync, readFileSync, readdirSync, unlinkSync } from 'fs'
import { basename, join } from 'path'
import type { DraftEntry, DraftResult } from '@shared/api'
import { Part5Item, Part6Set, formatIssues } from '@shared/types'
import { writeJsonAtomic } from './jsonFile'

type Raw = Record<string, unknown>

const draftsDir = (root: string) => join(root, 'drafts')

function safeFile(file: string): string {
  if (basename(file) !== file || !file.endsWith('.json')) throw new Error(`invalid draft file name: ${file}`)
  return file
}

function readArray(path: string): Raw[] {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Raw[]) : []
}

function removeFromDraft(root: string, file: string, id: string): void {
  const path = join(draftsDir(root), safeFile(file))
  const rest = readArray(path).filter((x) => x.id !== id)
  if (rest.length === 0) {
    if (existsSync(path)) unlinkSync(path)
  } else {
    writeJsonAtomic(path, rest)
  }
}

export function listDrafts(root: string): DraftEntry[] {
  const dir = draftsDir(root)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((file) => readArray(join(dir, file)).map((item) => ({ file, id: String(item.id), item })))
}

export function approveDraft(root: string, file: string, id: string, edited: unknown): DraftResult {
  safeFile(file)
  if (typeof edited !== 'object' || edited === null) return { ok: false, error: 'item must be an object' }
  const candidate = { ...(edited as Raw), status: 'approved', flag: undefined }

  let parsedId: string
  let target: string
  let data: unknown
  if (id.startsWith('p5-')) {
    const r = Part5Item.safeParse(candidate)
    if (!r.success) return { ok: false, error: formatIssues(r.error) }
    parsedId = r.data.id
    target = join(root, 'grammar', 'part5', `${r.data.topic}.json`)
    data = r.data
  } else if (id.startsWith('p6-')) {
    const r = Part6Set.safeParse(candidate)
    if (!r.success) return { ok: false, error: formatIssues(r.error) }
    parsedId = r.data.id
    target = join(root, 'grammar', 'part6', 'sets.json')
    data = r.data
  } else {
    return { ok: false, error: `unknown id prefix: ${id}` }
  }
  if (parsedId !== id) return { ok: false, error: 'id must not be changed' }

  const existing = readArray(target)
  if (existing.some((x) => x.id === id)) return { ok: false, error: `${id} already exists in ${basename(target)}` }
  writeJsonAtomic(target, [...existing, data])
  removeFromDraft(root, file, id)
  return { ok: true }
}

export function rejectDraft(root: string, file: string, id: string): void {
  removeFromDraft(root, file, id)
}
