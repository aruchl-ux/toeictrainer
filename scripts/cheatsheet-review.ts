/**
 * Writes every grammar cheat sheet to Markdown for human spot-checking:
 *   npx tsx scripts/cheatsheet-review.ts [out-file]
 * Default output: docs/content-review/cheatsheet.md
 */
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { CHEAT_SHEETS } from '../src/shared/cheatsheet'
import { PART5_TOPICS } from '../src/shared/types'

const out = resolve(process.argv[2] ?? 'docs/content-review/cheatsheet.md')
const bold = (s: string) => s.replace(/\{\{([^}]+)\}\}/g, '**$1**')
const total = PART5_TOPICS.reduce((n, tp) => n + CHEAT_SHEETS[tp].entries.length, 0)

const lines: string[] = [
  '# Grammar cheat sheet',
  '',
  `${total} formulas across ${PART5_TOPICS.length} Part 5 topics. Check that each formula and example is correct English, the bold part is what the formula produces, and the Thai reads naturally. Note the id of anything wrong.`,
  ''
]

for (const tp of PART5_TOPICS) {
  const sheet = CHEAT_SHEETS[tp]
  lines.push(`## ${tp}`, '', sheet.intro.en, '', sheet.intro.th, '')
  for (const e of sheet.entries) {
    lines.push(`### ${e.name.en} · ${e.name.th} \`${e.id}\``, '')
    for (const f of e.formula) lines.push(`    ${f}`)
    if (e.words?.length) lines.push('', ...e.words.map((w) => `- \`${w.w}\` = ${w.th} (${w.en})`))
    lines.push('', `- ${e.use.en}`, `- ${e.use.th}`, `- ${bold(e.example.en)}`, `- ${e.example.th}`)
    if (e.clues?.length) lines.push(`- Clues: ${e.clues.join(' · ')}`)
    lines.push('')
  }
}

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, lines.join('\n'), 'utf8')
console.log(`Wrote ${total} formulas to ${out}`)
