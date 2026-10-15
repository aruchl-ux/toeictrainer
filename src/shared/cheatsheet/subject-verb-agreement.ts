import type { CheatSheet } from './types'

export const subjectVerbAgreement: CheatSheet = {
  topic: 'subject-verb-agreement',
  intro: {
    en: 'The choices are one verb in different forms, like is, are, has, have. Find the real subject first and skip the words in the middle (of the managers, who…). Then check: one thing, or more than one? One thing takes the -s form (is, has, helps).',
    th: 'ตัวเลือกเป็นกริยาตัวเดียวกันแต่ต่างรูป เช่น is, are, has, have ให้หาประธานตัวจริงก่อน (ข้ามคำที่คั่นกลาง เช่น of the managers) แล้วดูว่าเป็นสิ่งเดียวหรือหลายสิ่ง ถ้าสิ่งเดียว กริยาเติม s (is, has, helps)'
  },
  entries: [
    {
      id: 'singular-vs-plural-subject',
      name: { en: 'Singular vs plural subject', th: 'ประธานสิ่งเดียวกับหลายสิ่ง (singular vs plural subject)' },
      formula: ['N + V(s/es)', 'N(s) + V1'],
      use: {
        en: 'One subject: the verb takes -s (is, has). More than one: no -s (are, have). A group word like committee or team counts as one.',
        th: 'ประธานสิ่งเดียว กริยาเติม s (is, has) / ประธานหลายสิ่ง กริยาไม่เติม s (are, have) คำที่เป็นกลุ่ม เช่น committee, team นับเป็นหนึ่ง'
      },
      example: {
        en: 'The new printers {{require}} less maintenance.',
        th: 'เครื่องพิมพ์รุ่นใหม่ต้องการการบำรุงรักษาน้อยกว่า'
      },
      clues: [
        { w: 'is / has / was', en: 'for one thing', th: 'ใช้กับประธานสิ่งเดียว' },
        { w: 'are / have / were', en: 'for more than one', th: 'ใช้กับประธานหลายสิ่ง' },
        { w: 'committee + V(s/es)', en: 'one group counts as one', th: 'คณะกรรมการ (กลุ่มเดียว) กริยาเติม s' }
      ],
      mistake: {
        wrong: 'The manager have a meeting.',
        right: 'The manager has a meeting.',
        why: {
          en: 'Thai verbs never change, but one subject (the manager) needs has, not have.',
          th: 'ภาษาไทยกริยาไม่เปลี่ยนรูป แต่ประธานคนเดียว (the manager) ต้องใช้ has ไม่ใช่ have'
        }
      }
    },
    {
      id: 'of-phrase-subject',
      name: { en: 'Subject + of / between phrase', th: 'ประธานที่มีวลีคั่นกลาง (subject + of / between phrase)' },
      formula: ['N + of + N(s) + V(s/es)', 'one of + the + N(s) + V(s/es)', 'N + between + N(s) + V(s/es)'],
      use: {
        en: 'Look at the first noun, before of or between. The verb follows that noun, not the plural noun next to the verb.',
        th: 'ดูคำนามตัวแรก (ก่อน of หรือ between) แล้วผันกริยาตามตัวนั้น ไม่ใช่ตามคำนามหลายสิ่งที่อยู่ติดกริยา'
      },
      example: {
        en: 'The list of approved vendors {{is}} posted online.',
        th: 'รายชื่อผู้ขายที่ได้รับอนุมัติประกาศไว้บนเว็บไซต์'
      },
      clues: [
        { w: 'the list of', en: 'one list of many things', th: 'รายชื่อ / รายการของ…' },
        { w: 'the cost of', en: 'how much … costs', th: 'ค่าใช้จ่ายของ…' },
        { w: 'the quality of', en: 'how good … is', th: 'คุณภาพของ…' },
        { w: 'one of the', en: 'one from a group', th: 'หนึ่งใน… (นับเป็นหนึ่ง)' },
        { w: 'the agreement between', en: 'one agreement made by two sides', th: 'ข้อตกลงระหว่าง…' }
      ],
      mistake: {
        wrong: 'The list of suppliers are updated.',
        right: 'The list of suppliers is updated.',
        why: {
          en: 'The subject is list (one), not suppliers.',
          th: 'ประธานคือ list (รายชื่อเดียว) ไม่ใช่ suppliers จึงใช้ is'
        }
      }
    },
    {
      id: 'each-every',
      name: { en: 'Each / every', th: 'แต่ละ… / ทุก… (each / every)' },
      formula: ['each/every + N + V(s/es)', 'each of + the + N(s) + V(s/es)'],
      use: {
        en: 'Each and every count things one by one, so the verb takes -s, even in each of the managers or every manager and supervisor.',
        th: 'each, every นับทีละหนึ่ง กริยาจึงเติม s แม้จะเป็น each of the managers หรือ every manager and supervisor'
      },
      example: {
        en: 'Each of the applicants {{has}} been contacted.',
        th: 'ผู้สมัครแต่ละคนได้รับการติดต่อแล้ว'
      },
      clues: [
        { w: 'each', en: 'every single one', th: 'แต่ละ…' },
        { w: 'every', en: 'all, one by one', th: 'ทุก… (นับทีละหนึ่ง)' },
        { w: 'every + N + and + N', en: 'still one by one', th: 'every + คำนามสองตัว ก็ยังใช้กริยาเติม s' },
        { w: 'everyone / anyone / nobody', en: 'one person word', th: 'ทุกคน / ใครก็ได้ / ไม่มีใคร (กริยาเติม s)' }
      ],
      mistake: {
        wrong: 'Each of the managers are ready.',
        right: 'Each of the managers is ready.',
        why: {
          en: 'The subject is each (one by one), not managers.',
          th: 'ประธานคือ each (แต่ละคน) ไม่ใช่ managers จึงใช้ is'
        }
      }
    },
    {
      id: 'a-number-of',
      name: { en: 'A number of / the number of', th: 'หลาย… กับ จำนวน… (a number of / the number of)' },
      formula: ['a number of + N(s) + V1', 'the number of + N(s) + V(s/es)'],
      use: {
        en: 'A number of means many: no -s on the verb. The number of means the amount: add -s.',
        th: 'a number of = หลาย ๆ (กริยาไม่เติม s) / the number of = จำนวน (กริยาเติม s)'
      },
      example: {
        en: 'The number of participants {{has}} doubled this year.',
        th: 'จำนวนผู้เข้าร่วมเพิ่มขึ้นเป็นสองเท่าในปีนี้'
      },
      clues: [
        { w: 'a number of', en: 'many', th: 'หลาย…' },
        { w: 'the number of', en: 'the amount, one number', th: 'จำนวนของ… (ตัวเลขเดียว)' }
      ],
      mistake: {
        wrong: 'The number of customers have grown.',
        right: 'The number of customers has grown.',
        why: {
          en: 'The subject is the number (one amount), not customers.',
          th: 'ประธานคือ the number (จำนวน) ไม่ใช่ customers จึงใช้ has'
        }
      }
    },
    {
      id: 'either-neither',
      name: { en: 'Either … or / neither … nor', th: '…หรือ… / ไม่ทั้ง…และ… (either … or / neither … nor)' },
      formula: ['either + N + or + N + V', 'neither + N + nor + N + V'],
      use: {
        en: 'The verb follows the noun closest to it, the one after or / nor.',
        th: 'ผันกริยาตามคำนามที่อยู่ใกล้กริยาที่สุด คือตัวหลัง or / nor'
      },
      example: {
        en: 'Neither the manager nor the assistants {{were}} informed.',
        th: 'ทั้งผู้จัดการและผู้ช่วยไม่ได้รับแจ้งเลย'
      },
      clues: [
        { w: 'either … or', en: 'one or the other', th: '…หรือ… (อย่างใดอย่างหนึ่ง)' },
        { w: 'neither … nor', en: 'not this and not that', th: 'ไม่ทั้ง…และ…' },
        { w: 'not only … but also', en: 'this and also that', th: 'ไม่เพียงแต่…แต่ยัง…' }
      ],
      mistake: {
        wrong: 'Neither the director nor her assistants is free.',
        right: 'Neither the director nor her assistants are free.',
        why: {
          en: 'The noun next to the verb is assistants (more than one), so use are.',
          th: 'คำนามที่ติดกริยาคือ assistants (หลายคน) จึงใช้ are'
        }
      }
    },
    {
      id: 'relative-clause-agreement',
      name: { en: 'Verb after who / which / that', th: 'กริยาหลังคำว่า "ที่" (verb after who / which / that)' },
      formula: ['N + who/which/that + V'],
      use: {
        en: 'The verb after who, which or that follows the noun just before it.',
        th: 'กริยาหลัง who, which, that ผันตามคำนามที่อยู่หน้ามัน'
      },
      example: {
        en: 'Employees who {{wish}} to attend should register by Friday.',
        th: 'พนักงานที่ต้องการเข้าร่วมควรลงทะเบียนภายในวันศุกร์'
      },
      clues: [
        { w: 'who', en: 'for people', th: 'ที่ (ใช้กับคน)' },
        { w: 'which', en: 'for things', th: 'ที่ (ใช้กับสิ่งของ)' },
        { w: 'that', en: 'for people or things', th: 'ที่ (ใช้ได้ทั้งคนและสิ่งของ)' }
      ],
      mistake: {
        wrong: 'the consultants who was hired',
        right: 'the consultants who were hired',
        why: {
          en: 'Who means the consultants (more than one), so use were.',
          th: 'who หมายถึง consultants (หลายคน) จึงใช้ were'
        }
      }
    },
    {
      id: 'gerund-subject',
      name: { en: 'V-ing as the subject', th: 'กริยาเติม -ing เป็นประธาน (V-ing as the subject)' },
      formula: ['V-ing + Obj + V(s/es)'],
      use: {
        en: 'A V-ing subject counts as one thing, so the verb takes -s.',
        th: 'ถ้าประธานเป็นกริยาเติม -ing นับเป็น 1 เรื่อง กริยาจึงเติม s'
      },
      example: {
        en: 'Reviewing customer feedback {{helps}} us improve our service.',
        th: 'การทบทวนความคิดเห็นของลูกค้าช่วยให้เราปรับปรุงบริการได้'
      },
      mistake: {
        wrong: 'Reviewing the reports help us.',
        right: 'Reviewing the reports helps us.',
        why: {
          en: 'The subject is reviewing (one action), not reports.',
          th: 'ประธานคือ reviewing (การทบทวน 1 เรื่อง) ไม่ใช่ reports จึงใช้ helps'
        }
      }
    },
    {
      id: 'there-is-are',
      name: { en: 'There is / there are', th: 'มี… (there is / there are)' },
      formula: ['there + is + N', 'there + are + N(s)'],
      use: {
        en: 'There is not the subject. Look at the noun after is/are: one thing takes is, more than one takes are.',
        th: 'there ไม่ใช่ประธานตัวจริง ให้ดูคำนามหลัง is/are ถ้าสิ่งเดียวใช้ is ถ้าหลายสิ่งใช้ are'
      },
      example: {
        en: 'There {{are}} several openings at our Singapore branch.',
        th: 'มีตำแหน่งว่างหลายตำแหน่งที่สาขาสิงคโปร์'
      },
      clues: [
        { w: 'several / many + N(s)', en: 'more than one: use are', th: 'หลาย… ใช้ there are' }
      ],
      mistake: {
        wrong: 'There is several openings.',
        right: 'There are several openings.',
        why: {
          en: 'The noun after the verb, openings, is more than one, so use are.',
          th: 'คำนามหลังกริยาคือ openings (หลายตำแหน่ง) จึงใช้ are'
        }
      }
    }
  ]
}
