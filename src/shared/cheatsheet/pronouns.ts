import type { CheatSheet } from './types'

export const pronouns: CheatSheet = {
  topic: 'pronouns',
  intro: {
    en: 'Decide the job of the blank: subject, object, owner of a noun, or the same person as the subject. Each job has its own form.',
    th: 'ดูว่าช่องว่างทำหน้าที่อะไร: ประธาน กรรม เจ้าของคำนาม หรือคนเดียวกับประธาน แต่ละหน้าที่ใช้รูปต่างกัน'
  },
  entries: [
    {
      id: 'pronoun-cases',
      name: { en: 'Subject, object and possessive', th: 'สรรพนามประธาน กรรม และแสดงความเป็นเจ้าของ' },
      formula: ['he/she/we/they + V', 'V/Prep + me/him/her/us/them', 'my/his/her/our/their + N'],
      use: {
        en: 'Before a verb use the subject form; after a verb or preposition use the object form; before a noun use the possessive.',
        th: 'หน้ากริยาใช้รูปประธาน หลังกริยาหรือคำบุพบทใช้รูปกรรม หน้าคำนามใช้รูปแสดงความเป็นเจ้าของ'
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
        en: 'Use these when no noun follows; they stand for "possessive + noun" (yours = your laptop).',
        th: 'ใช้เมื่อไม่มีคำนามตามหลัง เพราะคำนี้แทน "คำแสดงเจ้าของ + คำนาม" แล้ว (yours = your laptop)'
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
        en: 'Use -self when the object is the same person as the subject, to stress "personally", or with by to mean alone.',
        th: 'ใช้ -self เมื่อกรรมเป็นคนเดียวกับประธาน เมื่อเน้นว่าทำเอง หรือใช้กับ by ในความหมายว่าตามลำพัง'
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
        en: 'In comparisons, that replaces a singular noun and those a plural noun, so the noun is not repeated.',
        th: 'ใช้ในการเปรียบเทียบเพื่อไม่ต้องพูดคำนามซ้ำ that แทนคำนามเอกพจน์ those แทนคำนามพหูพจน์'
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
        en: '"Those who" means the people who. It is plural, so the verb after it is plural too.',
        th: '"those who" แปลว่าผู้ที่ เป็นพหูพจน์ กริยาที่ตามมาจึงเป็นพหูพจน์ด้วย'
      },
      example: {
        en: '{{Those}} who wish to attend must register online.',
        th: 'ผู้ที่ต้องการเข้าร่วมต้องลงทะเบียนออนไลน์'
      }
    }
  ]
}
