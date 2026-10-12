import type { CheatSheet } from './types'

export const conjVsPrep: CheatSheet = {
  topic: 'conj-vs-prep',
  intro: {
    en: 'Check what comes after the blank. A full clause (subject + verb) needs a conjunction; a noun or V-ing needs a preposition.',
    th: 'ดูสิ่งที่ตามหลังช่องว่าง ถ้าเป็นประโยคเต็ม (ประธาน + กริยา) ต้องใช้คำสันธาน ถ้าเป็นคำนามหรือ V-ing ต้องใช้คำบุพบท'
  },
  entries: [
    {
      id: 'because-vs-because-of',
      name: { en: 'Because vs because of', th: 'Because กับ because of' },
      formula: ['because/since/as + S + V', 'because of/due to/owing to + N'],
      use: {
        en: 'Both give a reason. Because takes a clause; because of and due to take a noun.',
        th: 'ทั้งสองแบบบอกเหตุผล because ตามด้วยประโยค ส่วน because of และ due to ตามด้วยคำนาม'
      },
      example: {
        en: 'The flight was delayed {{due to}} heavy fog.',
        th: 'เที่ยวบินล่าช้าเนื่องจากหมอกลงหนา'
      }
    },
    {
      id: 'although-vs-despite',
      name: { en: 'Although vs despite', th: 'Although กับ despite' },
      formula: ['although/even though/though + S + V', 'despite/in spite of + N/V-ing'],
      use: {
        en: 'Both show contrast. Although takes a clause; despite takes a noun or V-ing. Never write "despite of".',
        th: 'ทั้งสองแบบแสดงความขัดแย้ง although ตามด้วยประโยค despite ตามด้วยคำนามหรือ V-ing และไม่มี "despite of"'
      },
      example: {
        en: '{{Despite}} the rain, the outdoor event continued.',
        th: 'แม้ฝนจะตก งานกลางแจ้งก็ยังดำเนินต่อไป'
      }
    },
    {
      id: 'while-vs-during',
      name: { en: 'While vs during', th: 'While กับ during' },
      formula: ['while + S + V', 'during + N'],
      use: {
        en: 'Both mean at the same time as. While takes a clause; during takes a noun.',
        th: 'ทั้งสองแปลว่าในระหว่างที่ while ตามด้วยประโยค during ตามด้วยคำนาม'
      },
      example: {
        en: 'Please do not use your phone {{while}} you are driving.',
        th: 'กรุณาอย่าใช้โทรศัพท์ขณะขับรถ'
      }
    },
    {
      id: 'if-vs-in-case-of',
      name: { en: 'If / unless vs in case of', th: 'If / unless กับ in case of' },
      formula: ['if/unless + S + V', 'in case of/in the event of + N'],
      use: {
        en: 'If and unless take a clause; in case of and in the event of take a noun.',
        th: 'if และ unless ตามด้วยประโยค ส่วน in case of และ in the event of ตามด้วยคำนาม'
      },
      example: {
        en: '{{In case of}} fire, use the stairs.',
        th: 'ในกรณีเกิดเพลิงไหม้ ให้ใช้บันได'
      }
    },
    {
      id: 'paired-conjunctions',
      name: { en: 'Paired conjunctions', th: 'คำสันธานที่มาเป็นคู่' },
      formula: ['both + N + and + N', 'either + N + or + N', 'not only + N + but also + N'],
      use: {
        en: 'These come in fixed pairs: both … and, either … or, neither … nor, not only … but also. If you see one half, look for its partner.',
        th: 'คำเหล่านี้มาเป็นคู่ตายตัว: both … and, either … or, neither … nor, not only … but also ถ้าเห็นครึ่งหนึ่ง ให้หาคู่ของมัน'
      },
      example: {
        en: 'The package includes {{both}} breakfast and dinner.',
        th: 'แพ็กเกจนี้รวมทั้งอาหารเช้าและอาหารเย็น'
      },
      clues: ['and → both', 'or → either', 'nor → neither', 'but also → not only']
    }
  ]
}
