import type { CheatSheet } from './types'

export const subjectVerbAgreement: CheatSheet = {
  topic: 'subject-verb-agreement',
  intro: {
    en: 'Find the real subject first and skip the words in the middle. Then check: one, or more than one?',
    th: 'หาประธานตัวจริงก่อน (ข้ามคำที่แทรกอยู่ตรงกลาง) แล้วดูว่าเป็น 1 หรือหลายอัน'
  },
  entries: [
    {
      id: 'singular-vs-plural-subject',
      name: { en: 'Singular vs plural subject', th: 'ประธานเอกพจน์กับพหูพจน์' },
      formula: ['N + V(s/es)', 'N(s) + V1'],
      use: {
        en: 'One subject: the verb takes -s (is, has). More than one: no -s (are, have).',
        th: 'ประธานตัวเดียว กริยาเติม s (is, has) / ประธานหลายตัว กริยาไม่เติม s (are, have)'
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
        en: 'Look at the first noun, before of. The verb follows that noun.',
        th: 'ดูคำนามตัวแรก (ก่อน of) แล้วผันกริยาตามตัวนั้น'
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
        en: 'Each and every always count as one, so the verb takes -s.',
        th: 'each, every นับเป็น 1 เสมอ กริยาจึงเติม s'
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
        en: 'A number of means many: no -s on the verb. The number of means the amount: add -s.',
        th: 'a number of = หลาย ๆ (กริยาไม่เติม s) / the number of = จำนวน (กริยาเติม s)'
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
        en: 'The verb follows the noun closest to it.',
        th: 'ผันกริยาตามคำนามที่อยู่ใกล้กริยาที่สุด'
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
        en: 'The verb after who, which or that follows the noun just before it.',
        th: 'กริยาหลัง who, which, that ผันตามคำนามที่อยู่หน้ามัน'
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
        en: 'A V-ing subject counts as one thing, so the verb takes -s.',
        th: 'ถ้าประธานเป็น V-ing นับเป็น 1 เรื่อง กริยาจึงเติม s'
      },
      example: {
        en: 'Reviewing customer feedback {{helps}} us improve our service.',
        th: 'การทบทวนความคิดเห็นของลูกค้าช่วยให้เราปรับปรุงบริการได้'
      }
    }
  ]
}
