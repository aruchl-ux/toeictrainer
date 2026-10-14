import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { loadContent } from '../src/main/content'
import { privateContentRoot } from '../src/main/privateRoot'
import { PART5_TOPICS, Part5Topic, type Part5Item } from '../src/shared/types'
import { ask } from './lib/claude'
import {
  CheckResult,
  GenPart5,
  GenPart6,
  applyVerdicts,
  checkPrompt,
  guardOverlap,
  nextNumber,
  parseDraftFile,
  part5Prompt,
  part6Prompt,
  spreadPick,
  toPart5Drafts,
  toPart6Drafts
} from './lib/gen'

const CONTENT = 'content'
const DRAFTS = join(CONTENT, 'drafts')
const P5_BATCH = 10
const P6_BATCH = 3

function readDrafts(dir = DRAFTS): Record<string, unknown>[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => {
      const { items, warning } = parseDraftFile(readFileSync(join(dir, f), 'utf8'), f)
      if (warning) console.warn(warning)
      return items
    })
}

// npm keeps flags for itself unless they come after `--`, so the usage shows that form.
const USAGE = `Usage:
  npm run gen -- --part 5 --topic <topic> [--count 10] [--difficulty 3] [--style private]
  npm run gen -- --part 6 [--count 3] [--difficulty 3]
  --style private: copy the trap style of your imported questions (npm run import) without copying their text.

Part 5 topics: ${PART5_TOPICS.join(', ')}
Needs ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") or an \`ant auth login\` profile.
Drafts are written to content/drafts; review them in the app at /dev/content.`

class UsageError extends Error {}

const strings = (xs: Record<string, unknown>[], key: string): string[] =>
  xs.flatMap((x) => (typeof x[key] === 'string' ? [x[key] as string] : []))

/** Never loses generated output: if the check call fails, every item is saved flagged. */
async function selfCheck<T extends { flag?: string }>(items: T[]): Promise<T[]> {
  if (items.length === 0) return items
  try {
    const p = checkPrompt(items)
    const result = await ask(CheckResult, p.system, p.user)
    return applyVerdicts(items, result.verdicts)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn(`[self-check failed] ${message}`)
    return items.map((item) => ({ ...item, flag: `self-check failed: ${message}` }))
  }
}

function save(name: string, items: { flag?: string }[]): void {
  const file = join(DRAFTS, name)
  writeFileSync(file, JSON.stringify(items, null, 2) + '\n', 'utf8')
  const flagged = items.filter((i) => i.flag).length
  console.log(`Wrote ${items.length} drafts (${flagged} flagged) to ${file}`)
}

async function main(): Promise<void> {
  let values
  try {
    ;({ values } = parseArgs({
      options: {
        part: { type: 'string' },
        topic: { type: 'string' },
        count: { type: 'string', default: '10' },
        difficulty: { type: 'string', default: '3' },
        style: { type: 'string' }
      }
    }))
  } catch (e) {
    throw new UsageError(e instanceof Error ? e.message : String(e))
  }
  const count = Number(values.count)
  const difficulty = Number(values.difficulty)
  if (values.part !== '5' && values.part !== '6') throw new UsageError('--part must be 5 or 6')
  if (values.part === '5' && !Part5Topic.safeParse(values.topic).success) {
    throw new UsageError(values.topic ? `Unknown topic "${values.topic}"` : '--topic is required for --part 5')
  }
  if (!Number.isInteger(count) || count < 1 || count > 50) throw new UsageError('--count must be an integer from 1 to 50')
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    throw new UsageError('--difficulty must be an integer from 1 to 5')
  }
  if (values.style !== undefined && values.style !== 'private') throw new UsageError('--style must be "private"')

  const { bank } = loadContent(CONTENT)
  mkdirSync(DRAFTS, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const drafts = readDrafts()
  const known = [...bank.part5.map((i) => i.id), ...bank.part6.map((s) => s.id), ...strings(drafts, 'id')]

  if (values.part === '5') {
    const topic = Part5Topic.parse(values.topic)
    const existing = bank.part5.filter((i) => i.topic === topic)
    const styleOnly = values.style === 'private'
    let privateItems: Part5Item[] = []
    let guardRefs: { id: string; stem: string }[] = []
    if (styleOnly) {
      const privateRoot = privateContentRoot(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'))
      const loaded = loadContent(privateRoot)
      for (const e of loaded.errors) console.warn('[private pack]', e)
      privateItems = loaded.bank.part5
      const privateDrafts = readDrafts(join(privateRoot, 'drafts')).flatMap((d) =>
        typeof d.stem === 'string' ? [{ id: typeof d.id === 'string' ? d.id : 'a private draft', stem: d.stem }] : []
      )
      guardRefs = [...privateItems, ...privateDrafts]
      console.log(`Loaded ${privateItems.length} private questions and ${privateDrafts.length} private drafts as style examples and overlap guard.`)
    }
    const privateOfTopic = privateItems.filter((i) => i.topic === topic)
    if (styleOnly && privateOfTopic.length === 0) {
      throw new UsageError(`No imported questions for "${topic}" yet. Run npm run import first.`)
    }
    const examples = styleOnly ? spreadPick(privateOfTopic, 6) : (existing.length > 0 ? existing : bank.part5).slice(0, 3)
    let start = nextNumber(known.filter((id) => id.startsWith(`p5-${topic}-`)))
    const draftStems = strings(
      drafts.filter((d) => d.topic === topic && d.part === 5),
      'stem'
    )
    const generated: Part5Item[] = []
    for (let left = count, k = 1; left > 0; left -= P5_BATCH, k++) {
      const n = Math.min(P5_BATCH, left)
      const p = part5Prompt(topic, n, difficulty, examples, [...existing, ...generated].map((i) => i.stem).concat(draftStems), styleOnly)
      const { items, errors } = toPart5Drafts(await ask(GenPart5, p.system, p.user), topic, start)
      for (const e of errors) console.warn('[invalid, skipped]', e)
      const { kept, dropped } = guardOverlap(items, guardRefs)
      for (const d of dropped) console.warn('[too close to an imported question, dropped]', d)
      start += items.length
      generated.push(...kept)
      save(`part5-${topic}-${stamp}-b${k}.json`, await selfCheck(kept))
    }
  } else if (values.part === '6') {
    const examples = bank.part6.slice(0, 2)
    let start = nextNumber(known.filter((id) => id.startsWith('p6-')))
    const titles = [...bank.part6.map((s) => s.title), ...strings(drafts.filter((d) => d.part === 6), 'title')]
    for (let left = count, k = 1; left > 0; left -= P6_BATCH, k++) {
      const n = Math.min(P6_BATCH, left)
      const p = part6Prompt(n, difficulty, examples, titles)
      const { items, errors } = toPart6Drafts(await ask(GenPart6, p.system, p.user), start)
      for (const e of errors) console.warn('[invalid, skipped]', e)
      start += items.length
      titles.push(...items.map((s) => s.title))
      save(`part6-${stamp}-b${k}.json`, await selfCheck(items))
    }
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  if (err instanceof UsageError) console.error(`\n${USAGE}`)
  else if (err instanceof Error && /authentication/i.test(err.message)) {
    console.error('\nNo Claude credentials found. Set ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") and run again.')
  }
  process.exit(1)
})
