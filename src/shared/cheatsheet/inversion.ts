import type { CheatSheet } from './types'

export const inversion: CheatSheet = {
  topic: 'inversion',
  intro: {
    en: 'The choices mix normal order and question order, like we have received / have we received, or are helping verbs like does, has, is, had. Look at the first word of the sentence: a negative word (rarely, seldom), not only, only after, so + adjective, should / had / were, or Attached / Enclosed. Then the helping verb comes before the subject, like a question.',
    th: 'ตัวเลือกมีทั้งแบบเรียงปกติและแบบสลับเหมือนคำถาม เช่น we have received / have we received หรือเป็นกริยาช่วยอย่าง does, has, is, had ให้ดูคำแรกของประโยคก่อน ถ้าเป็นคำปฏิเสธ (rarely, seldom), not only, only after, so + คำคุณศัพท์, should / had / were หรือ Attached / Enclosed ให้ย้ายกริยาช่วยมาไว้หน้าประธาน เหมือนประโยคคำถาม'
  },
  entries: [
    {
      id: 'which-helper-verb',
      name: { en: 'Which helping verb goes first?', th: 'เลือกกริยาช่วยที่ย้ายมาไว้หน้า (which helping verb goes first)' },
      formula: ['be/have/will/can + S + …', 'do/does/did + S + V1'],
      words: [
        { w: 'be', en: 'the normal sentence has is/are/was/were, or an adjective, V-ing or passive V3 follows', th: 'ประโยคปกติมี is / are / was / were หรือข้างหลังเป็นคำคุณศัพท์ กริยาเติม -ing หรือกริยาช่อง 3 แบบถูกทำ' },
        { w: 'have', en: 'the normal sentence has has/have/had + V3', th: 'ประโยคปกติมี has / have / had + กริยาช่อง 3' },
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
      clues: [
        { w: 'the team misses → Seldom does the team miss', en: 'no helping verb: add does, and miss goes back to its base form', th: 'ไม่มีกริยาช่วย เติม does แล้ว miss กลับเป็นรูปเดิม' },
        { w: 'we have met → Rarely have we met', en: 'have is already there: move it to the front', th: 'มี have อยู่แล้ว ย้าย have มาไว้หน้า' },
        { w: 'it was popular → So popular was it', en: 'an adjective follows: use be, never do', th: 'ข้างหลังเป็นคำคุณศัพท์ ใช้ be ห้ามใช้ do' }
      ],
      mistake: {
        wrong: 'Seldom did we received so many applications.',
        right: 'Seldom did we receive so many applications.',
        why: {
          en: 'Did already shows the past, so the main verb goes back to its base form: did … receive, not did … received.',
          th: 'did บอกว่าเป็นอดีตไปแล้ว กริยาหลักจึงกลับเป็นรูปเดิม: did … receive ไม่ใช่ did … received'
        }
      }
    },
    {
      id: 'negative-adverb-inversion',
      name: { en: 'Negative word first', th: 'ขึ้นต้นด้วยคำปฏิเสธ (never / rarely / seldom first)' },
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
      clues: [
        { w: 'rarely + have + S + V3', en: 'we have received → Rarely have we received', th: 'we have received → Rarely have we received (ย้าย have มาไว้หน้า)' },
        { w: 'seldom + does + S + V1', en: 'the board approves → Seldom does the board approve', th: 'the board approves → Seldom does the board approve (เติม does กริยากลับเป็นรูปเดิม)' },
        { w: 'little', en: 'not at all (Little did we know)', th: 'แทบไม่… เลย (Little did we know = เราไม่รู้เลยว่า)' },
        { w: 'under no circumstances', en: 'never, in any situation', th: 'ไม่ว่ากรณีใด ๆ ก็ห้าม / ก็ไม่' }
      ],
      mistake: {
        wrong: 'Rarely we have seen such strong sales.',
        right: 'Rarely have we seen such strong sales.',
        why: {
          en: 'Thai keeps the same order (เราแทบไม่เคยเห็น…), but in English a negative word at the front moves the helping verb before the subject.',
          th: 'ภาษาไทยเรียงคำแบบเดิม (เราแทบไม่เคยเห็น…) แต่ภาษาอังกฤษ ถ้าคำปฏิเสธขึ้นต้นประโยค ต้องย้ายกริยาช่วยมาไว้หน้าประธาน'
        }
      }
    },
    {
      id: 'not-only-inversion',
      name: { en: 'Not only … but also', th: 'ไม่เพียงแต่… แต่ยัง… ขึ้นต้นประโยค (not only … but also)' },
      formula: ['not only + aux + S + V, but + S + also + V'],
      words: [{ w: 'not only … but', en: 'not just this, but also that', th: 'ไม่เพียงแต่… แต่ยัง…' }],
      use: {
        en: 'If not only starts the sentence, swap only the first part. The part after but stays normal.',
        th: 'ขึ้นต้นด้วย not only ให้สลับเฉพาะส่วนแรก ส่วนหลัง but เป็นประโยคปกติ'
      },
      example: {
        en: 'Not only {{does}} the plan save money, but it also saves time.',
        th: 'แผนนี้ไม่เพียงแต่ช่วยประหยัดเงิน แต่ยังประหยัดเวลาด้วย'
      },
      clues: [
        { w: 'not only + is + S + faster', en: 'an adjective follows (faster): is the printer, not does the printer', th: 'ข้างหลังเป็นคำคุณศัพท์ (faster) ใช้ is the printer ไม่ใช่ does the printer' }
      ],
      mistake: {
        wrong: 'Not only the plan saves money, but it also saves time.',
        right: 'Not only does the plan save money, but it also saves time.',
        why: {
          en: 'Thai keeps normal order after ไม่เพียงแต่, but in English not only at the front swaps the first part: does the plan save.',
          th: 'ภาษาไทยเรียงคำปกติหลัง "ไม่เพียงแต่" แต่ภาษาอังกฤษ ถ้า not only ขึ้นต้นประโยค ส่วนแรกต้องสลับเป็น does the plan save'
        }
      }
    },
    {
      id: 'only-inversion',
      name: { en: 'Only after / only when / not until', th: 'หลังจาก… เท่านั้น ถึงจะ… (only after / only when / not until)' },
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
      },
      clues: [
        { w: 'only after + Clause + aux + S', en: 'the swap is in the main part: will employees be', th: 'สลับในส่วนหลัก: will employees be' }
      ],
      mistake: {
        wrong: 'Only when the payment clears we will ship the order.',
        right: 'Only when the payment clears will we ship the order.',
        why: {
          en: 'Thai says เราจะส่ง… in normal order, but after an only part at the front, English swaps the main part: will we ship.',
          th: 'ภาษาไทยพูด "เราจะส่ง…" ตามปกติ แต่ภาษาอังกฤษ ถ้าส่วนที่มี only ขึ้นต้นประโยค ส่วนหลักต้องสลับเป็น will we ship'
        }
      }
    },
    {
      id: 'so-such-inversion',
      name: { en: 'So + adjective / such first', th: 'มาก… จน… ขึ้นต้นประโยค (so + adjective / such first)' },
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
      clues: [
        { w: 'so + adjective + ___ + the …', en: 'the blank is be (was, is), then the subject', th: 'ช่องว่างเป็น be (was, is) แล้วตามด้วยประธาน' },
        { w: '… that + result', en: 'that tells what happened because of it', th: 'that บอกผลที่ตามมา' }
      ],
      mistake: {
        wrong: 'So popular the workshop was that a second session was added.',
        right: 'So popular was the workshop that a second session was added.',
        why: {
          en: 'Thai keeps normal order, but with so + adjective at the front, English puts was before the subject.',
          th: 'ภาษาไทยเรียงคำปกติ แต่ภาษาอังกฤษ ถ้า so + คำคุณศัพท์ ขึ้นต้นประโยค ต้องวาง was ไว้หน้าประธาน'
        }
      }
    },
    {
      id: 'conditional-inversion',
      name: { en: 'If-clause without if', th: 'ตัด if แล้วสลับที่ (should / had / were first)' },
      formula: ['should + S + V1, S + will + V1', 'had + S + V3, S + would have + V3', 'were + S + to V1, S + would + V1'],
      words: [
        { w: 'should', en: 'if (it happens)', th: 'ถ้า… (= if + S + V)' },
        { w: 'had', en: 'if (in the past, but it did not happen)', th: 'ถ้า… (เรื่องอดีตที่ไม่ได้เกิดจริง = if + had V3)' },
        { w: 'were', en: 'if (imagined)', th: 'ถ้า… (สมมติ = if + V2)' }
      ],
      use: {
        en: 'Drop if and move should, had or were to the front. "Should you have…" is very common in emails. Only were can take to + V1.',
        th: 'ตัด if ออก แล้วย้าย should, had, were มาไว้หน้าสุด ในอีเมลเจอ "Should you have…" บ่อยมาก และมีแค่ were ที่ตามด้วย to + กริยารูปเดิมได้'
      },
      example: {
        en: '{{Should}} you need any help, please call the front desk.',
        th: 'หากต้องการความช่วยเหลือ กรุณาโทรหาแผนกต้อนรับ'
      },
      clues: [
        { w: 'Should you have any questions', en: 'If you have any questions', th: 'หากคุณมีคำถาม' },
        { w: 'Should you need assistance', en: 'If you need help', th: 'หากคุณต้องการความช่วยเหลือ' },
        { w: 'Had + S + been + V3', en: 'If … had been … (would have in the other part)', th: 'ถ้า… had been… (อีกส่วนมี would have)' },
        { w: 'Were + S + to V1', en: 'If … (imagined): Were the company to relocate', th: 'ถ้า… (สมมติ): Were the company to relocate' }
      ],
      mistake: {
        wrong: 'If had we known about the delay, we would have called.',
        right: 'Had we known about the delay, we would have called.',
        why: {
          en: 'Had at the front already means if, so do not use both. Write If we had known, or Had we known.',
          th: 'Had ที่ขึ้นต้นประโยคแปลว่า "ถ้า" อยู่แล้ว ห้ามใช้คู่กับ if ให้เลือกเขียน If we had known หรือ Had we known อย่างใดอย่างหนึ่ง'
        }
      }
    },
    {
      id: 'no-sooner-than',
      name: { en: 'No sooner … than / hardly … when', th: 'ทันทีที่… ก็… (no sooner … than / hardly … when)' },
      formula: ['no sooner + had + S + V3 + than + S + V2', 'hardly + had + S + V3 + when + S + V2'],
      words: [
        { w: 'no sooner … than', en: 'as soon as … then', th: 'ทันทีที่… ก็…' },
        { w: 'hardly … when', en: 'as soon as … then', th: 'เพิ่งจะ… ก็…' }
      ],
      use: {
        en: 'As soon as A happened, B happened. Both are past, so use had, not has. Remember the pairs: no sooner … than, hardly … when.',
        th: 'ทันทีที่ A เกิด B ก็เกิด เป็นเรื่องในอดีตจึงใช้ had ไม่ใช่ has และจำคู่ให้แม่น: no sooner … than, hardly … when'
      },
      example: {
        en: 'No sooner {{had}} the store opened than customers rushed in.',
        th: 'ร้านเพิ่งเปิดได้ไม่ทันไร ลูกค้าก็กรูกันเข้ามา'
      },
      clues: [
        { w: 'no sooner had … than', en: 'past events: had, not has', th: 'เรื่องในอดีต ใช้ had ไม่ใช่ has' }
      ],
      mistake: {
        wrong: 'No sooner had the store opened when customers rushed in.',
        right: 'No sooner had the store opened than customers rushed in.',
        why: {
          en: 'Thai uses one pattern, ทันทีที่… ก็…, but English has fixed pairs: no sooner goes with than, hardly goes with when.',
          th: 'ภาษาไทยใช้ "ทันทีที่… ก็…" แบบเดียว แต่ภาษาอังกฤษมีคู่ตายตัว: no sooner คู่กับ than / hardly คู่กับ when'
        }
      }
    },
    {
      id: 'enclosed-attached-inversion',
      name: { en: 'Attached / Enclosed first (emails)', th: 'ที่แนบมา… ขึ้นต้นประโยค (attached / enclosed first)' },
      formula: ['attached/enclosed/included + is + N', 'attached/enclosed/included + are + N(s)'],
      words: [
        { w: 'attached', en: 'sent with this email', th: 'ที่แนบมา (ในอีเมล)' },
        { w: 'enclosed', en: 'sent in this envelope', th: 'ที่แนบมา (ในซองจดหมาย)' },
        { w: 'included', en: 'part of this package', th: 'ที่รวมมาด้วย' }
      ],
      use: {
        en: 'Emails often move attached or enclosed to the front. The real subject comes after is/are, so pick is or are from the noun after the blank.',
        th: 'ในอีเมลมักย้าย attached, enclosed มาไว้หน้า ประธานจริงอยู่ "หลัง" is / are จึงต้องดูคำนามหลังช่องว่าง: ชิ้นเดียวใช้ is / หลายชิ้นใช้ are'
      },
      example: {
        en: 'Attached {{are}} the slides from yesterday’s meeting.',
        th: 'แนบสไลด์จากการประชุมเมื่อวานมาด้วย'
      },
      clues: [
        { w: 'attached + is + the invoice', en: 'one thing after the blank: is', th: 'ข้างหลังเป็นของชิ้นเดียว ใช้ is' },
        { w: 'enclosed + are + N(s)', en: 'more than one after the blank: are (Enclosed are two copies)', th: 'ข้างหลังมีหลายชิ้น ใช้ are (Enclosed are two copies)' }
      ],
      mistake: {
        wrong: 'Attached is the slides from the meeting.',
        right: 'Attached are the slides from the meeting.',
        why: {
          en: 'The real subject (the slides) comes after the verb and is plural, so use are. Thai has no plural form, so this is easy to miss.',
          th: 'ประธานจริง (the slides) อยู่หลังกริยาและมีหลายชิ้น จึงต้องใช้ are ภาษาไทยไม่มีรูปพหูพจน์ จึงมักลืมดู'
        }
      }
    }
  ]
}
