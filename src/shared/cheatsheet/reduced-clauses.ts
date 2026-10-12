import type { CheatSheet } from './types'

export const reducedClauses: CheatSheet = {
  topic: 'reduced-clauses',
  intro: {
    en: 'A clause can drop its relative word or subject and keep only a participle. Choose V-ing if the noun does the action, V3 if it receives it.',
    th: 'ประโยคย่อยลดรูปได้โดยตัดคำเชื่อมหรือประธานออก เหลือแค่ participle ใช้ V-ing ถ้าคำนามเป็นผู้ทำ ใช้ V3 ถ้าคำนามเป็นผู้ถูกกระทำ'
  },
  entries: [
    {
      id: 'reduced-active',
      name: { en: 'Noun + V-ing (active)', th: 'คำนาม + V-ing (ผู้ทำ)' },
      formula: ['N + V-ing + Obj'],
      use: {
        en: 'Short for "who/which + verb". The noun does the action.',
        th: 'ลดรูปมาจาก "who/which + กริยา" คำนามเป็นผู้ทำ'
      },
      example: {
        en: 'Passengers {{traveling}} with pets must notify the airline.',
        th: 'ผู้โดยสารที่เดินทางพร้อมสัตว์เลี้ยงต้องแจ้งสายการบิน'
      },
      clues: ['noun + ___ + object']
    },
    {
      id: 'reduced-passive',
      name: { en: 'Noun + V3 (passive)', th: 'คำนาม + V3 (ผู้ถูกกระทำ)' },
      formula: ['N + V3 + Prep + N'],
      use: {
        en: 'Short for "which/who + be + V3". The noun receives the action, and there is no object after the participle.',
        th: 'ลดรูปมาจาก "which/who + be + V3" คำนามเป็นผู้ถูกกระทำ และไม่มีกรรมตามหลัง participle'
      },
      example: {
        en: 'The report {{submitted}} yesterday contained several errors.',
        th: 'รายงานที่ส่งมาเมื่อวานมีข้อผิดพลาดหลายจุด'
      },
      clues: ['noun + ___ + by/in/on…', 'no object after the blank']
    },
    {
      id: 'participle-clause-active',
      name: { en: 'Opening V-ing clause', th: 'ขึ้นต้นประโยคด้วย V-ing' },
      formula: ['V-ing + Obj, S + V', 'after/before/when/while + V-ing, S + V'],
      use: {
        en: 'The subject of the main clause does the V-ing action. Having + V3 shows it happened first.',
        th: 'ประธานของประโยคหลักเป็นผู้ทำ V-ing ด้วย ถ้าใช้ having + V3 แปลว่าเกิดขึ้นก่อน'
      },
      example: {
        en: '{{Having reviewed}} the proposal, the director approved it.',
        th: 'หลังจากตรวจข้อเสนอแล้ว ผู้อำนวยการก็อนุมัติ'
      }
    },
    {
      id: 'participle-clause-passive',
      name: { en: 'Opening V3 clause', th: 'ขึ้นต้นประโยคด้วย V3' },
      formula: ['V3 + Prep + N, S + V', 'once/if/unless/as + V3, S + V'],
      use: {
        en: 'The subject of the main clause receives the V3 action.',
        th: 'ประธานของประโยคหลักเป็นผู้ถูกกระทำตาม V3'
      },
      example: {
        en: '{{Designed}} for small offices, the printer is compact and quiet.',
        th: 'เครื่องพิมพ์นี้ออกแบบมาสำหรับสำนักงานขนาดเล็ก จึงกะทัดรัดและเงียบ'
      },
      clues: ['as stated', 'as requested', 'once approved', 'unless otherwise noted']
    }
  ]
}
