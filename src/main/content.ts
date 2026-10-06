import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { ZodType } from 'zod'
import { Part5Item, Part6Set, formatIssues, type ContentBank } from '@shared/types'

export interface LoadResult {
  bank: ContentBank
  errors: string[]
}

function collect<T extends { id: string; status: string }>(
  dir: string,
  schema: ZodType<T>,
  errors: string[],
  seen: Set<string>
): T[] {
  if (!existsSync(dir)) return []
  const out: T[] = []
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const path = join(dir, file)
    let raw: unknown
    try {
      raw = JSON.parse(readFileSync(path, 'utf8'))
    } catch (err) {
      errors.push(`${path}: invalid JSON (${(err as Error).message})`)
      continue
    }
    if (!Array.isArray(raw)) {
      errors.push(`${path}: expected an array`)
      continue
    }
    raw.forEach((entry, i) => {
      const r = schema.safeParse(entry)
      if (!r.success) {
        errors.push(`${path}#${i}: ${formatIssues(r.error)}`)
        return
      }
      if (seen.has(r.data.id)) {
        errors.push(`${path}#${i}: duplicate id ${r.data.id}`)
        return
      }
      seen.add(r.data.id)
      if (r.data.status === 'approved') out.push(r.data)
    })
  }
  return out
}

export function loadContent(root: string): LoadResult {
  const errors: string[] = []
  const seen = new Set<string>()
  const part5 = collect(join(root, 'grammar', 'part5'), Part5Item, errors, seen)
  const part6 = collect(join(root, 'grammar', 'part6'), Part6Set, errors, seen)
  return { bank: { part5, part6 }, errors }
}
