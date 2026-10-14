import type { CheatSheet } from './types'

export const nounClauses: CheatSheet = {
  topic: 'noun-clauses',
  intro: {
    en: 'A noun clause is a whole clause (S + V) used as a noun: the subject or object of the sentence. It starts with that, what, whether / if or a wh-word.',
    th: 'noun clause คือประโยคย่อย (S + V) ที่ทำหน้าที่เหมือนคำนาม เป็นประธานหรือกรรมของประโยค ขึ้นต้นด้วย that, what, whether / if หรือคำ wh-'
  },
  entries: [
    {
      id: 'that-clause',
      name: { en: 'That + complete clause', th: 'that + ประโยคสมบูรณ์' },
      formula: ['S + V + that + S + V'],
      words: [{ w: 'that', en: 'introduces a fact; adds no meaning', th: 'ว่า (นำข้อเท็จจริง ไม่มีความหมายเพิ่ม)' }],
      use: {
        en: 'That joins a complete clause after verbs like announce, confirm and ensure. Nothing is missing in the clause after that.',
        th: 'that เชื่อมประโยคสมบูรณ์หลังกริยาอย่าง announce, confirm, ensure ประโยคหลัง that ต้องครบ ไม่ขาดอะไร'
      },
      example: {
        en: 'The manager confirmed {{that}} the shipment had arrived.',
        th: 'ผู้จัดการยืนยันว่าสินค้ามาถึงแล้ว'
      },
      clues: ['announce', 'confirm', 'ensure', 'suggest']
    },
    {
      id: 'what-noun-clause',
      name: { en: 'What = the thing that', th: 'what = สิ่งที่' },
      formula: ['V + what + S + V'],
      words: [{ w: 'what', en: 'the thing that', th: 'สิ่งที่' }],
      use: {
        en: 'Use what when the clause after it is missing a noun (an object or a subject). What already means "the thing that".',
        th: 'ใช้ what เมื่อประโยคที่ตามมาขาดคำนาม (ขาดกรรมหรือประธาน) what แปลว่า สิ่งที่ อยู่แล้ว'
      },
      example: {
        en: 'Please tell us {{what}} you need for the event.',
        th: 'กรุณาบอกเราว่าคุณต้องการอะไรสำหรับงานนี้'
      },
      clues: ['clause missing an object → what', 'complete clause → that']
    },
    {
      id: 'whether-if',
      name: { en: 'Whether / if = whether or not', th: 'whether / if = ว่า…หรือไม่' },
      formula: ['V + whether/if + S + V', 'whether + to V'],
      words: [
        { w: 'whether', en: 'if or not', th: 'ว่า…หรือไม่' },
        { w: 'if', en: 'if or not; only right after a verb', th: 'ว่า…หรือไม่ (ใช้หลังกริยาเท่านั้น)' }
      ],
      use: {
        en: 'Use whether or if for a yes/no question inside a sentence. Only whether works at the start of a sentence, before to V, or with or not right after it.',
        th: 'ใช้ whether หรือ if กับคำถามแบบใช่/ไม่ใช่ที่อยู่ในประโยค แต่ถ้าขึ้นต้นประโยค ตามด้วย to V หรือมี or not ต่อท้ายทันที ใช้ได้แค่ whether'
      },
      example: {
        en: 'The board has not decided {{whether}} to open a new branch.',
        th: 'คณะกรรมการยังไม่ได้ตัดสินใจว่าจะเปิดสาขาใหม่หรือไม่'
      },
      clues: ['decide', 'wonder', 'ask', 'or not']
    },
    {
      id: 'wh-word-order',
      name: { en: 'Wh-word + S + V (statement order)', th: 'คำ wh- + S + V (เรียงแบบบอกเล่า)' },
      formula: ['V + where/when/how + S + V'],
      words: [
        { w: 'where', en: 'the place', th: 'ที่ไหน' },
        { w: 'when', en: 'the time', th: 'เมื่อไร' },
        { w: 'how', en: 'the way', th: 'อย่างไร' }
      ],
      use: {
        en: 'Inside a sentence, a wh-question uses normal order: subject before verb. Write where the meeting is, not where is the meeting.',
        th: 'เมื่อคำถาม wh- อยู่ในประโยค ให้เรียงแบบประโยคบอกเล่า ประธานมาก่อนกริยา เช่น where the meeting is ไม่ใช่ where is the meeting'
      },
      example: {
        en: 'Could you tell me {{where}} the training will be held?',
        th: 'ช่วยบอกได้ไหมว่าการอบรมจะจัดที่ไหน'
      },
      clues: ['tell me', 'know', 'ask', 'explain']
    }
  ]
}
