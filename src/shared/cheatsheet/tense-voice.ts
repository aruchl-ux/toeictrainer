import type { CheatSheet } from './types'

export const tenseVoice: CheatSheet = {
  topic: 'tense-voice',
  intro: {
    en: 'All four choices are one verb in different forms, like opens, opened, has opened, will open. First find the time words (ago, since, by next year, at the moment). Then ask: does the subject do the action, or is it done to the subject?',
    th: 'ตัวเลือกทั้งสี่เป็นกริยาตัวเดียวกันแต่ต่างรูป เช่น opens, opened, has opened, will open ให้หาคำบอกเวลาก่อน (ago, since, by next year, at the moment) แล้วถามว่าประธานเป็นคนทำเอง หรือถูกทำ'
  },
  entries: [
    {
      id: 'present-simple',
      name: { en: 'Present simple', th: 'กาลปัจจุบันธรรมดา (present simple)' },
      formula: ['S + V(s/es) + Obj'],
      use: {
        en: 'For habits and facts. If the subject is one person or thing (he, she, it), add -s/-es to the verb.',
        th: 'ใช้กับเรื่องที่ทำเป็นประจำ หรือเป็นความจริง ถ้าประธานเป็นคนเดียวหรือสิ่งเดียว (he, she, it) กริยาเติม s/es'
      },
      example: {
        en: 'The shuttle bus {{leaves}} the hotel every 30 minutes.',
        th: 'รถรับส่งออกจากโรงแรมทุก 30 นาที'
      },
      clues: [
        { w: 'every day', en: 'each day', th: 'ทุกวัน' },
        { w: 'usually', en: 'most of the time', th: 'โดยปกติ' },
        { w: 'always', en: 'every time', th: 'เสมอ / ทุกครั้ง' },
        { w: 'often', en: 'many times', th: 'บ่อย ๆ' },
        { w: 'regularly', en: 'at regular times', th: 'เป็นประจำ' }
      ],
      mistake: {
        wrong: 'The bus leave every 30 minutes.',
        right: 'The bus leaves every 30 minutes.',
        why: {
          en: 'Thai verbs never change, but in English one subject (the bus) needs -s on the verb.',
          th: 'ภาษาไทยกริยาไม่เปลี่ยนรูป แต่ภาษาอังกฤษ ประธานสิ่งเดียว (the bus) กริยาต้องเติม s'
        }
      }
    },
    {
      id: 'present-continuous',
      name: { en: 'Present continuous', th: 'กาลปัจจุบันกำลังทำ (present continuous)' },
      formula: ['S + am/is/are + V-ing + Obj'],
      use: {
        en: 'For something happening right now, or a plan already fixed for soon.',
        th: 'ใช้กับสิ่งที่กำลังทำอยู่ตอนนี้ หรือแผนที่นัดไว้แล้วเร็ว ๆ นี้'
      },
      example: {
        en: 'Ms. Park {{is reviewing}} the contract at the moment.',
        th: 'คุณพาร์คกำลังตรวจสัญญาอยู่ในขณะนี้'
      },
      clues: [
        { w: 'now', en: 'at this time', th: 'ตอนนี้' },
        { w: 'currently', en: 'now', th: 'ในปัจจุบัน / ขณะนี้' },
        { w: 'at the moment', en: 'right now', th: 'ในขณะนี้' },
        { w: 'this week', en: 'during the present week', th: 'สัปดาห์นี้' }
      ],
      mistake: {
        wrong: 'She meeting a client now.',
        right: 'She is meeting a client now.',
        why: {
          en: 'Thai says กำลัง with no extra verb, but English needs both am/is/are and the -ing verb.',
          th: 'ภาษาไทยพูดแค่ "กำลัง" แต่ภาษาอังกฤษต้องมีทั้ง am/is/are และกริยาเติม -ing'
        }
      }
    },
    {
      id: 'present-perfect',
      name: { en: 'Present perfect', th: 'กาลปัจจุบันสมบูรณ์ (present perfect)' },
      formula: ['S + have/has + V3 + Obj'],
      use: {
        en: 'For something that started in the past and is still true now, or that is done and matters now. Often with since, for or already.',
        th: 'ใช้กับเรื่องที่เริ่มในอดีตและยังเป็นอยู่ถึงตอนนี้ หรือทำเสร็จแล้วและยังมีผลตอนนี้ มักเจอ since, for, already'
      },
      example: {
        en: 'Sales {{have increased}} steadily since January.',
        th: 'ยอดขายเพิ่มขึ้นอย่างต่อเนื่องตั้งแต่เดือนมกราคม'
      },
      clues: [
        { w: 'have/has + V3 + since', en: 'since + the time it started', th: 'ตั้งแต่… (จุดเริ่มในอดีต) จนถึงตอนนี้' },
        { w: 'for + period', en: 'for a length of time (for two years)', th: 'เป็นเวลา… (for two years)' },
        { w: 'already', en: 'before now', th: 'แล้ว / เรียบร้อยแล้ว' },
        { w: 'yet', en: 'until now (in questions and negatives)', th: 'ยัง… (ใช้ในคำถามและปฏิเสธ)' },
        { w: 'recently', en: 'not long ago', th: 'เมื่อเร็ว ๆ นี้' },
        { w: 'so far', en: 'until now', th: 'จนถึงตอนนี้' },
        { w: 'over the past + time', en: 'during the last … up to now', th: 'ตลอดช่วง… ที่ผ่านมา' }
      ],
      mistake: {
        wrong: 'I work here since 2019.',
        right: 'I have worked here since 2019.',
        why: {
          en: 'Since tells you it started in the past and is still true, so use have/has + V3.',
          th: 'since บอกว่าเริ่มในอดีตและยังเป็นอยู่ จึงต้องใช้ have/has + กริยาช่อง 3 ไม่ใช่กริยารูปเดิม'
        }
      }
    },
    {
      id: 'present-perfect-continuous',
      name: { en: 'Present perfect continuous', th: 'กาลปัจจุบันสมบูรณ์ต่อเนื่อง (present perfect continuous)' },
      formula: ['S + have/has + been + V-ing'],
      use: {
        en: 'Like the present perfect, but it stresses how long the action has gone on. It is still going on.',
        th: 'เหมือนกาลปัจจุบันสมบูรณ์ แต่เน้นว่าทำต่อเนื่องมานานแค่ไหน และตอนนี้ยังทำอยู่'
      },
      example: {
        en: 'Mr. Lee {{has been working}} on the report for three hours.',
        th: 'คุณลีทำรายงานฉบับนี้มาสามชั่วโมงแล้ว'
      },
      clues: [
        { w: 'for + period', en: 'for a length of time', th: 'เป็นเวลา…' },
        { w: 'since', en: 'from a past time until now', th: 'ตั้งแต่…' },
        { w: 'all day', en: 'the whole day', th: 'ทั้งวัน' },
        { w: 'lately', en: 'in the recent past', th: 'ช่วงนี้' }
      ],
      mistake: {
        wrong: 'I am waiting for two hours.',
        right: 'I have been waiting for two hours.',
        why: {
          en: 'For two hours says how long it has gone on, so use have/has been + -ing, not am/is/are + -ing.',
          th: 'for two hours บอกว่าทำมานานเท่าไร จึงใช้ have/has been + กริยาเติม -ing ไม่ใช่ am/is/are'
        }
      }
    },
    {
      id: 'past-simple',
      name: { en: 'Past simple', th: 'กาลอดีตธรรมดา (past simple)' },
      formula: ['S + V2 + Obj'],
      use: {
        en: 'For a finished action at a clear past time, like yesterday, last year or ago.',
        th: 'ใช้กับเรื่องที่จบไปแล้วในอดีต และบอกเวลาชัด เช่น yesterday, last year, ago'
      },
      example: {
        en: 'The company {{opened}} its first branch in 2015.',
        th: 'บริษัทเปิดสาขาแรกในปี 2015'
      },
      clues: [
        { w: 'V2 + ago', en: 'ago = a finished past time', th: '…ที่แล้ว (two years ago = สองปีที่แล้ว)' },
        { w: 'yesterday', en: 'the day before today', th: 'เมื่อวาน' },
        { w: 'last + time', en: 'the one before this (last week)', th: '…ที่แล้ว (last week = สัปดาห์ที่แล้ว)' },
        { w: 'in + past year', en: 'in a year that has passed (in 2015)', th: 'ในปี… ที่ผ่านไปแล้ว' },
        { w: 'previously', en: 'before', th: 'ก่อนหน้านี้' }
      ],
      mistake: {
        wrong: 'The store has opened two years ago.',
        right: 'The store opened two years ago.',
        why: {
          en: 'Thai แล้ว does not mean has/have. With a clear past time (ago, last year), use V2.',
          th: 'คำว่า "แล้ว" ไม่ได้แปลว่าต้องใช้ has ถ้ามีเวลาในอดีตชัด ๆ (ago, last year) ใช้กริยาช่อง 2'
        }
      }
    },
    {
      id: 'past-continuous',
      name: { en: 'Past continuous', th: 'กาลอดีตกำลังทำ (past continuous)' },
      formula: ['S + was/were + V-ing'],
      use: {
        en: 'For something that was in progress in the past when another thing happened (when + V2).',
        th: 'ใช้กับสิ่งที่กำลังทำอยู่ในอดีต แล้วมีอีกเรื่องเข้ามาแทรก (when + กริยาช่อง 2)'
      },
      example: {
        en: 'The manager {{was speaking}} with a client when the power went out.',
        th: 'ผู้จัดการกำลังคุยกับลูกค้าอยู่ตอนที่ไฟดับ'
      },
      clues: [
        { w: 'when + V2', en: 'when the other thing happened', th: 'ตอนที่… (อีกเรื่องเกิดขึ้น)' },
        { w: 'while', en: 'during the time that', th: 'ขณะที่' },
        { w: 'at that time', en: 'then', th: 'ในตอนนั้น' },
        { w: 'at 3 p.m. yesterday', en: 'at a clear past time', th: 'เมื่อวานตอนบ่ายสามโมง' }
      ],
      mistake: {
        wrong: 'He was speak with a client.',
        right: 'He was speaking with a client.',
        why: {
          en: 'For กำลัง…อยู่ in the past, was/were needs the -ing verb.',
          th: '"กำลัง…อยู่" ในอดีต ต้องใช้ was/were + กริยาเติม -ing'
        }
      }
    },
    {
      id: 'past-perfect',
      name: { en: 'Past perfect', th: 'กาลอดีตสมบูรณ์ (past perfect)' },
      formula: ['S + had + V3 + Obj'],
      use: {
        en: 'When there are two past actions, use had + V3 for the one that happened first.',
        th: 'ในอดีตมี 2 เรื่อง เรื่องที่เกิดก่อนใช้ had + กริยาช่อง 3'
      },
      example: {
        en: 'The meeting {{had started}} before Ms. Diaz arrived.',
        th: 'การประชุมเริ่มไปแล้วก่อนที่คุณดิแอซจะมาถึง'
      },
      clues: [
        { w: 'before + V2', en: 'before the later past action', th: 'ก่อนที่… (อีกเรื่องในอดีต)' },
        { w: 'by the time + V2', en: 'when the later past action happened', th: 'ตอนที่… (เรื่องแรกเสร็จไปแล้ว)' },
        { w: 'already', en: 'before then', th: 'แล้ว / เรียบร้อยแล้ว' },
        { w: 'after + had + V3', en: 'after the earlier action', th: 'หลังจากที่…ไปแล้ว' }
      ],
      mistake: {
        wrong: 'By the time he arrived, the flight has left.',
        right: 'By the time he arrived, the flight had left.',
        why: {
          en: 'Both actions are in the past (arrived), so the earlier one takes had, not has.',
          th: 'ทั้งสองเรื่องอยู่ในอดีต (arrived) เรื่องที่เกิดก่อนจึงใช้ had ไม่ใช่ has'
        }
      }
    },
    {
      id: 'future-will',
      name: { en: 'Future simple (will)', th: 'กาลอนาคตด้วย will (future simple)' },
      formula: ['S + will + V1 + Obj'],
      use: {
        en: 'For the future. The verb after will is always the base form (no -s).',
        th: 'ใช้พูดถึงอนาคต กริยาหลัง will เป็นรูปเดิมเสมอ (ไม่เติม s)'
      },
      example: {
        en: 'The new policy {{will take}} effect next month.',
        th: 'นโยบายใหม่จะมีผลบังคับใช้เดือนหน้า'
      },
      clues: [
        { w: 'tomorrow', en: 'the day after today', th: 'พรุ่งนี้' },
        { w: 'next + time', en: 'the one after this (next week)', th: '…หน้า (next week = สัปดาห์หน้า)' },
        { w: 'soon', en: 'in a short time', th: 'เร็ว ๆ นี้' },
        { w: 'upcoming', en: 'coming soon', th: 'ที่กำลังจะมาถึง' },
        { w: 'in the future', en: 'later on', th: 'ในอนาคต' }
      ],
      mistake: {
        wrong: 'The policy will takes effect.',
        right: 'The policy will take effect.',
        why: {
          en: 'After will, use the base verb with no -s, even for one subject.',
          th: 'หลัง will ใช้กริยารูปเดิม ไม่เติม s แม้ประธานจะเป็นสิ่งเดียว'
        }
      }
    },
    {
      id: 'be-going-to',
      name: { en: 'be going to', th: 'แผนที่ตั้งใจไว้แล้ว (be going to)' },
      formula: ['S + am/is/are + going to + V1'],
      use: {
        en: 'For a plan you have already decided on.',
        th: 'ใช้กับแผนที่ตั้งใจไว้แล้ว'
      },
      example: {
        en: 'We {{are going to hire}} two more engineers this year.',
        th: 'ปีนี้เราจะจ้างวิศวกรเพิ่มอีกสองคน'
      },
      clues: [
        { w: 'this year', en: 'during the present year', th: 'ปีนี้' },
        { w: 'next + time', en: 'the one after this', th: '…หน้า' },
        { w: 'plan', en: 'something decided', th: 'แผนที่วางไว้' }
      ],
      mistake: {
        wrong: 'We going to hire two engineers.',
        right: 'We are going to hire two engineers.',
        why: {
          en: 'Thai จะ is one word, but English needs am/is/are before going to.',
          th: 'ภาษาไทยพูดแค่ "จะ" แต่ภาษาอังกฤษต้องมี am/is/are หน้า going to'
        }
      }
    },
    {
      id: 'future-continuous',
      name: { en: 'Future continuous', th: 'กาลอนาคตกำลังทำ (future continuous)' },
      formula: ['S + will + be + V-ing'],
      use: {
        en: 'For something that will be in progress at a certain time in the future.',
        th: 'ใช้กับสิ่งที่จะกำลังทำอยู่ ณ เวลาหนึ่งในอนาคต'
      },
      example: {
        en: 'At 3 p.m. tomorrow, Ms. Tan {{will be presenting}} the results.',
        th: 'พรุ่งนี้เวลาบ่ายสามโมง คุณแทนจะกำลังนำเสนอผลลัพธ์อยู่'
      },
      clues: [
        { w: 'at this time tomorrow', en: 'tomorrow at this same time', th: 'เวลานี้ของพรุ่งนี้' },
        { w: 'at + time + future day', en: 'at a clear future time', th: 'ตอน… ของวันข้างหน้า (at 3 p.m. tomorrow)' }
      ],
      mistake: {
        wrong: 'She will presenting the results.',
        right: 'She will be presenting the results.',
        why: {
          en: 'Will + -ing needs be in the middle: will be + -ing.',
          th: 'ระหว่าง will กับกริยาเติม -ing ต้องมี be เสมอ'
        }
      }
    },
    {
      id: 'future-perfect',
      name: { en: 'Future perfect', th: 'กาลอนาคตสมบูรณ์ (future perfect)' },
      formula: ['S + will + have + V3'],
      use: {
        en: 'For something that will be finished before a future time. Often with by + time.',
        th: 'ใช้กับสิ่งที่จะเสร็จก่อนเวลาหนึ่งในอนาคต มักเจอ by + เวลา'
      },
      example: {
        en: 'By the end of June, the team {{will have completed}} the project.',
        th: 'ภายในสิ้นเดือนมิถุนายน ทีมจะทำโครงการนี้เสร็จแล้ว'
      },
      clues: [
        { w: 'by + future time', en: 'no later than a future time', th: 'ไม่เกิน… / ก่อนถึง… (เวลาในอนาคต)' },
        { w: 'by the time + V(s/es)', en: 'when it happens (future)', th: 'เมื่อถึงตอนที่… (ในอนาคต)' },
        { w: 'by the end of this year', en: 'no later than the end of this year', th: 'ภายในสิ้นปีนี้' }
      ],
      mistake: {
        wrong: 'By the end of this year, we have hired 200 people.',
        right: 'By the end of this year, we will have hired 200 people.',
        why: {
          en: 'By + a future time means it will be done by then, so use will have + V3.',
          th: 'by + เวลาในอนาคต = จะเสร็จก่อนเวลานั้น จึงใช้ will have + กริยาช่อง 3'
        }
      }
    },
    {
      id: 'time-clause-future',
      name: { en: 'Future time clauses', th: 'ประโยคบอกเวลาที่พูดถึงอนาคต (future time clauses)' },
      formula: ['when/once/after/as soon as + S + V(s/es), S + will + V1'],
      use: {
        en: 'In a time clause (when, once, after, as soon as + S + V), use the present simple even for the future. Do not use will there.',
        th: 'ในประโยคบอกเวลา (when, once, after, as soon as + ประธาน + กริยา) ถึงจะพูดถึงอนาคต ก็ใช้กาลปัจจุบัน ห้ามใส่ will'
      },
      example: {
        en: 'Please call me as soon as the shipment {{arrives}}.',
        th: 'กรุณาโทรหาฉันทันทีที่สินค้ามาถึง'
      },
      clues: [
        { w: 'once + present simple', en: 'once = as soon as; present even for the future', th: 'once = ทันทีที่ ใช้กาลปัจจุบันแม้พูดถึงอนาคต' },
        { w: 'when', en: 'at the time that', th: 'เมื่อ' },
        { w: 'as soon as', en: 'right after', th: 'ทันทีที่' },
        { w: 'until', en: 'up to the time that', th: 'จนกว่า' },
        { w: 'before / after', en: 'earlier than / later than', th: 'ก่อนที่ / หลังจากที่' }
      ],
      mistake: {
        wrong: 'once the contract will be signed',
        right: 'once the contract is signed',
        why: {
          en: 'Thai can say จะ in both parts, but after once, when or as soon as English uses the present.',
          th: 'ภาษาไทยใส่ "จะ" ได้ทั้งสองส่วน แต่หลัง once, when, as soon as ภาษาอังกฤษใช้กาลปัจจุบัน'
        }
      }
    },
    {
      id: 'passive-voice',
      name: { en: 'Passive voice', th: 'รูปถูกกระทำ (passive voice)' },
      formula: ['S + be + V3', 'S + have/has + been + V3', 'S + is/are + being + V3'],
      use: {
        en: 'Use it when something is done to the subject. The pattern is be + V3. If no object follows the blank, it is often passive; if an object follows, the subject usually does the action (except be given / be sent + a thing).',
        th: 'ใช้เมื่อประธาน "ถูกทำ" ไม่ได้ทำเอง สูตรคือ be + กริยาช่อง 3 ถ้าหลังช่องว่างไม่มีกรรม มักเป็นรูปถูกกระทำ ถ้ามีกรรมตามหลัง มักเป็นประธานทำเอง (ยกเว้น be given / be sent + สิ่งของ)'
      },
      example: {
        en: 'The invoices {{were sent}} to all clients yesterday.',
        th: 'ใบแจ้งหนี้ถูกส่งถึงลูกค้าทุกรายเมื่อวานนี้'
      },
      clues: [
        { w: 'was/were + V3', en: 'was done (past)', th: 'ถูก… (ในอดีต)' },
        { w: 'will + be + V3', en: 'will be done (future)', th: 'จะถูก…' },
        { w: 'by + doer', en: 'by the person who does it', th: 'โดย… (คนที่ทำ)' },
        { w: 'no object after the blank', en: 'nothing receives the action', th: 'หลังช่องว่างไม่มีกรรม มักเป็นรูปถูกกระทำ (ยกเว้น rise, happen)' },
        { w: 'rise / happen / occur / arrive', en: 'no object, never passive', th: 'กริยาพวกนี้ไม่มีรูปถูกกระทำ (rose ไม่ใช่ were risen)' },
        { w: 'thing as subject', en: 'a room, a meeting, a form', th: 'ประธานเป็นสิ่งของ (ห้อง, การประชุม) มักถูกทำ' }
      ],
      mistake: {
        wrong: 'The room is renovating.',
        right: 'The room is being renovated.',
        why: {
          en: 'Thai can say ห้องกำลังซ่อม, but a room cannot renovate itself: it is being renovated.',
          th: 'ภาษาไทยพูดว่า "ห้องกำลังซ่อม" ได้ แต่ห้องซ่อมตัวเองไม่ได้ ต้องใช้รูปถูกกระทำ is being + กริยาช่อง 3'
        }
      }
    }
  ]
}
