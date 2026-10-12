import type { CheatSheet } from './types'

export const prepositions: CheatSheet = {
  topic: 'prepositions',
  intro: {
    en: 'Look at the noun after the blank: is it a time, a period, a deadline or a place? Each kind takes its own preposition.',
    th: 'ดูคำนามหลังช่องว่างว่าเป็นเวลา ช่วงเวลา กำหนดส่ง หรือสถานที่ แต่ละแบบใช้คำบุพบทต่างกัน'
  },
  entries: [
    {
      id: 'time-at-on-in',
      name: { en: 'Time: at / on / in', th: 'เวลา: at / on / in' },
      formula: ['at + clock time', 'on + day/date', 'in + month/year/season'],
      use: {
        en: 'At for an exact time, on for a day or date, in for a longer period such as a month or year.',
        th: 'at ใช้กับเวลาที่แน่นอน on ใช้กับวันหรือวันที่ in ใช้กับช่วงที่ยาวกว่า เช่น เดือน ปี ฤดู'
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
        en: 'By means no later than (a one-time action). Until means the action continues up to that time.',
        th: 'by แปลว่าไม่เกินเวลานั้น (ทำครั้งเดียวให้เสร็จ) until แปลว่าทำต่อเนื่องไปจนถึงเวลานั้น'
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
        en: 'For + how long (three days). During + an event or period (the meeting). Since + when it started, usually with the present perfect.',
        th: 'for + ระยะเวลา (three days) during + เหตุการณ์หรือช่วงเวลา (the meeting) since + จุดเริ่มต้น มักใช้กับ present perfect'
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
        en: 'Within means inside a time limit. Throughout means during the whole period or all over a place.',
        th: 'within แปลว่าภายในกรอบเวลา throughout แปลว่าตลอดทั้งช่วงเวลาหรือทั่วทั้งพื้นที่'
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
        en: 'At for a point or address, on for a surface, floor or street, in for an enclosed space or a city.',
        th: 'at ใช้กับจุดหรือที่อยู่ on ใช้กับพื้นผิว ชั้น หรือถนน in ใช้กับพื้นที่ปิดหรือเมือง'
      },
      example: {
        en: 'The office is located {{on}} the fifth floor.',
        th: 'สำนักงานตั้งอยู่ที่ชั้นห้า'
      },
      clues: ['at the front desk', 'on Main Street', 'in the lobby', 'in Bangkok']
    }
  ]
}
