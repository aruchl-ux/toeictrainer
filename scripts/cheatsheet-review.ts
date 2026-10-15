/**
 * Writes every grammar cheat sheet to Markdown for human spot-checking:
 *   npx tsx scripts/cheatsheet-review.ts [out-file]
 * Default output: docs/content-review/cheatsheet.md
 */
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { loadContent } from '../src/main/content'
import { CHEAT_SHEETS, SYMBOLS, sheetPoints, symbolsIn, uncoveredPoints } from '../src/shared/cheatsheet'
import { PART5_TOPICS } from '../src/shared/types'

const out = resolve(process.argv[2] ?? 'docs/content-review/cheatsheet.md')
const bold = (s: string) => s.replace(/\{\{([^}]+)\}\}/g, '**$1**')
const total = PART5_TOPICS.reduce((n, tp) => n + CHEAT_SHEETS[tp].entries.length, 0)

const { bank, errors } = loadContent(resolve('content'))
if (errors.length) console.warn(errors.join('\n'))

const lines: string[] = [
  '# Grammar cheat sheet',
  '',
  `${total} formulas across ${PART5_TOPICS.length} Part 5 topics. Check that each formula and example is correct English, the bold part is what the formula produces, the Thai reads naturally for a beginner, and each mistake is one Thai learners really make. "Not on any entry" lists points the drills test that only the auto list shows; fold general ones into an entry. Note the id of anything wrong.`,
  ''
]

for (const tp of PART5_TOPICS) {
  const sheet = CHEAT_SHEETS[tp]
  const points = sheetPoints(tp, bank)
  lines.push(`## ${tp}`, '', sheet.intro.en, '', sheet.intro.th, '')
  const syms = symbolsIn(sheet)
  if (syms.length) lines.push(`Symbols: ${syms.map((s) => `\`${s}\` = ${SYMBOLS[s].th}`).join(' · ')}`, '')
  for (const e of sheet.entries) {
    lines.push(`### ${e.name.en} · ${e.name.th} \`${e.id}\``, '')
    for (const f of e.formula) lines.push(`    ${f}`)
    if (e.words?.length) lines.push('', ...e.words.map((w) => `- \`${w.w}\` = ${w.th} (${w.en})`))
    lines.push('', `- ${e.use.en}`, `- ${e.use.th}`, `- ${bold(e.example.en)}`, `- ${e.example.th}`)
    lines.push(`- ✗ ${e.mistake.wrong} → ✓ ${e.mistake.right}: ${e.mistake.why.th} (${e.mistake.why.en})`)
    if (e.clues?.length) {
      lines.push(`- Clues: ${e.clues.map((c) => `${c.w} = ${c.th}`).join(' · ')}`)
    }
    lines.push('')
  }
  lines.push(`### Tested in drills (${points.length})`, '')
  for (const p of points) lines.push(`- \`${p.key}\` = ${p.th} (${p.en})${p.wrong.length ? ` · ✗ ${p.wrong.join(', ')}` : ''}`)
  const gaps = uncoveredPoints(sheet, points)
  lines.push('', `Not on any entry (${gaps.length}): ${gaps.map((p) => `\`${p.key}\``).join(', ') || 'none'}`, '')
}

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, lines.join('\n'), 'utf8')
console.log(`Wrote ${total} formulas to ${out}`)
