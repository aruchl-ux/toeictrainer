import type { CheatSheet } from './types'

export const prepositions: CheatSheet = {
  topic: 'prepositions',
  intro: {
    en: 'Look at the word after the blank: a time, a length of time, a deadline or a place? Each one has its own preposition.',
    th: 'ดูคำหลังช่องว่างว่าเป็น เวลา ช่วงเวลา วันกำหนดส่ง หรือสถานที่ แต่ละแบบใช้คำต่างกัน'
  },
  entries: [
    {
      id: 'time-at-on-in',
      name: { en: 'Time: at / on / in', th: 'เวลา: at / on / in' },
      formula: ['at + clock time', 'on + day/date', 'in + month/year/season'],
      use: {
        en: 'at + clock time (at 9 a.m.), on + day (on Monday), in + month or year (in May).',
        th: 'at + เวลา (at 9 a.m.) / on + วัน (on Monday) / in + เดือน ปี (in May)'
      },
      example: {
        en: 'The conference will begin {{on}} Monday, May 5.',
        th: 'การประชุมจะเริ่มในวันจันทร์ที่ 5 พฤษภาคม'
      },
      clues: ['at 9 a.m.', 'on Friday', 'on June 3', 'in July', 'in 2027']
    },
    {
      id: 'by-vs-until',
      name: { en: 'By vs until', th: 'By กับ until' },
      formula: ['by + deadline', 'until + end time'],
      use: {
        en: 'By means no later than: finish before then. Until means keep going up to then.',
        th: 'by = ไม่เกินเวลานี้ (ทำให้เสร็จ) / until = ทำต่อไปเรื่อย ๆ จนถึงเวลานี้'
      },
      example: {
        en: 'Please submit your expense reports {{by}} Friday.',
        th: 'กรุณาส่งรายงานค่าใช้จ่ายภายในวันศุกร์'
      },
      clues: ['submit / complete / return → by', 'stay / remain / wait → until']
    },
    {
      id: 'for-during-since',
      name: { en: 'For / during / since', th: 'For / during / since' },
      formula: ['for + length of time', 'during + N', 'since + starting point'],
      use: {
        en: 'for + how long (for 3 days), during + an event (during the meeting), since + when it started (since 2020).',
        th: 'for + นานเท่าไร (for 3 days) / during + ช่วงหรืองาน (during the meeting) / since + เริ่มเมื่อไร (since 2020)'
      },
      example: {
        en: 'Phones must be turned off {{during}} the presentation.',
        th: 'ต้องปิดโทรศัพท์ระหว่างการนำเสนอ'
      },
      clues: ['for two weeks', 'during the holiday', 'since 2020']
    },
    {
      id: 'within-throughout',
      name: { en: 'Within / throughout', th: 'Within / throughout' },
      formula: ['within + length of time', 'throughout + N'],
      use: {
        en: 'Within means inside a time limit. Throughout means the whole time, or all over a place.',
        th: 'within = ภายในเวลานี้ / throughout = ตลอดทั้งช่วง หรือทั่วทั้งที่'
      },
      example: {
        en: 'Refunds will be processed {{within}} 10 business days.',
        th: 'การคืนเงินจะดำเนินการภายใน 10 วันทำการ'
      },
      clues: ['within 24 hours', 'throughout the year', 'throughout the building']
    },
    {
      id: 'place-at-on-in',
      name: { en: 'Place: at / on / in', th: 'สถานที่: at / on / in' },
      formula: ['at + point/address', 'on + surface/floor/street', 'in + room/building/city'],
      use: {
        en: 'at + a point (at the desk), on + a floor, street or surface (on the 5th floor), in + inside a room or city (in the room).',
        th: 'at + จุด (at the desk) / on + ชั้น ถนน พื้นผิว (on the 5th floor) / in + ข้างในห้อง เมือง (in the room)'
      },
      example: {
        en: 'The office is located {{on}} the fifth floor.',
        th: 'สำนักงานตั้งอยู่ที่ชั้นห้า'
      },
      clues: ['at the front desk', 'on Main Street', 'in the lobby', 'in Bangkok']
    }
  ]
}
