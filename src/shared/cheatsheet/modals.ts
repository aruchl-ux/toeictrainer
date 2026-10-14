import type { CheatSheet } from './types'

export const modals: CheatSheet = {
  topic: 'modals',
  intro: {
    en: 'A modal (can, must, should, may, might, could, would, will) is always followed by the base verb (V1), never V-ing, to V or V(s).',
    th: 'กริยาช่วยแสดงทัศนคติ (modal) เช่น can, must, should, may ต้องตามด้วยกริยารูปเดิม (V1) เสมอ ห้ามตามด้วย V-ing, to V หรือกริยาเติม s'
  },
  entries: [
    {
      id: 'modal-base-verb',
      name: { en: 'Modal + V1', th: 'modal + V1' },
      formula: ['S + modal + V1', 'S + modal + be + V3'],
      words: [
        { w: 'can', en: 'is able to', th: 'สามารถ' },
        { w: 'must', en: 'has to; it is required', th: 'ต้อง' },
        { w: 'should', en: 'it is a good idea to', th: 'ควร' },
        { w: 'may', en: 'possibly; or polite permission', th: 'อาจจะ / ได้รับอนุญาตให้' }
      ],
      use: {
        en: 'After any modal, use V1. For the passive, use modal + be + V3.',
        th: 'หลัง modal ทุกตัวใช้ V1 ถ้าเป็นรูปถูกกระทำ ใช้ modal + be + V3'
      },
      example: {
        en: 'All visitors must {{sign}} in at the front desk.',
        th: 'ผู้มาติดต่อทุกคนต้องลงชื่อที่โต๊ะต้อนรับ'
      },
      clues: ['must', 'should', 'can', 'will', 'may']
    },
    {
      id: 'modal-have-v3',
      name: { en: 'Modal + have + V3 (about the past)', th: 'modal + have + V3 (พูดถึงอดีต)' },
      formula: ['S + must/might/should/could + have + V3'],
      words: [
        { w: 'must have', en: 'I am sure it happened', th: 'ต้อง…แน่ ๆ (สรุปจากหลักฐาน)' },
        { w: 'might have', en: 'maybe it happened', th: 'อาจจะ…แล้ว' },
        { w: 'should have', en: 'it was the right thing, but it did not happen', th: 'น่าจะ… (แต่ไม่ได้ทำ)' },
        { w: 'could have', en: 'it was possible, but it did not happen', th: '…ได้ (แต่ไม่ได้ทำ)' }
      ],
      use: {
        en: 'Use modal + have + V3 for the past: a guess (must have, might have) or a regret (should have, could have).',
        th: 'ใช้ modal + have + V3 พูดถึงอดีต เป็นการเดา (must have, might have) หรือความเสียดาย (should have, could have)'
      },
      example: {
        en: 'The lights are off, so the staff {{must have}} gone home.',
        th: 'ไฟปิดหมดแล้ว พนักงานคงกลับบ้านกันไปแล้วแน่ ๆ'
      },
      clues: ['already', 'yesterday', 'last week', 'by now']
    },
    {
      id: 'modal-phrases',
      name: { en: 'Have to / be able to / used to + V1', th: 'have to / be able to / used to + V1' },
      formula: ['S + have to/be able to/used to + V1'],
      words: [
        { w: 'have to', en: 'must', th: 'ต้อง' },
        { w: 'be able to', en: 'can', th: 'สามารถ' },
        { w: 'used to', en: 'did regularly in the past, but not now', th: 'เคย… (แต่ตอนนี้ไม่แล้ว)' }
      ],
      use: {
        en: 'These phrases work like modals and take V1. Be used to + V-ing is different: it means accustomed to.',
        th: 'วลีเหล่านี้ทำงานเหมือน modal และตามด้วย V1 แต่ be used to + V-ing ต่างกัน แปลว่า คุ้นเคยกับ'
      },
      example: {
        en: 'We were not able to {{finish}} the report on time.',
        th: 'เราไม่สามารถทำรายงานเสร็จทันเวลาได้'
      },
      clues: ['be used to + V-ing', 'used to + V1']
    }
  ]
}
