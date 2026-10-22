import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import type { ZodType } from 'zod'
import { resolveIds } from '@shared/quiz'
import { Exam, Part5Item, Part6Set, Part7Set, formatIssues, type ContentBank } from '@shared/types'

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

/** Loads the bundled content, then the private pack if given; ids must be unique across both. */
export function loadContent(root: string, privateRoot?: string): LoadResult {
  const errors: string[] = []
  const seen = new Set<string>()
  const roots = privateRoot ? [root, privateRoot] : [root]
  const part5 = roots.flatMap((r) => collect(join(r, 'grammar', 'part5'), Part5Item, errors, seen))
  const part6 = roots.flatMap((r) => collect(join(r, 'grammar', 'part6'), Part6Set, errors, seen))
  const part7 = roots.flatMap((r) => collect(join(r, 'reading', 'part7'), Part7Set, errors, seen))
  const bank: ContentBank = { part5, part6, part7 }
  // An exam with a question that did not load would run short, so it is left out.
  const exams = roots.flatMap((r) => collect(join(r, 'exams'), Exam, errors, seen))
  bank.exams = exams.filter((exam) => {
    const found = resolveIds(bank, exam.ids).length
    if (found !== exam.ids.length) errors.push(`exam ${exam.id}: ${exam.ids.length - found} question(s) not found`)
    return found === exam.ids.length
  })
  return { bank, errors }
}
