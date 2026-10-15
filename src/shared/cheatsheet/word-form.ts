import type { CheatSheet } from './types'

export const wordForm: CheatSheet = {
  topic: 'word-form',
  intro: {
    en: 'All four choices are the same word in different forms, like inform, information, informative, informatively. Look at the words just before and after the blank first, then ask: does this spot need a noun, an adjective, an adverb or a verb?',
    th: 'ตัวเลือกทั้งสี่เป็นคำเดียวกันแต่ต่างรูป เช่น inform, information, informative, informatively ให้ดูคำหน้าและหลังช่องว่างก่อน แล้วถามว่าช่องนี้ต้องเป็นคำนาม คำคุณศัพท์ คำกริยาวิเศษณ์ หรือกริยา'
  },
  entries: [
    {
      id: 'noun-after-determiner',
      name: { en: 'Noun after a determiner', th: 'คำนามหลังคำนำหน้านาม (noun after a determiner)' },
      formula: ['a/the/this + (Adj) + N', 'my/your/its/their + (Adj) + N'],
      use: {
        en: 'After a, the, this, any, my, your, its or their, you need a noun. An adjective can come in between, but a noun must still follow.',
        th: 'หลัง a, the, this, any, my, your, its, their ต้องเป็นคำนาม มีคำคุณศัพท์คั่นได้ แต่ต้องมีคำนามตามมาเสมอ'
      },
      example: {
        en: 'We appreciate your {{cooperation}} on this matter.',
        th: 'เราขอขอบคุณสำหรับความร่วมมือของคุณในเรื่องนี้'
      },
      clues: [
        { w: 'your + N', en: 'a noun after your', th: 'หลัง your ต้องใช้คำนาม' },
        { w: 'any + N', en: 'a noun after any', th: 'หลัง any ใช้คำนาม' },
        { w: 'its + Adj + N', en: 'a noun after the adjective', th: 'หลังคำคุณศัพท์ (strong) ยังต้องมีคำนาม' },
        { w: '-tion / -ment / -ness', en: 'noun endings (information)', th: 'มักเป็นคำนาม เช่น information, commitment' },
        { w: '-ance / -ence / -ity', en: 'noun endings (patience)', th: 'มักเป็นคำนาม เช่น patience, ability' },
        { w: '-er / -or / -ant', en: 'a person (applicant)', th: 'มักหมายถึงคน เช่น applicant = ผู้สมัคร' }
      ],
      mistake: {
        wrong: 'your cooperate',
        right: 'your cooperation',
        why: {
          en: 'Cooperate is a verb. After your you need the noun.',
          th: 'cooperate เป็นกริยา หลัง your ต้องใช้คำนาม cooperation'
        }
      }
    },
    {
      id: 'noun-after-preposition',
      name: { en: 'Noun after a preposition', th: 'คำนามหลังคำบุพบท (noun after a preposition)' },
      formula: ['Prep + (the) + N', 'Prep + V-ing + Obj'],
      use: {
        en: 'After a preposition (for, of, after, without), use a noun or a verb + -ing, never a base verb.',
        th: 'หลังคำบุพบท (for, of, after, without) ต้องเป็นคำนาม หรือกริยาเติม -ing ห้ามใช้กริยารูปเดิม'
      },
      example: {
        en: 'After careful {{consideration}}, the board approved the plan.',
        th: 'หลังจากพิจารณาอย่างรอบคอบ คณะกรรมการก็อนุมัติแผนนี้'
      },
      clues: [
        { w: 'after careful consideration', en: 'after thinking carefully', th: 'หลังพิจารณาอย่างรอบคอบ' },
        { w: 'without permission', en: 'not allowed first', th: 'โดยไม่ได้รับอนุญาต' },
        { w: 'upon arrival', en: 'when you arrive', th: 'เมื่อมาถึง' }
      ],
      mistake: {
        wrong: 'before decide',
        right: 'before deciding',
        why: {
          en: 'Before is a preposition here, so a noun or -ing follows, not a base verb.',
          th: 'before ในที่นี้เป็นคำบุพบท จึงตามด้วยคำนามหรือกริยาเติม -ing ไม่ใช่กริยารูปเดิม'
        }
      }
    },
    {
      id: 'noun-as-modifier',
      name: { en: 'Noun + noun', th: 'คำนามขยายคำนาม (noun + noun)' },
      formula: ['the + N + N'],
      use: {
        en: 'Some pairs are two nouns together. The first noun describes the second and stays singular.',
        th: 'บางคำเป็นคำนาม 2 ตัวติดกัน ตัวหน้าทำหน้าที่ขยายตัวหลัง และเป็นรูปเอกพจน์ (ไม่เติม s)'
      },
      example: {
        en: 'All employees must follow the {{safety}} regulations.',
        th: 'พนักงานทุกคนต้องปฏิบัติตามกฎความปลอดภัย'
      },
      clues: [
        { w: 'safety regulations', en: 'safety rules', th: 'กฎความปลอดภัย' },
        { w: 'customer satisfaction', en: 'how happy customers are', th: 'ความพึงพอใจของลูกค้า' },
        { w: 'sales figures', en: 'sales numbers', th: 'ตัวเลขยอดขาย' },
        { w: 'application form', en: 'the form you fill in to apply', th: 'แบบฟอร์มใบสมัคร' },
        { w: 'job opening', en: 'a job nobody has yet', th: 'ตำแหน่งงานว่าง' }
      ],
      mistake: {
        wrong: 'customers satisfaction',
        right: 'customer satisfaction',
        why: {
          en: 'The first noun only describes the second, so it stays singular.',
          th: 'คำนามตัวหน้าทำหน้าที่ขยายเท่านั้น จึงไม่เติม s'
        }
      }
    },
    {
      id: 'adjective-before-noun',
      name: { en: 'Adjective before a noun', th: 'คำคุณศัพท์หน้าคำนาม (adjective before a noun)' },
      formula: ['(Adv) + Adj + N'],
      use: {
        en: 'A word before a noun that says what the noun is like is an adjective. An -ly word can stand in front of it.',
        th: 'คำที่อยู่หน้าคำนาม และบอกว่าคำนามนั้นเป็นอย่างไร คือคำคุณศัพท์ ข้างหน้าอาจมีคำ -ly มาขยายอีกที'
      },
      example: {
        en: 'The hotel offers {{comfortable}} rooms at reasonable prices.',
        th: 'โรงแรมมีห้องพักที่สะดวกสบายในราคาสมเหตุสมผล'
      },
      clues: [
        { w: '-ful / -ous / -ive', en: 'adjective endings (helpful)', th: 'มักเป็นคำคุณศัพท์ เช่น helpful, famous, informative' },
        { w: '-able / -ible / -ic', en: 'adjective endings (comfortable)', th: 'มักเป็นคำคุณศัพท์ เช่น comfortable, responsible' }
      ],
      mistake: {
        wrong: 'a success plan',
        right: 'a successful plan',
        why: {
          en: 'Success is a noun. Before the noun plan you need the adjective successful.',
          th: 'success เป็นคำนาม หน้าคำนาม plan ต้องใช้คำคุณศัพท์ successful'
        }
      }
    },
    {
      id: 'adjective-after-linking-verb',
      name: { en: 'Adjective after be / linking verbs', th: 'คำคุณศัพท์หลัง be และกริยาบอกสภาพ (linking verbs)' },
      formula: ['S + be/become/remain/seem + Adj', 'S + look/sound/appear/stay/prove + Adj', 'S + keep/make/find + Obj + Adj'],
      use: {
        en: 'These verbs tell you how something is, not what it does, so use an adjective (not -ly). With keep, make and find, the adjective goes after the object.',
        th: 'กริยากลุ่มนี้บอกสภาพ ไม่ได้บอกการกระทำ จึงตามด้วยคำคุณศัพท์ (ไม่ใช่คำ -ly) ส่วน keep, make, find ให้วางคำคุณศัพท์ไว้หลังกรรม'
      },
      example: {
        en: 'Sales have remained {{steady}} despite the price increase.',
        th: 'ยอดขายยังคงทรงตัวแม้ราคาจะสูงขึ้น'
      },
      clues: [
        { w: 'remain + Adj', en: 'an adjective after remain, not -ly', th: 'หลัง remain ใช้คำคุณศัพท์ ไม่ใช่คำ -ly' },
        { w: 'become + Adj', en: 'change into a state', th: 'กลายเป็น…' },
        { w: 'seem / appear + Adj', en: 'look as if it is', th: 'ดูเหมือน…' },
        { w: 'prove + Adj', en: 'turn out to be', th: 'กลายเป็นว่า… / พิสูจน์แล้วว่า…' },
        { w: 'keep + Obj + Adj', en: 'make it stay that way', th: 'ทำให้…ยังคง…' },
        { w: 'find + Obj + Adj', en: 'think that it is', th: 'เห็นว่า…' }
      ],
      mistake: {
        wrong: 'remains confidently',
        right: 'remains confident',
        why: {
          en: 'Remain tells you a state, so an adjective follows, not an -ly word.',
          th: 'remain บอกสภาพ จึงตามด้วยคำคุณศัพท์ ไม่ใช่คำ -ly'
        }
      }
    },
    {
      id: 'parallel-word-form',
      name: { en: 'Same form after and / or / but', th: 'คำชนิดเดียวกันรอบ and / or / but (parallel form)' },
      formula: ['Adj + and/or/but + Adj', 'N + and/or + N', 'Adv + and + Adv'],
      use: {
        en: 'Words joined by and, or or but must be the same type. Look at the word on the other side and match it.',
        th: 'คำที่เชื่อมด้วย and, or, but ต้องเป็นชนิดเดียวกัน ดูคำอีกฝั่งแล้วเลือกให้เหมือนกัน'
      },
      example: {
        en: 'The hotel staff were helpful and {{courteous}}.',
        th: 'พนักงานโรงแรมช่วยเหลือดีและสุภาพ'
      },
      clues: [
        { w: 'helpful and courteous', en: 'helpful and polite', th: 'ช่วยเหลือดีและสุภาพ' },
        { w: 'both … and', en: 'the two of them', th: 'ทั้ง… และ…' },
        { w: 'either … or', en: 'one of the two', th: '…หรือ… (อย่างใดอย่างหนึ่ง)' }
      ],
      mistake: {
        wrong: 'helpful and courtesy',
        right: 'helpful and courteous',
        why: {
          en: 'Helpful is an adjective, so the word after and must be an adjective too.',
          th: 'helpful เป็นคำคุณศัพท์ คำหลัง and จึงต้องเป็นคำคุณศัพท์ด้วย'
        }
      }
    },
    {
      id: 'adverb-with-verb',
      name: { en: 'Adverb with a verb', th: 'คำกริยาวิเศษณ์ขยายกริยา (adverb + verb)' },
      formula: ['S + Adv + V', 'S + have/be + Adv + V3/V-ing', 'S + V + Obj + Adv'],
      use: {
        en: 'A word that says how something is done is an adverb, usually ending in -ly. It can sit between have/be and the main verb, or after the verb or its object.',
        th: 'คำที่บอกว่า "ทำอย่างไร" คือคำกริยาวิเศษณ์ มักลงท้าย -ly วางระหว่าง have/be กับกริยาหลักได้ หรือวางหลังกริยาหรือหลังกรรมก็ได้'
      },
      example: {
        en: 'Ms. Kim {{carefully}} reviewed the budget.',
        th: 'คุณคิมตรวจงบประมาณอย่างละเอียด'
      },
      clues: [
        { w: '-ly', en: 'the usual adverb ending (carefully)', th: 'มักเป็นคำกริยาวิเศษณ์ เช่น carefully, fully' },
        { w: 'V + Adv', en: 'an -ly adverb can follow the verb', th: 'คำ -ly ขยายกริยา วางหลังกริยาได้' },
        { w: 'will be fully implemented', en: 'will be put into use completely', th: 'จะถูกนำไปใช้อย่างเต็มที่' }
      ],
      mistake: {
        wrong: 'has grown considerable',
        right: 'has grown considerably',
        why: {
          en: 'The word describes the verb grown, so it must be the -ly adverb.',
          th: 'คำนี้ขยายกริยา grown จึงต้องเป็นคำ -ly ไม่ใช่คำคุณศัพท์'
        }
      }
    },
    {
      id: 'adverb-with-adjective',
      name: { en: 'Adverb before an adjective', th: 'คำกริยาวิเศษณ์หน้าคำคุณศัพท์ (adverb + adjective)' },
      formula: ['be + Adv + Adj', 'Adv + Adj + N'],
      use: {
        en: 'Before an adjective, use an -ly adverb to say how much or in what way (extremely useful, environmentally responsible).',
        th: 'หน้าคำคุณศัพท์ ถ้าต้องการคำบอกระดับหรือบอกว่าในด้านไหน ให้ใช้คำ -ly เช่น extremely useful, environmentally responsible'
      },
      example: {
        en: 'The training session was {{extremely}} useful.',
        th: 'การอบรมครั้งนี้มีประโยชน์อย่างมาก'
      },
      clues: [
        { w: 'extremely', en: 'very, very', th: 'อย่างยิ่ง' },
        { w: 'highly', en: 'very (for good things)', th: 'อย่างสูง / มาก' },
        { w: 'significantly', en: 'a lot', th: 'อย่างมาก / อย่างเห็นได้ชัด' },
        { w: 'environmentally', en: 'for the environment', th: 'ในด้านสิ่งแวดล้อม' }
      ],
      mistake: {
        wrong: 'significant different',
        right: 'significantly different',
        why: {
          en: 'Different is an adjective. A word that describes an adjective must be an -ly adverb.',
          th: 'different เป็นคำคุณศัพท์ คำที่มาขยายคำคุณศัพท์ต้องเป็นคำ -ly'
        }
      }
    },
    {
      id: 'ed-vs-ing-adjectives',
      name: { en: '-ed vs -ing adjectives', th: 'คำคุณศัพท์ -ed กับ -ing (adjectives: -ed vs -ing)' },
      formula: ['Adj-ing + N', 'S + be + Adj-ed'],
      use: {
        en: '-ing is the thing that causes the feeling (a boring film, encouraging figures). -ed is the person who feels it (I am bored).',
        th: '-ing = สิ่งที่ทำให้รู้สึก (หนังน่าเบื่อ = boring) / -ed = คนที่รู้สึก (ฉันเบื่อ = bored)'
      },
      example: {
        en: 'Staff were {{satisfied}} with the new schedule.',
        th: 'พนักงานพอใจกับตารางงานใหม่'
      },
      clues: [
        { w: 'encouraging / encouraged', en: 'gives hope / feels hopeful', th: 'น่ายินดี / รู้สึกมีกำลังใจ' },
        { w: 'interesting / interested', en: 'makes you curious / feels curious', th: 'น่าสนใจ / รู้สึกสนใจ' },
        { w: 'satisfying / satisfied', en: 'makes you happy / feels happy with it', th: 'น่าพอใจ / รู้สึกพอใจ' }
      ],
      mistake: {
        wrong: 'I am boring',
        right: 'I am bored',
        why: {
          en: 'A person who feels it takes -ed. I am boring means people find me dull.',
          th: 'คนที่รู้สึกใช้ -ed ถ้าพูด I am boring จะแปลว่า ฉันเป็นคนน่าเบื่อ'
        }
      }
    },
    {
      id: 'verb-after-to-or-modal',
      name: { en: 'Base verb after to / modals', th: 'กริยารูปเดิมหลัง to และ will, can, must (base verb)' },
      formula: ['will/can/must/should + V1', 'to V1'],
      use: {
        en: 'After will, can, must, should, or the to in plan to / want to, use the base verb with nothing added (not after look forward to: see the gerund sheet). The blank must be a verb, not a noun or an adjective.',
        th: 'หลัง will, can, must, should หรือ to ใน plan to / want to ใช้กริยารูปเดิม ไม่เติมอะไรเลย (ยกเว้น look forward to ที่ตามด้วย -ing ดูชีต Gerund กับ Infinitive) และช่องนั้นต้องเป็นกริยา ไม่ใช่คำนามหรือคำคุณศัพท์'
      },
      example: {
        en: 'The company plans to {{expand}} its operations overseas.',
        th: 'บริษัทวางแผนจะขยายธุรกิจไปต่างประเทศ'
      },
      clues: [
        { w: '-ize / -ify / -en', en: 'verb endings (strengthen)', th: 'มักเป็นกริยา เช่น strengthen, simplify, organize' },
        { w: 'plan to', en: 'intend to', th: 'วางแผนจะ' },
        { w: 'will / must / should', en: 'a base verb comes next', th: 'ตามด้วยกริยารูปเดิม' }
      ],
      mistake: {
        wrong: 'plans to strong',
        right: 'plans to strengthen',
        why: {
          en: 'After to you need a verb. Strong is an adjective; the verb is strengthen.',
          th: 'หลัง to ต้องเป็นกริยา strong เป็นคำคุณศัพท์ กริยาคือ strengthen'
        }
      }
    }
  ]
}
