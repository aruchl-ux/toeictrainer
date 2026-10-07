/**
 * Stricter checks than the schema, for hand- or AI-written content:
 *   npx tsx scripts/check-content.ts
 * Reports problems a learner would hit; exits 1 if any are found.
 */
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { loadContent } from '../src/main/content'

const ROOT = resolve('content')
const problems: string[] = []
const { bank, errors } = loadContent(ROOT)
problems.push(...errors)

// Explanations are shown with shuffled choices, so they must never point at a choice by position.
const POSITIONAL = /\(\s*[A-D]\s*\)|\b(?:option|choice|answer)\s+[A-D]\b|ตัวเลือก(?:ที่)?\s*[A-Dก-ง1-4]|\b(?:first|second|third|fourth|last)\s+(?:option|choice)\b/i

function checkChoices(where: string, choices: string[], answer: number, explain: { en: string; th: string }, trap: string): void {
  const norm = choices.map((c) => c.trim().toLowerCase())
  if (new Set(norm).size !== norm.length) problems.push(`${where}: duplicate choices ${JSON.stringify(choices)}`)
  if (answer < 0 || answer >= choices.length) problems.push(`${where}: answer out of range`)
  for (const [lang, text] of Object.entries(explain)) {
    if (POSITIONAL.test(text)) problems.push(`${where}: ${lang} explanation refers to a choice by position`)
    if (text.trim().length < 30) problems.push(`${where}: ${lang} explanation is too short`)
  }
  if (!/[฀-๿]/.test(explain.th)) problems.push(`${where}: th explanation has no Thai text`)
  if (!where.startsWith('p7-') && !explain.en.toLowerCase().includes(choices[answer].toLowerCase().split(' ')[0]) && choices[answer].length < 40) {
    problems.push(`${where}: en explanation never mentions the correct answer "${choices[answer]}"`)
  }
  if (POSITIONAL.test(trap)) problems.push(`${where}: trap refers to a choice by position`)
}

for (const item of bank.part5) {
  const blanks = item.stem.split('____').length - 1
  if (blanks !== 1) problems.push(`${item.id}: stem must contain exactly one ____ (has ${blanks})`)
  checkChoices(item.id, item.choices, item.answer, item.explain, item.trap)
}
for (const set of bank.part6) {
  set.blanks.forEach((b, i) => checkChoices(`${set.id}#${i + 1}`, b.choices, b.answer, b.explain, b.trap))
}
for (const set of bank.part7) {
  set.questions.forEach((q, i) => {
    const where = `${set.id}#q${i + 1}`
    // Part 7 has no trap label; pass the prompt so the positional ban still applies to it.
    checkChoices(where, q.choices, q.answer, q.explain, q.prompt)
    if (/\b(?:choice|option)\s+[A-D]\b/i.test(q.prompt)) problems.push(`${where}: prompt refers to a choice by letter`)
  })
  const words = set.docs.reduce((n, d) => n + d.body.split(/\s+/).filter(Boolean).length, 0)
  if (words < 60) problems.push(`${set.id}: passages are too short (${words} words)`)
}
console.log(`Part 7: ${bank.part7.length} sets`, {
  single: bank.part7.filter((s) => s.format === 'single').length,
  double: bank.part7.filter((s) => s.format === 'double').length,
  triple: bank.part7.filter((s) => s.format === 'triple').length
})

// Duplicate stems across the whole bank.
const stems = new Map<string, string>()
for (const item of bank.part5) {
  const key = item.stem.toLowerCase().replace(/\s+/g, ' ').trim()
  const prev = stems.get(key)
  if (prev) problems.push(`${item.id}: same stem as ${prev}`)
  stems.set(key, item.id)
}

// Ids must be sequential per topic file so future additions do not collide.
const dir = join(ROOT, 'grammar', 'part5')
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const items = JSON.parse(readFileSync(join(dir, file), 'utf8')) as { id: string }[]
  items.forEach((it, i) => {
    const n = Number(it.id.slice(-4))
    if (n !== i + 1) problems.push(`${file}: id ${it.id} at position ${i + 1} is out of sequence`)
  })
}

const counts = new Map<string, number>()
for (const item of bank.part5) counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1)
console.log(`Part 5: ${bank.part5.length} items`, Object.fromEntries([...counts].sort()))
console.log(`Part 6: ${bank.part6.length} sets`)
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`)
  for (const p of problems) console.log(` - ${p}`)
  process.exit(1)
}
console.log('OK: no problems found')
