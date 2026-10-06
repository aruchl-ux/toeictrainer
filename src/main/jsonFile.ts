import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import type { ZodType } from 'zod'

export function readJson<T>(path: string, schema: ZodType<T>, fallback: () => T): T {
  if (!existsSync(path)) return fallback()
  try {
    return schema.parse(JSON.parse(readFileSync(path, 'utf8')))
  } catch (err) {
    const backup = `${path}.corrupt-${Date.now()}`
    renameSync(path, backup)
    console.error(`[store] ${path} was invalid and has been moved to ${backup}:`, err)
    return fallback()
  }
}

export function writeJsonAtomic(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.tmp`
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  renameSync(tmp, path)
}
