import type { CheatSheet } from './types'

export const prepositions: CheatSheet = {
  topic: 'prepositions',
  intro: {
    en: 'All four choices are small words like in, on, at, by. Look at the word after the blank first: is it a time, a length of time, a deadline or a place? Each one has its own preposition. Some words also have a fixed partner you just learn.',
    th: 'ตัวเลือกทั้งสี่เป็นคำบุพบท เช่น in, on, at, by ให้ดูคำหลังช่องว่างก่อน ว่าเป็นเวลา ช่วงเวลา กำหนดส่ง หรือสถานที่ แต่ละแบบใช้คำบุพบทต่างกัน และบางคำก็มีคำบุพบทคู่ประจำที่ต้องจำ'
  },
  entries: [
    {
      id: 'time-at-on-in',
      name: { en: 'Time: at / on / in', th: 'บอกเวลา at / on / in (time)' },
      formula: ['at + clock time', 'on + day/date', 'in + month/year/season'],
      use: {
        en: 'at + clock time (at 9 a.m.), on + day or date (on Monday, on March 14), in + month or year (in May).',
        th: 'at + เวลา (at 9 a.m.) / on + วัน หรือวันที่ (on Monday, on March 14) / in + เดือน ปี (in May)'
      },
      example: {
        en: 'The conference will begin {{on}} Monday, May 5.',
        th: 'การประชุมจะเริ่มในวันจันทร์ที่ 5 พฤษภาคม'
      },
      clues: [
        { w: 'at 9 a.m.', en: 'at nine in the morning', th: 'ตอน 9 โมงเช้า' },
        { w: 'on Friday', en: 'on that day', th: 'ในวันศุกร์' },
        { w: 'on June 3', en: 'on that date', th: 'ในวันที่ 3 มิถุนายน' },
        { w: 'in July', en: 'in that month', th: 'ในเดือนกรกฎาคม' },
        { w: 'in 2027', en: 'in that year', th: 'ในปี 2027' }
      ],
      mistake: {
        wrong: 'in Monday',
        right: 'on Monday',
        why: {
          en: 'Days and dates take on. Thai says "ในวันจันทร์", so learners write in.',
          th: 'วันและวันที่ใช้ on เสมอ ภาษาไทยพูดว่า "ในวันจันทร์" จึงมักเผลอใช้ in'
        }
      }
    },
    {
      id: 'by-vs-until',
      name: { en: 'By vs until', th: 'กำหนดส่งกับการรอ (by vs until)' },
      formula: ['by + deadline', 'until + end time'],
      use: {
        en: 'By means no later than: finish before then. Until means keep going up to then.',
        th: 'by = ไม่เกินเวลานี้ (ทำให้เสร็จ) / until = ทำต่อไปเรื่อย ๆ จนถึงเวลานี้'
      },
      example: {
        en: 'Please submit your expense reports {{by}} Friday.',
        th: 'กรุณาส่งรายงานค่าใช้จ่ายภายในวันศุกร์'
      },
      clues: [
        { w: 'submit … by Friday', en: 'hand in no later than Friday', th: 'ส่งภายในวันศุกร์' },
        { w: 'wait until Friday', en: 'keep waiting up to Friday', th: 'รอจนถึงวันศุกร์' },
        { w: 'submit / send / return → by', en: 'one action, done in time', th: 'ทำครั้งเดียวให้ทัน ใช้ by' },
        { w: 'stay / remain / wait → until', en: 'goes on up to that time', th: 'ทำต่อเนื่องจนถึงเวลานั้น ใช้ until' }
      ],
      mistake: {
        wrong: 'submit the report until Friday',
        right: 'submit the report by Friday',
        why: {
          en: 'Submitting happens once and must be in time, so use by. Until is for things that keep going, like wait.',
          th: 'การส่งเกิดครั้งเดียวและต้องทันเวลา จึงใช้ by ส่วน until ใช้กับสิ่งที่ทำต่อเนื่อง เช่น wait'
        }
      }
    },
    {
      id: 'for-during-since',
      name: { en: 'For / during / since', th: 'นานเท่าไร ช่วงไหน ตั้งแต่เมื่อไร (for / during / since)' },
      formula: ['for + length of time', 'during + N', 'since + starting point'],
      use: {
        en: 'for + how long (for 3 days), during + an event (during the meeting), since + when it started (since 2020). For a date range, use from … through.',
        th: 'for + นานเท่าไร (for 3 days) / during + ช่วงหรืองาน (during the meeting) / since + เริ่มเมื่อไร (since 2020) ถ้าเป็นช่วงวันที่ใช้ from … through'
      },
      example: {
        en: 'Phones must be turned off {{during}} the presentation.',
        th: 'ต้องปิดโทรศัพท์ระหว่างการนำเสนอ'
      },
      clues: [
        { w: 'for two weeks', en: 'how long: two weeks', th: 'เป็นเวลาสองสัปดาห์' },
        { w: 'during the holiday', en: 'in the time of the holiday', th: 'ระหว่างวันหยุด' },
        { w: 'since 2020', en: 'from 2020 until now', th: 'ตั้งแต่ปี 2020 (จนถึงตอนนี้)' },
        { w: 'from … through', en: 'from the first day to the last day', th: 'ตั้งแต่…ถึง… (ช่วงวันที่)' }
      ],
      mistake: {
        wrong: 'since three years',
        right: 'for three years',
        why: {
          en: 'Since needs a starting point (since 2020). A length of time takes for.',
          th: 'since ต้องตามด้วยจุดเริ่ม (since 2020) ส่วนระยะเวลา (3 ปี) ใช้ for'
        }
      }
    },
    {
      id: 'within-throughout',
      name: { en: 'Within / throughout', th: 'ภายใน และตลอดทั้ง (within / throughout)' },
      formula: ['within + length of time', 'throughout + N'],
      use: {
        en: 'Within means inside a time limit. Throughout means the whole time, or all over a place.',
        th: 'within = ภายในเวลานี้ / throughout = ตลอดทั้งช่วง หรือทั่วทั้งที่'
      },
      example: {
        en: 'Refunds will be processed {{within}} 10 business days.',
        th: 'การคืนเงินจะดำเนินการภายใน 10 วันทำการ'
      },
      clues: [
        { w: 'within 24 hours', en: 'no later than 24 hours from now', th: 'ภายใน 24 ชั่วโมง' },
        { w: 'throughout the year', en: 'all year', th: 'ตลอดทั้งปี' },
        { w: 'throughout the building', en: 'all over the building', th: 'ทั่วทั้งอาคาร' }
      ],
      mistake: {
        wrong: 'arrive among two weeks',
        right: 'arrive within two weeks',
        why: {
          en: 'Among means in a group of people or things. Inside a time limit is within.',
          th: 'among = ท่ามกลาง (ใช้กับกลุ่มคนหรือสิ่งของ) ส่วน "ภายใน" ช่วงเวลาใช้ within'
        }
      }
    },
    {
      id: 'place-at-on-in',
      name: { en: 'Place: at / on / in', th: 'บอกสถานที่ at / on / in (place)' },
      formula: ['at + point/address', 'on + surface/floor/street', 'in + room/building/city'],
      use: {
        en: 'at + a point (at the desk), on + a floor, street or surface (on the 5th floor), in + inside a room or city (in the room).',
        th: 'at + จุด (at the desk) / on + ชั้น ถนน พื้นผิว (on the 5th floor) / in + ข้างในห้อง เมือง (in the room)'
      },
      example: {
        en: 'The office is located {{on}} the fifth floor.',
        th: 'สำนักงานตั้งอยู่ที่ชั้นห้า'
      },
      clues: [
        { w: 'at the front desk', en: 'at the reception point', th: 'ที่เคาน์เตอร์ต้อนรับ' },
        { w: 'on Main Street', en: 'on that street', th: 'บนถนนเมน' },
        { w: 'in the lobby', en: 'inside the lobby', th: 'ในล็อบบี้' },
        { w: 'in Bangkok', en: 'inside the city', th: 'ในกรุงเทพฯ' }
      ],
      mistake: {
        wrong: 'in the fifth floor',
        right: 'on the fifth floor',
        why: {
          en: 'Floors of a building take on, even though Thai says "ในชั้นห้า".',
          th: 'ชั้นของอาคารใช้ on แม้ภาษาไทยจะพูดว่า "ในชั้นห้า"'
        }
      }
    },
    {
      id: 'preposition-partners',
      name: { en: 'Words with a fixed preposition', th: 'คำที่มีคำบุพบทคู่ประจำ (fixed prepositions)' },
      formula: ['responsible + for', 'comply + with', 'increase/rise + by + amount'],
      use: {
        en: 'Some words always take the same preposition, whatever the Thai meaning suggests. Learn the word and its preposition as one piece.',
        th: 'บางคำต้องใช้คำบุพบทตัวเดิมเสมอ ไม่ว่าภาษาไทยจะแปลว่าอะไร ให้จำคำกับคำบุพบทเป็นคู่ทั้งก้อน'
      },
      example: {
        en: 'Monthly revenue has increased {{by}} nearly 15 percent.',
        th: 'รายได้ต่อเดือนเพิ่มขึ้นเกือบ 15 เปอร์เซ็นต์'
      },
      clues: [
        { w: 'responsible for', en: 'in charge of', th: 'รับผิดชอบ' },
        { w: 'comply with', en: 'follow (rules)', th: 'ปฏิบัติตาม (กฎ, ข้อบังคับ)' },
        { w: 'increase by', en: 'go up by (an amount)', th: 'เพิ่มขึ้น… (บอกจำนวนที่เพิ่ม)' },
        { w: 'send something to someone', en: 'give or post something to a person', th: 'ส่งอะไรไปให้ใคร' },
        { w: 'in person', en: 'face to face', th: 'ด้วยตัวเอง แบบตัวต่อตัว' }
      ],
      mistake: {
        wrong: 'comply to the rules',
        right: 'comply with the rules',
        why: {
          en: 'Comply always takes with.',
          th: 'comply ใช้กับ with เสมอ ไม่ใช่ to'
        }
      }
    }
  ]
}
