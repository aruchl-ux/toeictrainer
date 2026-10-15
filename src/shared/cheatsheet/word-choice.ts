import type { CheatSheet } from './types'

export const wordChoice: CheatSheet = {
  topic: 'word-choice',
  intro: {
    en: 'All four choices are the same type of word with different meanings, so grammar cannot decide. Read the whole sentence, find the word the blank must go with, and pick the meaning that makes sense at work.',
    th: 'ตัวเลือกทั้งสี่เป็นคำชนิดเดียวกันแต่ความหมายต่างกัน ไวยากรณ์ช่วยตัดไม่ได้ ให้อ่านทั้งประโยค หาคำที่ช่องว่างต้องเข้าคู่ด้วย แล้วเลือกความหมายที่เข้ากับเรื่องงาน'
  },
  entries: [
    {
      id: 'word-choice-verb-object',
      name: { en: 'Verb that fits its object', th: 'กริยาที่เข้ากับกรรม (verb + object)' },
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
      clues: [
        { w: 'board a plane', en: 'get on a plane', th: 'ขึ้นเครื่องบิน' },
        { w: 'claim baggage', en: 'collect your bags', th: 'รับกระเป๋าเดินทาง' },
        { w: 'place an order', en: 'order something', th: 'สั่งซื้อสินค้า' },
        { w: 'submit a report', en: 'hand in a report', th: 'ส่งรายงาน' }
      ],
      mistake: {
        wrong: 'Can you borrow me your pen?',
        right: 'Can you lend me your pen?',
        why: {
          en: 'Thai uses "ยืม" both ways, but lend means give for a time and borrow means take for a time.',
          th: 'ภาษาไทยใช้ "ยืม" ทั้งสองทาง แต่ lend = ให้ยืม ส่วน borrow = ขอยืม'
        }
      }
    },
    {
      id: 'word-choice-noun-context',
      name: { en: 'Noun that fits the context', th: 'คำนามที่เข้ากับเรื่อง (noun in context)' },
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
      clues: [
        { w: 'a hot beverage', en: 'a hot drink', th: 'เครื่องดื่มร้อน' },
        { w: 'a detailed itinerary', en: 'a full trip plan', th: 'กำหนดการเดินทางแบบละเอียด' },
        { w: 'a full refund', en: 'all your money back', th: 'คืนเงินเต็มจำนวน' }
      ],
      mistake: {
        wrong: 'the entrance price',
        right: 'the entrance fee',
        why: {
          en: 'Money you pay to enter or for a service is a fee. Price is for things you buy.',
          th: 'เงินที่จ่ายเพื่อเข้างานหรือใช้บริการคือ fee ส่วน price ใช้กับราคาสินค้า'
        }
      }
    },
    {
      id: 'word-choice-adjective-noun',
      name: { en: 'Adjective that fits the noun', th: 'คำคุณศัพท์ที่เข้ากับคำนาม (adjective + noun)' },
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
      clues: [
        { w: 'valid ticket', en: 'a ticket you can still use', th: 'ตั๋วที่ยังใช้ได้' },
        { w: 'eligible for', en: 'allowed to get', th: 'มีสิทธิ์ได้รับ' },
        { w: 'reasonable price', en: 'a fair price', th: 'ราคาสมเหตุสมผล' }
      ],
      mistake: {
        wrong: 'a cheap price',
        right: 'a low price',
        why: {
          en: 'Thai says "ราคาถูก", but a price is low or reasonable. Cheap goes with the thing itself (a cheap hotel).',
          th: 'ภาษาไทยพูดว่า "ราคาถูก" แต่ price ใช้ low หรือ reasonable ส่วน cheap ใช้กับตัวสินค้า เช่น a cheap hotel'
        }
      }
    },
    {
      id: 'word-choice-partner-preposition',
      name: { en: 'Word chosen by the preposition after it', th: 'เลือกคำจากคำบุพบทที่ตามมา (word + preposition)' },
      formula: ['V + Obj + from + V-ing', 'be + Adj + for + N'],
      words: [
        { w: 'from', en: 'goes with prohibit, prevent, stop', th: 'ใช้คู่กับ prohibit, prevent, stop' },
        { w: 'for', en: 'goes with responsible, eligible, famous', th: 'ใช้คู่กับ responsible, eligible, famous' }
      ],
      use: {
        en: 'When two choices mean almost the same, the word after the blank often decides. Only one of them is used with that preposition.',
        th: 'ถ้ามีสองตัวเลือกความหมายใกล้กัน ให้ดูคำหลังช่องว่าง มักมีแค่คำเดียวที่ใช้คู่กับคำบุพบทนั้นได้'
      },
      example: {
        en: 'Signs {{prohibit}} drivers from parking in the loading area.',
        th: 'ป้ายห้ามผู้ขับขี่จอดรถในบริเวณขนถ่ายสินค้า'
      },
      clues: [
        { w: 'prohibit … from', en: 'not allow … to', th: 'ห้าม… ไม่ให้…' },
        { w: 'responsible for', en: 'in charge of', th: 'รับผิดชอบ' },
        { w: 'eligible for', en: 'allowed to get', th: 'มีสิทธิ์ได้รับ' },
        { w: 'interested in', en: 'wanting to know or do', th: 'สนใจ' }
      ],
      mistake: {
        wrong: 'prohibit drivers to park',
        right: 'prohibit drivers from parking',
        why: {
          en: 'Prohibit takes from + -ing, not to.',
          th: 'prohibit ใช้คู่กับ from + กริยาเติม -ing ไม่ใช้ to'
        }
      }
    }
  ]
}
