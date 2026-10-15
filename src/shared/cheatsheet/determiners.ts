import type { CheatSheet } from './types'

export const determiners: CheatSheet = {
  topic: 'determiners',
  intro: {
    en: 'The choices are small words that go before a noun, like each, every, most, few, little, another. Look at the noun right after the blank first: is it one (singular) or more than one (plural)? Can you count it, or not (information, equipment)?',
    th: 'ตัวเลือกเป็นคำเล็ก ๆ ที่อยู่หน้าคำนาม (คำนำหน้านาม) เช่น each, every, most, few, little, another ให้ดูคำนามหลังช่องว่างก่อนว่าเป็นเอกพจน์ (ตัวเดียว) หรือพหูพจน์ (หลายตัว) และนับได้หรือนับไม่ได้ (information, equipment)'
  },
  entries: [
    {
      id: 'each-every-noun',
      name: { en: 'Each / every + singular noun', th: 'แต่ละ / ทุก + นามเอกพจน์ (each / every)' },
      formula: ['each/every + N(singular) + V(s/es)'],
      words: [
        { w: 'each', en: 'every one, seen one by one', th: 'แต่ละ' },
        { w: 'every', en: 'all of them, as a group', th: 'ทุก ๆ' }
      ],
      use: {
        en: 'Each and every take a singular noun and a singular verb (with -s). Each of the takes a plural noun, but the verb is still singular.',
        th: 'each และ every ตามด้วยนามเอกพจน์ และกริยาเติม s ส่วน each of the ตามด้วยนามพหูพจน์ แต่กริยายังเติม s'
      },
      example: {
        en: 'Every new {{employee}} receives a copy of the handbook.',
        th: 'พนักงานใหม่ทุกคนได้รับคู่มือคนละเล่ม'
      },
      clues: [
        { w: 'every + singular noun', en: 'all, counted one by one (every employee)', th: 'ทุก + นามเอกพจน์ (every employee)' },
        { w: 'each of the + plural noun', en: 'each one of a group; the verb still takes -s', th: 'แต่ละ…ใน (กลุ่ม) + นามพหูพจน์ กริยายังเติม s' }
      ],
      mistake: {
        wrong: 'Every employees receive a handbook.',
        right: 'Every employee receives a handbook.',
        why: {
          en: 'ทุกคน sounds like many people, but every takes a singular noun and a verb with -s.',
          th: '"ทุกคน" ฟังดูเป็นหลายคน แต่ every ตามด้วยนามเอกพจน์ และกริยาเติม s'
        }
      }
    },
    {
      id: 'all-most-some',
      name: { en: 'All / most / some + plural or uncountable', th: 'ทั้งหมด / ส่วนใหญ่ / บางส่วน (all / most / some)' },
      formula: ['all/most/some + N(plural)', 'most of the + N'],
      words: [
        { w: 'all', en: 'every one', th: 'ทั้งหมด' },
        { w: 'most', en: 'nearly all', th: 'ส่วนใหญ่' },
        { w: 'some', en: 'a number of, not all', th: 'บางส่วน / จำนวนหนึ่ง' }
      ],
      use: {
        en: 'All, most and some take a plural noun or an uncountable noun. Before the or a word like our, add of: most of the staff.',
        th: 'all, most, some ตามด้วยนามพหูพจน์หรือนามนับไม่ได้ ถ้าข้างหลังมี the หรือคำบอกความเป็นเจ้าของ (our, their) ต้องเติม of เช่น most of the staff'
      },
      example: {
        en: '{{Most}} applicants have at least two years of experience.',
        th: 'ผู้สมัครส่วนใหญ่มีประสบการณ์อย่างน้อยสองปี'
      },
      clues: [
        { w: 'most + noun', en: 'most people or things in general', th: 'ส่วนใหญ่ (พูดทั่วไป)' },
        { w: 'most of the + noun', en: 'most of one group we know', th: 'ส่วนใหญ่ของ… (กลุ่มที่รู้กันแล้ว)' },
        { w: 'almost all', en: 'nearly all (almost needs all)', th: 'เกือบทั้งหมด (almost ต้องมี all)' }
      ],
      mistake: {
        wrong: 'Almost employees work from home.',
        right: 'Most employees work from home.',
        why: {
          en: 'Almost means "nearly" and cannot go straight before a noun. Use most, or almost all.',
          th: 'almost แปลว่า "เกือบ" วางหน้าคำนามตรง ๆ ไม่ได้ ให้ใช้ most หรือ almost all'
        }
      }
    },
    {
      id: 'few-little',
      name: { en: '(A) few vs (a) little', th: 'มีบ้าง / แทบไม่มี (a few vs a little)' },
      formula: ['a few/few + N(plural)', 'a little/little + N(uncountable)'],
      words: [
        { w: 'a few', en: 'some, a small number', th: 'มีอยู่บ้าง (นับได้)' },
        { w: 'few', en: 'almost none', th: 'แทบไม่มี (นับได้)' },
        { w: 'a little', en: 'some, a small amount', th: 'มีอยู่บ้าง (นับไม่ได้)' },
        { w: 'little', en: 'almost none', th: 'แทบไม่มี (นับไม่ได้)' }
      ],
      use: {
        en: 'Few and a few go with plural nouns you can count; little and a little with uncountable nouns. Without a, the meaning is negative: almost none.',
        th: 'few / a few ใช้กับนามนับได้พหูพจน์ ส่วน little / a little ใช้กับนามนับไม่ได้ ถ้าไม่มี a ความหมายเป็นลบ คือแทบไม่มี'
      },
      example: {
        en: 'There is {{little}} time left before the deadline, so please hurry.',
        th: 'เหลือเวลาก่อนถึงกำหนดส่งน้อยมาก กรุณารีบหน่อย'
      },
      clues: [
        { w: 'information', en: 'uncountable: no -s, no a', th: 'ข้อมูล (นับไม่ได้ ไม่เติม s)' },
        { w: 'equipment', en: 'uncountable: no -s, no a', th: 'อุปกรณ์ (นับไม่ได้ ไม่เติม s)' },
        { w: 'advice', en: 'uncountable: no -s, no a', th: 'คำแนะนำ (นับไม่ได้ ไม่เติม s)' },
        { w: 'furniture', en: 'uncountable: no -s, no a', th: 'เฟอร์นิเจอร์ (นับไม่ได้ ไม่เติม s)' }
      ],
      mistake: {
        wrong: 'We need a few information.',
        right: 'We need a little information.',
        why: {
          en: 'Information cannot be counted in English (no -s), so it takes a little, not a few.',
          th: 'information ในภาษาอังกฤษนับไม่ได้ (ไม่เติม s) จึงใช้ a little ไม่ใช่ a few'
        }
      }
    },
    {
      id: 'another-other',
      name: { en: 'Another / other / the other', th: 'อีก / อื่น ๆ / ที่เหลือ (another / other / the other)' },
      formula: ['another + N(singular)', 'other + N(plural)', 'the other + N'],
      words: [
        { w: 'another', en: 'one more, or a different one', th: 'อีกหนึ่ง / อีกอันหนึ่ง' },
        { w: 'other', en: 'more, different ones', th: 'อื่น ๆ' },
        { w: 'the other', en: 'the last one or ones that remain', th: 'อันที่เหลือ' }
      ],
      use: {
        en: 'Another takes a singular noun; other takes a plural or uncountable noun; the other means the one or ones that are left.',
        th: 'another ตามด้วยนามเอกพจน์ other ตามด้วยนามพหูพจน์หรือนามนับไม่ได้ ส่วน the other หมายถึงอันที่เหลืออยู่'
      },
      example: {
        en: 'Please use {{another}} meeting room; this one is booked.',
        th: 'กรุณาใช้ห้องประชุมห้องอื่น ห้องนี้มีคนจองแล้ว'
      },
      clues: [
        { w: 'another + singular noun', en: 'one more (another room)', th: 'อีกหนึ่ง + นามเอกพจน์ (another room)' },
        { w: 'other + plural noun', en: 'different ones (other rooms)', th: 'อื่น ๆ + นามพหูพจน์ (other rooms)' },
        { w: 'one … the other', en: 'the first … the second (of two)', th: 'อันหนึ่ง … อีกอันที่เหลือ (มีสองอัน)' }
      ],
      mistake: {
        wrong: 'Please use another rooms.',
        right: 'Please use another room.',
        why: {
          en: 'Another means "one more", so the noun after it is singular. For more than one, use other rooms.',
          th: 'another = อีกหนึ่ง คำนามข้างหลังจึงเป็นเอกพจน์ (room) ถ้าหลายห้องให้ใช้ other rooms'
        }
      }
    }
  ]
}
