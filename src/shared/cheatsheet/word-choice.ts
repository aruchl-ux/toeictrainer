import type { CheatSheet } from './types'

export const wordChoice: CheatSheet = {
  topic: 'word-choice',
  intro: {
    en: 'All four choices are the same part of speech, so grammar cannot decide. Read the whole sentence, find the word the blank must fit with, and pick the meaning that makes sense at work.',
    th: 'ตัวเลือกทั้งสี่เป็นคำชนิดเดียวกัน ไวยากรณ์ช่วยตัดไม่ได้ ต้องอ่านทั้งประโยค หาคำที่ช่องว่างต้องเข้าคู่ด้วย แล้วเลือกความหมายที่เข้ากับบริบทการทำงาน'
  },
  entries: [
    {
      id: 'word-choice-verb-object',
      name: { en: 'Verb that fits its object', th: 'กริยาที่เข้ากับกรรม' },
      formula: ['V + Obj'],
      words: [
        { w: 'board', en: 'get on a plane, train or ship', th: 'ขึ้น (เครื่องบิน รถไฟ เรือ)' },
        { w: 'claim', en: 'ask for something that is yours', th: 'ขอรับ / เรียกร้องสิ่งที่เป็นของเรา' }
      ],
      use: {
        en: 'Look at the object after the blank and ask which action people really do to that thing at work.',
        th: 'ดูกรรมหลังช่องว่าง แล้วถามตัวเองว่าในการทำงานจริง เราทำกริยาไหนกับสิ่งนั้น'
      },
      example: {
        en: 'Passengers should {{board}} the train ten minutes before it leaves.',
        th: 'ผู้โดยสารควรขึ้นรถไฟก่อนรถออกสิบนาที'
      },
      clues: ['board a plane', 'claim baggage', 'place an order', 'submit a report']
    },
    {
      id: 'word-choice-noun-context',
      name: { en: 'Noun that fits the context', th: 'คำนามที่เข้ากับบริบท' },
      formula: ['Det + (Adj) + N'],
      words: [
        { w: 'itinerary', en: 'a plan of a trip', th: 'กำหนดการเดินทาง' },
        { w: 'beverage', en: 'a drink', th: 'เครื่องดื่ม' }
      ],
      use: {
        en: 'Read the words around the blank. Describing words like detailed, hot or extra show which thing is meant.',
        th: 'อ่านคำรอบช่องว่าง คำขยายอย่าง detailed, hot, extra ช่วยบอกว่าหมายถึงสิ่งไหน'
      },
      example: {
        en: 'The agency sent each guest a detailed {{itinerary}} for the conference week.',
        th: 'บริษัทส่งกำหนดการแบบละเอียดของสัปดาห์การประชุมให้แขกทุกคน'
      },
      clues: ['a hot beverage', 'a detailed itinerary', 'a full refund']
    },
    {
      id: 'word-choice-adjective-noun',
      name: { en: 'Adjective that fits the noun', th: 'คำคุณศัพท์ที่เข้ากับคำนาม' },
      formula: ['be + Adj', 'Adj + N'],
      words: [
        { w: 'valid', en: 'officially usable, not expired', th: 'ใช้ได้ ยังไม่หมดอายุ' },
        { w: 'eligible', en: 'allowed to have or do something', th: 'มีสิทธิ์' },
        { w: 'reasonable', en: 'fair, not too high', th: 'สมเหตุสมผล (ราคาไม่แพงเกินไป)' }
      ],
      use: {
        en: 'Check what the adjective describes: a ticket or permit is valid, a person is eligible, a price is reasonable.',
        th: 'ดูว่าคำคุณศัพท์ขยายอะไร ตั๋วหรือใบอนุญาตใช้ valid คนที่มีสิทธิ์ใช้ eligible ราคาที่เหมาะสมใช้ reasonable'
      },
      example: {
        en: 'Your parking permit is no longer {{valid}} after March 31.',
        th: 'บัตรจอดรถของคุณใช้ไม่ได้แล้วหลังวันที่ 31 มีนาคม'
      },
      clues: ['valid ticket', 'eligible for', 'reasonable price']
    },
    {
      id: 'word-choice-partner-preposition',
      name: { en: 'Word chosen by the preposition after it', th: 'เลือกคำจากบุพบทที่ตามมา' },
      formula: ['V + Obj + from + V-ing', 'be + Adj + for + N'],
      words: [
        { w: 'from', en: 'goes with prohibit, prevent, stop', th: 'ใช้คู่กับ prohibit, prevent, stop' },
        { w: 'for', en: 'goes with responsible, eligible, famous', th: 'ใช้คู่กับ responsible, eligible, famous' }
      ],
      use: {
        en: 'When two choices mean almost the same, the word after the blank often decides. Only one of them is used with that preposition.',
        th: 'ถ้ามีสองตัวเลือกความหมายใกล้กัน ให้ดูคำหลังช่องว่าง มักมีแค่คำเดียวที่ใช้คู่กับบุพบทนั้นได้'
      },
      example: {
        en: 'Signs {{prohibit}} drivers from parking in the loading area.',
        th: 'ป้ายห้ามผู้ขับขี่จอดรถในบริเวณขนถ่ายสินค้า'
      },
      clues: ['prohibit … from', 'responsible for', 'eligible for', 'interested in']
    }
  ]
}
