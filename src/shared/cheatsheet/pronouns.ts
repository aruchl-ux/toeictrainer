import type { CheatSheet } from './types'

export const pronouns: CheatSheet = {
  topic: 'pronouns',
  intro: {
    en: 'The choices are one pronoun in different forms, like they, them, their, theirs, themselves. Look where the blank is first: before a verb (they), after a verb or preposition (them), before a noun (their), or alone with no noun after it (theirs).',
    th: 'ตัวเลือกเป็นคำสรรพนามตัวเดียวกันแต่ต่างรูป เช่น they, them, their, theirs, themselves ให้ดูตำแหน่งช่องว่างก่อน: หน้ากริยา (they) หลังกริยาหรือคำบุพบท (them) หน้าคำนาม (their) หรืออยู่ลอย ๆ ไม่มีคำนามตาม (theirs)'
  },
  entries: [
    {
      id: 'pronoun-cases',
      name: { en: 'Subject, object and possessive', th: 'สรรพนามประธาน กรรม และแสดงความเป็นเจ้าของ (subject, object, possessive)' },
      formula: ['he/she/we/they/I + V', 'V/Prep + me/him/her/us/them', 'my/your/his/her/its/our/their + N'],
      use: {
        en: 'Before a verb: I, he, she, they. After a verb or preposition: me, him, her, them. Before a noun: my, your, his, its, their. Its (no apostrophe) means "of it"; it\'s means "it is".',
        th: 'หน้ากริยาใช้ I, he, she, they / หลังกริยาหรือคำบุพบทใช้ me, him, her, them / หน้าคำนามใช้ my, your, his, its, their ส่วน its (ไม่มี \') = ของมัน แต่ it\'s = it is'
      },
      example: {
        en: 'Ms. Ortiz asked {{her}} assistant to book the room.',
        th: 'คุณออร์ติซขอให้ผู้ช่วยของเธอจองห้อง'
      },
      clues: [
        { w: 'your + N', en: 'your before a noun (your questions)', th: 'ของคุณ + คำนาม (your questions)' },
        { w: 'its + N', en: 'of it, for one company or thing', th: 'ของมัน (บริษัทหรือสิ่งของหนึ่งอย่าง)' },
        { w: "it's", en: 'it is (not "of it")', th: 'it is (ไม่ได้แปลว่า "ของมัน")' },
        { w: 'V + them', en: 'them after a verb (gave them, review them)', th: 'หลังกริยาใช้ them (gave them, review them)' },
        { w: 'and I + V', en: 'I in a two-person subject (Mr. Davis and I will…)', th: 'ประธานสองคนใช้ I (Mr. Davis and I will…)' }
      ],
      mistake: {
        wrong: 'Mr. Davis and me will lead the session.',
        right: 'Mr. Davis and I will lead the session.',
        why: {
          en: 'Thai uses ฉัน in every position, but before a verb English needs I, even with another name in front.',
          th: 'ภาษาไทยใช้ "ฉัน" ได้ทุกตำแหน่ง แต่ถ้าเป็นประธาน (อยู่หน้ากริยา) ต้องใช้ I แม้มีชื่อคนอื่นอยู่ด้วย'
        }
      }
    },
    {
      id: 'possessive-pronouns',
      name: { en: 'Possessive pronouns', th: 'ของ… แบบไม่มีคำนามตาม (possessive pronouns)' },
      formula: ['mine/yours/his/hers/ours/theirs'],
      use: {
        en: 'Use these when no noun follows: they stand for "my/your/her… + the noun". For example, yours = your laptop.',
        th: 'ใช้เมื่อข้างหลังไม่มีคำนาม เพราะคำนี้แทน "ของ… + คำนาม" ไปแล้ว เช่น yours = your laptop'
      },
      example: {
        en: 'My laptop is old, but {{yours}} is brand new.',
        th: 'แล็ปท็อปของฉันเก่าแล้ว แต่ของคุณเป็นเครื่องใหม่เอี่ยม'
      },
      clues: [
        { w: 'hers', en: 'her one (her charger)', th: 'ของเธอ (= her charger)' },
        { w: 'theirs', en: 'their one (their badge)', th: 'ของพวกเขา (= their badge)' },
        { w: 'yours', en: 'your one (your laptop)', th: 'ของคุณ (= your laptop)' }
      ],
      mistake: {
        wrong: 'This laptop is my.',
        right: 'This laptop is mine.',
        why: {
          en: 'Thai ของฉัน works with or without a noun, but my needs a noun after it. With no noun, use mine.',
          th: 'ภาษาไทยใช้ "ของฉัน" ได้ทั้งมีและไม่มีคำนามตาม แต่ my ต้องมีคำนามตามหลัง ถ้าไม่มีคำนามให้ใช้ mine'
        }
      }
    },
    {
      id: 'reflexive-pronouns',
      name: { en: 'Reflexive pronouns', th: 'ตัวเอง (reflexive pronouns: -self)' },
      formula: ['S + V + myself/himself/themselves', 'by + himself/herself/themselves'],
      use: {
        en: 'Use -self when the subject does something to itself, or to stress that they did it personally, not someone else. By himself means alone. If people do something to each other, use one another or each other, not themselves.',
        th: 'ใช้ -self เมื่อประธานทำกับตัวเอง หรือเน้นว่าทำเอง ไม่ให้คนอื่นทำแทน by himself = ทำคนเดียว ถ้าต่างคนต่างทำให้กัน ใช้ one another หรือ each other ไม่ใช่ themselves'
      },
      example: {
        en: 'Mr. Chen prepared the presentation {{himself}}.',
        th: 'คุณเฉินเตรียมการนำเสนอด้วยตัวเอง'
      },
      clues: [
        { w: 'by + himself/herself', en: 'alone, without help', th: 'คนเดียว ไม่มีใครช่วย' },
        { w: 'do it + themselves', en: 'do it personally, not through someone else', th: 'ทำเอง ไม่ให้คนอื่นทำแทน' },
        { w: 'one another / each other', en: 'to or with each other', th: 'ซึ่งกันและกัน (ต่างคนต่างทำให้กัน)' }
      ],
      mistake: {
        wrong: 'The managers shared data with themselves.',
        right: 'The managers shared data with one another.',
        why: {
          en: 'Thai กันเอง means "with each other", not ตัวเอง "oneself". People who give to each other take one another or each other, not themselves.',
          th: '"แบ่งปันกันเอง" คือให้กันและกัน (one another) ไม่ใช่ให้ตัวเอง (themselves) กันเอง ≠ ตัวเอง'
        }
      }
    },
    {
      id: 'one-the-other',
      name: { en: 'One … the other', th: 'อีกคนที่เหลือ (one … the other)' },
      formula: ['one + V, the other + V'],
      use: {
        en: 'In a group of two, the first is one and the second is the other. Another means one more from a bigger group.',
        th: 'ถ้ามีสองคนหรือสองอัน คนแรกใช้ one คนที่เหลือใช้ the other ส่วน another = อีกหนึ่ง (จากกลุ่มที่มีมากกว่าสอง)'
      },
      example: {
        en: 'We have two offices: one is in Bangkok, and {{the other}} is in Chiang Mai.',
        th: 'เรามีสำนักงานสองแห่ง แห่งหนึ่งอยู่กรุงเทพฯ อีกแห่งอยู่เชียงใหม่'
      },
      clues: [
        { w: 'one … the other', en: 'the first … the second (of two)', th: 'อันหนึ่ง … อีกอันที่เหลือ (มีสองอัน)' },
        { w: 'another', en: 'one more, from a bigger group', th: 'อีกหนึ่ง (จากกลุ่มที่มีหลายอัน)' },
        { w: 'others', en: 'other people or things, with no noun after', th: 'คนอื่น ๆ / อันอื่น ๆ (ไม่มีคำนามตาม)' }
      ],
      mistake: {
        wrong: 'We have two offices: one is in Bangkok, and another is in Chiang Mai.',
        right: 'We have two offices: one is in Bangkok, and the other is in Chiang Mai.',
        why: {
          en: 'Thai says อีกแห่งหนึ่ง, which sounds like another, but with only two, the second one is the other.',
          th: 'ภาษาไทยพูดว่า "อีกแห่งหนึ่ง" จึงชอบใช้ another แต่ถ้ามีแค่สองแห่ง แห่งที่เหลือต้องใช้ the other'
        }
      }
    },
    {
      id: 'that-those-of',
      name: { en: 'That of / those of', th: 'แทนคำนามที่พูดไปแล้วในการเปรียบเทียบ (that of / those of)' },
      formula: ['that + of + N', 'those + of/for + N'],
      use: {
        en: 'In comparisons they stand for a noun already said, so it is not repeated: that for one thing or an uncountable noun, those for more than one.',
        th: 'ใช้ในการเปรียบเทียบ แทนคำนามที่พูดไปแล้วจะได้ไม่ต้องพูดซ้ำ: that แทนสิ่งเดียวหรือนามนับไม่ได้ / those แทนหลายสิ่ง'
      },
      example: {
        en: 'Our prices are lower than {{those}} of our competitors.',
        th: 'ราคาของเราต่ำกว่าราคาของคู่แข่ง'
      },
      clues: [
        { w: 'than + those of/for', en: 'than the ones of (more than one)', th: 'กว่า…ของ (แทนคำนามหลายสิ่ง)' },
        { w: 'than + that of', en: 'than the one of (one, or uncountable)', th: 'กว่า…ของ (แทนสิ่งเดียวหรือนามนับไม่ได้)' }
      ],
      mistake: {
        wrong: 'Our prices are lower than that of our competitors.',
        right: 'Our prices are lower than those of our competitors.',
        why: {
          en: 'Prices is plural, so the word that stands for it is those. Thai has no plural form, so this is easy to miss.',
          th: 'prices เป็นพหูพจน์ (หลายสิ่ง) คำที่ใช้แทนจึงต้องเป็น those ภาษาไทยไม่มีรูปพหูพจน์ จึงมักลืมดู'
        }
      }
    },
    {
      id: 'those-who',
      name: { en: 'Those who', th: 'ผู้ที่… (those who)' },
      formula: ['those + who + V1'],
      use: {
        en: 'Those who means "the people who". It is plural, so the verb has no -s.',
        th: 'those who = ผู้ที่… / คนที่… (หลายคน) กริยาจึงไม่เติม s'
      },
      example: {
        en: '{{Those}} who wish to attend must register online.',
        th: 'ผู้ที่ต้องการเข้าร่วมต้องลงทะเบียนออนไลน์'
      },
      clues: [
        { w: 'those who', en: 'the people who', th: 'ผู้ที่… / คนที่… (หลายคน)' },
        { w: 'anyone who', en: 'any person who (verb + s)', th: 'ใครก็ตามที่… (กริยาเติม s)' }
      ],
      mistake: {
        wrong: 'Who wish to attend must register online.',
        right: 'Those who wish to attend must register online.',
        why: {
          en: 'Thai can start a sentence with ผู้ที่, but English needs those before who.',
          th: 'ภาษาไทยขึ้นต้นประโยคด้วย "ผู้ที่…" ได้เลย แต่ภาษาอังกฤษต้องมี those นำหน้า who'
        }
      }
    }
  ]
}
