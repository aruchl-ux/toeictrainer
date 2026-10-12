import type { CheatSheet } from './types'

export const conditionals: CheatSheet = {
  topic: 'conditionals',
  intro: {
    en: 'Match the two halves: the verb form in the if clause tells you the verb form in the main clause.',
    th: 'จับคู่สองส่วนให้ตรงกัน รูปกริยาในประโยค if เป็นตัวบอกรูปกริยาในประโยคหลัก'
  },
  entries: [
    {
      id: 'zero-conditional',
      name: { en: 'Zero conditional', th: 'Zero conditional (ความจริงทั่วไป)' },
      formula: ['if + S + V(s/es), S + V(s/es)'],
      use: {
        en: 'Something that is always true when the condition happens.',
        th: 'สิ่งที่เป็นจริงเสมอเมื่อเงื่อนไขเกิดขึ้น'
      },
      example: {
        en: 'If the temperature {{drops}} below zero, the pipes freeze.',
        th: 'ถ้าอุณหภูมิต่ำกว่าศูนย์ ท่อน้ำจะแข็งตัว'
      }
    },
    {
      id: 'first-conditional',
      name: { en: 'First conditional', th: 'First conditional (เป็นไปได้ในอนาคต)' },
      formula: ['if + S + V(s/es), S + will + V1'],
      use: {
        en: 'A real possibility in the future. Use the present simple after if, not will.',
        th: 'สิ่งที่เป็นไปได้จริงในอนาคต หลัง if ใช้ present simple ห้ามใช้ will'
      },
      example: {
        en: 'If you {{order}} today, we will ship it tomorrow.',
        th: 'ถ้าคุณสั่งวันนี้ เราจะจัดส่งพรุ่งนี้'
      },
      clues: ['if', 'unless', 'as long as', 'provided that']
    },
    {
      id: 'second-conditional',
      name: { en: 'Second conditional', th: 'Second conditional (สมมติในปัจจุบัน)' },
      formula: ['if + S + V2/were, S + would + V1'],
      use: {
        en: 'An imaginary or unlikely situation now. Use were for every subject.',
        th: 'สถานการณ์สมมติหรือไม่น่าเกิดขึ้นในปัจจุบัน ใช้ were ได้กับประธานทุกตัว'
      },
      example: {
        en: 'If we {{had}} more staff, we would open on weekends.',
        th: 'ถ้าเรามีพนักงานมากกว่านี้ เราจะเปิดร้านวันเสาร์อาทิตย์'
      }
    },
    {
      id: 'third-conditional',
      name: { en: 'Third conditional', th: 'Third conditional (สมมติในอดีต)' },
      formula: ['if + S + had + V3, S + would have + V3'],
      use: {
        en: 'An imaginary past: it did not happen, so the result did not happen either.',
        th: 'สมมติย้อนอดีต เหตุการณ์ไม่ได้เกิดขึ้นจริง ผลจึงไม่เกิดขึ้นด้วย'
      },
      example: {
        en: 'If the parts had arrived earlier, we {{would have finished}} on time.',
        th: 'ถ้าชิ้นส่วนมาถึงเร็วกว่านี้ เราคงทำเสร็จทันเวลาแล้ว'
      }
    },
    {
      id: 'unless',
      name: { en: 'Unless (= if … not)', th: 'Unless (= ถ้าไม่)' },
      formula: ['unless + S + V(s/es), S + will + V1'],
      use: {
        en: 'Unless means "if … not". The verb after it is positive.',
        th: 'unless แปลว่า "ถ้าไม่" กริยาหลัง unless จึงเป็นรูปบอกเล่า'
      },
      example: {
        en: 'The event will be canceled {{unless}} more people register.',
        th: 'งานจะถูกยกเลิกถ้ามีคนลงทะเบียนไม่เพิ่ม'
      }
    }
  ]
}
