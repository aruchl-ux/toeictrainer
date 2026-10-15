import type { CheatSheet } from './types'

export const comparatives: CheatSheet = {
  topic: 'comparatives',
  intro: {
    en: 'The choices are one word in different forms, like high, higher, highest, highly. Find the signal word first: than means -er or more; the … of all or in history means -est or most; as … as means equal.',
    th: 'ตัวเลือกเป็นคำเดียวกันแต่ต่างรูป เช่น high, higher, highest, highly ให้หาคำสัญญาณก่อน: มี than ใช้ขั้นกว่า (-er / more) มี the … of all หรือ in history ใช้ขั้นสูงสุด (-est / most) มี as … as คือเท่ากัน'
  },
  entries: [
    {
      id: 'comparative',
      name: { en: 'Comparative', th: 'ขั้นกว่า (comparative)' },
      formula: ['Adj-er + than', 'more + Adj + than'],
      use: {
        en: 'Comparing two things: short words add -er, long words use more, then than. Use -er or more, not both.',
        th: 'เปรียบเทียบ 2 อย่าง: คำสั้นเติม -er / คำยาวใช้ more แล้วตามด้วย than ใช้ -er หรือ more อย่างใดอย่างหนึ่ง ห้ามใช้ทั้งคู่'
      },
      example: {
        en: 'The new model is {{lighter}} than the old one.',
        th: 'รุ่นใหม่เบากว่ารุ่นเก่า'
      },
      clues: [
        { w: 'than', en: 'used after -er or more', th: 'กว่า' },
        { w: 'than any other + singular noun', en: 'than every other one (so it is the top one)', th: 'กว่า…อื่นใด (ความหมายคือ "ที่สุด" แต่ใช้ขั้นกว่า)' },
        { w: 'superior to / inferior to', en: 'better than / worse than; they take to, not than', th: 'ดีกว่า / แย่กว่า (ใช้ to ไม่ใช่ than)' }
      ],
      mistake: {
        wrong: 'This model is cheap than the old one.',
        right: 'This model is cheaper than the old one.',
        why: {
          en: 'Thai adds only กว่า, but English needs -er (or more) on the word as well as than.',
          th: 'ภาษาไทยเติมแค่ "กว่า" แต่ภาษาอังกฤษต้องเติม -er (หรือใช้ more) และมี than ด้วย'
        }
      }
    },
    {
      id: 'superlative',
      name: { en: 'Superlative', th: 'ขั้นสูงสุด (superlative)' },
      formula: ['the + Adj-est + N', 'the most + Adj + N'],
      use: {
        en: 'The top one in a group of three or more: the + -est for short words, the most for long words.',
        th: 'มากที่สุดในกลุ่ม (สามขึ้นไป): คำสั้นใช้ the + -est / คำยาวใช้ the most'
      },
      example: {
        en: 'This is {{the most popular}} tour we offer.',
        th: 'นี่คือทัวร์ที่ได้รับความนิยมมากที่สุดของเรา'
      },
      clues: [
        { w: 'of all', en: 'among all of them', th: 'ในบรรดาทั้งหมด' },
        { w: 'in the region / in history', en: 'in a whole area or time', th: 'ในภูมิภาค / ในประวัติศาสตร์' },
        { w: 'ever', en: 'at any time until now', th: 'เท่าที่เคยมีมา' },
        { w: 'one of the + N(s)', en: 'one from a group: the noun is plural', th: 'หนึ่งใน… (คำนามเติม s)' }
      ],
      mistake: {
        wrong: 'She is one of the best employee in the team.',
        right: 'She is one of the best employees in the team.',
        why: {
          en: 'One of the means one from a group, so the noun after it is plural. Thai nouns have no plural form, so the -s is easy to forget.',
          th: 'one of the = หนึ่งใน… (กลุ่ม) คำนามข้างหลังต้องเป็นพหูพจน์ เติม s ภาษาไทยไม่มีรูปพหูพจน์ จึงมักลืม'
        }
      }
    },
    {
      id: 'as-as',
      name: { en: 'As … as', th: 'เท่ากัน (as … as)' },
      formula: ['as + Adj + as', 'V + as + Adv + as', 'not as + Adj + as'],
      use: {
        en: 'Equal: as + plain word + as, with no -er. If the word describes an action verb (operates, works), use the adverb, usually the -ly word: as quickly as.',
        th: 'เท่ากัน: as + คำปกติ + as (ไม่เติม -er) ถ้าคำนั้นขยายกริยา (operates, works) ใช้คำกริยาวิเศษณ์ (ส่วนมากลงท้าย -ly) เช่น as quickly as'
      },
      example: {
        en: 'The second quarter was {{as}} profitable as the first.',
        th: 'ไตรมาสที่สองทำกำไรได้เท่ากับไตรมาสแรก'
      },
      clues: [
        { w: 'twice as … as', en: 'two times as much', th: 'มากเป็นสองเท่า' },
        { w: 'the same + N + as', en: 'equal to', th: 'เหมือนกับ / เท่ากับ' },
        { w: 'not as … as', en: 'less than', th: 'ไม่…เท่า' }
      ],
      mistake: {
        wrong: 'The price is as same as last year.',
        right: 'The price is the same as last year.',
        why: {
          en: 'Thai เท่ากับ leads to "as same as". Say the same as, or use as + a word like cheap + as.',
          th: 'คำว่า "เท่ากับ" ทำให้คนไทยชอบพูด as same as ที่ถูกคือ the same as หรือใช้ as + คำอย่าง cheap + as'
        }
      }
    },
    {
      id: 'comparative-intensifiers',
      name: { en: 'Much / far + comparative', th: 'กว่ามาก (much / far + comparative)' },
      formula: ['much/far/even/a lot + Adj-er + than'],
      use: {
        en: 'To say "a lot more", put much, far or even before the comparative. Not very.',
        th: 'อยากเน้นว่า "…กว่ามาก" ให้ใส่ much, far หรือ even หน้าขั้นกว่า ห้ามใช้ very'
      },
      example: {
        en: 'The new office is {{much}} larger than the old one.',
        th: 'สำนักงานใหม่ใหญ่กว่าที่เก่ามาก'
      },
      clues: [
        { w: 'much + comparative', en: 'a lot (much safer, much more detailed)', th: '…กว่ามาก (much safer, much more detailed)' },
        { w: 'far / even / a lot', en: 'also used before a comparative', th: 'ใช้หน้าขั้นกว่าได้เหมือน much' }
      ],
      mistake: {
        wrong: 'The new office is very larger than the old one.',
        right: 'The new office is much larger than the old one.',
        why: {
          en: 'Thai มาก goes with anything, but very cannot go before -er or more. Use much or far.',
          th: 'ภาษาไทยใช้ "มาก" ได้ทุกที่ แต่หน้าขั้นกว่าห้ามใช้ very ให้ใช้ much หรือ far'
        }
      }
    },
    {
      id: 'fewer-less',
      name: { en: 'Fewer vs less', th: 'น้อยกว่า: จำนวนกับปริมาณ (fewer vs less)' },
      formula: ['fewer + N(plural) + than', 'less + N(uncountable) + than', 'less + Adj + than'],
      use: {
        en: 'Fewer is for things you can count (calls, complaints). Less is for things you cannot count (time, money), and less + adjective means "not as … as".',
        th: 'fewer ใช้กับสิ่งที่นับได้ (calls, complaints) ส่วน less ใช้กับสิ่งที่นับไม่ได้ (time, money) และ less + คำคุณศัพท์ = ไม่…เท่า'
      },
      example: {
        en: 'This year we received {{fewer}} complaints than last year.',
        th: 'ปีนี้เราได้รับคำร้องเรียนน้อยกว่าปีที่แล้ว'
      },
      clues: [
        { w: 'fewer + plural noun', en: 'a smaller number of', th: 'จำนวนน้อยกว่า (นับได้)' },
        { w: 'less + uncountable noun', en: 'a smaller amount of', th: 'ปริมาณน้อยกว่า (นับไม่ได้)' },
        { w: 'less + adjective + than', en: 'not as … as', th: 'น้อยกว่า / ไม่…เท่า' }
      ],
      mistake: {
        wrong: 'We received less complaints this year.',
        right: 'We received fewer complaints this year.',
        why: {
          en: 'Thai uses น้อยกว่า for both. In English, things you can count (complaints) take fewer.',
          th: 'ภาษาไทยใช้ "น้อยกว่า" ทั้งสองแบบ แต่ภาษาอังกฤษ ของที่นับได้ (complaints) ต้องใช้ fewer'
        }
      }
    },
    {
      id: 'the-more-the-more',
      name: { en: 'The more …, the more …', th: 'ยิ่ง … ยิ่ง … (the more …, the more …)' },
      formula: ['the + Adj-er + S + V, the + Adj-er + S + V'],
      use: {
        en: 'The more…, the more…: both parts start with the + comparative, and the comparative moves to the front of each part.',
        th: 'ยิ่ง … ยิ่ง …: ทั้งสองส่วนขึ้นต้นด้วย the + ขั้นกว่า โดยยกขั้นกว่ามาไว้หน้าแต่ละส่วน'
      },
      example: {
        en: 'The earlier you register, {{the lower}} the fee will be.',
        th: 'ยิ่งลงทะเบียนเร็ว ค่าธรรมเนียมยิ่งถูก'
      },
      clues: [
        { w: 'the earlier …, the …', en: 'the sooner …, the more …', th: 'ยิ่งเร็ว … ยิ่ง …' },
        { w: 'the more …, the more …', en: 'when one grows, the other grows too', th: 'ยิ่งมาก … ยิ่งมาก …' }
      ],
      mistake: {
        wrong: 'The earlier you register, the fee will be lower.',
        right: 'The earlier you register, the lower the fee will be.',
        why: {
          en: 'Thai says ค่าธรรมเนียมยิ่งถูก with the subject first, but English puts the + comparative first in both parts: the lower the fee.',
          th: 'ภาษาไทยพูด "ค่าธรรมเนียมยิ่งถูก" (ประธานขึ้นก่อน) แต่ภาษาอังกฤษต้องยก the + ขั้นกว่า ไปไว้หน้าทั้งสองส่วน: the lower the fee'
        }
      }
    },
    {
      id: 'irregular-comparatives',
      name: { en: 'Irregular forms', th: 'รูปที่เปลี่ยนทั้งคำ (irregular forms)' },
      formula: ['good/well → better → the best', 'bad/badly → worse → the worst', 'many/much → more → the most'],
      use: {
        en: 'These change the whole word instead of adding -er or -est. Learn them by heart.',
        th: 'คำพวกนี้เปลี่ยนทั้งคำ ไม่เติม -er / -est ต้องจำ'
      },
      example: {
        en: 'Our sales results were {{better}} than expected.',
        th: 'ผลยอดขายของเราดีกว่าที่คาดไว้'
      },
      clues: [
        { w: 'better than', en: 'more good than', th: 'ดีกว่า' },
        { w: 'worse than', en: 'more bad than', th: 'แย่กว่า' }
      ],
      mistake: {
        wrong: 'Sales were more better than expected.',
        right: 'Sales were better than expected.',
        why: {
          en: 'Better already means "more good", so do not add more.',
          th: 'better แปลว่า "ดีกว่า" อยู่แล้ว ไม่ต้องใส่ more ซ้ำ'
        }
      }
    }
  ]
}
