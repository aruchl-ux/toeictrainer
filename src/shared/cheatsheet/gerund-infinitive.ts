import type { CheatSheet } from './types'

export const gerundInfinitive: CheatSheet = {
  topic: 'gerund-infinitive',
  intro: {
    en: 'The word before the blank decides. Some verbs take V-ing, some take to V1, and after a preposition always use V-ing.',
    th: 'คำหน้าช่องว่างเป็นตัวบอก: กริยาบางตัวตามด้วย V-ing บางตัวตามด้วย to V1 และหลังคำบุพบทใช้ V-ing เสมอ'
  },
  entries: [
    {
      id: 'verb-plus-gerund',
      name: { en: 'Verb + V-ing', th: 'กริยา + V-ing' },
      formula: ['enjoy/avoid/consider/suggest/finish + V-ing'],
      use: {
        en: 'These verbs are followed by V-ing only.',
        th: 'กริยาพวกนี้ตามด้วย V-ing เท่านั้น'
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
        en: 'These verbs, mostly about plans or wishes, are followed by to V1.',
        th: 'กริยาพวกนี้ (ส่วนมากเกี่ยวกับแผนหรือความอยาก) ตามด้วย to V1'
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
        en: 'After a preposition, always use V-ing. Careful: in look forward to, to is a preposition, so V-ing follows.',
        th: 'หลังคำบุพบทใช้ V-ing เสมอ ระวัง! look forward to ตัว to เป็นคำบุพบท จึงตามด้วย V-ing'
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
        en: 'Verb + person + to V1, as in "ask him to come".',
        th: 'กริยา + คน + to V1 เช่น ask him to come'
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
        en: 'make, let or have + person + base verb, with no to.',
        th: 'make, let, have + คน + กริยารูปเดิม (ไม่มี to)'
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
        en: 'To V1 or in order to V1 gives the reason: "so that you can".',
        th: 'to V1 หรือ in order to V1 = เพื่อจะ…'
      },
      example: {
        en: '{{To apply}}, please fill out the online form.',
        th: 'หากต้องการสมัคร กรุณากรอกแบบฟอร์มออนไลน์'
      },
      clues: ['in order to', 'so as to']
    }
  ]
}
