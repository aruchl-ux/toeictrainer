import type { CheatSheet } from './types'

export const collocations: CheatSheet = {
  topic: 'collocations',
  intro: {
    en: 'Some words simply go together. Learn them as fixed chunks; grammar alone will not tell you which one is right.',
    th: 'คำบางคำใช้คู่กันเป็นชุด ต้องจำเป็นก้อน เพราะไวยากรณ์อย่างเดียวบอกไม่ได้ว่าคำไหนถูก'
  },
  entries: [
    {
      id: 'verb-noun-collocations',
      name: { en: 'Verb + noun', th: 'กริยา + คำนาม' },
      formula: ['make + a decision/an effort/a reservation', 'take + place/part/action', 'meet + a deadline/a demand'],
      use: {
        en: 'These verbs and nouns are fixed partners. Do a decision or make part are wrong.',
        th: 'กริยากับคำนามเหล่านี้เป็นคู่ตายตัว เช่น พูดว่า do a decision หรือ make part ไม่ได้'
      },
      example: {
        en: 'The board will {{make}} a decision next week.',
        th: 'คณะกรรมการจะตัดสินใจในสัปดาห์หน้า'
      },
      clues: ['conduct a survey', 'place an order', 'raise funds', 'reach an agreement']
    },
    {
      id: 'adjective-preposition',
      name: { en: 'Adjective + preposition', th: 'คำคุณศัพท์ + คำบุพบท' },
      formula: ['be + responsible/eligible + for', 'be + familiar/compatible + with', 'be + aware/capable + of'],
      use: {
        en: 'Each adjective takes its own preposition. Learn the pair together.',
        th: 'คำคุณศัพท์แต่ละตัวใช้คำบุพบทเฉพาะของมัน ให้จำเป็นคู่'
      },
      example: {
        en: 'Ms. Patel is responsible {{for}} training new staff.',
        th: 'คุณพาเทลรับผิดชอบการอบรมพนักงานใหม่'
      },
      clues: ['responsible for', 'eligible for', 'familiar with', 'aware of', 'subject to']
    },
    {
      id: 'noun-preposition',
      name: { en: 'Noun + preposition', th: 'คำนาม + คำบุพบท' },
      formula: ['increase/decrease/demand + in + N', 'access/approach/solution + to + N'],
      use: {
        en: 'Change nouns take in; access, approach and solution take to.',
        th: 'คำนามที่บอกการเปลี่ยนแปลงใช้ in ส่วน access, approach, solution ใช้ to'
      },
      example: {
        en: 'There has been a sharp increase {{in}} online sales.',
        th: 'ยอดขายออนไลน์เพิ่มขึ้นอย่างมาก'
      },
      clues: ['increase in', 'demand for', 'access to', 'reason for', 'effect on']
    },
    {
      id: 'verb-preposition',
      name: { en: 'Verb + preposition', th: 'กริยา + คำบุพบท' },
      formula: ['comply + with', 'depend/rely + on', 'apply + for/to'],
      use: {
        en: 'These verbs need a fixed preposition before their object.',
        th: 'กริยาเหล่านี้ต้องมีคำบุพบทเฉพาะก่อนกรรม'
      },
      example: {
        en: 'All visitors must comply {{with}} the safety rules.',
        th: 'ผู้มาเยือนทุกคนต้องปฏิบัติตามกฎความปลอดภัย'
      },
      clues: ['comply with', 'rely on', 'apply for (a job)', 'respond to', 'participate in']
    },
    {
      id: 'adverb-collocations',
      name: { en: 'Adverb + adjective / V3', th: 'คำกริยาวิเศษณ์ + คำคุณศัพท์ / V3' },
      formula: ['highly + recommended/qualified', 'strictly + prohibited', 'deeply + appreciated'],
      use: {
        en: 'Certain adverbs are the natural partners of certain adjectives or V3 forms.',
        th: 'คำกริยาวิเศษณ์บางตัวใช้คู่กับคำคุณศัพท์หรือ V3 บางตัวเป็นปกติ'
      },
      example: {
        en: 'Smoking is {{strictly}} prohibited in the building.',
        th: 'ห้ามสูบบุหรี่ในอาคารโดยเด็ดขาด'
      },
      clues: ['highly recommended', 'strictly prohibited', 'conveniently located', 'widely used']
    }
  ]
}
