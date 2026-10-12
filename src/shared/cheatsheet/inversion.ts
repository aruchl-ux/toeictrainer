import type { CheatSheet } from './types'

export const inversion: CheatSheet = {
  topic: 'inversion',
  intro: {
    en: 'When a sentence starts with a negative word, only, so + adjective, should / had / were, or Attached / Enclosed, the verb comes before the subject, like a question.',
    th: 'ถ้าประโยคขึ้นต้นด้วยคำปฏิเสธ, only, so + คำคุณศัพท์, should / had / were หรือ Attached / Enclosed ให้ย้ายกริยามาไว้หน้าประธาน เหมือนประโยคคำถาม'
  },
  entries: [
    {
      id: 'which-helper-verb',
      name: { en: 'Which helping verb goes first?', th: 'เลือกกริยาช่วยตัวไหนมาไว้หน้า' },
      formula: ['be/have/will/can + S + …', 'do/does/did + S + V1'],
      words: [
        { w: 'be', en: 'the normal sentence has is/are/was/were, or an adjective, V-ing or passive V3 follows', th: 'ประโยคปกติมี is / are / was / were หรือข้างหลังเป็นคำคุณศัพท์ V-ing หรือ V3 แบบถูกทำ' },
        { w: 'have', en: 'the normal sentence has has/have/had + V3', th: 'ประโยคปกติมี has / have / had + V3' },
        { w: 'will/can', en: 'the normal sentence has a modal (will, can, should…)', th: 'ประโยคปกติมี will, can, should ฯลฯ' },
        { w: 'do/does/did', en: 'the normal sentence has no helping verb; the main verb goes back to V1', th: 'ประโยคปกติไม่มีกริยาช่วยเลย ให้เติม do / does / did และกริยาหลักกลับเป็นรูปเดิม' }
      ],
      use: {
        en: 'First say the sentence the normal way. If it already has be, have or a modal, move that word to the front. If not, add do, does or did. Before an adjective like successful, it must be be, never do.',
        th: 'ลองพูดประโยคแบบปกติก่อน ถ้ามี be, have หรือ will / can อยู่แล้ว ให้ย้ายตัวนั้นมาไว้หน้า ถ้าไม่มี ให้เติม do / does / did ระวัง! ถ้าข้างหลังเป็นคำคุณศัพท์ (เช่น successful) ต้องใช้ be ห้ามใช้ do'
      },
      example: {
        en: 'Seldom {{does}} our team miss a deadline.',
        th: 'ทีมของเราแทบไม่เคยพลาดกำหนดส่ง'
      },
      clues: ['the team misses → Seldom does the team miss', 'we have met → Rarely have we met', 'it was popular → So popular was it']
    },
    {
      id: 'negative-adverb-inversion',
      name: { en: 'Negative word first', th: 'ขึ้นต้นด้วยคำปฏิเสธ' },
      formula: ['never/rarely/seldom/hardly + aux + S + V'],
      words: [
        { w: 'never', en: 'not ever', th: 'ไม่เคย' },
        { w: 'rarely', en: 'almost never', th: 'แทบไม่เคย / นาน ๆ ครั้ง' },
        { w: 'seldom', en: 'almost never', th: 'แทบไม่เคย (เหมือน rarely)' },
        { w: 'hardly', en: 'almost not', th: 'แทบจะไม่' },
        { w: 'aux', en: 'helping verb: be, have, will/can or do/does/did (see the first card)', th: 'กริยาช่วย: be, have, will / can หรือ do / does / did (ดูการ์ดแรก)' }
      ],
      use: {
        en: 'If the sentence starts with never, rarely, seldom or hardly, put the helping verb before the subject.',
        th: 'ขึ้นต้นด้วย never, rarely, seldom, hardly ให้วางกริยาช่วยไว้หน้าประธาน'
      },
      example: {
        en: 'Rarely {{have}} we seen such strong sales in the first quarter.',
        th: 'เราแทบไม่เคยเห็นยอดขายไตรมาสแรกสูงขนาดนี้'
      },
      clues: ['never', 'rarely', 'seldom', 'hardly', 'little', 'under no circumstances']
    },
    {
      id: 'not-only-inversion',
      name: { en: 'Not only … but also', th: 'Not only … but also ขึ้นต้นประโยค' },
      formula: ['not only + aux + S + V, but + S + also + V'],
      words: [{ w: 'not only … but', en: 'not just this, but also that', th: 'ไม่เพียงแต่… แต่ยัง…' }],
      use: {
        en: 'If not only starts the sentence, swap only the first part. The part after but stays normal.',
        th: 'ขึ้นต้นด้วย not only ให้สลับเฉพาะส่วนแรก ส่วนหลัง but เป็นประโยคปกติ'
      },
      example: {
        en: 'Not only {{does}} the plan save money, but it also saves time.',
        th: 'แผนนี้ไม่เพียงแต่ช่วยประหยัดเงิน แต่ยังประหยัดเวลาด้วย'
      }
    },
    {
      id: 'only-inversion',
      name: { en: 'Only after / only when / not until', th: 'Only after / only when / not until' },
      formula: ['only after/only when/not until + N/Clause + aux + S + V'],
      words: [
        { w: 'only after', en: 'not before', th: 'หลังจาก… เท่านั้น ถึงจะ…' },
        { w: 'only when', en: 'only at the time that', th: 'ก็ต่อเมื่อ…' },
        { w: 'not until', en: 'not before', th: 'จนกว่า… ถึงจะ…' }
      ],
      use: {
        en: 'The "only" part stays normal. The main part that follows it is swapped: helping verb, then subject.',
        th: 'ส่วนที่มี only เป็นปกติ แต่ส่วนหลักที่ตามมาต้องสลับ: กริยาช่วย แล้วค่อยประธาน'
      },
      example: {
        en: 'Only when the payment clears {{will}} we ship the order.',
        th: 'เราจะส่งสินค้าก็ต่อเมื่อชำระเงินเรียบร้อยแล้วเท่านั้น'
      }
    },
    {
      id: 'so-such-inversion',
      name: { en: 'So + adjective / such first', th: 'ขึ้นต้นด้วย So + คำคุณศัพท์ / Such' },
      formula: ['so + Adj + be + S + that + S + V', 'such + be + N + that + S + V'],
      words: [
        { w: 'so … that', en: 'so much … that (result)', th: 'มาก… จน…' },
        { w: 'such … that', en: 'so great … that', th: '…มากขนาดนั้น จน…' },
        { w: 'be', en: 'is/are/was/were, never do', th: 'is / are / was / were เท่านั้น ห้ามใช้ do' }
      ],
      use: {
        en: 'This is the normal "S + was so + adjective + that" with so + adjective moved to the front. Then be, then the subject. Use be because an adjective cannot follow do.',
        th: 'มาจากประโยคปกติ "S + was so + คำคุณศัพท์ + that…" แล้วย้าย so + คำคุณศัพท์ มาไว้หน้า ตามด้วย be + ประธาน ต้องใช้ be เพราะ do ตามด้วยคำคุณศัพท์ไม่ได้'
      },
      example: {
        en: 'So popular {{was}} the workshop that a second session was added.',
        th: 'เวิร์กช็อปได้รับความนิยมมาก จนต้องเพิ่มรอบที่สอง'
      },
      clues: ['So + adjective ___ the …', '… that + result']
    },
    {
      id: 'conditional-inversion',
      name: { en: 'If-clause without if', th: 'ละ if แล้วสลับที่' },
      formula: ['should + S + V1, S + will + V1', 'had + S + V3, S + would have + V3', 'were + S + to V1, S + would + V1'],
      words: [
        { w: 'should', en: 'if (it happens)', th: 'ถ้า… (= if + S + V)' },
        { w: 'had', en: 'if (in the past, but it did not happen)', th: 'ถ้า… (เรื่องอดีตที่ไม่ได้เกิดจริง = if + had V3)' },
        { w: 'were', en: 'if (imagined)', th: 'ถ้า… (สมมติ = if + V2)' }
      ],
      use: {
        en: 'Drop if and move should, had or were to the front. "Should you have…" is very common in emails.',
        th: 'ตัด if ออก แล้วย้าย should, had, were มาไว้หน้าสุด ในอีเมลเจอ "Should you have…" บ่อยมาก'
      },
      example: {
        en: '{{Should}} you need any help, please call the front desk.',
        th: 'หากต้องการความช่วยเหลือ กรุณาโทรหาแผนกต้อนรับ'
      },
      clues: ['___ you have any questions', '___ you need assistance']
    },
    {
      id: 'no-sooner-than',
      name: { en: 'No sooner … than / hardly … when', th: 'No sooner … than / hardly … when' },
      formula: ['no sooner + had + S + V3 + than + S + V2', 'hardly + had + S + V3 + when + S + V2'],
      words: [
        { w: 'no sooner … than', en: 'as soon as … then', th: 'ทันทีที่… ก็…' },
        { w: 'hardly … when', en: 'as soon as … then', th: 'เพิ่งจะ… ก็…' }
      ],
      use: {
        en: 'As soon as A happened, B happened. Remember the pairs: no sooner … than, hardly … when.',
        th: 'ทันทีที่ A เกิด B ก็เกิด จำคู่ให้แม่น: no sooner … than, hardly … when'
      },
      example: {
        en: 'No sooner {{had}} the store opened than customers rushed in.',
        th: 'ร้านเพิ่งเปิดได้ไม่ทันไร ลูกค้าก็กรูกันเข้ามา'
      }
    },
    {
      id: 'enclosed-attached-inversion',
      name: { en: 'Attached / Enclosed first (emails)', th: 'Attached / Enclosed ขึ้นต้นประโยค (อีเมล)' },
      formula: ['attached/enclosed/included + is + N', 'attached/enclosed/included + are + N(s)'],
      words: [
        { w: 'attached', en: 'sent with this email', th: 'ที่แนบมา (ในอีเมล)' },
        { w: 'enclosed', en: 'sent in this envelope', th: 'ที่แนบมา (ในซองจดหมาย)' },
        { w: 'included', en: 'part of this package', th: 'ที่รวมมาด้วย' }
      ],
      use: {
        en: 'Emails often move attached or enclosed to the front. The real subject comes after is/are, so pick is or are from the noun after the blank.',
        th: 'ในอีเมลมักย้าย attached, enclosed มาไว้หน้า ประธานจริงอยู่ "หลัง" is / are จึงต้องดูคำนามหลังช่องว่าง: ตัวเดียวใช้ is / หลายตัวใช้ are'
      },
      example: {
        en: 'Attached {{are}} the slides from yesterday’s meeting.',
        th: 'แนบสไลด์จากการประชุมเมื่อวานมาด้วย'
      },
      clues: ['Attached ___', 'Enclosed ___', 'Included ___']
    }
  ]
}
