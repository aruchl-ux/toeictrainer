import type { CheatSheet } from './types'

export const wordForm: CheatSheet = {
  topic: 'word-form',
  intro: {
    en: 'All choices are the same word in different forms. Look at the words just before and after the blank, then pick the right type of word.',
    th: 'ทุกตัวเลือกเป็นคำเดียวกันแต่คนละชนิด ดูคำข้างหน้าและข้างหลังช่องว่าง แล้วเลือกชนิดคำที่ใช่'
  },
  entries: [
    {
      id: 'noun-after-determiner',
      name: { en: 'Noun after a determiner', th: 'คำนามหลัง determiner' },
      formula: ['a/the/this + (Adj) + N', 'my/your/its/their + (Adj) + N'],
      use: {
        en: 'After a, the, my, your, its or their, you need a noun. An adjective can come in between.',
        th: 'หลัง a, the, my, your, its, their ต้องเป็นคำนาม (มีคำคุณศัพท์คั่นได้)'
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
        en: 'After a preposition (for, of, after, without), use a noun or V-ing.',
        th: 'หลังคำบุพบท (for, of, after, without) ต้องเป็นคำนาม หรือ V-ing'
      },
      example: {
        en: 'After careful {{consideration}}, the board approved the plan.',
        th: 'หลังจากพิจารณาอย่างรอบคอบ คณะกรรมการก็อนุมัติแผนนี้'
      },
      clues: ['for', 'of', 'after', 'without', 'upon']
    },
    {
      id: 'noun-as-modifier',
      name: { en: 'Noun + noun', th: 'คำนามขยายคำนาม (คำนามประสม)' },
      formula: ['the + N + N'],
      use: {
        en: 'Some pairs are two nouns together. The first noun describes the second and stays singular.',
        th: 'บางคำเป็นคำนาม 2 ตัวติดกัน ตัวหน้าทำหน้าที่ขยายตัวหลัง และเป็นรูปเอกพจน์'
      },
      example: {
        en: 'All employees must follow the {{safety}} regulations.',
        th: 'พนักงานทุกคนต้องปฏิบัติตามกฎความปลอดภัย'
      },
      clues: ['safety regulations', 'customer satisfaction', 'sales figures', 'application form', 'job opening']
    },
    {
      id: 'adjective-before-noun',
      name: { en: 'Adjective before a noun', th: 'คำคุณศัพท์หน้าคำนาม' },
      formula: ['(Adv) + Adj + N'],
      use: {
        en: 'A word before a noun that says what the noun is like is an adjective.',
        th: 'คำที่อยู่หน้าคำนาม และบอกว่าคำนามนั้นเป็นอย่างไร คือคำคุณศัพท์'
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
      formula: ['S + be/become/remain/seem + Adj', 'S + look/sound/appear/stay/prove + Adj', 'S + keep/make/find + Obj + Adj'],
      use: {
        en: 'These verbs tell you how something is, not what it does, so use an adjective (not -ly). With keep, make and find, the adjective goes after the object.',
        th: 'กริยากลุ่มนี้บอกสภาพ ไม่ได้บอกการกระทำ จึงตามด้วยคำคุณศัพท์ (ไม่ใช่คำ -ly) ส่วน keep, make, find ให้วางคำคุณศัพท์ไว้หลังกรรม'
      },
      example: {
        en: 'Sales have remained {{steady}} despite the price increase.',
        th: 'ยอดขายยังคงทรงตัวแม้ราคาจะสูงขึ้น'
      },
      clues: ['be', 'become', 'remain', 'stay', 'seem', 'appear', 'look', 'sound', 'feel', 'prove', 'keep + Obj', 'find + Obj']
    },
    {
      id: 'parallel-word-form',
      name: { en: 'Same form after and / or / but', th: 'คำที่เชื่อมด้วย and / or / but ต้องเป็นชนิดเดียวกัน' },
      formula: ['Adj + and/or/but + Adj', 'N + and/or + N', 'Adv + and + Adv'],
      use: {
        en: 'Words joined by and, or or but must be the same type. Look at the word on the other side and match it.',
        th: 'คำที่เชื่อมด้วย and, or, but ต้องเป็นชนิดเดียวกัน ดูคำอีกฝั่งแล้วเลือกให้เหมือนกัน'
      },
      example: {
        en: 'The hotel staff were helpful and {{courteous}}.',
        th: 'พนักงานโรงแรมช่วยเหลือดีและสุภาพ'
      },
      clues: ['___ and + Adj', 'Adj + and ___', 'both … and', 'either … or']
    },
    {
      id: 'adverb-with-verb',
      name: { en: 'Adverb with a verb', th: 'คำกริยาวิเศษณ์ขยายกริยา' },
      formula: ['S + Adv + V', 'S + have/be + Adv + V3/V-ing', 'S + V + Obj + Adv'],
      use: {
        en: 'A word that says how something is done is an adverb, usually ending in -ly. It often sits between have/be and the main verb.',
        th: 'คำที่บอกว่า "ทำอย่างไร" คือ adverb มักลงท้าย -ly และมักอยู่ระหว่าง have/be กับกริยาหลัก'
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
        en: 'Before an adjective, use an adverb to say how much (very, extremely, highly).',
        th: 'หน้าคำคุณศัพท์ ถ้าต้องการคำบอกระดับ (มาก น้อย) ให้ใช้ adverb เช่น extremely, highly'
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
        en: '-ing is the thing that causes the feeling (a boring film). -ed is the person who feels it (I am bored).',
        th: '-ing = สิ่งที่ทำให้รู้สึก (หนังน่าเบื่อ = boring) / -ed = คนที่รู้สึก (ฉันเบื่อ = bored)'
      },
      example: {
        en: 'Staff were {{satisfied}} with the new schedule.',
        th: 'พนักงานพอใจกับตารางงานใหม่'
      },
      clues: ['interesting / interested', 'exciting / excited', 'satisfying / satisfied']
    },
    {
      id: 'verb-after-to-or-modal',
      name: { en: 'Base verb after to / modals', th: 'กริยารูปเดิมหลัง to และ modal' },
      formula: ['will/can/must/should + V1', 'to V1'],
      use: {
        en: 'After will, can, must, should or to, use the base verb with nothing added.',
        th: 'หลัง will, can, must, should หรือ to ใช้กริยารูปเดิม ไม่เติมอะไรเลย'
      },
      example: {
        en: 'The company plans to {{expand}} its operations overseas.',
        th: 'บริษัทวางแผนจะขยายธุรกิจไปต่างประเทศ'
      },
      clues: ['-ize', '-ify', '-en', 'plan to', 'will', 'must']
    }
  ]
}
