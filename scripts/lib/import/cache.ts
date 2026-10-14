import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const hashOf = (x: unknown): string => createHash('sha1').update(JSON.stringify(x)).digest('hex').slice(0, 16)

/** Runs `make` once per key; later runs read the saved JSON, so finished API calls are never paid twice. */
export async function cached<T>(dir: string, key: string, make: () => Promise<T>): Promise<T> {
  const file = join(dir, `${key}.json`)
  if (existsSync(file)) {
    try {
      return JSON.parse(readFileSync(file, 'utf8')) as T
    } catch {
      // unreadable or truncated cache file: treat as a miss and recompute
    }
  }
  const value = await make()
  mkdirSync(dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8')
  renameSync(tmp, file)
  return value
}

/** Maps with at most `limit` calls in flight; results keep input order. */
export async function pool<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}
