/**
 * Adds a cheat-sheet point to every question and Part 6 blank that has none:
 *   npm run points                         shipped content
 *   npm run points -- --topic collocations one topic
 *   npm run points -- --private            the private pack
 * Rerunning only fills what is still missing.
 * Needs ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") or an `ant auth login` profile.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { privateContentRoot } from '../src/main/privateRoot'
import { Part5Topic, type Point } from '../src/shared/types'
import { ask } from './lib/claude'
import { chunk } from './lib/import/args'
import { PointResult, applyPoints, findTargets, formatLike, pointPrompt, toPoint, type ContentFile, type PointTarget } from './lib/points'

function parseArgs(argv: string[]): { topic?: Part5Topic; private: boolean } {
  const out: { topic?: Part5Topic; private: boolean } = { private: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--private') out.private = true
    else if (argv[i] === '--topic') {
      const r = Part5Topic.safeParse(argv[++i])
      if (!r.success) throw new Error(`--topic must be a Part 5 topic (got "${argv[i]}")`)
      out.topic = r.data
    } else throw new Error(`unknown argument "${argv[i]}"`)
  }
  return out
}

const jsonIn = (dir: string): string[] =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f)) : []

function readFiles(root: string): ContentFile[] {
  return [...jsonIn(join(root, 'grammar', 'part5')), ...jsonIn(join(root, 'grammar', 'part6'))].map((path) => {
    // Strip CR so a CRLF checkout (core.autocrlf) keeps its layout when rewritten.
    const text = readFileSync(path, 'utf8').replace(/\r/g, '')
    return { path, text, data: JSON.parse(text) as unknown[] }
  })
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const root = args.private ? privateContentRoot(process.env.APPDATA ?? '') : resolve('content')
  const files = readFiles(root)
  const targets = findTargets(files, args.topic)
  console.log(`${targets.length} questions need a point in ${root}`)

  const byTopic = new Map<Part5Topic, PointTarget[]>()
  for (const t of targets) byTopic.set(t.topic, [...(byTopic.get(t.topic) ?? []), t])

  let done = 0
  let failed = 0
  for (const [topic, list] of byTopic) {
    for (const batch of chunk(list, 10)) {
      const p = pointPrompt(topic, batch)
      const res = await ask(PointResult, p.system, p.user, { effort: 'medium' })
      const points = new Map<string, Point>()
      batch.forEach((t, i) => {
        const r = res.points.find((x) => x.index === i)
        const point = r ? toPoint(r) : null
        if (point) points.set(t.ref, point)
        else {
          failed++
          console.warn(`  ${t.ref}: no valid point returned; rerun to retry`)
        }
      })
      // Write each touched file now, so a crash or Ctrl+C keeps what is done.
      for (const path of new Set(batch.map((t) => t.file))) {
        const f = files.find((x) => x.path === path)!
        f.data = applyPoints(f.data, points)
        writeFileSync(path, formatLike(f.text, f.data), 'utf8')
      }
      done += points.size
      console.log(`${topic}: ${done}/${targets.length}`)
    }
  }
  console.log(`\nDone. ${done} points written, ${failed} failed.`)
  if (failed) process.exitCode = 1
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  if (err instanceof Error && /authentication/i.test(err.message)) {
    console.error('\nNo Claude credentials found. Set ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") and run again.')
  }
  process.exit(1)
})
