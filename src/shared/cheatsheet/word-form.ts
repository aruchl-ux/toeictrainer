import type { CheatSheet } from './types'

export const wordForm: CheatSheet = {
  topic: 'word-form',
  intro: {
    en: 'All four choices share one root. Look at the words right before and after the blank to decide which part of speech fits, then use the suffix to find it.',
    th: 'ตัวเลือกทั้งสี่มาจากรากศัพท์เดียวกัน ดูคำหน้าและหลังช่องว่างเพื่อตัดสินว่าต้องการคำชนิดไหน แล้วใช้คำลงท้าย (suffix) หาคำตอบ'
  },
  entries: [
    {
      id: 'noun-after-determiner',
      name: { en: 'Noun after a determiner', th: 'คำนามหลัง determiner' },
      formula: ['a/the/this + (Adj) + N', 'my/your/its/their + (Adj) + N'],
      use: {
        en: 'After an article, a possessive or this/that, the blank is a noun, with or without an adjective in front of it.',
        th: 'หลัง a/the, คำแสดงความเป็นเจ้าของ (my, its, their) หรือ this/that ช่องว่างคือคำนาม อาจมีคำคุณศัพท์คั่นอยู่หน้าก็ได้'
      },
      example: {
        en: 'We appreciate your {{cooperation}} on this matter.',
        th: 'เราขอขอบคุณสำหรับความร่วมมือของคุณในเรื่องนี้'
      },
      clues: ['-tion', '-ment', '-ness', '-ance/-ence', '-ity', '-er/-or (person)']
    },
    {
      id: 'noun-after-preposition',
      name: { en: 'Noun after a preposition', th: 'คำนามหลังคำบุพบท' },
      formula: ['Prep + (the) + N', 'Prep + V-ing + Obj'],
      use: {
        en: 'A preposition is followed by a noun, or by V-ing when the idea is an action.',
        th: 'หลังคำบุพบทต้องเป็นคำนาม หรือ V-ing ถ้าเป็นการกระทำ'
      },
      example: {
        en: 'After careful {{consideration}}, the board approved the plan.',
        th: 'หลังจากพิจารณาอย่างรอบคอบ คณะกรรมการก็อนุมัติแผนนี้'
      },
      clues: ['for', 'of', 'after', 'without', 'upon']
    },
    {
      id: 'adjective-before-noun',
      name: { en: 'Adjective before a noun', th: 'คำคุณศัพท์หน้าคำนาม' },
      formula: ['(Adv) + Adj + N'],
      use: {
        en: 'A word between a determiner and a noun describes the noun, so it is an adjective.',
        th: 'คำที่อยู่ระหว่าง determiner กับคำนาม ทำหน้าที่ขยายคำนาม จึงต้องเป็นคำคุณศัพท์'
      },
      example: {
        en: 'The hotel offers {{comfortable}} rooms at reasonable prices.',
        th: 'โรงแรมมีห้องพักที่สะดวกสบายในราคาสมเหตุสมผล'
      },
      clues: ['-ful', '-ous', '-ive', '-able/-ible', '-al', '-ic']
    },
    {
      id: 'adjective-after-linking-verb',
      name: { en: 'Adjective after be / linking verbs', th: 'คำคุณศัพท์หลัง be และ linking verb' },
      formula: ['S + be/become/remain/seem + Adj'],
      use: {
        en: 'After be and linking verbs (become, remain, seem, look, stay), use an adjective, not an adverb.',
        th: 'หลัง be และ linking verb (become, remain, seem, look, stay) ใช้คำคุณศัพท์ ไม่ใช้คำกริยาวิเศษณ์'
      },
      example: {
        en: 'The results of the survey were {{impressive}}.',
        th: 'ผลการสำรวจน่าประทับใจ'
      },
      clues: ['be', 'become', 'remain', 'seem', 'look', 'stay']
    },
    {
      id: 'adverb-with-verb',
      name: { en: 'Adverb with a verb', th: 'คำกริยาวิเศษณ์ขยายกริยา' },
      formula: ['S + Adv + V', 'S + have/be + Adv + V3/V-ing', 'S + V + Obj + Adv'],
      use: {
        en: 'A word describing how an action is done is an adverb, usually ending in -ly. It often sits between have/be and the main verb.',
        th: 'คำที่บอกว่าการกระทำเป็นอย่างไรคือคำกริยาวิเศษณ์ มักลงท้ายด้วย -ly และมักอยู่ระหว่าง have/be กับกริยาหลัก'
      },
      example: {
        en: 'Ms. Kim {{carefully}} reviewed the budget.',
        th: 'คุณคิมตรวจงบประมาณอย่างละเอียด'
      },
      clues: ['-ly', 'has ___ V3', 'is ___ V-ing']
    },
    {
      id: 'adverb-with-adjective',
      name: { en: 'Adverb before an adjective', th: 'คำกริยาวิเศษณ์หน้าคำคุณศัพท์' },
      formula: ['be + Adv + Adj', 'Adv + Adj + N'],
      use: {
        en: 'A word in front of an adjective that says how much or in what way is an adverb.',
        th: 'คำที่อยู่หน้าคำคุณศัพท์และบอกระดับหรือลักษณะ ต้องเป็นคำกริยาวิเศษณ์'
      },
      example: {
        en: 'The training session was {{extremely}} useful.',
        th: 'การอบรมครั้งนี้มีประโยชน์อย่างมาก'
      },
      clues: ['extremely', 'highly', 'relatively', 'surprisingly']
    },
    {
      id: 'ed-vs-ing-adjectives',
      name: { en: '-ed vs -ing adjectives', th: 'คำคุณศัพท์ -ed กับ -ing' },
      formula: ['Adj-ing + N', 'S + be + Adj-ed'],
      use: {
        en: '-ing describes the thing that causes the feeling; -ed describes the person who has the feeling.',
        th: '-ing ใช้กับสิ่งที่ทำให้เกิดความรู้สึก ส่วน -ed ใช้กับคนที่รู้สึกเอง'
      },
      example: {
        en: 'Staff were {{satisfied}} with the new schedule.',
        th: 'พนักงานพอใจกับตารางงานใหม่'
      },
      clues: ['interesting / interested', 'exciting / excited', 'satisfying / satisfied']
    }
  ]
}
