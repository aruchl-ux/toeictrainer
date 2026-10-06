import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeSync
} from 'fs'
import { dirname } from 'path'
import type { ZodType } from 'zod'

const RETRYABLE = new Set(['EPERM', 'EBUSY', 'EACCES'])
const RENAME_ATTEMPTS = 5

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

export function readJson<T>(path: string, schema: ZodType<T>, fallback: () => T): T {
  if (!existsSync(path)) return fallback()
  try {
    return schema.parse(JSON.parse(readFileSync(path, 'utf8')))
  } catch (err) {
    const backup = `${path}.corrupt-${Date.now()}`
    try {
      renameSync(path, backup)
    } catch {
      try {
        copyFileSync(path, backup)
      } catch (copyErr) {
        console.error(
          `[store] ${path} is invalid and could NOT be backed up (${String(copyErr)}); using defaults:`,
          err
        )
        return fallback()
      }
    }
    console.error(`[store] ${path} was invalid and has been backed up to ${backup}:`, err)
    return fallback()
  }
}

export function writeJsonAtomic(path: string, data: unknown): void {
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.tmp`
  try {
    const fd = openSync(tmp, 'w')
    try {
      writeSync(fd, JSON.stringify(data, null, 2) + '\n', null, 'utf8')
      fsyncSync(fd)
    } finally {
      closeSync(fd)
    }
    for (let attempt = 1; ; attempt++) {
      try {
        renameSync(tmp, path)
        return
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code
        if (attempt >= RENAME_ATTEMPTS || !code || !RETRYABLE.has(code)) throw err
        sleepSync(20 * attempt)
      }
    }
  } catch (err) {
    try {
      unlinkSync(tmp)
    } catch {
      /* temp may not exist */
    }
    throw err
  }
}
