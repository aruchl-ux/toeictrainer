import type { CheatSheet } from './types'

export const determiners: CheatSheet = {
  topic: 'determiners',
  intro: {
    en: 'Determiners come before a noun and must match it: countable or uncountable, singular or plural.',
    th: 'คำนำหน้านาม (determiner) อยู่หน้าคำนาม และต้องเข้ากับคำนามนั้น ทั้งนับได้หรือนับไม่ได้ เอกพจน์หรือพหูพจน์'
  },
  entries: [
    {
      id: 'each-every-noun',
      name: { en: 'Each / every + singular noun', th: 'each / every + นามเอกพจน์' },
      formula: ['each/every + N(singular) + V(s/es)'],
      words: [
        { w: 'each', en: 'every one, seen one by one', th: 'แต่ละ' },
        { w: 'every', en: 'all of them, as a group', th: 'ทุก ๆ' }
      ],
      use: {
        en: 'Each and every take a singular noun and a singular verb. Each of the takes a plural noun but still a singular verb.',
        th: 'each และ every ตามด้วยนามเอกพจน์และกริยาเอกพจน์ ส่วน each of the ตามด้วยนามพหูพจน์ แต่กริยายังเป็นเอกพจน์'
      },
      example: {
        en: 'Every new {{employee}} receives a copy of the handbook.',
        th: 'พนักงานใหม่ทุกคนได้รับคู่มือคนละเล่ม'
      },
      clues: ['each', 'every', 'each of the + plural noun']
    },
    {
      id: 'all-most-some',
      name: { en: 'All / most / some + plural or uncountable', th: 'all / most / some + นามพหูพจน์หรือนามนับไม่ได้' },
      formula: ['all/most/some + N(plural)', 'most of the + N'],
      words: [
        { w: 'all', en: 'every one', th: 'ทั้งหมด' },
        { w: 'most', en: 'nearly all', th: 'ส่วนใหญ่' },
        { w: 'some', en: 'a number of, not all', th: 'บางส่วน / จำนวนหนึ่ง' }
      ],
      use: {
        en: 'All, most and some take a plural countable noun or an uncountable noun. Before the or a possessive, add of: most of the staff.',
        th: 'all, most, some ตามด้วยนามพหูพจน์หรือนามนับไม่ได้ ถ้าข้างหลังมี the หรือคำแสดงความเป็นเจ้าของ ต้องเติม of เช่น most of the staff'
      },
      example: {
        en: '{{Most}} applicants have at least two years of experience.',
        th: 'ผู้สมัครส่วนใหญ่มีประสบการณ์อย่างน้อยสองปี'
      },
      clues: ['most + noun', 'most of the + noun', 'almost all']
    },
    {
      id: 'few-little',
      name: { en: '(A) few vs (a) little', th: '(a) few กับ (a) little' },
      formula: ['a few/few + N(plural)', 'a little/little + N(uncountable)'],
      words: [
        { w: 'a few', en: 'some, a small number', th: 'มีอยู่บ้าง (นับได้)' },
        { w: 'few', en: 'almost none', th: 'แทบไม่มี (นับได้)' },
        { w: 'a little', en: 'some, a small amount', th: 'มีอยู่บ้าง (นับไม่ได้)' },
        { w: 'little', en: 'almost none', th: 'แทบไม่มี (นับไม่ได้)' }
      ],
      use: {
        en: 'Few and a few go with plural countable nouns; little and a little with uncountable nouns. Without a, the meaning is negative: almost none.',
        th: 'few / a few ใช้กับนามนับได้พหูพจน์ ส่วน little / a little ใช้กับนามนับไม่ได้ ถ้าไม่มี a ความหมายเป็นลบ คือแทบไม่มี'
      },
      example: {
        en: 'There is {{little}} time left before the deadline, so please hurry.',
        th: 'เหลือเวลาก่อนถึงกำหนดส่งน้อยมาก กรุณารีบหน่อย'
      },
      clues: ['information', 'equipment', 'advice', 'furniture (uncountable)']
    },
    {
      id: 'another-other',
      name: { en: 'Another / other / the other', th: 'another / other / the other' },
      formula: ['another + N(singular)', 'other + N(plural)', 'the other + N'],
      words: [
        { w: 'another', en: 'one more, or a different one', th: 'อีกหนึ่ง / อีกอันหนึ่ง' },
        { w: 'other', en: 'more, different ones', th: 'อื่น ๆ' },
        { w: 'the other', en: 'the last one or ones that remain', th: 'อันที่เหลือ' }
      ],
      use: {
        en: 'Another takes a singular noun; other takes a plural or uncountable noun; the other means the remaining one or ones.',
        th: 'another ตามด้วยนามเอกพจน์ other ตามด้วยนามพหูพจน์หรือนามนับไม่ได้ ส่วน the other หมายถึงอันที่เหลืออยู่'
      },
      example: {
        en: 'Please use {{another}} meeting room; this one is booked.',
        th: 'กรุณาใช้ห้องประชุมห้องอื่น ห้องนี้มีคนจองแล้ว'
      },
      clues: ['another + singular', 'other + plural', 'one … the other']
    }
  ]
}
