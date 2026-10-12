import type { CheatSheet } from './types'

export const tenseVoice: CheatSheet = {
  topic: 'tense-voice',
  intro: {
    en: 'Pick the tense from the time words in the sentence, then check whether the subject does the action (active) or receives it (passive).',
    th: 'ดูคำบอกเวลาในประโยคเพื่อเลือก tense แล้วเช็กว่าประธานเป็นผู้ทำ (active) หรือผู้ถูกกระทำ (passive)'
  },
  entries: [
    {
      id: 'present-simple',
      name: { en: 'Present simple', th: 'Present simple (ปัจจุบันกาลธรรมดา)' },
      formula: ['S + V(s/es) + Obj'],
      use: {
        en: 'Facts, habits, routines and fixed schedules. Add -s/-es when the subject is he, she, it or a singular noun.',
        th: 'ความจริงทั่วไป นิสัย กิจวัตร และตารางเวลาที่แน่นอน ถ้าประธานเป็น he, she, it หรือคำนามเอกพจน์ ให้เติม -s/-es ที่กริยา'
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
        en: 'An action happening now, a temporary situation, or a plan already arranged for the near future.',
        th: 'สิ่งที่กำลังเกิดขึ้นตอนนี้ สถานการณ์ชั่วคราว หรือแผนในอนาคตอันใกล้ที่นัดหมายไว้แล้ว'
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
        en: 'Something that started in the past and continues to now, or a past action whose result matters now.',
        th: 'สิ่งที่เริ่มในอดีตและต่อเนื่องมาถึงปัจจุบัน หรือเหตุการณ์ในอดีตที่ผลยังส่งถึงตอนนี้'
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
        en: 'An activity that started in the past and is still going on, stressing how long it has lasted.',
        th: 'กิจกรรมที่เริ่มในอดีตและยังทำอยู่ เน้นว่าทำมานานเท่าไรแล้ว'
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
        en: 'A finished action at a specific time in the past.',
        th: 'เหตุการณ์ที่จบไปแล้วในเวลาที่ระบุในอดีต'
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
        en: 'An action in progress at a point in the past, often interrupted by another past action.',
        th: 'สิ่งที่กำลังทำอยู่ ณ เวลาหนึ่งในอดีต มักมีอีกเหตุการณ์หนึ่ง (past simple) เข้ามาแทรก'
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
        en: 'The earlier of two past actions: it was already finished when the second one happened.',
        th: 'เหตุการณ์ที่เกิดก่อนในสองเหตุการณ์ในอดีต คือจบไปแล้วตอนที่อีกเหตุการณ์เกิดขึ้น'
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
        en: 'Future facts, predictions, promises and decisions. The verb after will never takes -s.',
        th: 'ข้อเท็จจริงในอนาคต การคาดการณ์ คำสัญญา หรือการตัดสินใจ กริยาหลัง will เป็นรูปเดิมเสมอ ไม่เติม -s'
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
        en: 'A plan or intention decided before now, or a prediction based on what you can see.',
        th: 'แผนหรือความตั้งใจที่ตัดสินใจไว้ก่อนแล้ว หรือการคาดการณ์จากสิ่งที่เห็นอยู่ตรงหน้า'
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
        en: 'An action that will be in progress at a set time in the future.',
        th: 'สิ่งที่จะกำลังทำอยู่ ณ เวลาที่ระบุในอนาคต'
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
        en: 'Something that will be finished before a point in the future.',
        th: 'สิ่งที่จะเสร็จสมบูรณ์ก่อนถึงเวลาหนึ่งในอนาคต'
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
        en: 'After when, once, before, after, until and as soon as, use the present simple for a future event, never will.',
        th: 'หลัง when, once, before, after, until, as soon as ถ้าพูดถึงอนาคต ให้ใช้ present simple ห้ามใช้ will'
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
        en: 'The subject receives the action. Change the tense through be (is, was, will be, has been…); the main verb stays V3. Often followed by by + the doer, and no object after the verb.',
        th: 'ประธานเป็นผู้ถูกกระทำ เปลี่ยน tense ที่ตัว be (is, was, will be, has been…) ส่วนกริยาหลักเป็น V3 เสมอ มักตามด้วย by + ผู้กระทำ และไม่มีกรรมตามหลังกริยา'
      },
      example: {
        en: 'The invoices {{were sent}} to all clients yesterday.',
        th: 'ใบแจ้งหนี้ถูกส่งถึงลูกค้าทุกรายเมื่อวานนี้'
      },
      clues: ['by + doer', 'no object after the blank', 'thing as subject']
    }
  ]
}
