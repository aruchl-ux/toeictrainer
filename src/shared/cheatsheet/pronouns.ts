import type { CheatSheet } from './types'

export const pronouns: CheatSheet = {
  topic: 'pronouns',
  intro: {
    en: 'Look where the blank is: before a verb, after a verb, or before a noun. Each place needs a different form.',
    th: 'ดูว่าช่องว่างอยู่ตรงไหน: หน้ากริยา หลังกริยา หรือหน้าคำนาม แต่ละที่ใช้รูปต่างกัน'
  },
  entries: [
    {
      id: 'pronoun-cases',
      name: { en: 'Subject, object and possessive', th: 'สรรพนามประธาน กรรม และแสดงความเป็นเจ้าของ' },
      formula: ['he/she/we/they + V', 'V/Prep + me/him/her/us/them', 'my/his/her/our/their + N'],
      use: {
        en: 'Before a verb: he, she, they. After a verb: him, her, them. Before a noun: his, her, their.',
        th: 'หน้ากริยาใช้ he, she, they / หลังกริยาใช้ him, her, them / หน้าคำนามใช้ his, her, their'
      },
      example: {
        en: 'Ms. Ortiz asked {{her}} assistant to book the room.',
        th: 'คุณออร์ติซขอให้ผู้ช่วยของเธอจองห้อง'
      }
    },
    {
      id: 'possessive-pronouns',
      name: { en: 'Possessive pronouns', th: 'สรรพนามแสดงความเป็นเจ้าของแบบไม่มีคำนามตาม' },
      formula: ['mine/yours/his/hers/ours/theirs'],
      use: {
        en: 'Use these when no noun follows. For example, yours = your laptop.',
        th: 'ใช้เมื่อข้างหลังไม่มีคำนาม เช่น yours = your laptop'
      },
      example: {
        en: 'My laptop is old, but {{yours}} is brand new.',
        th: 'แล็ปท็อปของฉันเก่าแล้ว แต่ของคุณเป็นเครื่องใหม่เอี่ยม'
      }
    },
    {
      id: 'reflexive-pronouns',
      name: { en: 'Reflexive pronouns', th: 'สรรพนามสะท้อน (-self)' },
      formula: ['S + V + myself/himself/themselves', 'by + himself/herself/themselves'],
      use: {
        en: 'Use -self when someone does something to themselves, or to stress they did it personally. By himself means alone.',
        th: 'ใช้ -self เมื่อทำกับตัวเอง หรือเน้นว่าทำเอง / by himself = ทำคนเดียว'
      },
      example: {
        en: 'Mr. Chen prepared the presentation {{himself}}.',
        th: 'คุณเฉินเตรียมการนำเสนอด้วยตัวเอง'
      },
      clues: ['by ___', 'S + V + ___ (same person)']
    },
    {
      id: 'that-those-of',
      name: { en: 'That of / those of', th: 'That of / those of' },
      formula: ['that + of + N', 'those + of + N'],
      use: {
        en: 'In comparisons they stand for a noun already said: that for one, those for more than one.',
        th: 'ใช้ในการเปรียบเทียบ แทนคำนามที่พูดไปแล้ว: that แทนตัวเดียว / those แทนหลายตัว'
      },
      example: {
        en: 'Our prices are lower than {{those}} of our competitors.',
        th: 'ราคาของเราต่ำกว่าราคาของคู่แข่ง'
      },
      clues: ['than ___ of', 'similar to ___ of']
    },
    {
      id: 'those-who',
      name: { en: 'Those who', th: 'Those who' },
      formula: ['those + who + V1'],
      use: {
        en: 'Those who means the people who. It is plural, so the verb has no -s.',
        th: 'those who = คนที่… (หลายคน) กริยาจึงไม่เติม s'
      },
      example: {
        en: '{{Those}} who wish to attend must register online.',
        th: 'ผู้ที่ต้องการเข้าร่วมต้องลงทะเบียนออนไลน์'
      }
    }
  ]
}
