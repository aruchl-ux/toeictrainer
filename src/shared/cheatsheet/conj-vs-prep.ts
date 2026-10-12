import type { CheatSheet } from './types'

export const conjVsPrep: CheatSheet = {
  topic: 'conj-vs-prep',
  intro: {
    en: 'Look after the blank. A subject and verb: use a word like because or although. Only a noun: use a word like because of or despite.',
    th: 'ดูหลังช่องว่าง: มีประธาน + กริยา ใช้ because, although / มีแค่คำนาม ใช้ because of, despite'
  },
  entries: [
    {
      id: 'because-vs-because-of',
      name: { en: 'Because vs because of', th: 'Because กับ because of (เพราะ)' },
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
      clues: ['___ + the/a + noun', '___ + he/they + verb']
    },
    {
      id: 'although-vs-despite',
      name: { en: 'Although vs despite', th: 'Although กับ despite (แม้ว่า)' },
      formula: ['although/even though/even if + S + V', 'despite/in spite of + N/V-ing'],
      words: [
        { w: 'although', en: 'even though', th: 'แม้ว่า' },
        { w: 'even though', en: 'even though (stronger)', th: 'แม้ว่า (เน้นกว่า although)' },
        { w: 'even if', en: 'whether or not (imagined)', th: 'ถึงแม้ว่า (เรื่องสมมติ อาจเกิดหรือไม่เกิด)' },
        { w: 'despite', en: 'without being stopped by', th: 'ทั้ง ๆ ที่มี… / แม้จะมี…' },
        { w: 'in spite of', en: 'same as despite', th: 'เหมือน despite' }
      ],
      use: {
        en: 'All of them show a surprise contrast. although, even though, even if + subject and verb. despite, in spite of + a noun or V-ing. Never "despite of".',
        th: 'ทุกคำแสดงเรื่องที่ขัดกัน (แม้ว่า…ก็ยัง…): although, even though, even if + ประโยค / despite, in spite of + คำนาม หรือ V-ing (ไม่มี despite of)'
      },
      example: {
        en: '{{Despite}} the rain, the outdoor event continued.',
        th: 'แม้ฝนจะตก งานกลางแจ้งก็ยังดำเนินต่อไป'
      }
    },
    {
      id: 'whereas-vs-unlike',
      name: { en: 'Whereas vs unlike', th: 'Whereas กับ unlike (เทียบความต่าง)' },
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
      }
    },
    {
      id: 'while-vs-during',
      name: { en: 'While vs during', th: 'While กับ during (ระหว่าง)' },
      formula: ['while/when + S + V', 'while/when + V-ing', 'during/throughout + N'],
      words: [
        { w: 'while', en: 'at the same time as', th: 'ขณะที่' },
        { w: 'when', en: 'at the time that', th: 'เมื่อ / ตอนที่' },
        { w: 'during', en: 'in the time of', th: 'ระหว่าง' },
        { w: 'throughout', en: 'for the whole time of', th: 'ตลอดทั้ง' }
      ],
      use: {
        en: 'while or when + subject and verb, or + V-ing (a short form). during or throughout + a noun.',
        th: 'while, when + ประโยค หรือ + V-ing (แบบย่อ) / during, throughout + คำนาม'
      },
      example: {
        en: 'Please do not use your phone {{while}} driving.',
        th: 'กรุณาอย่าใช้โทรศัพท์ขณะขับรถ'
      }
    },
    {
      id: 'if-vs-in-case-of',
      name: { en: 'If / unless vs in case of', th: 'If / unless กับ in case of (ถ้า / ในกรณี)' },
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
      }
    },
    {
      id: 'so-that-vs-in-order-to',
      name: { en: 'So that vs in order to', th: 'So that กับ in order to (เพื่อ)' },
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
      }
    },
    {
      id: 'whether-vs-regardless-of',
      name: { en: 'Whether vs regardless of', th: 'Whether กับ regardless of (ไม่ว่า…)' },
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
      }
    },
    {
      id: 'instead-of-without',
      name: { en: 'Instead of / without', th: 'Instead of / without (+ คำนาม หรือ V-ing)' },
      formula: ['instead of/without + N/V-ing'],
      words: [
        { w: 'instead of', en: 'in place of', th: 'แทนที่จะ / แทน' },
        { w: 'without', en: 'not having or doing', th: 'โดยไม่ / โดยไม่มี' }
      ],
      use: {
        en: 'These are prepositions, so a noun or V-ing follows, never a full sentence.',
        th: 'สองคำนี้เป็นคำบุพบท จึงตามด้วยคำนามหรือ V-ing ไม่ใช่ประโยค'
      },
      example: {
        en: 'You can pay online {{instead of}} visiting the office.',
        th: 'คุณจ่ายเงินออนไลน์แทนการไปที่สำนักงานได้'
      }
    },
    {
      id: 'however-therefore',
      name: { en: 'However / therefore between sentences', th: 'However / therefore (เชื่อมระหว่างสองประโยค)' },
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
      clues: ['; ___ ,', 'Sentence. ___ ,']
    },
    {
      id: 'paired-conjunctions',
      name: { en: 'Paired conjunctions', th: 'คำเชื่อมที่มาเป็นคู่' },
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
      clues: ['and → both', 'or → either', 'nor → neither', 'but also → not only']
    }
  ]
}
