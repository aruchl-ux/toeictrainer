import type { CheatSheet } from './types'

export const relativeClauses: CheatSheet = {
  topic: 'relative-clauses',
  intro: {
    en: 'Look at the noun before the blank (person, thing, place, time) and at what follows (a verb, or a subject + verb). Together they pick the relative word.',
    th: 'ดูคำนามหน้าช่องว่าง (คน สิ่งของ สถานที่ เวลา) และสิ่งที่ตามหลัง (กริยา หรือ ประธาน + กริยา) สองอย่างนี้บอกว่าต้องใช้คำเชื่อมตัวไหน'
  },
  entries: [
    {
      id: 'who-which-that',
      name: { en: 'Who / which / that as subject', th: 'Who / which / that ทำหน้าที่ประธาน' },
      formula: ['N (person) + who + V', 'N (thing) + which + V', 'N + that + V'],
      use: {
        en: 'When a verb comes right after the blank, use who for people, which for things, or that for either.',
        th: 'ถ้ากริยาตามหลังช่องว่างทันที ใช้ who กับคน which กับสิ่งของ หรือ that ได้ทั้งสองแบบ'
      },
      example: {
        en: 'The candidate {{who}} was hired starts on Monday.',
        th: 'ผู้สมัครที่ได้รับการจ้างงานจะเริ่มงานวันจันทร์'
      }
    },
    {
      id: 'whom-object',
      name: { en: 'Whom / which / that as object', th: 'Whom / which / that ทำหน้าที่กรรม' },
      formula: ['N + whom/which/that + S + V'],
      use: {
        en: 'When a subject + verb comes after the blank, the relative word is the object: whom for people, which for things.',
        th: 'ถ้าหลังช่องว่างเป็นประธาน + กริยา คำเชื่อมนี้ทำหน้าที่กรรม ใช้ whom กับคน which กับสิ่งของ'
      },
      example: {
        en: 'The consultant {{whom}} we hired has extensive experience.',
        th: 'ที่ปรึกษาที่เราจ้างมามีประสบการณ์มาก'
      }
    },
    {
      id: 'whose',
      name: { en: 'Whose', th: 'Whose (ซึ่ง…ของเขา)' },
      formula: ['N + whose + N + V'],
      use: {
        en: 'Whose shows ownership and is always followed by a noun.',
        th: 'whose แสดงความเป็นเจ้าของ และต้องตามด้วยคำนามเสมอ'
      },
      example: {
        en: 'Employees {{whose}} contracts expire this year will be contacted.',
        th: 'พนักงานที่สัญญาจ้างจะหมดอายุในปีนี้จะได้รับการติดต่อ'
      },
      clues: ['___ + noun + verb']
    },
    {
      id: 'where-when',
      name: { en: 'Where / when', th: 'Where / when' },
      formula: ['N (place) + where + S + V', 'N (time) + when + S + V'],
      use: {
        en: 'After a place noun use where, after a time noun use when, when a full clause follows.',
        th: 'หลังคำนามบอกสถานที่ใช้ where หลังคำนามบอกเวลาใช้ when เมื่อตามด้วยประโยคเต็ม'
      },
      example: {
        en: 'This is the room {{where}} the interviews will be held.',
        th: 'นี่คือห้องที่จะใช้สัมภาษณ์งาน'
      }
    },
    {
      id: 'preposition-which',
      name: { en: 'Preposition + which / whom', th: 'คำบุพบท + which / whom' },
      formula: ['N + Prep + which/whom + S + V'],
      use: {
        en: 'A preposition can move in front of which or whom. Never use that or who after a preposition.',
        th: 'คำบุพบทย้ายมาอยู่หน้า which หรือ whom ได้ แต่ห้ามใช้ that หรือ who หลังคำบุพบท'
      },
      example: {
        en: 'The firm {{with which}} we partnered is based in Seoul.',
        th: 'บริษัทที่เราร่วมมือด้วยตั้งอยู่ที่โซล'
      }
    },
    {
      id: 'what-clause',
      name: { en: 'What (= the thing that)', th: 'What (= สิ่งที่)' },
      formula: ['what + S + V'],
      use: {
        en: 'What has no noun before it; it already means "the thing that".',
        th: 'what ไม่มีคำนามอยู่ข้างหน้า เพราะมีความหมายว่า "สิ่งที่" อยู่ในตัวแล้ว'
      },
      example: {
        en: '{{What}} customers want most is faster delivery.',
        th: 'สิ่งที่ลูกค้าต้องการมากที่สุดคือการจัดส่งที่เร็วขึ้น'
      }
    }
  ]
}
