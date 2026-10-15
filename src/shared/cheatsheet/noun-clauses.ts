import type { CheatSheet } from './types'

export const nounClauses: CheatSheet = {
  topic: 'noun-clauses',
  intro: {
    en: 'The choices are words like that, what, whether, if, where, how. The blank starts a clause (subject + verb) used as a noun, often after a verb like confirm, decide or tell. Look after the blank first: a full clause (that), a clause missing a noun (what), a yes/no question (whether / if), or a place, time or way (where / when / how)?',
    th: 'ตัวเลือกเป็นคำอย่าง that, what, whether, if, where, how ช่องว่างเป็นจุดเริ่มของประโยคย่อย (ประธาน + กริยา) ที่ทำหน้าที่เป็นคำนาม มักอยู่หลังกริยาอย่าง confirm, decide, tell ให้ดูข้างหลังช่องว่างก่อน: เป็นประโยคครบ (that) ขาดคำนาม (what) เป็นคำถามใช่หรือไม่ (whether / if) หรือถามที่ไหน เมื่อไร อย่างไร (where / when / how)'
  },
  entries: [
    {
      id: 'that-clause',
      name: { en: 'That + complete clause', th: 'ว่า… + ประโยคครบ (that + clause)' },
      formula: ['S + V + that + S + V'],
      words: [{ w: 'that', en: 'introduces a fact; adds no meaning', th: 'ว่า (นำข้อเท็จจริง ไม่มีความหมายเพิ่ม)' }],
      use: {
        en: 'That joins a complete clause after verbs like announce, confirm and ensure. Nothing is missing in the clause after that.',
        th: 'that เชื่อมประโยคครบหลังกริยาอย่าง announce, confirm, ensure ประโยคหลัง that ต้องครบ ไม่ขาดอะไร'
      },
      example: {
        en: 'The manager confirmed {{that}} the shipment had arrived.',
        th: 'ผู้จัดการยืนยันว่าสินค้ามาถึงแล้ว'
      },
      clues: [
        { w: 'announce that', en: 'say officially that', th: 'ประกาศว่า' },
        { w: 'confirm that', en: 'say for sure that', th: 'ยืนยันว่า' },
        { w: 'ensure that', en: 'make sure that', th: 'ทำให้แน่ใจว่า' },
        { w: 'tell + person + that', en: 'tell us that (but say that, or say to us that)', th: 'บอก (ใคร) ว่า… (tell us that แต่ say ต้องเป็น say that หรือ say to us that)' }
      ],
      mistake: {
        wrong: 'The manager said us that the shipment had arrived.',
        right: 'The manager told us that the shipment had arrived.',
        why: {
          en: 'Thai says บอกเราว่า, so learners write said us. A person cannot come straight after say: use told us that, or said that.',
          th: 'ภาษาไทยพูด "บอกเราว่า…" จึงชอบเขียน said us แต่หลัง say ใส่คนตามทันทีไม่ได้ ให้ใช้ told us that หรือ said that'
        }
      }
    },
    {
      id: 'what-noun-clause',
      name: { en: 'What = the thing that', th: 'สิ่งที่ (what)' },
      formula: ['V + what + S + V'],
      words: [{ w: 'what', en: 'the thing that', th: 'สิ่งที่' }],
      use: {
        en: 'Use what when the clause after it is missing a noun (an object or a subject). What already means "the thing that".',
        th: 'ใช้ what เมื่อประโยคที่ตามมาขาดคำนาม (ขาดกรรมหรือประธาน) เพราะ what แปลว่า "สิ่งที่" อยู่แล้ว'
      },
      example: {
        en: 'Please tell us {{what}} you need for the event.',
        th: 'กรุณาบอกเราว่าคุณต้องการอะไรสำหรับงานนี้'
      },
      clues: [
        { w: 'clause missing an object → what', en: 'you need ___ (need what?): what', th: 'ประโยคขาดกรรม (you need อะไร?) ใช้ what' },
        { w: 'complete clause → that', en: 'nothing is missing: that', th: 'ประโยคครบ ไม่ขาดอะไร ใช้ that' }
      ],
      mistake: {
        wrong: 'Please tell us that you need for the event.',
        right: 'Please tell us what you need for the event.',
        why: {
          en: 'Thai บอกเราว่า makes learners pick that, but need has no object here (need what?). What fills that gap: the thing that.',
          th: 'ภาษาไทยพูด "บอกเราว่า…" จึงชอบเลือก that แต่หลัง need ไม่มีกรรม (ต้องการอะไร?) ต้องใช้ what = สิ่งที่'
        }
      }
    },
    {
      id: 'whether-if',
      name: { en: 'Whether / if = whether or not', th: 'ว่า…หรือไม่ (whether / if)' },
      formula: ['V + whether/if + S + V', 'whether + to V'],
      words: [
        { w: 'whether', en: 'if or not', th: 'ว่า…หรือไม่' },
        { w: 'if', en: 'whether; but it cannot start the sentence as its subject or come before to V', th: 'ว่า…หรือไม่ (แต่ขึ้นต้นประโยคเป็นประธานไม่ได้ และตามด้วย to V ไม่ได้)' }
      ],
      use: {
        en: 'Use whether or if for a yes/no question inside a sentence. Only whether works at the start of a sentence, before to V, or with or not right after it.',
        th: 'ใช้ whether หรือ if กับคำถามแบบใช่หรือไม่ที่อยู่ในประโยค แต่ถ้าขึ้นต้นประโยค ตามด้วย to V หรือมี or not ต่อท้ายทันที ใช้ได้แค่ whether'
      },
      example: {
        en: 'The board has not decided {{whether}} to open a new branch.',
        th: 'คณะกรรมการยังไม่ได้ตัดสินใจว่าจะเปิดสาขาใหม่หรือไม่'
      },
      clues: [
        { w: 'decide whether', en: 'choose yes or no', th: 'ตัดสินใจว่า…หรือไม่' },
        { w: 'wonder whether/if', en: 'want to know if or not', th: 'สงสัยว่า…หรือไม่' },
        { w: 'ask whether/if', en: 'ask a yes/no question', th: 'ถามว่า…หรือไม่' },
        { w: 'whether or not', en: 'yes or no; write whether or not, not if or not', th: 'ว่า…หรือไม่ (เขียน whether or not ไม่ใช้ if or not)' }
      ],
      mistake: {
        wrong: 'The board has not decided that it will open a new branch or not.',
        right: 'The board has not decided whether it will open a new branch or not.',
        why: {
          en: 'Thai ว่า…หรือไม่ starts with ว่า, so learners write that. For a yes/no question, use whether (or if), not that.',
          th: 'ภาษาไทย "ว่า…หรือไม่" ขึ้นต้นด้วย "ว่า" จึงชอบใช้ that แต่ถ้าเป็นคำถามใช่หรือไม่ ต้องใช้ whether (หรือ if) ไม่ใช่ that'
        }
      }
    },
    {
      id: 'wh-word-order',
      name: { en: 'Wh-word + S + V (statement order)', th: 'คำถามที่อยู่ในประโยค เรียงแบบบอกเล่า (wh-word + S + V)' },
      formula: ['V + where/when/how + S + V'],
      words: [
        { w: 'where', en: 'the place', th: 'ที่ไหน' },
        { w: 'when', en: 'the time', th: 'เมื่อไร' },
        { w: 'how', en: 'the way', th: 'อย่างไร' }
      ],
      use: {
        en: 'Inside a sentence, a wh-question uses normal order: subject before verb. Write where the meeting is, not where is the meeting.',
        th: 'เมื่อคำถาม where / when / how อยู่ในประโยค ให้เรียงแบบประโยคบอกเล่า ประธานมาก่อนกริยา เช่น where the meeting is ไม่ใช่ where is the meeting'
      },
      example: {
        en: 'Could you tell me {{where}} the training will be held?',
        th: 'ช่วยบอกได้ไหมว่าการอบรมจะจัดที่ไหน'
      },
      clues: [
        { w: 'tell me where/when/how', en: 'tell me + a question in statement order', th: 'บอกฉันว่า… + ประธาน + กริยา' },
        { w: 'know where/when/how', en: 'know + a question in statement order', th: 'รู้ว่า… + ประธาน + กริยา' },
        { w: 'explain how', en: 'say the way something is done', th: 'อธิบายว่า…อย่างไร' }
      ],
      mistake: {
        wrong: 'Could you tell me where will the training be held?',
        right: 'Could you tell me where the training will be held?',
        why: {
          en: 'A question on its own swaps the verb (where will it be held?), but inside a sentence the order goes back to subject + verb.',
          th: 'คำถามเดี่ยว ๆ จะสลับกริยาไว้หน้า (where will it be held?) แต่เมื่ออยู่ในประโยคอื่น ต้องเรียงกลับเป็นประธาน + กริยา'
        }
      }
    }
  ]
}
