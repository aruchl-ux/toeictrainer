import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { privateContentRoot } from '../src/main/privateRoot'
import { ask } from './lib/claude'
import { chunk, pageNumbers, parsePages } from './lib/import/args'
import { buildItems, makeNumberer } from './lib/import/build'
import { cached, hashOf, pool } from './lib/import/cache'
import { cleanItem, dedupe, dedupeKey, problemOf, type ExtractedItem } from './lib/import/normalize'
import { findPdftotext, forgetPdf, pageCount, pageText, singlePagePdf } from './lib/import/pdf'
import { BlindResult, ExtractResult, SolveResult, blindPrompt, extractSystem, solvePrompt } from './lib/import/prompts'
import { readLedger, saveLedger, writeBuilt } from './lib/import/store'

const SOURCE_DIR = 'toeic_source'
const WORK = 'content-private-work'
// Scanned simulation books and the garbled-Thai booklet need OCR (a later sub-project).
const SKIP = /^(sim|toeic-korea)/i
const BATCH = 10
const MIN_TEXT = 40

const USAGE = `Usage:
  npm run import -- [--file UNIT_1.pdf [--pages 3-10]] [--dry-run] [--concurrency 4] [--out <folder>]

Reads ${SOURCE_DIR}/*.pdf, extracts Part 5 questions, has Claude answer, explain and re-check them,
and writes them to your private pack (default %APPDATA%\\toeic-trainer\\private-content).
Agreed items are approved; the rest wait in Content review (npm run dev → Content review).
Finished work is cached in ${WORK}/, so a rerun only pays for what is new.
Needs ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") or an \`ant auth login\` profile.`

class UsageError extends Error {}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e))
const pageKey = (file: string, page: number) => `${file}/p${String(page).padStart(4, '0')}`

interface PageResult {
  file: string
  page: number
  kind: 'part5' | 'other'
  items: ExtractedItem[]
  broken: { item: ExtractedItem; problem: string }[]
}

async function extractPage(bin: string, dir: string, file: string, page: number): Promise<PageResult> {
  const path = join(dir, file)
  const text = pageText(bin, path, page)
  const fromText =
    text.trim().length < MIN_TEXT
      ? null
      : await cached(join(WORK, 'extract'), pageKey(file, page), () =>
          ask(ExtractResult, extractSystem, text, { effort: 'medium' })
        )
  const bad = (r: ExtractResult | null) =>
    r === null || (r.pageKind === 'part5' && (r.items.length === 0 || r.items.some((i) => problemOf(cleanItem(i)))))
  // Pages with little text (scans) or broken questions are read again from the page image.
  const res = bad(fromText)
    ? await cached(join(WORK, 'extract-vision'), pageKey(file, page), async () =>
        ask(
          ExtractResult,
          extractSystem,
          [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: await singlePagePdf(path, page) }
            },
            { type: 'text', text: 'Extract the Part 5 questions on this PDF page.' }
          ],
          { effort: 'medium' }
        )
      )
    : (fromText as ExtractResult)
  const items = res.pageKind === 'part5' ? res.items.map(cleanItem) : []
  return {
    file,
    page,
    kind: res.pageKind,
    items: items.filter((i) => !problemOf(i)),
    broken: items.flatMap((i) => {
      const problem = problemOf(i)
      return problem ? [{ item: i, problem }] : []
    })
  }
}

