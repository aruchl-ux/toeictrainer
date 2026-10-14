import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { writeJsonAtomic } from '../../../src/main/jsonFile'
import type { Built } from './build'

const readArray = (path: string): unknown[] => (existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as unknown[]) : [])

/** Approved items go to their topic file in the private pack; flagged ones to this run's draft file.
 *  Every target is read and parsed first, so a corrupt file throws before anything is written. */
export function writeBuilt(outRoot: string, built: Built, draftFile: string): void {
  const byTopic = new Map<string, unknown[]>()
  for (const item of built.approved) byTopic.set(item.topic, [...(byTopic.get(item.topic) ?? []), item])
  const targets = [...byTopic].map(([topic, items]) => ({ path: join(outRoot, 'grammar', 'part5', `${topic}.json`), items }))
  if (built.flagged.length) targets.push({ path: join(outRoot, 'drafts', draftFile), items: built.flagged })
  const loaded = targets.map((t) => ({ ...t, prev: readArray(t.path) }))
  for (const t of loaded) writeJsonAtomic(t.path, [...t.prev, ...t.items])
}

/** Every item id already in the private pack (topic files and drafts); missing folders count as none. */
export function packIds(outRoot: string): string[] {
  const ids: string[] = []
  for (const dir of [join(outRoot, 'grammar', 'part5'), join(outRoot, 'drafts')]) {
    if (!existsSync(dir)) continue
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
      for (const it of readArray(join(dir, f))) {
        const id = (it as { id?: unknown } | null)?.id
        if (typeof id === 'string') ids.push(id)
      }
    }
  }
  return ids
}

/** dedupeKey → id of every item ever written, so reruns skip them even after a draft is rejected. */
export function readLedger(path: string): Record<string, string> {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>) : {}
}

export function saveLedger(path: string, ledger: Record<string, string>): void {
  writeJsonAtomic(path, ledger)
}
