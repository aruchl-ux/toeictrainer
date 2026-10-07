/**
 * Writes a Markdown answer sheet of every approved question for human spot-checking:
 *   npx tsx scripts/answer-sheet.ts [out-file]
 * Default output: docs/content-review/answer-sheet.md
 */
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { loadContent } from '../src/main/content'
import { PART5_TOPICS } from '../src/shared/types'

const out = resolve(process.argv[2] ?? 'docs/content-review/answer-sheet.md')
const { bank, errors } = loadContent(resolve('content'))
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')
const filled = (stem: string, answer: string) => stem.replace('____', `**[${answer}]**`)
const others = (choices: string[], answer: number) => choices.filter((_, i) => i !== answer).join(' / ')

const lines: string[] = [
  '# Answer sheet',
  '',
  `${bank.part5.length} Part 5 questions and ${bank.part6.length} Part 6 passages and ${bank.part7.length} Part 7 sets. Check that each bold answer is the only correct one and the Thai explanation reads naturally. Note the id of anything wrong.`,
  ''
]

for (const topic of PART5_TOPICS) {
  const items = bank.part5.filter((i) => i.topic === topic)
  if (items.length === 0) continue
  lines.push(`## Part 5 · ${topic} (${items.length})`, '', '| id | sentence | wrong choices | tested point | คำอธิบาย |', '|---|---|---|---|---|')
  for (const i of items) {
    lines.push(
      `| ${i.id.replace(`p5-${topic}-`, '')} | ${cell(filled(i.stem, i.choices[i.answer]))} | ${cell(others(i.choices, i.answer))} | ${cell(i.trap)} | ${cell(i.explain.th)} |`
    )
  }
  lines.push('')
}

for (const set of bank.part6) {
  let n = 0
  const passage = set.passage.replace(/\{\{([1-4])\}\}/g, () => {
    const b = set.blanks[n++]
    return `**[${n}: ${b.choices[b.answer]}]**`
  })
  lines.push(`## Part 6 · ${set.id} · ${set.title}`, '', ...passage.split('\n').map((l) => `> ${l}`), '')
  lines.push('| blank | topic | wrong choices | tested point | คำอธิบาย |', '|---|---|---|---|---|')
  set.blanks.forEach((b, i) =>
    lines.push(`| ${i + 1} | ${b.topic} | ${cell(others(b.choices, b.answer))} | ${cell(b.trap)} | ${cell(b.explain.th)} |`)
  )
  lines.push('')
}

for (const set of bank.part7) {
  lines.push(`## Part 7 · ${set.id} · ${set.format}`, '')
  set.docs.forEach((d, i) => lines.push(`**Doc ${i + 1} — ${d.title}**`, '', ...d.body.split('\n').map((l) => `> ${l}`), ''))
  lines.push('| q | type | question | answer | wrong choices | evidence | คำอธิบาย |', '|---|---|---|---|---|---|---|')
  set.questions.forEach((q, i) =>
    lines.push(
      `| ${i + 1} | ${q.type} | ${cell(q.prompt)} | **${cell(q.choices[q.answer])}** | ${cell(others(q.choices, q.answer))} | ${cell(q.evidence.map((e) => `[doc ${e.doc + 1}] “${e.quote}”`).join(' '))} | ${cell(q.explain.th)} |`
    )
  )
  lines.push('')
}

mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, lines.join('\n'), 'utf8')
console.log(`wrote ${out}`)
