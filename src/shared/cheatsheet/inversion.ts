import type { CheatSheet } from './types'

export const inversion: CheatSheet = {
  topic: 'inversion',
  intro: {
    en: 'When a negative word or "should / had / were" opens the sentence, the helping verb comes before the subject, as in a question.',
    th: 'เมื่อคำปฏิเสธหรือ should / had / were ขึ้นต้นประโยค กริยาช่วยจะย้ายมาอยู่หน้าประธานเหมือนประโยคคำถาม'
  },
  entries: [
    {
      id: 'negative-adverb-inversion',
      name: { en: 'Negative word first', th: 'ขึ้นต้นด้วยคำปฏิเสธ' },
      formula: ['never/rarely/seldom/hardly + aux + S + V1'],
      use: {
        en: 'After never, rarely, seldom or hardly at the start, put do/does/did, have or be before the subject.',
        th: 'ถ้าขึ้นต้นด้วย never, rarely, seldom, hardly ให้วาง do/does/did, have หรือ be ไว้หน้าประธาน'
      },
      example: {
        en: 'Rarely {{does}} the CEO attend these meetings.',
        th: 'ซีอีโอแทบไม่เคยเข้าประชุมเหล่านี้เลย'
      },
      clues: ['never', 'rarely', 'seldom', 'hardly', 'little']
    },
    {
      id: 'not-only-inversion',
      name: { en: 'Not only … but also', th: 'Not only … but also ขึ้นต้นประโยค' },
      formula: ['not only + aux + S + V, but + S + also + V'],
      use: {
        en: 'When not only opens the sentence, invert the first clause only.',
        th: 'เมื่อ not only ขึ้นต้นประโยค ให้สลับเฉพาะประโยคแรก'
      },
      example: {
        en: 'Not only {{did}} sales rise, but costs also fell.',
        th: 'ไม่เพียงยอดขายจะเพิ่มขึ้น ต้นทุนยังลดลงด้วย'
      }
    },
    {
      id: 'only-inversion',
      name: { en: 'Only after / only when', th: 'Only after / only when' },
      formula: ['only + after/when/if + N/Clause + aux + S + V'],
      use: {
        en: 'After an "only" phrase at the start, the main clause is inverted.',
        th: 'เมื่อวลี only ขึ้นต้นประโยค ประโยคหลักต้องสลับกริยาช่วยมาหน้าประธาน'
      },
      example: {
        en: 'Only after the inspection {{will}} the permit be issued.',
        th: 'จะออกใบอนุญาตได้ก็ต่อเมื่อตรวจสอบเสร็จแล้วเท่านั้น'
      }
    },
    {
      id: 'conditional-inversion',
      name: { en: 'If-clause without if', th: 'ละ if แล้วสลับที่' },
      formula: ['should + S + V1, S + will + V1', 'had + S + V3, S + would have + V3', 'were + S + to V1, S + would + V1'],
      use: {
        en: 'Drop if and move should, had or were to the front. "Should you have…" is very common in TOEIC emails.',
        th: 'ตัด if ออกแล้วย้าย should, had หรือ were มาไว้ต้นประโยค "Should you have…" พบบ่อยมากในอีเมลข้อสอบ TOEIC'
      },
      example: {
        en: '{{Should}} you have any questions, please contact us.',
        th: 'หากคุณมีคำถามใด ๆ กรุณาติดต่อเรา'
      },
      clues: ['___ you have any questions', '___ you need assistance']
    },
    {
      id: 'no-sooner-than',
      name: { en: 'No sooner … than / hardly … when', th: 'No sooner … than / hardly … when' },
      formula: ['no sooner + had + S + V3 + than + S + V2', 'hardly + had + S + V3 + when + S + V2'],
      use: {
        en: 'One thing happened right after another. Keep the pairs: no sooner … than, hardly … when.',
        th: 'เหตุการณ์หนึ่งเกิดตามหลังอีกเหตุการณ์ทันที จำคู่ให้แม่น: no sooner … than, hardly … when'
      },
      example: {
        en: 'No sooner {{had}} the store opened than customers rushed in.',
        th: 'ร้านเพิ่งเปิดได้ไม่ทันไร ลูกค้าก็กรูกันเข้ามา'
      }
    }
  ]
}
