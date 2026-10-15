import type { CheatSheet } from './types'

export const relativeClauses: CheatSheet = {
  topic: 'relative-clauses',
  intro: {
    en: 'The choices are words like who, whom, whose, which, that, where, what. Look at the word before the blank first: a person, a thing, a place, a time, a preposition, or no noun at all? Then look after it: a verb straight away, a noun, or a full clause (subject + verb)?',
    th: 'ตัวเลือกเป็นคำอย่าง who, whom, whose, which, that, where, what ให้ดูคำหน้าช่องว่างก่อนว่าเป็นคน สิ่งของ สถานที่ เวลา คำบุพบท หรือไม่มีคำนามเลย แล้วดูข้างหลังว่าเป็นกริยาเลย เป็นคำนาม หรือเป็นประโยคครบ (ประธาน + กริยา)'
  },
  entries: [
    {
      id: 'who-which-that',
      name: { en: 'Who / which / that as subject', th: 'ที่… ตามด้วยกริยาเลย (who / which / that as subject)' },
      formula: ['N (person) + who + V', 'N (thing) + which + V', 'N + that + V'],
      use: {
        en: 'If a verb comes right after: who for people, which for things, that for both. After a comma, use who or which, never that.',
        th: 'ถ้าข้างหลังเป็นกริยาเลย: คนใช้ who / สิ่งของใช้ which / that ใช้ได้ทั้งคู่ แต่หลังจุลภาค (,) ใช้ who หรือ which ห้ามใช้ that'
      },
      example: {
        en: 'The candidate {{who}} was hired starts on Monday.',
        th: 'ผู้สมัครที่ได้รับการจ้างงานจะเริ่มงานวันจันทร์'
      },
      clues: [
        { w: 'applicants who / employees who + V', en: 'people who … (a verb follows)', th: 'ผู้สมัครที่… / พนักงานที่… (ตามด้วยกริยา)' },
        { w: ', which', en: 'after a comma: which for things, never that', th: 'หลังจุลภาค (,) สิ่งของใช้ which ห้ามใช้ that' },
        { w: ', who', en: 'after a comma: who for people (Dana Morris, who…)', th: 'หลังจุลภาค (,) คนใช้ who (Dana Morris, who…)' }
      ],
      mistake: {
        wrong: 'The candidate which was hired starts on Monday.',
        right: 'The candidate who was hired starts on Monday.',
        why: {
          en: 'Thai ที่ is used for people and things, but English uses who for people and which for things.',
          th: 'ภาษาไทยใช้ "ที่" ได้ทั้งคนและสิ่งของ แต่ภาษาอังกฤษ คนใช้ who สิ่งของใช้ which'
        }
      }
    },
    {
      id: 'whom-object',
      name: { en: 'Whom / which / that as object', th: 'ที่… ตามด้วยประธาน + กริยา (whom / which / that as object)' },
      formula: ['N (person) + whom + S + V', 'N (thing) + which + S + V', 'N + that + S + V'],
      use: {
        en: 'If a subject and verb come after: whom for people, which for things, that for both.',
        th: 'ถ้าข้างหลังมีประธาน + กริยา: คนใช้ whom / สิ่งของใช้ which / that ใช้ได้ทั้งคู่'
      },
      example: {
        en: 'The consultant {{whom}} we hired has extensive experience.',
        th: 'ที่ปรึกษาที่เราจ้างมามีประสบการณ์มาก'
      },
      clues: [
        { w: 'the system that + S + V', en: 'after a noun, that (never what)', th: 'หลังคำนาม (system) ใช้ that ห้ามใช้ what' }
      ],
      mistake: {
        wrong: 'The consultant whom we hired him has experience.',
        right: 'The consultant whom we hired has experience.',
        why: {
          en: 'Thai says ที่เราจ้างเขามา, but in English whom already stands for the person, so do not add him.',
          th: 'ภาษาไทยพูดว่า "ที่เราจ้างเขามา" แต่ในภาษาอังกฤษ whom แทนคนนั้นแล้ว ไม่ต้องใส่ him ซ้ำ'
        }
      }
    },
    {
      id: 'whose',
      name: { en: 'Whose', th: 'ซึ่ง…ของเขา (whose)' },
      formula: ['N + whose + N + V'],
      use: {
        en: 'Whose shows who owns something. A noun comes right after it: whose report, whose contracts.',
        th: 'whose = ซึ่ง…ของเขา บอกว่าเป็นของใคร ข้างหลังมีคำนามตามทันที เช่น whose report, whose contracts'
      },
      example: {
        en: 'Employees {{whose}} contracts expire this year will be contacted.',
        th: 'พนักงานที่สัญญาจ้างจะหมดอายุในปีนี้จะได้รับการติดต่อ'
      },
      clues: [
        { w: 'whose + noun + verb', en: 'the noun belongs to the person before', th: 'คำนามข้างหลังเป็นของคนข้างหน้า' }
      ],
      mistake: {
        wrong: 'Employees who contracts expire this year will be contacted.',
        right: 'Employees whose contracts expire this year will be contacted.',
        why: {
          en: 'Thai says พนักงานที่สัญญาจ้าง… with no word for ของ, but English needs whose before the thing the person owns.',
          th: 'ภาษาไทยพูด "พนักงานที่สัญญาจ้าง…" ไม่มีคำว่า "ของ" แต่ภาษาอังกฤษต้องใช้ whose หน้าสิ่งที่เป็นของคนนั้น'
        }
      }
    },
    {
      id: 'where-when',
      name: { en: 'Where / when', th: 'สถานที่และเวลา (where / when)' },
      formula: ['N (place) + where + S + V', 'N (time) + when + S + V'],
      use: {
        en: 'For a place use where, for a time use when. A full clause follows, with nothing missing after the verb.',
        th: 'สถานที่ใช้ where / เวลาใช้ when ข้างหลังเป็นประโยคครบ (ประธาน + กริยา) ไม่ขาดอะไรหลังกริยา'
      },
      example: {
        en: 'This is the room {{where}} the interviews will be held.',
        th: 'นี่คือห้องที่จะใช้สัมภาษณ์งาน'
      },
      clues: [
        { w: 'the hotel / office / city + where', en: 'a place + a full clause', th: 'สถานที่ + ประโยคครบ' },
        { w: 'the date / day / time + when', en: 'a time + a full clause', th: 'วัน / เวลา + ประโยคครบ' }
      ],
      mistake: {
        wrong: 'This is the room which the interviews will be held.',
        right: 'This is the room where the interviews will be held.',
        why: {
          en: 'Thai ที่ becomes which, but the clause after it is already full, so a place needs where (or in which).',
          th: 'คนไทยแปล "ที่" เป็น which แต่ข้างหลังเป็นประโยคครบแล้ว สถานที่จึงต้องใช้ where (หรือ in which)'
        }
      }
    },
    {
      id: 'preposition-which',
      name: { en: 'Preposition + which / whom', th: 'คำบุพบทนำหน้า (preposition + which / whom)' },
      formula: ['N + Prep + which/whom + S + V'],
      use: {
        en: 'Verbs like rely on or deliver to keep their preposition, and it can move to the front: on which, to whom. After a preposition use only which or whom, never that or who.',
        th: 'กริยาที่มีคำบุพบทคู่ (rely on, deliver to) ต้องเก็บคำบุพบทไว้ และยกมาไว้หน้าได้: on which, to whom หลังคำบุพบทใช้ได้แค่ which หรือ whom ห้ามใช้ that หรือ who'
      },
      example: {
        en: 'The firm {{with which}} we partnered is based in Seoul.',
        th: 'บริษัทที่เราร่วมมือด้วยตั้งอยู่ที่โซล'
      },
      clues: [
        { w: 'Prep + which', en: 'for things (on which, in which)', th: 'สิ่งของ: on which, in which' },
        { w: 'Prep + whom', en: 'for people (to whom, with whom)', th: 'คน: to whom, with whom' },
        { w: 'most of whom / some of which', en: 'part of the group just named', th: 'ซึ่งส่วนใหญ่ในนั้น… / ซึ่งบางส่วนในนั้น…' }
      ],
      mistake: {
        wrong: 'The software which our team relies is old.',
        right: 'The software on which our team relies is old.',
        why: {
          en: 'Rely goes with on (rely on), so on must stay: on which, or which … relies on.',
          th: 'rely ใช้คู่กับ on (rely on) จึงต้องมี on ด้วย: on which หรือ which … relies on'
        }
      }
    },
    {
      id: 'what-clause',
      name: { en: 'What (= the thing that)', th: 'สิ่งที่ (what)' },
      formula: ['what + S + V'],
      use: {
        en: 'What means "the thing that". It has no noun before it. After a noun, use that or which instead.',
        th: 'what = สิ่งที่… ข้างหน้าไม่มีคำนาม ถ้าข้างหน้ามีคำนามให้ใช้ that หรือ which แทน'
      },
      example: {
        en: '{{What}} customers want most is faster delivery.',
        th: 'สิ่งที่ลูกค้าต้องการมากที่สุดคือการจัดส่งที่เร็วขึ้น'
      },
      clues: [
        { w: 'pleased with what + S + V', en: 'pleased with the thing that …', th: 'พอใจกับสิ่งที่…' },
        { w: 'what = the thing that', en: 'no noun before it', th: 'สิ่งที่… (ข้างหน้าไม่มีคำนาม)' }
      ],
      mistake: {
        wrong: 'The client liked the design what we presented.',
        right: 'The client liked the design that we presented.',
        why: {
          en: 'Thai สิ่งที่ / ที่ is often turned into what, but what cannot follow a noun. After a noun (the design), use that or which.',
          th: 'คนไทยมักแปล "ที่" เป็น what แต่ what วางหลังคำนามไม่ได้ ถ้ามีคำนาม (the design) ให้ใช้ that หรือ which'
        }
      }
    }
  ]
}
