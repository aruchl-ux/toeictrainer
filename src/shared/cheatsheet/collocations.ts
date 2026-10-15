import type { CheatSheet } from './types'

export const collocations: CheatSheet = {
  topic: 'collocations',
  intro: {
    en: 'Some words always go together, like make a decision. The test gives you four words that look right; only one goes with the word next to the blank. Translating from Thai word by word usually picks the wrong one, so learn each pair as one piece.',
    th: 'คำบางคำต้องใช้คู่กันเสมอ เช่น make a decision (ตัดสินใจ) ข้อสอบจะให้เลือกคำที่ "เข้าคู่" กับคำข้างช่องว่าง ถ้าแปลตรงจากภาษาไทยทีละคำมักเลือกผิด ให้จำเป็นคู่ทั้งก้อน'
  },
  entries: [
    {
      id: 'verb-noun-collocations',
      name: { en: 'Verb + noun', th: 'กริยา + คำนาม (verb + noun)' },
      formula: ['make + a decision/an effort/a reservation', 'take + place/part/action/effect', 'meet + a deadline/a demand/the needs'],
      use: {
        en: 'The verb is fixed by the noun after it. Look at the noun first, then pick the verb that goes with it.',
        th: 'คำนามข้างหลังเป็นตัวกำหนดว่าต้องใช้กริยาตัวไหน ให้ดูคำนามก่อน แล้วเลือกกริยาที่เป็นคู่ของมัน'
      },
      example: {
        en: 'Warehouse staff must {{exercise}} caution near the loading dock.',
        th: 'พนักงานคลังสินค้าต้องใช้ความระมัดระวังใกล้จุดขนถ่ายสินค้า'
      },
      clues: [
        { w: 'meet a deadline', en: 'finish on time', th: 'ทำงานเสร็จทันกำหนด' },
        { w: 'meet the needs', en: 'give what is needed', th: 'ตอบสนองความต้องการ' },
        { w: 'place an order', en: 'order something', th: 'สั่งซื้อสินค้า' },
        { w: 'conduct a survey', en: 'carry out a survey', th: 'ทำการสำรวจ' },
        { w: 'take effect', en: 'start to apply', th: 'เริ่มมีผลบังคับใช้' },
        { w: 'raise awareness', en: 'help people know about something', th: 'สร้างความตระหนักรู้' },
        { w: 'exercise caution', en: 'be careful', th: 'ใช้ความระมัดระวัง' },
        { w: 'address concerns', en: 'deal with worries', th: 'จัดการกับข้อกังวล' },
        { w: 'reach an agreement', en: 'agree', th: 'ตกลงกันได้' },
        { w: 'raise funds', en: 'collect money', th: 'ระดมทุน' }
      ],
      mistake: {
        wrong: 'do a decision',
        right: 'make a decision',
        why: {
          en: 'Thai says "ทำ" for both make and do, but decision always takes make.',
          th: 'ภาษาไทยใช้ "ทำ" ได้ทั้งคู่ แต่ decision ต้องใช้ make เสมอ ห้ามแปลตรงว่า do'
        }
      }
    },
    {
      id: 'adjective-preposition',
      name: { en: 'Adjective + preposition', th: 'คำคุณศัพท์ + คำบุพบท (adjective + preposition)' },
      formula: ['be + responsible/eligible + for', 'be + familiar/compatible + with', 'be + aware/capable + of'],
      use: {
        en: 'Each adjective has its own preposition. If the blank is right after the adjective, choose its partner.',
        th: 'คำคุณศัพท์แต่ละตัวมีคำบุพบทคู่ของมัน ถ้าช่องว่างอยู่หลังคำคุณศัพท์ ให้เลือกคำบุพบทที่เป็นคู่'
      },
      example: {
        en: 'Ms. Patel is responsible {{for}} training new staff.',
        th: 'คุณพาเทลรับผิดชอบการอบรมพนักงานใหม่'
      },
      clues: [
        { w: 'responsible for', en: 'in charge of', th: 'รับผิดชอบ' },
        { w: 'eligible for', en: 'allowed to get', th: 'มีสิทธิ์ได้รับ' },
        { w: 'familiar with', en: 'knowing well', th: 'คุ้นเคยกับ' },
        { w: 'aware of', en: 'knowing about', th: 'รู้ตัว/ตระหนักถึง' },
        { w: 'make someone aware of', en: 'tell someone about', th: 'ทำให้ใครรู้เรื่อง…' },
        { w: 'subject to', en: 'may be affected by', th: 'อาจมีการ… (เช่น เปลี่ยนแปลง)' }
      ],
      mistake: {
        wrong: 'responsible of',
        right: 'responsible for',
        why: { en: 'Responsible always takes for.', th: 'responsible ใช้กับ for เสมอ ไม่ใช่ of' }
      }
    },
    {
      id: 'noun-preposition',
      name: { en: 'Noun + preposition', th: 'คำนาม + คำบุพบท (noun + preposition)' },
      formula: ['increase/decrease + in + N', 'demand/need/reason + for + N', 'access/approach/solution + to + N'],
      use: {
        en: 'Words for going up or down take in (an increase in sales). Words for wanting or why take for (demand for, reason for). Access and solution take to.',
        th: 'คำที่บอกการเพิ่มหรือลดใช้ in (an increase in sales) คำที่บอกความต้องการหรือเหตุผลใช้ for (demand for, reason for) ส่วน access และ solution ใช้ to'
      },
      example: {
        en: 'There has been a sharp increase {{in}} online sales.',
        th: 'ยอดขายออนไลน์เพิ่มขึ้นอย่างมาก'
      },
      clues: [
        { w: 'increase in', en: 'a rise in', th: 'การเพิ่มขึ้นของ' },
        { w: 'demand for', en: 'need for', th: 'ความต้องการ' },
        { w: 'access to', en: 'a way to use', th: 'สิทธิ์เข้าถึง/เข้าใช้' },
        { w: 'reason for', en: 'why', th: 'เหตุผลของ' },
        { w: 'effect on', en: 'change to', th: 'ผลกระทบต่อ' }
      ],
      mistake: {
        wrong: 'access for the database',
        right: 'access to the database',
        why: { en: 'Access always takes to.', th: 'access ใช้กับ to เสมอ' }
      }
    },
    {
      id: 'verb-preposition',
      name: { en: 'Verb + preposition', th: 'กริยา + คำบุพบท (verb + preposition)' },
      formula: ['comply + with', 'adhere + to', 'depend/rely + on'],
      use: {
        en: 'These verbs need a preposition before the object. Similar verbs like follow and obey do not, so they are the trap.',
        th: 'กริยาพวกนี้ต้องมีคำบุพบทก่อนกรรม ส่วนกริยาความหมายใกล้กันอย่าง follow และ obey ไม่ต้องมี จึงมักเป็นตัวหลอก'
      },
      example: {
        en: 'All visitors must comply {{with}} the safety rules.',
        th: 'ผู้มาเยือนทุกคนต้องปฏิบัติตามกฎความปลอดภัย'
      },
      clues: [
        { w: 'comply with', en: 'follow (rules)', th: 'ปฏิบัติตาม (กฎ, ข้อบังคับ)' },
        { w: 'adhere to', en: 'follow closely', th: 'ยึดถือปฏิบัติตาม (อย่างเคร่งครัด)' },
        { w: 'rely on', en: 'depend on', th: 'พึ่งพา' },
        { w: 'apply for (a job)', en: 'ask for (a job)', th: 'สมัคร (งาน)' },
        { w: 'respond to', en: 'reply to', th: 'ตอบกลับ' },
        { w: 'participate in', en: 'take part in', th: 'เข้าร่วม' }
      ],
      mistake: {
        wrong: 'comply the rules',
        right: 'comply with the rules',
        why: {
          en: 'Comply needs with. Follow the rules needs nothing, so do not mix them.',
          th: 'comply ต้องมี with เสมอ ส่วน follow the rules ไม่ต้องมี อย่าสลับกัน'
        }
      }
    },
    {
      id: 'adverb-collocations',
      name: { en: 'Adverb + adjective / past participle', th: 'คำกริยาวิเศษณ์ + คำคุณศัพท์ / กริยาช่อง 3 (adverb + adjective)' },
      formula: ['highly + recommended/qualified', 'strictly + prohibited', 'conveniently + located'],
      use: {
        en: 'Some adverbs almost always go with certain words. Learn the pair: highly recommended, strictly prohibited.',
        th: 'adverb บางตัวมักใช้คู่กับคำบางคำเสมอ ให้จำเป็นคู่ เช่น highly recommended, strictly prohibited'
      },
      example: {
        en: 'Smoking is {{strictly}} prohibited in the building.',
        th: 'ห้ามสูบบุหรี่ในอาคารโดยเด็ดขาด'
      },
      clues: [
        { w: 'highly recommended', en: 'strongly recommended', th: 'ได้รับการแนะนำอย่างมาก' },
        { w: 'strictly prohibited', en: 'not allowed at all', th: 'ห้ามโดยเด็ดขาด' },
        { w: 'conveniently located', en: 'in an easy place to reach', th: 'ตั้งอยู่ในทำเลสะดวก' },
        { w: 'widely used', en: 'used by many people', th: 'ใช้กันอย่างแพร่หลาย' }
      ],
      mistake: {
        wrong: 'greatly recommended',
        right: 'highly recommended',
        why: { en: 'Recommended goes with highly, not greatly or deeply.', th: 'recommended ใช้คู่กับ highly ไม่ใช่ greatly หรือ deeply' }
      }
    }
  ]
}
