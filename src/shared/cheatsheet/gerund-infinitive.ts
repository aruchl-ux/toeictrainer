import type { CheatSheet } from './types'

export const gerundInfinitive: CheatSheet = {
  topic: 'gerund-infinitive',
  intro: {
    en: 'The choices are one verb in different forms, like open, opening, to open, opened. Look at the word before the blank: some verbs take V-ing, some take to V1, and a verb after a preposition (by, for, look forward to) takes V-ing.',
    th: 'ตัวเลือกเป็นกริยาตัวเดียวกันแต่ต่างรูป เช่น open, opening, to open, opened ให้ดูคำหน้าช่องว่าง กริยาบางตัวตามด้วย V-ing บางตัวตามด้วย to V1 และกริยาที่อยู่หลังคำบุพบท (by, for, look forward to) ต้องเป็น V-ing'
  },
  entries: [
    {
      id: 'verb-plus-gerund',
      name: { en: 'Verb + V-ing', th: 'กริยาที่ตามด้วย -ing (verb + V-ing)' },
      formula: ['enjoy/avoid/consider/suggest/finish + V-ing'],
      use: {
        en: 'These verbs are followed by V-ing, not to V1.',
        th: 'กริยาพวกนี้ตามด้วย V-ing ไม่ใช่ to V1'
      },
      example: {
        en: 'We suggest {{booking}} your tickets early.',
        th: 'เราแนะนำให้จองตั๋วล่วงหน้า'
      },
      clues: [
        { w: 'enjoy + V-ing', en: 'like doing', th: 'สนุกกับการ…' },
        { w: 'avoid + V-ing', en: 'keep away from doing', th: 'หลีกเลี่ยงการ…' },
        { w: 'consider + V-ing', en: 'think about doing', th: 'พิจารณาการ…' },
        { w: 'suggest + V-ing', en: 'say something is a good idea', th: 'แนะนำให้…' },
        { w: 'recommend + V-ing', en: 'say something is a good idea', th: 'แนะนำให้… (ไม่มีคนตามหลัง)' },
        { w: 'finish + V-ing', en: 'stop when done', th: 'ทำ…เสร็จ' },
        { w: 'postpone + V-ing', en: 'move to a later time', th: 'เลื่อนการ…ออกไป' },
        { w: 'mind + V-ing', en: 'be unhappy about doing', th: 'รังเกียจ / ไม่สะดวกกับการ…' }
      ],
      mistake: {
        wrong: 'We are considering to open a new store.',
        right: 'We are considering opening a new store.',
        why: {
          en: 'Thai says พิจารณาที่จะ, which sounds like to, but consider takes V-ing.',
          th: 'ภาษาไทยพูดว่า "พิจารณาที่จะ" จึงชอบใส่ to แต่ consider ตามด้วย V-ing'
        }
      }
    },
    {
      id: 'verb-plus-infinitive',
      name: { en: 'Verb + to V1', th: 'กริยาที่ตามด้วย to (verb + to V1)' },
      formula: ['plan/decide/agree/hope/expect + to V1'],
      use: {
        en: 'These verbs, mostly about plans or wishes, are followed by to V1.',
        th: 'กริยาพวกนี้ (ส่วนมากเกี่ยวกับแผนหรือความอยาก) ตามด้วย to V1'
      },
      example: {
        en: 'The company plans {{to open}} a new branch in Osaka.',
        th: 'บริษัทวางแผนจะเปิดสาขาใหม่ที่โอซาก้า'
      },
      clues: [
        { w: 'plan + to V1', en: 'intend to', th: 'วางแผนจะ…' },
        { w: 'decide + to V1', en: 'choose to', th: 'ตัดสินใจจะ…' },
        { w: 'agree + to V1', en: 'say yes to doing', th: 'ตกลง / ยอมที่จะ…' },
        { w: 'hope + to V1', en: 'want and expect to', th: 'หวังว่าจะ…' },
        { w: 'expect + to V1', en: 'think you will', th: 'คาดว่าจะ…' },
        { w: 'intend + to V1', en: 'mean to', th: 'ตั้งใจจะ…' },
        { w: 'offer + to V1', en: 'say you will do it for someone', th: 'เสนอที่จะ…' },
        { w: 'refuse + to V1', en: 'say no to doing', th: 'ปฏิเสธที่จะ…' },
        { w: 'hesitate + to V1', en: 'wait because you are unsure', th: 'ลังเลที่จะ… (do not hesitate to = อย่าลังเลที่จะ)' },
        { w: 'be sure + to V1', en: 'do not forget to (sure is an adjective, not a verb)', th: 'อย่าลืม… (be sure เป็นวลี ไม่ใช่กริยาเดี่ยว)' }
      ],
      mistake: {
        wrong: 'We decided open a new branch.',
        right: 'We decided to open a new branch.',
        why: {
          en: 'Thai puts two verbs side by side (ตัดสินใจเปิด), but decide needs to before the next verb.',
          th: 'ภาษาไทยวางกริยาติดกันได้ (ตัดสินใจเปิด) แต่หลัง decide ต้องมี to ก่อนกริยาตัวถัดไป'
        }
      }
    },
    {
      id: 'preposition-plus-gerund',
      name: { en: 'Preposition + V-ing', th: 'คำบุพบทตามด้วย -ing (preposition + V-ing)' },
      formula: ['Prep + V-ing', 'look forward to/be committed to + V-ing'],
      use: {
        en: 'When a verb comes after a preposition (by, for, about, without), it takes V-ing. Careful: in look forward to, object to and be used to, to is a preposition, so V-ing follows.',
        th: 'ถ้ากริยาอยู่หลังคำบุพบท (by, for, about, without) ต้องเป็น V-ing ระวัง! look forward to, object to, be used to ตัว to เป็นคำบุพบท จึงตามด้วย V-ing'
      },
      example: {
        en: 'We look forward to {{meeting}} you next week.',
        th: 'เราตั้งตารอที่จะได้พบคุณสัปดาห์หน้า'
      },
      clues: [
        { w: 'look forward to + V-ing', en: 'wait happily for', th: 'ตั้งตารอ (การ…)' },
        { w: 'object to + V-ing', en: 'say you are against', th: 'คัดค้านการ…' },
        { w: 'be used to + V-ing', en: 'be accustomed to', th: 'คุ้นเคยกับการ…' },
        { w: 'be committed to', en: 'promise to keep doing', th: 'มุ่งมั่นกับการ…' },
        { w: 'be dedicated to', en: 'give a lot of effort to', th: 'ทุ่มเทให้กับการ…' },
        { w: 'by + V-ing', en: 'the way you do it', th: 'โดยการ…' },
        { w: 'in addition to', en: 'as well as', th: 'นอกจาก…แล้ว' }
      ],
      mistake: {
        wrong: 'We look forward to meet you.',
        right: 'We look forward to meeting you.',
        why: {
          en: 'The to in look forward to is a preposition, not part of to V1, so V-ing follows.',
          th: 'to ใน look forward to เป็นคำบุพบท ไม่ใช่ to V1 จึงต้องตามด้วย V-ing'
        }
      }
    },
    {
      id: 'verb-object-infinitive',
      name: { en: 'Verb + object + to V1', th: 'กริยา + คน + to (verb + object + to V1)' },
      formula: ['ask/allow/encourage/require + Obj + to V1'],
      use: {
        en: 'Verb + person + to V1, as in "ask him to come".',
        th: 'กริยา + คน + to V1 เช่น ask him to come'
      },
      example: {
        en: 'The policy allows employees {{to work}} from home.',
        th: 'นโยบายนี้อนุญาตให้พนักงานทำงานจากที่บ้านได้'
      },
      clues: [
        { w: 'ask', en: 'request', th: 'ขอให้ (ใคร) …' },
        { w: 'allow', en: 'let', th: 'อนุญาตให้ (ใคร) …' },
        { w: 'encourage', en: 'give hope or support to', th: 'สนับสนุน / ส่งเสริมให้ (ใคร) …' },
        { w: 'require', en: 'make it a rule for', th: 'กำหนดให้ (ใคร) ต้อง…' },
        { w: 'remind', en: 'help remember', th: 'เตือนให้ (ใคร) …' },
        { w: 'invite', en: 'ask politely to come', th: 'เชิญให้ (ใคร) …' },
        { w: 'advise', en: 'say what is best', th: 'แนะนำให้ (ใคร) …' }
      ],
      mistake: {
        wrong: 'The policy allows employees work from home.',
        right: 'The policy allows employees to work from home.',
        why: {
          en: 'Thai says อนุญาตให้พนักงานทำงาน with no extra word, but English needs to after the person.',
          th: 'ภาษาไทยพูด "อนุญาตให้พนักงานทำงาน" ได้เลย แต่ภาษาอังกฤษต้องมี to หลังคน'
        }
      }
    },
    {
      id: 'causative-bare-infinitive',
      name: { en: 'Make / let / have + object + V1', th: 'ให้ใครทำอะไร ไม่มี to (make / let / have + object + V1)' },
      formula: ['make/let/have + Obj + V1'],
      use: {
        en: 'make, let or have + person + base verb, with no to.',
        th: 'make, let, have + คน + กริยารูปเดิม (ไม่มี to)'
      },
      example: {
        en: 'The manager let the staff {{leave}} early on Friday.',
        th: 'ผู้จัดการให้พนักงานกลับบ้านเร็วในวันศุกร์'
      },
      clues: [
        { w: 'make', en: 'force', th: 'บังคับให้ (ใคร) …' },
        { w: 'let', en: 'allow', th: 'ปล่อยให้ / อนุญาตให้ (ใคร) …' },
        { w: 'have', en: 'ask someone to do a job', th: 'ให้ (ใคร) ทำ… (สั่งงาน)' }
      ],
      mistake: {
        wrong: 'The manager let the staff to leave early.',
        right: 'The manager let the staff leave early.',
        why: {
          en: 'Allow takes to, but let does not.',
          th: 'allow ต้องมี to แต่ let ไม่มี to ใช้กริยารูปเดิมเลย'
        }
      }
    },
    {
      id: 'infinitive-of-purpose',
      name: { en: 'To V1 for purpose', th: 'เพื่อที่จะ (to V1 / in order to V1)' },
      formula: ['to V1/in order to V1 + Obj', 'S + V + Obj + in order to V1'],
      use: {
        en: 'To V1 or in order to V1 gives the reason: "so that you can". A noun like time can also take to V1 (time to attend).',
        th: 'to V1 หรือ in order to V1 = เพื่อจะ… คำนามบางคำ เช่น time ก็ตามด้วย to V1 ได้ (time to attend = เวลาที่จะไปร่วม)'
      },
      example: {
        en: '{{To apply}}, please fill out the online form.',
        th: 'หากต้องการสมัคร กรุณากรอกแบบฟอร์มออนไลน์'
      },
      clues: [
        { w: 'in order to', en: 'so that you can', th: 'เพื่อที่จะ' },
        { w: 'so as to', en: 'so that you can', th: 'เพื่อที่จะ' },
        { w: 'time + to V1', en: 'time for doing something', th: 'เวลาที่จะ… / เวลาสำหรับ…' }
      ],
      mistake: {
        wrong: 'We hired more staff for handle complaints.',
        right: 'We hired more staff to handle complaints.',
        why: {
          en: 'Thai เพื่อ is often turned into for, but for + a base verb is wrong. Use to + V1.',
          th: 'คนไทยมักแปล "เพื่อ" เป็น for แต่ for + กริยารูปเดิมผิด ให้ใช้ to + กริยารูปเดิม'
        }
      }
    }
  ]
}
