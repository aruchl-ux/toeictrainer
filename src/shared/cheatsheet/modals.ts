import type { CheatSheet } from './types'

export const modals: CheatSheet = {
  topic: 'modals',
  intro: {
    en: 'Two kinds of question. If the blank comes after can, must, should or may, pick the base verb (sign, not signs, signing or to sign). If the choices are different modals, pick by meaning: must = has to, may = possibly.',
    th: 'ข้อสอบมี 2 แบบ ถ้าช่องว่างอยู่หลังกริยาช่วย (can, must, should, may) ให้เลือกกริยารูปเดิม เช่น sign ไม่ใช่ signs, signing, to sign ถ้าตัวเลือกเป็นกริยาช่วยต่างตัว ให้เลือกตามความหมาย เช่น must = ต้อง, may = อาจจะ'
  },
  entries: [
    {
      id: 'modal-base-verb',
      name: { en: 'Modal + V1', th: 'กริยาช่วย + กริยารูปเดิม (modal + V1)' },
      formula: ['S + modal + V1', 'S + modal + be + V3'],
      words: [
        { w: 'can', en: 'is able to', th: 'สามารถ' },
        { w: 'must', en: 'has to; it is required', th: 'ต้อง' },
        { w: 'should', en: 'it is a good idea to', th: 'ควร' },
        { w: 'may', en: 'possibly; or polite permission', th: 'อาจจะ / ได้รับอนุญาตให้' }
      ],
      use: {
        en: 'After any modal, use V1 with nothing added: no -s, no -ing, no to. For something done to the subject, use modal + be + V3.',
        th: 'หลังกริยาช่วยทุกตัวใช้กริยารูปเดิม ไม่เติม s ไม่เติม -ing ไม่มี to ถ้าประธานถูกทำ ใช้กริยาช่วย + be + กริยาช่อง 3'
      },
      example: {
        en: 'All visitors must {{sign}} in at the front desk.',
        th: 'ผู้มาติดต่อทุกคนต้องลงชื่อที่โต๊ะต้อนรับ'
      },
      clues: [
        { w: 'will', en: 'in the future', th: 'จะ' },
        { w: 'could', en: 'was able to; or maybe', th: 'สามารถ…ได้ (อดีต) / อาจจะ' },
        { w: 'might', en: 'maybe (less sure)', th: 'อาจจะ (ไม่ค่อยแน่ใจ)' },
        { w: 'would', en: 'polite asking; or an imagined result', th: 'จะ… (ใช้ขอร้องสุภาพ หรือสมมติ)' },
        { w: 'must be + V3', en: 'has to be done', th: 'ต้องถูก… (must be signed = ต้องได้รับการเซ็น)' }
      ],
      mistake: {
        wrong: 'All visitors must to sign in.',
        right: 'All visitors must sign in.',
        why: {
          en: 'Have to has a to, but must does not. The base verb comes right after must.',
          th: 'have to มี to แต่ must ไม่มี to ให้ใช้กริยารูปเดิมตามหลัง must ทันที'
        }
      }
    },
    {
      id: 'modal-have-v3',
      name: { en: 'Modal + have + V3 (about the past)', th: 'กริยาช่วย + have + กริยาช่อง 3 (modal + have + V3)' },
      formula: ['S + must/might/should/could + have + V3'],
      words: [
        { w: 'must have', en: 'I am sure it happened', th: 'ต้อง…แน่ ๆ (สรุปจากหลักฐาน)' },
        { w: 'might have', en: 'maybe it happened', th: 'อาจจะ…แล้ว' },
        { w: 'should have', en: 'it was the right thing, but it did not happen', th: 'น่าจะ… (แต่ไม่ได้ทำ)' },
        { w: 'could have', en: 'it was possible, but it did not happen', th: '…ได้ (แต่ไม่ได้ทำ)' }
      ],
      use: {
        en: 'Use modal + have + V3 for the past: a guess (must have, might have) or a regret (should have, could have).',
        th: 'ใช้กริยาช่วย + have + กริยาช่อง 3 พูดถึงอดีต เป็นการเดา (must have, might have) หรือความเสียดาย (should have, could have)'
      },
      example: {
        en: 'The lights are off, so the staff {{must have gone}} home.',
        th: 'ไฟปิดหมดแล้ว พนักงานคงกลับบ้านกันไปแล้วแน่ ๆ'
      },
      clues: [
        { w: 'already', en: 'before now', th: 'แล้ว / เรียบร้อยแล้ว' },
        { w: 'yesterday', en: 'the day before today', th: 'เมื่อวาน' },
        { w: 'last week', en: 'the week before this one', th: 'สัปดาห์ที่แล้ว' },
        { w: 'by now', en: 'before this moment', th: 'ป่านนี้' }
      ],
      mistake: {
        wrong: 'We should send it yesterday.',
        right: 'We should have sent it yesterday.',
        why: {
          en: 'Thai ควรจะ does not change for the past, but English needs should have + V3 for yesterday.',
          th: 'ภาษาไทย "ควรจะ" ไม่เปลี่ยนรูป แต่เรื่องเมื่อวานต้องใช้ should have + กริยาช่อง 3'
        }
      }
    },
    {
      id: 'modal-phrases',
      name: { en: 'Have to / be able to / used to + V1', th: 'วลีที่ใช้แบบกริยาช่วย (have to / be able to / used to)' },
      formula: ['S + have to/be able to/used to + V1'],
      words: [
        { w: 'have to', en: 'must', th: 'ต้อง' },
        { w: 'be able to', en: 'can', th: 'สามารถ' },
        { w: 'used to', en: 'did regularly in the past, but not now', th: 'เคย… (แต่ตอนนี้ไม่แล้ว)' }
      ],
      use: {
        en: 'These phrases work like modals and take V1. Use them where a modal cannot go, e.g. after will (will be able to). Be used to + -ing is different: it means accustomed to.',
        th: 'วลีเหล่านี้ใช้แบบกริยาช่วยและตามด้วยกริยารูปเดิม ใช้ในที่ที่กริยาช่วยวางไม่ได้ เช่น หลัง will (will be able to) ส่วน be used to + กริยาเติม -ing ต่างกัน แปลว่า คุ้นเคยกับ'
      },
      example: {
        en: 'We were not able to {{finish}} the report on time.',
        th: 'เราไม่สามารถทำรายงานเสร็จทันเวลาได้'
      },
      clues: [
        { w: 'will be able to', en: 'not will can: two modals cannot go together', th: 'จะสามารถ… (ห้ามใช้ will can)' },
        { w: 'be used to + -ing', en: 'be accustomed to', th: 'คุ้นเคยกับการ…' },
        { w: 'used to + V1', en: 'did often before, not now', th: 'เคย…เป็นประจำ (ตอนนี้ไม่แล้ว)' }
      ],
      mistake: {
        wrong: 'We will can finish it.',
        right: 'We will be able to finish it.',
        why: {
          en: 'Thai says จะสามารถ, but two modals cannot go together. Use will be able to.',
          th: 'ภาษาไทยพูด "จะสามารถ" ได้ แต่ภาษาอังกฤษห้ามใช้ will กับ can ติดกัน ให้ใช้ will be able to'
        }
      }
    }
  ]
}
