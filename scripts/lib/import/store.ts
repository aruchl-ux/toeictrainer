import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { writeJsonAtomic } from '../../../src/main/jsonFile'
import type { Built } from './build'

export function appendItems(path: string, items: unknown[]): void {
  if (items.length === 0) return
  const prev = existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as unknown[]) : []
  writeJsonAtomic(path, [...prev, ...items])
}

/** Approved items go to their topic file in the private pack; flagged ones to this run's draft file. */
export function writeBuilt(outRoot: string, built: Built, draftFile: string): void {
  const byTopic = new Map<string, unknown[]>()
  for (const item of built.approved) byTopic.set(item.topic, [...(byTopic.get(item.topic) ?? []), item])
  for (const [topic, items] of byTopic) appendItems(join(outRoot, 'grammar', 'part5', `${topic}.json`), items)
  appendItems(join(outRoot, 'drafts', draftFile), built.flagged)
}

/** dedupeKey → id of every item ever written, so reruns skip them even after a draft is rejected. */
export function readLedger(path: string): Record<string, string> {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>) : {}
}

export function saveLedger(path: string, ledger: Record<string, string>): void {
  writeJsonAtomic(path, ledger)
}