async function main(): Promise<void> {
  let values
  try {
    ;({ values } = parseArgs({
      options: {
        file: { type: 'string' },
        pages: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
        concurrency: { type: 'string', default: '4' },
        out: { type: 'string' },
        help: { type: 'boolean', default: false }
      }
    }))
  } catch (e) {
    throw new UsageError(message(e))
  }
  if (values.help) {
    console.log(USAGE)
    return
  }
  const concurrency = Number(values.concurrency)
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) {
    throw new UsageError('--concurrency must be an integer from 1 to 16')
  }
  if (values.pages && !values.file) throw new UsageError('--pages needs --file')
  let range: ReturnType<typeof parsePages>
  try {
    range = parsePages(values.pages)
  } catch (e) {
    throw new UsageError(message(e))
  }

  const bin = findPdftotext()
  const out = values.out ?? privateContentRoot(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'))
  let files = readdirSync(SOURCE_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort()
  if (values.file) {
    if (!files.includes(values.file)) throw new UsageError(`No ${values.file} in ${SOURCE_DIR}/`)
    files = [values.file]
  } else {
    const skipped = files.filter((f) => SKIP.test(f))
    if (skipped.length) console.log(`Skipping (need OCR): ${skipped.join(', ')}`)
    files = files.filter((f) => !SKIP.test(f))
  }

  // 1. Extract, file by file (big books are parsed once and then freed).
  const pages: PageResult[] = []
  for (const file of files) {
    const path = join(SOURCE_DIR, file)
    const count = await cached(join(WORK, 'pages'), file, () => pageCount(path))
    const nums = pageNumbers(count, range)
    if (values['dry-run']) {
      const chars = nums.reduce((n, p) => n + pageText(bin, path, p).trim().length, 0)
      const scans = nums.filter((p) => pageText(bin, path, p).trim().length < MIN_TEXT).length
      console.log(`${file}: ${nums.length} pages, ${chars} characters of text, ${scans} pages need the image read`)
      forgetPdf(path)
      continue
    }
    console.log(`${file}: reading ${nums.length} pages…`)
    const results = await pool(nums, concurrency, (p) =>
      extractPage(bin, SOURCE_DIR, file, p).catch((e) => {
        console.warn(`[extract failed] ${file} p.${p}: ${message(e)}`)
        return null
      })
    )
    pages.push(...results.filter((r): r is PageResult => r !== null))
    forgetPdf(path)
  }
  if (values['dry-run']) {
    console.log('\nDry run: no API calls made. Run without --dry-run to import.')
    return
  }
  mkdirSync(WORK, { recursive: true })
  writeFileSync(
    join(WORK, 'skipped-pages.json'),
    JSON.stringify(pages.filter((p) => p.kind === 'other').map((p) => ({ file: p.file, page: p.page })), null, 2)
  )
  const broken = pages.flatMap((p) => p.broken.map((b) => ({ file: p.file, page: p.page, ...b })))
  writeFileSync(join(WORK, 'broken.json'), JSON.stringify(broken, null, 2))

  // 2. Dedupe and drop anything written by an earlier run.
  const ledgerFile = join(WORK, 'ledger.json')
  const ledger = readLedger(ledgerFile)
  const raws = dedupe(pages).filter((r) => !(dedupeKey(r) in ledger))
  console.log(`\n${pages.reduce((n, p) => n + p.items.length, 0)} questions read, ${raws.length} new after removing duplicates.`)

  // 3–5. Solve, blind re-check, write.
  const nextId = makeNumberer(Object.values(ledger))
  const draftFile = `import-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  const totals = { approved: 0, flagged: 0, invalid: 0, failed: 0 }
  const batches = chunk(raws, BATCH)
  await pool(batches, concurrency, async (batch, b) => {
    const key = hashOf(batch.map(dedupeKey))
    const view = batch.map((r, index) => ({ index, stem: r.stem, choices: r.choices }))
    try {
      const sp = solvePrompt(view)
      const solved = await cached(join(WORK, 'solve'), key, () => ask(SolveResult, sp.system, sp.user))
      const bp = blindPrompt(view)
      const blind = await cached(join(WORK, 'check'), key, () => ask(BlindResult, bp.system, bp.user))
      const built = buildItems(batch, solved.items, blind.items, nextId)
      for (const e of built.errors) console.warn('[invalid, skipped]', e)
      writeBuilt(out, built, draftFile)
      for (const item of [...built.approved, ...built.flagged]) ledger[dedupeKey(item)] = item.id
      saveLedger(ledgerFile, ledger)
      totals.approved += built.approved.length
      totals.flagged += built.flagged.length
      totals.invalid += built.errors.length
      console.log(`batch ${b + 1}/${batches.length}: ${built.approved.length} approved, ${built.flagged.length} flagged`)
    } catch (e) {
      totals.failed += batch.length
      console.warn(`[batch ${b + 1} failed, rerun to retry] ${message(e)}`)
    }
  })

  console.log(`\nDone. ${totals.approved} approved, ${totals.flagged} flagged for review, ${totals.invalid} invalid, ${totals.failed} failed.`)
  console.log(`Private pack: ${out}`)
  if (broken.length) console.log(`${broken.length} questions could not be read cleanly; see ${join(WORK, 'broken.json')}.`)
  if (totals.flagged) console.log('Review flagged items: npm run dev → Content review.')
}

main().catch((err: unknown) => {
  console.error(message(err))
  if (err instanceof UsageError) console.error(`\n${USAGE}`)
  else if (err instanceof Error && /authentication/i.test(err.message)) {
    console.error('\nNo Claude credentials found. Set ANTHROPIC_API_KEY (PowerShell: $env:ANTHROPIC_API_KEY = "sk-ant-...") and run again.')
  }
  process.exit(1)
})
