import type { CheatSheet } from './types'

export const gerundInfinitive: CheatSheet = {
  topic: 'gerund-infinitive',
  intro: {
    en: 'The word before the blank decides the form: some verbs take V-ing, some take to V1, and every preposition takes V-ing.',
    th: 'คำหน้าช่องว่างเป็นตัวกำหนดรูป กริยาบางตัวตามด้วย V-ing บางตัวตามด้วย to V1 และคำบุพบททุกตัวตามด้วย V-ing'
  },
  entries: [
    {
      id: 'verb-plus-gerund',
      name: { en: 'Verb + V-ing', th: 'กริยา + V-ing' },
      formula: ['enjoy/avoid/consider/suggest/finish + V-ing'],
      use: {
        en: 'These verbs are followed by V-ing, never by to V1.',
        th: 'กริยากลุ่มนี้ตามด้วย V-ing เท่านั้น ห้ามใช้ to V1'
      },
      example: {
        en: 'We suggest {{booking}} your tickets early.',
        th: 'เราแนะนำให้จองตั๋วล่วงหน้า'
      },
      clues: ['enjoy', 'avoid', 'consider', 'suggest', 'recommend', 'finish', 'postpone', 'mind']
    },
    {
      id: 'verb-plus-infinitive',
      name: { en: 'Verb + to V1', th: 'กริยา + to V1' },
      formula: ['plan/decide/agree/hope/expect + to V1'],
      use: {
        en: 'These verbs, mostly about future plans or wishes, are followed by to V1.',
        th: 'กริยากลุ่มนี้ส่วนใหญ่เกี่ยวกับแผนหรือความต้องการในอนาคต ตามด้วย to V1'
      },
      example: {
        en: 'The company plans {{to open}} a new branch in Osaka.',
        th: 'บริษัทวางแผนจะเปิดสาขาใหม่ที่โอซาก้า'
      },
      clues: ['plan', 'decide', 'agree', 'hope', 'expect', 'intend', 'aim', 'offer', 'refuse']
    },
    {
      id: 'preposition-plus-gerund',
      name: { en: 'Preposition + V-ing', th: 'คำบุพบท + V-ing' },
      formula: ['Prep + V-ing', 'look forward to/be committed to + V-ing'],
      use: {
        en: 'After any preposition use V-ing. Watch for phrases where to is a preposition, not part of an infinitive.',
        th: 'หลังคำบุพบททุกตัวใช้ V-ing ระวังวลีที่ to เป็นคำบุพบท ไม่ใช่ to ของ infinitive'
      },
      example: {
        en: 'We look forward to {{meeting}} you next week.',
        th: 'เราตั้งตารอที่จะได้พบคุณสัปดาห์หน้า'
      },
      clues: ['look forward to', 'be committed to', 'be dedicated to', 'be used to', 'in addition to']
    },
    {
      id: 'verb-object-infinitive',
      name: { en: 'Verb + object + to V1', th: 'กริยา + กรรม + to V1' },
      formula: ['ask/allow/encourage/require + Obj + to V1'],
      use: {
        en: 'These verbs take a person as object, then to V1. In the passive: be + V3 + to V1.',
        th: 'กริยากลุ่มนี้ตามด้วยกรรม (คน) แล้วตามด้วย to V1 ถ้าเป็น passive จะเป็น be + V3 + to V1'
      },
      example: {
        en: 'The policy allows employees {{to work}} from home.',
        th: 'นโยบายนี้อนุญาตให้พนักงานทำงานจากที่บ้านได้'
      },
      clues: ['ask', 'allow', 'encourage', 'require', 'remind', 'invite', 'advise']
    },
    {
      id: 'causative-bare-infinitive',
      name: { en: 'Make / let / have + object + V1', th: 'Make / let / have + กรรม + V1' },
      formula: ['make/let/have + Obj + V1'],
      use: {
        en: 'After make, let and have (meaning to cause), the verb is the base form with no to.',
        th: 'หลัง make, let และ have (ในความหมายให้ทำ) กริยาเป็นรูปเดิม ไม่มี to'
      },
      example: {
        en: 'The manager let the staff {{leave}} early on Friday.',
        th: 'ผู้จัดการให้พนักงานกลับบ้านเร็วในวันศุกร์'
      }
    },
    {
      id: 'infinitive-of-purpose',
      name: { en: 'To V1 for purpose', th: 'To V1 บอกจุดประสงค์' },
      formula: ['to V1/in order to V1 + Obj', 'S + V + Obj + in order to V1'],
      use: {
        en: 'To V1 or in order to V1 gives the reason someone does something.',
        th: 'to V1 หรือ in order to V1 บอกเหตุผลหรือจุดประสงค์ของการกระทำ'
      },
      example: {
        en: '{{To apply}}, please fill out the online form.',
        th: 'หากต้องการสมัคร กรุณากรอกแบบฟอร์มออนไลน์'
      },
      clues: ['in order to', 'so as to']
    }
  ]
}
