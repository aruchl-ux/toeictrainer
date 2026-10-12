import type { CheatSheet } from './types'

export const conditionals: CheatSheet = {
  topic: 'conditionals',
  intro: {
    en: 'Match the pair: the verb in the if part tells you the verb in the other part.',
    th: 'จับคู่ให้ถูก: กริยาในส่วน if เป็นแบบไหน อีกส่วนก็ต้องเป็นคู่ของมัน'
  },
  entries: [
    {
      id: 'zero-conditional',
      name: { en: 'Zero conditional', th: 'Zero conditional (ความจริงทั่วไป)' },
      formula: ['if + S + V(s/es), S + V(s/es)'],
      use: {
        en: 'Always true: if A happens, B happens. Both parts use the present simple.',
        th: 'เรื่องจริงเสมอ: ถ้า A เกิด B ก็เกิด ทั้งสองส่วนใช้ present simple'
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
        en: 'Real and possible in the future: if + present simple, then will.',
        th: 'เป็นไปได้จริงในอนาคต: if + present simple แล้วอีกส่วนใช้ will'
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
        en: 'Imaginary, not true now: if + V2 (or were), then would.',
        th: 'สมมติ ไม่จริงตอนนี้: if + V2 (หรือ were) แล้วอีกส่วนใช้ would'
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
        en: 'Imaginary past that did not happen: if + had V3, then would have V3.',
        th: 'สมมติย้อนอดีต ซึ่งไม่ได้เกิดขึ้นจริง: if + had V3 แล้วอีกส่วนใช้ would have V3'
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
        en: 'Unless means "if not". The verb after it is not negative.',
        th: 'unless = ถ้าไม่ กริยาหลัง unless จึงเป็นรูปบอกเล่า'
      },
      example: {
        en: 'The event will be canceled {{unless}} more people register.',
        th: 'งานจะถูกยกเลิกถ้ามีคนลงทะเบียนไม่เพิ่ม'
      }
    }
  ]
}
