import type { CheatSheet } from './types'

export const collocations: CheatSheet = {
  topic: 'collocations',
  intro: {
    en: 'Some words always go together. Learn them as pairs, because grammar alone will not tell you.',
    th: 'คำบางคู่ใช้ด้วยกันเป็นประจำ ต้องจำเป็นคู่ เพราะเดาจากไวยากรณ์อย่างเดียวไม่ได้'
  },
  entries: [
    {
      id: 'verb-noun-collocations',
      name: { en: 'Verb + noun', th: 'กริยา + คำนาม' },
      formula: ['make + a decision/an effort/a reservation', 'take + place/part/action', 'meet + a deadline/a demand'],
      use: {
        en: 'These verbs and nouns are fixed pairs: make a decision, not do a decision.',
        th: 'กริยากับคำนามพวกนี้ใช้คู่กันตายตัว เช่น make a decision (ไม่ใช่ do a decision)'
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
        en: 'Each adjective has its own preposition. Learn them as pairs.',
        th: 'คำคุณศัพท์แต่ละตัวมีคำบุพบทคู่ของมัน ให้จำเป็นคู่'
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
        en: 'Words for going up or down take in (increase in). Access and solution take to.',
        th: 'คำที่บอกการเพิ่มหรือลดใช้ in (increase in) / access, solution ใช้ to'
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
        en: 'These verbs need a preposition before the object, like comply with.',
        th: 'กริยาพวกนี้ต้องมีคำบุพบทก่อนกรรม เช่น comply with'
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
        en: 'Some adverbs usually go with certain words, like highly recommended.',
        th: 'adverb บางตัวมักใช้คู่กับคำบางคำ เช่น highly recommended'
      },
      example: {
        en: 'Smoking is {{strictly}} prohibited in the building.',
        th: 'ห้ามสูบบุหรี่ในอาคารโดยเด็ดขาด'
      },
      clues: ['highly recommended', 'strictly prohibited', 'conveniently located', 'widely used']
    }
  ]
}
