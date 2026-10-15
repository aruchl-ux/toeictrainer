import type { CheatSheet } from './types'

export const reducedClauses: CheatSheet = {
  topic: 'reduced-clauses',
  intro: {
    en: 'The choices are one verb in different forms, like receive, receiving, received, was received. First check if the sentence already has its main verb. If it does, the blank is a short form. Then ask: does the noun (or the subject) do the action (-ing), or is it done to it (past participle)?',
    th: 'ตัวเลือกเป็นกริยาตัวเดียวกันแต่ต่างรูป เช่น receive, receiving, received, was received ให้ดูก่อนว่าประโยคมีกริยาหลักแล้วหรือยัง ถ้ามีแล้ว ช่องว่างเป็นกริยาแบบย่อ แล้วถามว่าคำนาม (หรือประธาน) เป็นคนทำเอง (กริยาเติม -ing) หรือถูกทำ (กริยาช่อง 3)'
  },
  entries: [
    {
      id: 'reduced-active',
      name: { en: 'Noun + V-ing (active)', th: 'คำนามที่เป็นคนทำ (noun + V-ing)' },
      formula: ['N + V-ing + Obj'],
      use: {
        en: 'Noun + V-ing means the noun does the action. It is short for who/which + verb: employees wishing to attend = employees who wish to attend.',
        th: 'คำนาม + กริยาเติม -ing = คำนามนั้นทำเอง ย่อมาจาก who / which + กริยา เช่น employees wishing to attend = employees who wish to attend'
      },
      example: {
        en: 'Passengers {{traveling}} with pets must notify the airline.',
        th: 'ผู้โดยสารที่เดินทางพร้อมสัตว์เลี้ยงต้องแจ้งสายการบิน'
      },
      clues: [
        { w: 'noun + ___ + object', en: 'an object follows, so the noun does it: -ing', th: 'มีกรรมตามหลัง คำนามเป็นคนทำ ใช้กริยาเติม -ing' },
        { w: 'employees wishing to …', en: 'employees who wish to …', th: 'พนักงานที่ต้องการ…' }
      ],
      mistake: {
        wrong: 'Employees wish to attend the training should register by Thursday.',
        right: 'Employees wishing to attend the training should register by Thursday.',
        why: {
          en: 'The sentence already has its main verb (should register), so wish cannot be a second main verb. Use the -ing form (wishing) or who + verb (who wish).',
          th: 'ประโยคนี้มีกริยาหลักแล้ว (should register) จึงใส่ wish เป็นกริยาหลักอีกตัวไม่ได้ ต้องใช้กริยาเติม -ing (wishing) หรือ who + กริยา (who wish)'
        }
      }
    },
    {
      id: 'reduced-passive',
      name: { en: 'Noun + V3 (passive)', th: 'คำนามที่ถูกทำ (noun + V3)' },
      formula: ['N + V3 + Prep + N'],
      use: {
        en: 'Noun + V3 means the action is done to the noun. It is short for who/which/that + is/was + V3. Usually no object follows.',
        th: 'คำนาม + กริยาช่อง 3 = คำนามนั้นถูกทำ ย่อมาจาก who / which / that + is / was + กริยาช่อง 3 ข้างหลังมักไม่มีกรรม'
      },
      example: {
        en: 'The report {{submitted}} yesterday contained several errors.',
        th: 'รายงานที่ส่งมาเมื่อวานมีข้อผิดพลาดหลายจุด'
      },
      clues: [
        { w: 'noun + ___ + by/in/after…', en: 'no object, a preposition follows: the noun has it done to it', th: 'ไม่มีกรรม ตามด้วยคำบุพบท คำนามเป็นสิ่งที่ถูกทำ' },
        { w: 'main verb already there', en: 'the blank is not the main verb: no was / has (the report prepared by … recommends)', th: 'ประโยคมีกริยาหลักแล้ว ช่องว่างจึงไม่ใช้ was / has (the report prepared by … recommends)' }
      ],
      mistake: {
        wrong: 'All orders receive after 3 P.M. will be processed the next day.',
        right: 'All orders received after 3 P.M. will be processed the next day.',
        why: {
          en: 'Thai says คำสั่งซื้อที่ได้รับ with no word for ถูก, but the orders are received by the company, so use the past participle.',
          th: 'ภาษาไทยพูด "คำสั่งซื้อที่ได้รับ" โดยไม่มีคำว่า "ถูก" แต่คำสั่งซื้อถูกบริษัทรับเข้ามา จึงต้องใช้กริยาช่อง 3 (received)'
        }
      }
    },
    {
      id: 'participle-clause-active',
      name: { en: 'Opening V-ing clause', th: 'ขึ้นต้นประโยคด้วยกริยาเติม -ing (opening V-ing clause)' },
      formula: ['V-ing + Obj, S + V', 'having + V3 + Obj, S + V', 'before/after/when/while + V-ing, S + V'],
      use: {
        en: 'Start with V-ing when the subject of the main part does the action. Having + V3 means it was done first. Before, after, when and while can take V-ing with no subject.',
        th: 'ขึ้นต้นด้วยกริยาเติม -ing ได้ ถ้าประธานของประโยคหลักเป็นคนทำ / having + กริยาช่อง 3 = ทำเสร็จก่อน / before, after, when, while ตามด้วยกริยาเติม -ing ได้เลยโดยไม่มีประธาน'
      },
      example: {
        en: '{{Having reviewed}} the proposal, the director approved it.',
        th: 'หลังจากตรวจข้อเสนอแล้ว ผู้อำนวยการก็อนุมัติ'
      },
      clues: [
        { w: 'before + V-ing', en: 'before signing = before you sign', th: 'ก่อน… (before signing = ก่อนที่คุณจะเซ็น)' },
        { w: 'when + V-ing', en: 'when handling = when they handle (the subject does it)', th: 'เมื่อ… (when handling = เมื่อพนักงานจัดการ… ประธานทำเอง)' },
        { w: 'having + V3 + object', en: 'the subject did it first, then the main action', th: 'ประธานทำสิ่งนี้เสร็จก่อน แล้วค่อยทำอีกอย่าง' }
      ],
      mistake: {
        wrong: 'Before sign the contract, please read the terms.',
        right: 'Before signing the contract, please read the terms.',
        why: {
          en: 'Thai ก่อนเซ็นสัญญา uses the verb as it is, but in English before with no subject after it takes -ing.',
          th: 'ภาษาไทยพูด "ก่อนเซ็นสัญญา" ใช้กริยาได้เลย แต่ภาษาอังกฤษ ถ้าหลัง before ไม่มีประธาน กริยาต้องเติม -ing'
        }
      }
    },
    {
      id: 'participle-clause-passive',
      name: { en: 'Opening V3 clause', th: 'ขึ้นต้นประโยคด้วยกริยาช่อง 3 (opening V3 clause)' },
      formula: ['V3 + Prep + N, S + V', 'having been + V3 + Prep + N, S + V', 'once/if/unless/as + V3, S + V'],
      use: {
        en: 'Start with V3 when the subject of the main part has the action done to it. Having been + V3 means it was done to the subject first. Once, if, unless and as can take V3 with no subject.',
        th: 'ขึ้นต้นด้วยกริยาช่อง 3 ได้ ถ้าประธานของประโยคหลักเป็นสิ่งที่ถูกทำ / having been + กริยาช่อง 3 = ถูกทำไปก่อนแล้ว / once, if, unless, as ตามด้วยกริยาช่อง 3 ได้เลยโดยไม่มีประธาน'
      },
      example: {
        en: '{{Designed}} for small offices, the printer is compact and quiet.',
        th: 'เครื่องพิมพ์นี้ออกแบบมาสำหรับสำนักงานขนาดเล็ก จึงกะทัดรัดและเงียบ'
      },
      clues: [
        { w: 'once + V3', en: 'once installed = once it is installed', th: 'เมื่อ (ถูก) …แล้ว (once installed = เมื่อติดตั้งเสร็จแล้ว)' },
        { w: 'as stated', en: 'as it is stated', th: 'ตามที่ระบุไว้' },
        { w: 'as requested', en: 'as it was requested', th: 'ตามที่ขอไว้' },
        { w: 'unless otherwise noted', en: 'unless it is noted differently', th: 'เว้นแต่จะระบุไว้เป็นอย่างอื่น' },
        { w: 'V3 + by …', en: 'by + the doer: the subject had it done to it', th: 'by + ผู้ทำ แปลว่าประธานถูกทำ' }
      ],
      mistake: {
        wrong: 'Founding in 1998, the firm has grown quickly.',
        right: 'Founded in 1998, the firm has grown quickly.',
        why: {
          en: 'Thai ก่อตั้งในปี 1998 has no word for ถูก, but the firm was founded by someone, so start with the past participle.',
          th: 'ภาษาไทยพูด "ก่อตั้งในปี 1998" ไม่มีคำว่า "ถูก" แต่บริษัทถูกก่อตั้งโดยคนอื่น จึงต้องขึ้นต้นด้วยกริยาช่อง 3 (Founded)'
        }
      }
    }
  ]
}
