import type { CheatSheet } from './types'

export const reducedClauses: CheatSheet = {
  topic: 'reduced-clauses',
  intro: {
    en: 'Sometimes who or which is dropped and only the verb is left. The noun does it: V-ing. It is done to the noun: V3.',
    th: 'บางทีตัด who / which ออก เหลือแค่กริยา: คำนามทำเอง ใช้ V-ing / คำนามถูกทำ ใช้ V3'
  },
  entries: [
    {
      id: 'reduced-active',
      name: { en: 'Noun + V-ing (active)', th: 'คำนาม + V-ing (ผู้ทำ)' },
      formula: ['N + V-ing + Obj'],
      use: {
        en: 'Noun + V-ing means the noun does the action. It is short for who/which + verb.',
        th: 'คำนาม + V-ing = คำนามนั้นทำเอง (ย่อมาจาก who / which + กริยา)'
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
        en: 'Noun + V3 means the action is done to the noun. No object follows.',
        th: 'คำนาม + V3 = คำนามนั้นถูกทำ และข้างหลังไม่มีกรรม'
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
        en: 'You can start with V-ing when the subject of the main part does it. Having + V3 means it was done first.',
        th: 'ขึ้นต้นด้วย V-ing ได้ ถ้าประธานของประโยคหลักเป็นคนทำ / having + V3 = ทำเสร็จก่อน'
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
        en: 'You can start with V3 when the subject of the main part has the action done to it.',
        th: 'ขึ้นต้นด้วย V3 ได้ ถ้าประธานของประโยคหลักเป็นสิ่งที่ถูกทำ'
      },
      example: {
        en: '{{Designed}} for small offices, the printer is compact and quiet.',
        th: 'เครื่องพิมพ์นี้ออกแบบมาสำหรับสำนักงานขนาดเล็ก จึงกะทัดรัดและเงียบ'
      },
      clues: ['as stated', 'as requested', 'once approved', 'unless otherwise noted']
    }
  ]
}
