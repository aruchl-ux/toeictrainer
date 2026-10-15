import type { CheatSheet } from './types'

export const conjVsPrep: CheatSheet = {
  topic: 'conj-vs-prep',
  intro: {
    en: 'The choices mix conjunctions, words that join clauses (because, although), with prepositions that mean the same (because of, despite). Look after the blank first. A subject and a verb (a clause): use the conjunction. Only a noun or an -ing word: use the preposition.',
    th: 'ตัวเลือกมักมีทั้งคำสันธาน (คำที่ต่อประโยค เช่น because, although) และคำบุพบทที่แปลเหมือนกัน (because of, despite) ให้ดูหลังช่องว่างก่อน ถ้ามีประธานและกริยา (เป็นประโยค) ใช้คำสันธาน ถ้ามีแค่คำนามหรือกริยาเติม -ing ใช้คำบุพบท'
  },
  entries: [
    {
      id: 'because-vs-because-of',
      name: { en: 'Because vs because of', th: 'เพราะ (because vs because of)' },
      formula: ['because/since/as + S + V', 'because of/due to/owing to + N'],
      words: [
        { w: 'because', en: 'because', th: 'เพราะ' },
        { w: 'since', en: 'because (often a reason everyone knows)', th: 'เพราะ (มักเป็นเหตุผลที่รู้กันอยู่แล้ว)' },
        { w: 'as', en: 'because', th: 'เพราะ' },
        { w: 'because of', en: 'because of', th: 'เพราะ' },
        { w: 'due to', en: 'caused by', th: 'เนื่องจาก' },
        { w: 'owing to', en: 'because of (formal)', th: 'เนื่องจาก (ภาษาทางการ)' }
      ],
      use: {
        en: 'All of them give a reason. because, since, as + subject and verb. because of, due to, owing to + a noun.',
        th: 'ทุกคำแปลว่า "เพราะ / เนื่องจาก" ต่างกันแค่สิ่งที่ตามหลัง: because, since, as + ประโยค / because of, due to, owing to + คำนาม'
      },
      example: {
        en: 'The flight was delayed {{owing to}} heavy fog.',
        th: 'เที่ยวบินล่าช้าเนื่องจากหมอกลงหนา'
      },
      clues: [
        { w: 'because + S + V', en: 'because + a clause', th: 'because + ประโยค (มีประธานและกริยา)' },
        { w: 'owing to + N', en: 'owing to + a noun (a reason)', th: 'owing to = เนื่องจาก ตามด้วยคำนาม' }
      ],
      mistake: {
        wrong: 'because of the flight was late',
        right: 'because the flight was late',
        why: {
          en: 'The flight was late has a subject and a verb, so use because with no of.',
          th: 'the flight was late มีประธานและกริยา จึงใช้ because ไม่มี of'
        }
      }
    },
    {
      id: 'although-vs-despite',
      name: { en: 'Although vs despite', th: 'แม้ว่า (although vs despite)' },
      formula: ['although/even though/even if + S + V', 'despite/in spite of + N/V-ing'],
      words: [
        { w: 'although', en: 'even though', th: 'แม้ว่า' },
        { w: 'even though', en: 'even though (stronger)', th: 'แม้ว่า (เน้นกว่า although)' },
        { w: 'even if', en: 'whether or not (imagined)', th: 'ถึงแม้ว่า (เรื่องสมมติ อาจเกิดหรือไม่เกิด)' },
        { w: 'despite', en: 'without being stopped by', th: 'ทั้ง ๆ ที่มี… / แม้จะมี…' },
        { w: 'in spite of', en: 'same as despite', th: 'เหมือน despite' }
      ],
      use: {
        en: 'All of them show a surprise contrast. although, even though, even if + subject and verb. despite, in spite of + a noun or an -ing verb. Never "despite of".',
        th: 'ทุกคำแสดงเรื่องที่ขัดกัน (แม้ว่า…ก็ยัง…): although, even though, even if + ประโยค / despite, in spite of + คำนาม หรือกริยาเติม -ing (ไม่มี despite of)'
      },
      example: {
        en: '{{Despite}} the rain, the outdoor event continued.',
        th: 'แม้ฝนจะตก งานกลางแจ้งก็ยังดำเนินต่อไป'
      },
      clues: [
        { w: 'despite + N', en: 'despite + a noun, not a clause', th: 'despite (แม้จะมี…) + คำนาม ไม่ใช่ประโยค' },
        { w: 'in spite of + V-ing', en: 'in spite of + -ing', th: 'in spite of (แม้จะ) + กริยาเติม -ing' }
      ],
      mistake: {
        wrong: 'despite of the rain',
        right: 'despite the rain',
        why: {
          en: 'Despite never takes of. Only in spite of has of.',
          th: 'despite ไม่มี of ตามหลัง มีแต่ in spite of ที่มี of'
        }
      }
    },
    {
      id: 'whereas-vs-unlike',
      name: { en: 'Whereas vs unlike', th: 'เทียบความต่าง (whereas vs unlike)' },
      formula: ['whereas/while + S + V', 'unlike + N'],
      words: [
        { w: 'whereas', en: 'but on the other hand', th: 'ในขณะที่ (อีกอย่างหนึ่งกลับต่างกัน)' },
        { w: 'while', en: 'whereas (when comparing)', th: 'ในขณะที่ (ใช้เทียบได้เหมือน whereas)' },
        { w: 'unlike', en: 'different from', th: 'ไม่เหมือนกับ' }
      ],
      use: {
        en: 'For comparing two different things. whereas or while + subject and verb. unlike + a noun.',
        th: 'ใช้เทียบสองอย่างที่ต่างกัน: whereas, while + ประโยค / unlike + คำนาม'
      },
      example: {
        en: 'Sales rose in Asia, {{whereas}} they fell in Europe.',
        th: 'ยอดขายในเอเชียเพิ่มขึ้น ในขณะที่ยุโรปลดลง'
      },
      clues: [{ w: 'whereas + S + V', en: 'whereas + a clause, to compare', th: 'whereas = ในขณะที่ (เทียบความต่าง) + ประโยค' }],
      mistake: {
        wrong: 'unlike her assistant relies on e-mail',
        right: 'whereas her assistant relies on e-mail',
        why: {
          en: 'A subject and a verb follow, so use whereas. Unlike takes only a noun.',
          th: 'ข้างหลังมีประธานและกริยา จึงใช้ whereas ส่วน unlike ตามด้วยคำนามเท่านั้น'
        }
      }
    },
    {
      id: 'while-vs-during',
      name: { en: 'While vs during', th: 'ขณะ / ระหว่าง (while vs during)' },
      formula: ['while/when + S + V', 'while/when + V-ing', 'during/throughout + N'],
      words: [
        { w: 'while', en: 'at the same time as', th: 'ขณะที่' },
        { w: 'when', en: 'at the time that', th: 'เมื่อ / ตอนที่' },
        { w: 'during', en: 'in the time of', th: 'ระหว่าง' },
        { w: 'throughout', en: 'for the whole time of', th: 'ตลอดทั้ง' }
      ],
      use: {
        en: 'while or when + subject and verb, or + an -ing verb (a short form). during or throughout + a noun. until (up to the time that) also takes a subject and verb.',
        th: 'while, when + ประโยค หรือ + กริยาเติม -ing (แบบย่อ) / during, throughout + คำนาม ส่วน until (จนกระทั่ง) ก็ตามด้วยประโยคเช่นกัน'
      },
      example: {
        en: 'Please do not use your phone {{while}} driving.',
        th: 'กรุณาอย่าใช้โทรศัพท์ขณะขับรถ'
      },
      clues: [
        { w: 'while + V-ing', en: 'while + -ing; during + a noun', th: 'while + กริยาเติม -ing ได้ ส่วน during + คำนาม' },
        { w: 'when + S + V', en: 'when + a clause', th: 'when = เมื่อ… ตามด้วยประโยค' },
        { w: 'until + S + V', en: 'until + a clause: up to the time that', th: 'until = จนกระทั่ง ตามด้วยประโยค' }
      ],
      mistake: {
        wrong: 'during driving',
        right: 'while driving',
        why: {
          en: 'During takes a noun (during the meeting). Before an -ing verb, use while.',
          th: 'during ตามด้วยคำนาม (during the meeting) ถ้าเป็นกริยาเติม -ing ใช้ while'
        }
      }
    },
    {
      id: 'if-vs-in-case-of',
      name: { en: 'If / unless vs in case of', th: 'ถ้า / ในกรณี (if, unless vs in case of)' },
      formula: ['if/unless/in case + S + V', 'in case of/in the event of + N'],
      words: [
        { w: 'if', en: 'if', th: 'ถ้า' },
        { w: 'unless', en: 'if not', th: 'ถ้าไม่' },
        { w: 'in case', en: 'to be ready if', th: 'เผื่อว่า' },
        { w: 'in case of', en: 'if there is', th: 'ในกรณีที่เกิด' },
        { w: 'in the event of', en: 'if there is (formal)', th: 'ในกรณีที่เกิด (ภาษาทางการ)' }
      ],
      use: {
        en: 'if, unless, in case + subject and verb. in case of, in the event of + a noun.',
        th: 'if, unless, in case + ประโยค / in case of, in the event of + คำนาม'
      },
      example: {
        en: '{{In case of}} fire, use the stairs.',
        th: 'ในกรณีเกิดเพลิงไหม้ ให้ใช้บันได'
      },
      clues: [{ w: 'unless + S + V', en: 'unless = if not, + a clause', th: 'unless = ถ้าไม่… ตามด้วยประโยค' }],
      mistake: {
        wrong: 'in case of it rains',
        right: 'if it rains',
        why: {
          en: 'In case of takes a noun (in case of rain). Before a clause, use if.',
          th: 'in case of ตามด้วยคำนาม (in case of rain) ถ้าเป็นประโยคใช้ if'
        }
      }
    },
    {
      id: 'so-that-vs-in-order-to',
      name: { en: 'So that vs in order to', th: 'เพื่อ (so that vs in order to)' },
      formula: ['so that + S + V', 'in order to/so as to + V1'],
      words: [
        { w: 'so that', en: 'so that', th: 'เพื่อที่จะ (ตามด้วยประโยค)' },
        { w: 'in order to', en: 'to (purpose)', th: 'เพื่อที่จะ (ตามด้วยกริยารูปเดิม)' },
        { w: 'so as to', en: 'same as in order to', th: 'เหมือน in order to' }
      ],
      use: {
        en: 'Both give a purpose. so that + subject and verb (often with can or will). in order to + base verb.',
        th: 'ทั้งคู่แปลว่า "เพื่อ": so that + ประโยค (มักมี can, will) / in order to + กริยารูปเดิม'
      },
      example: {
        en: 'Please arrive early {{so that}} we can start on time.',
        th: 'กรุณามาก่อนเวลา เพื่อที่เราจะได้เริ่มตรงเวลา'
      },
      mistake: {
        wrong: 'in order to we can start',
        right: 'so that we can start',
        why: {
          en: 'In order to takes a base verb. Before a subject and a verb, use so that.',
          th: 'in order to ตามด้วยกริยารูปเดิม ถ้ามีประธานและกริยาใช้ so that'
        }
      }
    },
    {
      id: 'whether-vs-regardless-of',
      name: { en: 'Whether vs regardless of', th: 'ไม่ว่า (whether vs regardless of)' },
      formula: ['whether + S + V + or not', 'regardless of + N'],
      words: [
        { w: 'whether … or not', en: 'no matter if … or not', th: 'ไม่ว่าจะ… หรือไม่' },
        { w: 'regardless of', en: 'no matter what', th: 'ไม่ว่า… / โดยไม่สนว่า…' }
      ],
      use: {
        en: 'Both mean "it does not matter". whether + subject and verb, usually with or. regardless of + a noun.',
        th: 'ทั้งคู่แปลว่า "ไม่ว่า…": whether + ประโยค (มักมี or) / regardless of + คำนาม'
      },
      example: {
        en: 'All staff must attend, {{regardless of}} their position.',
        th: 'พนักงานทุกคนต้องเข้าร่วม ไม่ว่าจะอยู่ตำแหน่งใด'
      },
      mistake: {
        wrong: 'regardless of you work here or there',
        right: 'whether you work here or there',
        why: {
          en: 'Regardless of takes a noun. Before a clause with or, use whether.',
          th: 'regardless of ตามด้วยคำนาม ถ้าเป็นประโยคที่มี or ใช้ whether'
        }
      }
    },
    {
      id: 'instead-of-without',
      name: { en: 'Instead of / without', th: 'แทนที่ / โดยไม่ (instead of / without)' },
      formula: ['instead of/without + N/V-ing'],
      words: [
        { w: 'instead of', en: 'in place of', th: 'แทนที่จะ / แทน' },
        { w: 'without', en: 'not having or doing', th: 'โดยไม่ / โดยไม่มี' }
      ],
      use: {
        en: 'These are prepositions, so a noun or an -ing verb follows, never a full sentence.',
        th: 'สองคำนี้เป็นคำบุพบท จึงตามด้วยคำนามหรือกริยาเติม -ing ไม่ใช่ประโยค'
      },
      example: {
        en: 'You can pay online {{instead of}} visiting the office.',
        th: 'คุณจ่ายเงินออนไลน์แทนการไปที่สำนักงานได้'
      },
      mistake: {
        wrong: 'instead of visit the office',
        right: 'instead of visiting the office',
        why: {
          en: 'Instead of is a preposition, so the verb after it takes -ing.',
          th: 'instead of เป็นคำบุพบท กริยาที่ตามหลังต้องเติม -ing'
        }
      }
    },
    {
      id: 'however-therefore',
      name: { en: 'However / therefore between sentences', th: 'คำเชื่อมระหว่างสองประโยค (however / therefore)' },
      formula: ['S + V; however/therefore/otherwise, S + V'],
      words: [
        { w: 'however', en: 'but', th: 'อย่างไรก็ตาม' },
        { w: 'therefore', en: 'so', th: 'ดังนั้น' },
        { w: 'otherwise', en: 'if not', th: 'มิฉะนั้น' },
        { w: 'nevertheless', en: 'but still', th: 'ถึงอย่างนั้นก็ตาม' },
        { w: 'meanwhile', en: 'at the same time', th: 'ในขณะเดียวกัน' }
      ],
      use: {
        en: 'These cannot join two sentences alone like because can. Put ; or . before them and , after them.',
        th: 'คำพวกนี้ต่อสองประโยคเองไม่ได้เหมือน because ต้องมี ; หรือ . ข้างหน้า และมี , ข้างหลัง'
      },
      example: {
        en: 'The venue was full; {{therefore}}, we moved the event online.',
        th: 'สถานที่เต็ม ดังนั้นเราจึงย้ายงานไปจัดออนไลน์'
      },
      clues: [
        { w: '; however,', en: 'but, between two sentences', th: 'อย่างไรก็ตาม (มี ; ข้างหน้า และ , ข้างหลัง)' },
        { w: '. However,', en: 'but, at the start of a new sentence', th: 'อย่างไรก็ตาม (ขึ้นประโยคใหม่ แล้วมี , ตาม)' }
      ],
      mistake: {
        wrong: 'It rained, however we went out.',
        right: 'It rained; however, we went out.',
        why: {
          en: 'A comma alone cannot join two sentences with however. Put ; before it and , after it.',
          th: 'ใช้แค่ , ต่อสองประโยคด้วย however ไม่ได้ ต้องมี ; ข้างหน้า และ , ข้างหลัง'
        }
      }
    },
    {
      id: 'paired-conjunctions',
      name: { en: 'Paired conjunctions', th: 'คำสันธานที่มาเป็นคู่ (paired conjunctions)' },
      formula: ['both + N + and + N', 'either + N + or + N', 'not only + N + but also + N'],
      words: [
        { w: 'both … and', en: 'the two of them', th: 'ทั้ง… และ…' },
        { w: 'either … or', en: 'one of the two', th: '…หรือ… (อย่างใดอย่างหนึ่ง)' },
        { w: 'neither … nor', en: 'not this and not that', th: 'ไม่ทั้ง… และไม่…' },
        { w: 'not only … but also', en: 'this, and that too', th: 'ไม่เพียงแต่… แต่ยัง…' }
      ],
      use: {
        en: 'These always come in pairs. See one half, look for the other.',
        th: 'คำพวกนี้มาเป็นคู่เสมอ เห็นคำหนึ่งให้มองหาอีกคำ'
      },
      example: {
        en: 'The package includes {{both}} breakfast and dinner.',
        th: 'แพ็กเกจนี้รวมทั้งอาหารเช้าและอาหารเย็น'
      },
      clues: [
        { w: 'and → both', en: 'see and, look for both', th: 'เห็น and ให้มองหา both' },
        { w: 'or → either', en: 'see or, look for either', th: 'เห็น or ให้มองหา either' },
        { w: 'nor → neither', en: 'see nor, look for neither', th: 'เห็น nor ให้มองหา neither' },
        { w: 'but also → not only', en: 'see but also, look for not only', th: 'เห็น but also ให้มองหา not only' }
      ],
      mistake: {
        wrong: 'both breakfast or dinner',
        right: 'both breakfast and dinner',
        why: {
          en: 'Both always pairs with and.',
          th: 'both ต้องคู่กับ and เสมอ'
        }
      }
    }
  ]
}
