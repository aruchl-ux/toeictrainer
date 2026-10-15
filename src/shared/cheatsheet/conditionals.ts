import type { CheatSheet } from './types'

export const conditionals: CheatSheet = {
  topic: 'conditionals',
  intro: {
    en: 'The choices are one verb in different forms, like does not arrive, will not arrive, would not arrive, or condition words like unless, as long as, provided that. First look at the verb in the other part of the sentence (will, would or would have), then pick its partner for the blank.',
    th: 'ตัวเลือกเป็นกริยาตัวเดียวกันแต่ต่างรูป เช่น does not arrive, will not arrive, would not arrive หรือเป็นคำบอกเงื่อนไขอย่าง unless, as long as, provided that ให้ดูกริยาในอีกส่วนของประโยคก่อน (will, would หรือ would have) แล้วเลือกคู่ของมันมาใส่ช่องว่าง'
  },
  entries: [
    {
      id: 'zero-conditional',
      name: { en: 'Zero conditional', th: 'ความจริงทั่วไป (zero conditional)' },
      formula: ['if + S + V(s/es), S + V(s/es)'],
      use: {
        en: 'For facts that happen every time: if A happens, B happens. Both parts use the present simple.',
        th: 'ใช้กับเรื่องที่เกิดทุกครั้ง: ถ้า A เกิด B ก็เกิด ทั้งสองส่วนใช้กาลปัจจุบันธรรมดา (present simple)'
      },
      example: {
        en: 'If the temperature {{drops}} below zero, the pipes freeze.',
        th: 'ถ้าอุณหภูมิต่ำกว่าศูนย์ ท่อน้ำจะแข็งตัว'
      },
      clues: [
        { w: 'if = when (every time)', en: 'if here means whenever', th: 'if ในที่นี้ = ทุกครั้งที่…' }
      ],
      mistake: {
        wrong: 'If the temperature drop below zero, the pipes freeze.',
        right: 'If the temperature drops below zero, the pipes freeze.',
        why: {
          en: 'Thai verbs never change, but with one subject (the temperature) the present simple verb needs -s, in the if part too.',
          th: 'ภาษาไทยกริยาไม่เปลี่ยนรูป แต่ภาษาอังกฤษ ประธานสิ่งเดียว (the temperature) กริยาต้องเติม s แม้อยู่ในส่วน if'
        }
      }
    },
    {
      id: 'first-conditional',
      name: { en: 'First conditional', th: 'เงื่อนไขที่เกิดได้จริงในอนาคต (first conditional)' },
      formula: ['if + S + V(s/es), S + will + V1'],
      use: {
        en: 'For a real, possible future: if + present simple, then will + V1 in the other part. The if part normally has no will, even about the future.',
        th: 'ใช้กับเรื่องที่เกิดได้จริงในอนาคต: ส่วน if ใช้กาลปัจจุบันธรรมดา อีกส่วนใช้ will + กริยารูปเดิม ส่วน if ปกติไม่ใช้ will แม้พูดถึงอนาคต'
      },
      example: {
        en: 'If you {{order}} today, we will ship it tomorrow.',
        th: 'ถ้าคุณสั่งวันนี้ เราจะจัดส่งพรุ่งนี้'
      },
      clues: [
        { w: 'will + V1 in the other part', en: 'so the if part takes the present simple', th: 'อีกส่วนมี will ส่วน if จึงใช้กาลปัจจุบันธรรมดา' },
        { w: 'if + does not/do not + V1', en: 'negative in the if part: does not, not will not', th: 'ปฏิเสธในส่วน if ใช้ does not / do not ไม่ใช่ will not' }
      ],
      mistake: {
        wrong: 'If it will rain tomorrow, we will cancel the trip.',
        right: 'If it rains tomorrow, we will cancel the trip.',
        why: {
          en: 'Thai says ถ้าพรุ่งนี้ฝนจะตก with จะ, but English uses the present simple after if, even about tomorrow.',
          th: 'ภาษาไทยพูด "ถ้าพรุ่งนี้ฝนจะตก" มีคำว่า "จะ" แต่ภาษาอังกฤษ ส่วน if ใช้กาลปัจจุบันธรรมดา แม้พูดถึงพรุ่งนี้'
        }
      }
    },
    {
      id: 'second-conditional',
      name: { en: 'Second conditional', th: 'สมมติเรื่องที่ไม่จริงตอนนี้ (second conditional)' },
      formula: ['if + S + V2, S + would + V1', 'if + S + were, S + would + V1'],
      use: {
        en: 'For something imagined, not true now: if + V2 (or were), then would + V1. In TOEIC, were is used with every subject (if the budget were). For the imagined part use V2 or were, not would (only polite phrases like if you would like use would).',
        th: 'ใช้กับเรื่องสมมติที่ไม่จริงตอนนี้: ส่วน if ใช้กริยาช่อง 2 (หรือ were) อีกส่วนใช้ would + กริยารูปเดิม ใน TOEIC ใช้ were กับทุกประธาน (if the budget were) ส่วนที่สมมติใช้กริยาช่อง 2 หรือ were ไม่ใช้ would (ยกเว้นสำนวนสุภาพอย่าง if you would like)'
      },
      example: {
        en: 'If we {{had}} more staff, we would open on weekends.',
        th: 'ถ้าเรามีพนักงานมากกว่านี้ เราจะเปิดร้านวันเสาร์อาทิตย์'
      },
      clues: [
        { w: 'would + V1 in the other part', en: 'so the if part takes V2 or were', th: 'อีกส่วนมี would ส่วน if จึงใช้กริยาช่อง 2 หรือ were' },
        { w: 'if + S + were', en: 'were with every subject (if the budget were)', th: 'ใช้ were ได้กับทุกประธาน (if the budget were)' }
      ],
      mistake: {
        wrong: 'If we have more staff, we would open on weekends.',
        right: 'If we had more staff, we would open on weekends.',
        why: {
          en: 'Thai verbs do not change for an imagined situation, but English moves the verb back one step to show it is not true now: have becomes had.',
          th: 'ภาษาไทยไม่เปลี่ยนรูปกริยาเวลาสมมติ แต่ภาษาอังกฤษต้องถอยกริยาไปเป็นช่อง 2 (have เป็น had) เพื่อบอกว่าไม่จริงตอนนี้'
        }
      }
    },
    {
      id: 'third-conditional',
      name: { en: 'Third conditional', th: 'สมมติย้อนอดีต (third conditional)' },
      formula: ['if + S + had + V3, S + would have + V3'],
      use: {
        en: 'For an imagined past that did not happen: if + had + V3, then would have + V3.',
        th: 'ใช้กับเรื่องในอดีตที่ไม่ได้เกิดขึ้นจริง: ส่วน if ใช้ had + กริยาช่อง 3 อีกส่วนใช้ would have + กริยาช่อง 3'
      },
      example: {
        en: 'If the parts had arrived earlier, we {{would have finished}} on time.',
        th: 'ถ้าชิ้นส่วนมาถึงเร็วกว่านี้ เราคงทำเสร็จทันเวลาแล้ว'
      },
      clues: [
        { w: 'would have + V3 in the other part', en: 'so the if part takes had + V3', th: 'อีกส่วนมี would have ส่วน if จึงใช้ had + กริยาช่อง 3' },
        { w: 'if + had + V3', en: 'so the other part takes would have + V3', th: 'ส่วน if มี had อีกส่วนจึงใช้ would have + กริยาช่อง 3' }
      ],
      mistake: {
        wrong: 'If I knew about the change, I would have rebooked my flight.',
        right: 'If I had known about the change, I would have rebooked my flight.',
        why: {
          en: 'Thai ถ้าฉันรู้ looks the same for now and the past, but for an imagined past English needs had + V3 (had known).',
          th: 'ภาษาไทย "ถ้าฉันรู้" ใช้ได้ทั้งตอนนี้และอดีต แต่ภาษาอังกฤษ ถ้าสมมติย้อนอดีตต้องใช้ had + กริยาช่อง 3 (had known)'
        }
      }
    },
    {
      id: 'mixed-conditional',
      name: { en: 'Mixed conditional (past if, result now)', th: 'อดีตไม่จริง แต่ผลอยู่ตอนนี้ (mixed conditional)' },
      formula: ['if + S + had + V3, S + would + V1'],
      use: {
        en: 'The if part is an imagined past (had + V3), but the result is about now. Look for now or today: then use would + V1, not would have + V3.',
        th: 'ส่วน if เป็นอดีตที่ไม่ได้เกิดจริง (had + กริยาช่อง 3) แต่ผลเป็นเรื่องตอนนี้ ถ้าเห็น now หรือ today ให้ใช้ would + กริยารูปเดิม ไม่ใช่ would have + กริยาช่อง 3'
      },
      example: {
        en: 'If we had booked earlier, we {{would be}} in Tokyo now.',
        th: 'ถ้าเราจองเร็วกว่านี้ ตอนนี้เราคงอยู่ที่โตเกียวแล้ว'
      },
      clues: [
        { w: 'now / today', en: 'the result is about the present: would + V1', th: 'ผลเป็นเรื่องตอนนี้ ใช้ would + กริยารูปเดิม' }
      ],
      mistake: {
        wrong: 'If we had booked earlier, we will be in Tokyo now.',
        right: 'If we had booked earlier, we would be in Tokyo now.',
        why: {
          en: 'Thai เราคงจะอยู่ has จะ, so learners write will, but an imagined result needs would.',
          th: 'ภาษาไทยพูด "เราคงจะอยู่…" มีคำว่า "จะ" จึงชอบใช้ will แต่ผลของเรื่องสมมติต้องใช้ would'
        }
      }
    },
    {
      id: 'unless',
      name: { en: 'Condition words: unless, as long as, provided that, even if', th: 'คำบอกเงื่อนไข (unless, as long as, provided that, even if)' },
      formula: ['unless + S + V(s/es), S + will + V1', 'as long as/provided that/even if + S + V'],
      words: [
        { w: 'unless', en: 'if … not', th: 'ถ้าไม่' },
        { w: 'as long as', en: 'on the condition that', th: 'ตราบใดที่ / ขอแค่…' },
        { w: 'provided that', en: 'only if', th: 'โดยมีเงื่อนไขว่า' },
        { w: 'even if', en: 'it may or may not happen; the result is the same', th: 'ต่อให้… (ก็ตาม) (เรื่องที่อาจเกิดหรือไม่เกิดก็ได้)' }
      ],
      use: {
        en: 'All of them take a clause (subject + verb). Unless already means "if not", so the verb after it is not negative. Even if is for something that may happen; even though is for something that is true.',
        th: 'ทุกคำตามด้วยประโยค (ประธาน + กริยา) unless แปลว่า "ถ้าไม่" อยู่แล้ว กริยาหลัง unless จึงไม่ต้องปฏิเสธซ้ำ / even if ใช้กับเรื่องที่อาจเกิด ส่วน even though ใช้กับเรื่องที่เกิดจริง'
      },
      example: {
        en: 'The event will be canceled {{unless}} more people register.',
        th: 'งานจะถูกยกเลิกถ้ามีคนลงทะเบียนไม่เพิ่ม'
      },
      clues: [
        { w: 'even if vs even though', en: 'even if = may or may not happen; even though = it is true', th: 'even if = ต่อให้… (อาจเกิดหรือไม่ก็ได้) / even though = แม้ว่า (เกิดจริงแล้ว)' },
        { w: 'in case of + noun', en: 'in case of takes a noun, not a clause', th: 'in case of ตามด้วยคำนาม ไม่ใช่ประโยค' }
      ],
      mistake: {
        wrong: 'Unless we do not receive the agreement, the team cannot begin.',
        right: 'Unless we receive the agreement, the team cannot begin.',
        why: {
          en: 'Thai ถ้าเราไม่ได้รับ has ไม่, so learners add not, but unless already means "if not".',
          th: 'ภาษาไทยพูด "ถ้าเราไม่ได้รับ…" มีคำว่า "ไม่" จึงชอบใส่ not ซ้ำ แต่ unless แปลว่า "ถ้าไม่" อยู่แล้ว'
        }
      }
    }
  ]
}
