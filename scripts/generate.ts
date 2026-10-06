import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { loadContent } from '../src/main/content'
import { Part5Topic, type Part5Item } from '../src/shared/types'
import { ask } from './lib/claude'
import {
  CheckResult,
  GenPart5,
  GenPart6,
  applyVerdicts,
  checkPrompt,
  nextNumber,
  part5Prompt,
  part6Prompt,
  toPart5Drafts,
  toPart6Drafts
} from './lib/gen'

const CONTENT = 'content'
const DRAFTS = join(CONTENT, 'drafts')
const P5_BATCH = 10
const P6_BATCH = 3

function draftIds(): string[] {
  if (!existsSync(DRAFTS)) return []
  return readdirSync(DRAFTS)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => (JSON.parse(readFileSync(join(DRAFTS, f), 'utf8')) as { id: string }[]).map((x) => x.id))
}

async function selfCheck<T extends { flag?: string }>(items: T[]): Promise<T[]> {
  if (items.length === 0) return items
  const p = checkPrompt(items)
  const result = await ask(CheckResult, p.system, p.user)
  return applyVerdicts(items, result.verdicts)
}

function save(name: string, items: { flag?: string }[]): void {
  const file = join(DRAFTS, name)
  writeFileSync(file, JSON.stringify(items, null, 2) + '\n', 'utf8')
  const flagged = items.filter((i) => i.flag).length
  console.log(`Wrote ${items.length} drafts (${flagged} flagged) to ${file}`)
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      part: { type: 'string' },
      topic: { type: 'string' },
      count: { type: 'string', default: '10' },
      difficulty: { type: 'string', default: '3' }
    }
  })
  const count = Number(values.count)
  const difficulty = Number(values.difficulty)
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new Error('--count must be an integer from 1 to 50')
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    throw new Error('--difficulty must be an integer from 1 to 5')
  }

  const { bank } = loadContent(CONTENT)
  mkdirSync(DRAFTS, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const known = [...bank.part5.map((i) => i.id), ...bank.part6.map((s) => s.id), ...draftIds()]

  if (values.part === '5') {
    const topic = Part5Topic.parse(values.topic)
    const existing = bank.part5.filter((i) => i.topic === topic)
    const examples = (existing.length > 0 ? existing : bank.part5).slice(0, 3)
    let start = nextNumber(known.filter((id) => id.startsWith(`p5-${topic}-`)))
    const generated: Part5Item[] = []
    for (let left = count, k = 1; left > 0; left -= P5_BATCH, k++) {
      const n = Math.min(P5_BATCH, left)
      const p = part5Prompt(topic, n, difficulty, examples, [...existing, ...generated].map((i) => i.stem))
      const { items, errors } = toPart5Drafts(await ask(GenPart5, p.system, p.user), topic, start)
      for (const e of errors) console.warn('[invalid, skipped]', e)
      start += items.length
      generated.push(...items)
      save(`part5-${topic}-${stamp}-b${k}.json`, await selfCheck(items))
    }
  } else if (values.part === '6') {
    const examples = bank.part6.slice(0, 2)
    let start = nextNumber(known.filter((id) => id.startsWith('p6-')))
    for (let left = count, k = 1; left > 0; left -= P6_BATCH, k++) {
      const n = Math.min(P6_BATCH, left)
      const p = part6Prompt(n, difficulty, examples)
      const { items, errors } = toPart6Drafts(await ask(GenPart6, p.system, p.user), start)
      for (const e of errors) console.warn('[invalid, skipped]', e)
      start += items.length
      save(`part6-${stamp}-b${k}.json`, await selfCheck(items))
    }
  } else {
    throw new Error('--part must be 5 or 6')
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
