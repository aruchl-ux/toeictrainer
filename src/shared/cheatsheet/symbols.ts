import type { Explain } from '../types'
import { formulaParts } from './types'
import type { CheatSheet } from './types'

/** Every symbol a formula may use, explained once for beginners. Order is the order of the key. */
export const SYMBOLS: Record<string, Explain> = {
  S: { en: 'subject', th: 'ประธาน' },
  V: { en: 'verb', th: 'คำกริยา' },
  V1: { en: 'base verb (go, make)', th: 'กริยาช่อง 1 รูปเดิม (go, make)' },
  V2: { en: 'past simple verb (went, made)', th: 'กริยาช่อง 2 (went, made)' },
  V3: { en: 'past participle (gone, made)', th: 'กริยาช่อง 3 (gone, made)' },
  'V-ing': { en: 'verb + ing (going)', th: 'กริยาเติม -ing (going)' },
  'V-ed': { en: 'verb + ed (worked)', th: 'กริยาเติม -ed (worked)' },
  Obj: { en: 'object', th: 'กรรม (สิ่งที่ถูกกระทำ)' },
  N: { en: 'noun', th: 'คำนาม' },
  NP: { en: 'noun phrase (the new office)', th: 'กลุ่มคำนาม (the new office)' },
  Adj: { en: 'adjective', th: 'คำคุณศัพท์ (บอกลักษณะของคำนาม)' },
  Adv: { en: 'adverb', th: 'คำกริยาวิเศษณ์ (ขยายกริยาหรือคุณศัพท์)' },
  Clause: { en: 'clause (subject + verb)', th: 'อนุประโยค (มีประธาน + กริยา)' },
  Prep: { en: 'preposition (in, on, for)', th: 'คำบุพบท (in, on, for)' },
  Pron: { en: 'pronoun (he, it, they)', th: 'คำสรรพนาม (he, it, they)' },
  Det: { en: 'determiner (a, the, each)', th: 'คำนำหน้านาม (a, the, each)' }
}

const TOKEN = /\b(S|V1|V2|V3|V-ing|V-ed|V|Obj|NP|N|Adj|Adv|Clause|Prep|Pron|Det)(?=\d|\b|\()(?![a-z])/g

/** The symbols a sheet's formulas use, in key order; "S2" counts as S and "to V1" as V1. */
export function symbolsIn(sheet: CheatSheet): string[] {
  const found = new Set<string>()
  for (const e of sheet.entries)
    for (const line of e.formula)
      for (const p of formulaParts(line)) for (const m of p.text.matchAll(TOKEN)) found.add(m[1])
  return Object.keys(SYMBOLS).filter((s) => found.has(s))
}
