import type { CheatSheet } from './types'

export const relativeClauses: CheatSheet = {
  topic: 'relative-clauses',
  intro: {
    en: 'Look at the noun before the blank (person, thing, place, time). Then look after it: a verb straight away, or a subject first?',
    th: 'ดูคำนามข้างหน้า (คน สิ่งของ สถานที่ เวลา) แล้วดูข้างหลังว่าเป็นกริยาเลย หรือมีประธานก่อน'
  },
  entries: [
    {
      id: 'who-which-that',
      name: { en: 'Who / which / that as subject', th: 'Who / which / that ทำหน้าที่ประธาน' },
      formula: ['N (person) + who + V', 'N (thing) + which + V', 'N + that + V'],
      use: {
        en: 'If a verb comes right after: who for people, which for things, that for both.',
        th: 'ถ้าข้างหลังเป็นกริยาเลย: คนใช้ who / สิ่งของใช้ which / that ใช้ได้ทั้งคู่'
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
        en: 'If a subject and verb come after: whom for people, which for things.',
        th: 'ถ้าข้างหลังมีประธาน + กริยา: คนใช้ whom / สิ่งของใช้ which'
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
        en: 'Whose shows who owns something. A noun always comes right after it.',
        th: 'whose = ของ… ข้างหลังต้องมีคำนามเสมอ'
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
        en: 'For a place use where, for a time use when. A full sentence follows.',
        th: 'สถานที่ใช้ where / เวลาใช้ when (ข้างหลังเป็นประโยคเต็ม)'
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
        en: 'After a preposition (with, in, to), use only which or whom. Never that or who.',
        th: 'หลังคำบุพบท (with, in, to) ใช้ได้แค่ which หรือ whom ห้ามใช้ that หรือ who'
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
        en: 'What means "the thing that". There is no noun before it.',
        th: 'what = สิ่งที่… ข้างหน้าไม่มีคำนาม'
      },
      example: {
        en: '{{What}} customers want most is faster delivery.',
        th: 'สิ่งที่ลูกค้าต้องการมากที่สุดคือการจัดส่งที่เร็วขึ้น'
      }
    }
  ]
}
