import type { CheatSheet } from './types'

export const subjectVerbAgreement: CheatSheet = {
  topic: 'subject-verb-agreement',
  intro: {
    en: 'Find the real subject first, skipping phrases like "of the…" or "who…" that sit between it and the verb. Then match singular or plural.',
    th: 'หาประธานตัวจริงก่อน โดยข้ามวลีที่คั่นอยู่ เช่น "of the…" หรือ "who…" แล้วเลือกกริยาให้ตรงกับเอกพจน์หรือพหูพจน์'
  },
  entries: [
    {
      id: 'singular-vs-plural-subject',
      name: { en: 'Singular vs plural subject', th: 'ประธานเอกพจน์กับพหูพจน์' },
      formula: ['N + V(s/es)', 'N(s) + V1'],
      use: {
        en: 'A singular subject takes a verb with -s/-es (is, has, was). A plural subject takes the base verb (are, have, were).',
        th: 'ประธานเอกพจน์ใช้กริยาเติม -s/-es (is, has, was) ประธานพหูพจน์ใช้กริยารูปเดิม (are, have, were)'
      },
      example: {
        en: 'The new printers {{require}} less maintenance.',
        th: 'เครื่องพิมพ์รุ่นใหม่ต้องการการบำรุงรักษาน้อยกว่า'
      }
    },
    {
      id: 'of-phrase-subject',
      name: { en: 'Subject + of + noun', th: 'ประธานที่มี of + คำนาม ตามหลัง' },
      formula: ['N + of + N(s) + V(s/es)'],
      use: {
        en: 'The verb agrees with the first noun, not the noun after of.',
        th: 'กริยาผันตามคำนามตัวแรก ไม่ใช่คำนามหลัง of'
      },
      example: {
        en: 'The list of approved vendors {{is}} posted online.',
        th: 'รายชื่อผู้ขายที่ได้รับอนุมัติประกาศไว้บนเว็บไซต์'
      },
      clues: ['the list of', 'the cost of', 'a series of', 'the quality of']
    },
    {
      id: 'each-every',
      name: { en: 'Each / every', th: 'Each / every' },
      formula: ['each/every + N + V(s/es)', 'each of + the + N(s) + V(s/es)'],
      use: {
        en: 'Each and every are singular, even in "each of the + plural noun".',
        th: 'each และ every เป็นเอกพจน์เสมอ แม้จะเป็น "each of the + คำนามพหูพจน์"'
      },
      example: {
        en: 'Each of the applicants {{has}} been contacted.',
        th: 'ผู้สมัครแต่ละคนได้รับการติดต่อแล้ว'
      },
      clues: ['each', 'every', 'everyone', 'anyone', 'nobody']
    },
    {
      id: 'a-number-of',
      name: { en: 'A number of / the number of', th: 'A number of กับ the number of' },
      formula: ['a number of + N(s) + V1', 'the number of + N(s) + V(s/es)'],
      use: {
        en: '"A number of" means many, so it is plural. "The number of" is one number, so it is singular.',
        th: '"a number of" แปลว่าหลาย จึงเป็นพหูพจน์ ส่วน "the number of" หมายถึงจำนวน (ตัวเลขเดียว) จึงเป็นเอกพจน์'
      },
      example: {
        en: 'The number of participants {{has}} doubled this year.',
        th: 'จำนวนผู้เข้าร่วมเพิ่มขึ้นเป็นสองเท่าในปีนี้'
      }
    },
    {
      id: 'either-neither',
      name: { en: 'Either … or / neither … nor', th: 'Either … or / neither … nor' },
      formula: ['either + N + or + N + V', 'neither + N + nor + N + V'],
      use: {
        en: 'The verb agrees with the noun closest to it (the second one). "Not only … but also" works the same way.',
        th: 'กริยาผันตามคำนามที่อยู่ใกล้ที่สุด (ตัวที่สอง) "not only … but also" ก็ใช้หลักเดียวกัน'
      },
      example: {
        en: 'Neither the manager nor the assistants {{were}} informed.',
        th: 'ทั้งผู้จัดการและผู้ช่วยไม่ได้รับแจ้งเลย'
      },
      clues: ['either … or', 'neither … nor', 'not only … but also']
    },
    {
      id: 'relative-clause-agreement',
      name: { en: 'Verb after who / that', th: 'กริยาหลัง who / that' },
      formula: ['N + who/that + V'],
      use: {
        en: 'The verb after who, which or that agrees with the noun just before it.',
        th: 'กริยาหลัง who, which, that ผันตามคำนามที่อยู่หน้ามันทันที'
      },
      example: {
        en: 'Employees who {{wish}} to attend should register by Friday.',
        th: 'พนักงานที่ต้องการเข้าร่วมควรลงทะเบียนภายในวันศุกร์'
      }
    },
    {
      id: 'gerund-subject',
      name: { en: 'V-ing as the subject', th: 'V-ing เป็นประธาน' },
      formula: ['V-ing + Obj + V(s/es)'],
      use: {
        en: 'A V-ing phrase used as the subject counts as one thing, so the verb is singular.',
        th: 'วลี V-ing ที่เป็นประธานนับเป็นสิ่งเดียว กริยาจึงเป็นเอกพจน์'
      },
      example: {
        en: 'Reviewing customer feedback {{helps}} us improve our service.',
        th: 'การทบทวนความคิดเห็นของลูกค้าช่วยให้เราปรับปรุงบริการได้'
      }
    }
  ]
}
