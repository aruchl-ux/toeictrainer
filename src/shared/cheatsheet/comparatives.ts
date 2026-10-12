import type { CheatSheet } from './types'

export const comparatives: CheatSheet = {
  topic: 'comparatives',
  intro: {
    en: 'Find the signal word: than means -er or more, the means -est or most, as … as means equal.',
    th: 'หาคำสัญญาณ: มี than ใช้ขั้นกว่า / มี the ใช้ขั้นสุด / มี as … as คือเท่ากัน'
  },
  entries: [
    {
      id: 'comparative',
      name: { en: 'Comparative', th: 'ขั้นกว่า (Comparative)' },
      formula: ['Adj-er + than', 'more + Adj + than'],
      use: {
        en: 'Comparing two things: short words add -er, long words use more, then than.',
        th: 'เปรียบเทียบ 2 อย่าง: คำสั้นเติม -er / คำยาวใช้ more แล้วตามด้วย than'
      },
      example: {
        en: 'The new model is {{lighter}} than the old one.',
        th: 'รุ่นใหม่เบากว่ารุ่นเก่า'
      },
      clues: ['than']
    },
    {
      id: 'superlative',
      name: { en: 'Superlative', th: 'ขั้นสูงสุด (Superlative)' },
      formula: ['the + Adj-est + N', 'the most + Adj + N'],
      use: {
        en: 'The top one in a group: the + -est, or the most.',
        th: 'มากที่สุดในกลุ่ม: the + -est หรือ the most'
      },
      example: {
        en: 'This is {{the most popular}} tour we offer.',
        th: 'นี่คือทัวร์ที่ได้รับความนิยมมากที่สุดของเรา'
      },
      clues: ['the', 'of all', 'in the region', 'ever', 'one of the + N(s)']
    },
    {
      id: 'as-as',
      name: { en: 'As … as', th: 'As … as (เท่ากัน)' },
      formula: ['as + Adj/Adv + as', 'not as + Adj + as'],
      use: {
        en: 'Equal: as + plain word + as, with no -er.',
        th: 'เท่ากัน: as + คำปกติ + as (ไม่เติม -er)'
      },
      example: {
        en: 'The second quarter was {{as}} profitable as the first.',
        th: 'ไตรมาสที่สองทำกำไรได้เท่ากับไตรมาสแรก'
      }
    },
    {
      id: 'comparative-intensifiers',
      name: { en: 'Much / far + comparative', th: 'Much / far + ขั้นกว่า' },
      formula: ['much/far/even/a lot + Adj-er + than'],
      use: {
        en: 'To say "much more", use much, far or even. Not very.',
        th: 'อยากเน้นว่า "กว่ามาก" ใช้ much, far, even ห้ามใช้ very'
      },
      example: {
        en: 'The new office is {{much}} larger than the old one.',
        th: 'สำนักงานใหม่ใหญ่กว่าที่เก่ามาก'
      }
    },
    {
      id: 'the-more-the-more',
      name: { en: 'The more …, the more …', th: 'ยิ่ง … ยิ่ง …' },
      formula: ['the + Adj-er + S + V, the + Adj-er + S + V'],
      use: {
        en: 'The more…, the more…: both parts start with the + comparative.',
        th: 'ยิ่ง … ยิ่ง …: ทั้งสองส่วนขึ้นต้นด้วย the + ขั้นกว่า'
      },
      example: {
        en: 'The earlier you register, {{the lower}} the fee will be.',
        th: 'ยิ่งลงทะเบียนเร็ว ค่าธรรมเนียมยิ่งถูก'
      }
    },
    {
      id: 'irregular-comparatives',
      name: { en: 'Irregular forms', th: 'รูปเปรียบเทียบที่ไม่ปกติ' },
      formula: ['good/well → better → the best', 'bad/badly → worse → the worst', 'many/much → more → the most'],
      use: {
        en: 'These change the whole word instead of adding -er or -est. Learn them by heart.',
        th: 'คำพวกนี้เปลี่ยนทั้งคำ ไม่เติม -er / -est ต้องจำ'
      },
      example: {
        en: 'Our sales results were {{better}} than expected.',
        th: 'ผลยอดขายของเราดีกว่าที่คาดไว้'
      }
    }
  ]
}
