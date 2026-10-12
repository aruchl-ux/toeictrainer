import type { CheatSheet } from './types'

export const tenseVoice: CheatSheet = {
  topic: 'tense-voice',
  intro: {
    en: 'First look at the time words. Then ask: does the subject do the action, or is it done to the subject?',
    th: 'ดูคำบอกเวลาในประโยคก่อน แล้วถามว่า ประธานเป็นคนทำเอง หรือถูกทำ'
  },
  entries: [
    {
      id: 'present-simple',
      name: { en: 'Present simple', th: 'Present simple (ปัจจุบันกาลธรรมดา)' },
      formula: ['S + V(s/es) + Obj'],
      use: {
        en: 'For habits and facts. If the subject is one person or thing (he, she, it), add -s/-es to the verb.',
        th: 'ใช้กับเรื่องที่ทำเป็นประจำ หรือเป็นความจริง ถ้าประธานเป็นคนเดียวหรือสิ่งเดียว (he, she, it) กริยาเติม s/es'
      },
      example: {
        en: 'The shuttle bus {{leaves}} the hotel every 30 minutes.',
        th: 'รถรับส่งออกจากโรงแรมทุก 30 นาที'
      },
      clues: ['every day', 'usually', 'always', 'often', 'regularly']
    },
    {
      id: 'present-continuous',
      name: { en: 'Present continuous', th: 'Present continuous (ปัจจุบันกาลกำลังกระทำ)' },
      formula: ['S + am/is/are + V-ing + Obj'],
      use: {
        en: 'For something happening right now, or a plan already fixed for soon.',
        th: 'ใช้กับสิ่งที่กำลังทำอยู่ตอนนี้ หรือแผนที่นัดไว้แล้วเร็ว ๆ นี้'
      },
      example: {
        en: 'Ms. Park {{is reviewing}} the contract at the moment.',
        th: 'คุณพาร์คกำลังตรวจสัญญาอยู่ในขณะนี้'
      },
      clues: ['now', 'currently', 'at the moment', 'right now', 'this week']
    },
    {
      id: 'present-perfect',
      name: { en: 'Present perfect', th: 'Present perfect (ปัจจุบันกาลสมบูรณ์)' },
      formula: ['S + have/has + V3 + Obj'],
      use: {
        en: 'For something that started in the past and is still true now. Often with since, for or already.',
        th: 'ใช้กับเรื่องที่เริ่มในอดีตและยังเป็นอยู่ถึงตอนนี้ มักเจอ since, for, already'
      },
      example: {
        en: 'Sales {{have increased}} steadily since January.',
        th: 'ยอดขายเพิ่มขึ้นอย่างต่อเนื่องตั้งแต่เดือนมกราคม'
      },
      clues: ['since', 'for', 'already', 'yet', 'recently', 'so far', 'over the past + time']
    },
    {
      id: 'present-perfect-continuous',
      name: { en: 'Present perfect continuous', th: 'Present perfect continuous' },
      formula: ['S + have/has + been + V-ing'],
      use: {
        en: 'Like the present perfect, but it stresses how long the action has gone on. It is still going on.',
        th: 'เหมือน present perfect แต่เน้นว่าทำต่อเนื่องมานานแค่ไหน และตอนนี้ยังทำอยู่'
      },
      example: {
        en: 'Mr. Lee {{has been working}} on the report for three hours.',
        th: 'คุณลีทำรายงานฉบับนี้มาสามชั่วโมงแล้ว'
      },
      clues: ['for + period', 'since', 'all day', 'lately']
    },
    {
      id: 'past-simple',
      name: { en: 'Past simple', th: 'Past simple (อดีตกาลธรรมดา)' },
      formula: ['S + V2 + Obj'],
      use: {
        en: 'For a finished action at a clear past time, like yesterday, last year or ago.',
        th: 'ใช้กับเรื่องที่จบไปแล้วในอดีต และบอกเวลาชัด เช่น yesterday, last year, ago'
      },
      example: {
        en: 'The company {{opened}} its first branch in 2015.',
        th: 'บริษัทเปิดสาขาแรกในปี 2015'
      },
      clues: ['yesterday', 'last + time', 'ago', 'in + past year', 'previously']
    },
    {
      id: 'past-continuous',
      name: { en: 'Past continuous', th: 'Past continuous (อดีตกาลกำลังกระทำ)' },
      formula: ['S + was/were + V-ing'],
      use: {
        en: 'For something that was in progress in the past when another thing happened (when + V2).',
        th: 'ใช้กับสิ่งที่กำลังทำอยู่ในอดีต แล้วมีอีกเรื่องเข้ามาแทรก (when + V2)'
      },
      example: {
        en: 'The manager {{was speaking}} with a client when the power went out.',
        th: 'ผู้จัดการกำลังคุยกับลูกค้าอยู่ตอนที่ไฟดับ'
      },
      clues: ['when + V2', 'while', 'at that time', 'at 3 p.m. yesterday']
    },
    {
      id: 'past-perfect',
      name: { en: 'Past perfect', th: 'Past perfect (อดีตกาลสมบูรณ์)' },
      formula: ['S + had + V3 + Obj'],
      use: {
        en: 'When there are two past actions, use had + V3 for the one that happened first.',
        th: 'ในอดีตมี 2 เรื่อง เรื่องที่เกิดก่อนใช้ had + V3'
      },
      example: {
        en: 'The meeting {{had started}} before Ms. Diaz arrived.',
        th: 'การประชุมเริ่มไปแล้วก่อนที่คุณดิแอซจะมาถึง'
      },
      clues: ['before + V2', 'by the time + V2', 'already', 'after + had V3']
    },
    {
      id: 'future-will',
      name: { en: 'Future simple (will)', th: 'Future simple (will)' },
      formula: ['S + will + V1 + Obj'],
      use: {
        en: 'For the future. The verb after will is always the base form (no -s).',
        th: 'ใช้พูดถึงอนาคต กริยาหลัง will เป็นรูปเดิมเสมอ (ไม่เติม s)'
      },
      example: {
        en: 'The new policy {{will take}} effect next month.',
        th: 'นโยบายใหม่จะมีผลบังคับใช้เดือนหน้า'
      },
      clues: ['tomorrow', 'next + time', 'soon', 'upcoming', 'in the future']
    },
    {
      id: 'be-going-to',
      name: { en: 'be going to', th: 'be going to (แผนที่ตั้งใจไว้)' },
      formula: ['S + am/is/are + going to + V1'],
      use: {
        en: 'For a plan you have already decided on.',
        th: 'ใช้กับแผนที่ตั้งใจไว้แล้ว'
      },
      example: {
        en: 'We {{are going to hire}} two more engineers this year.',
        th: 'ปีนี้เราจะจ้างวิศวกรเพิ่มอีกสองคน'
      },
      clues: ['this year', 'next + time', 'plan']
    },
    {
      id: 'future-continuous',
      name: { en: 'Future continuous', th: 'Future continuous' },
      formula: ['S + will + be + V-ing'],
      use: {
        en: 'For something that will be in progress at a certain time in the future.',
        th: 'ใช้กับสิ่งที่จะกำลังทำอยู่ ณ เวลาหนึ่งในอนาคต'
      },
      example: {
        en: 'At 3 p.m. tomorrow, Ms. Tan {{will be presenting}} the results.',
        th: 'พรุ่งนี้เวลาบ่ายสามโมง คุณแทนจะกำลังนำเสนอผลลัพธ์อยู่'
      },
      clues: ['at this time tomorrow', 'at + time + future day']
    },
    {
      id: 'future-perfect',
      name: { en: 'Future perfect', th: 'Future perfect (อนาคตกาลสมบูรณ์)' },
      formula: ['S + will + have + V3'],
      use: {
        en: 'For something that will be finished before a future time. Often with by + time.',
        th: 'ใช้กับสิ่งที่จะเสร็จก่อนเวลาหนึ่งในอนาคต มักเจอ by + เวลา'
      },
      example: {
        en: 'By the end of June, the team {{will have completed}} the project.',
        th: 'ภายในสิ้นเดือนมิถุนายน ทีมจะทำโครงการนี้เสร็จแล้ว'
      },
      clues: ['by + future time', 'by the time + V(s/es)', 'by next year']
    },
    {
      id: 'time-clause-future',
      name: { en: 'Future time clauses', th: 'ประโยคบอกเวลาที่พูดถึงอนาคต' },
      formula: ['when/once/after/as soon as + S + V(s/es), S + will + V1'],
      use: {
        en: 'After when, once, after or as soon as, use the present simple even for the future. Do not use will.',
        th: 'หลัง when, once, after, as soon as ถึงจะพูดถึงอนาคต ก็ใช้ present simple ห้ามใช้ will'
      },
      example: {
        en: 'Please call me as soon as the shipment {{arrives}}.',
        th: 'กรุณาโทรหาฉันทันทีที่สินค้ามาถึง'
      },
      clues: ['when', 'once', 'as soon as', 'until', 'before', 'after']
    },
    {
      id: 'passive-voice',
      name: { en: 'Passive voice', th: 'Passive voice (ประโยคถูกกระทำ)' },
      formula: ['S + be + V3', 'S + have/has + been + V3', 'S + is/are + being + V3'],
      use: {
        en: 'Use it when something is done to the subject. The pattern is be + V3. If no object follows the blank, it is often passive.',
        th: 'ใช้เมื่อประธาน "ถูกทำ" ไม่ได้ทำเอง สูตรคือ be + V3 ถ้าหลังช่องว่างไม่มีกรรม มักเป็น passive'
      },
      example: {
        en: 'The invoices {{were sent}} to all clients yesterday.',
        th: 'ใบแจ้งหนี้ถูกส่งถึงลูกค้าทุกรายเมื่อวานนี้'
      },
      clues: ['by + doer', 'no object after the blank', 'thing as subject']
    }
  ]
}
