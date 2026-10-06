import type { GrammarTopic, Language } from '@shared/types'

export type Lang = Language

const en = {
  appTitle: 'TOEIC Trainer',
  navHome: 'Home',
  navTopics: 'Topic drills',
  navMixed: 'Mixed test',
  navReview: 'Review',
  navProgress: 'Progress',
  navSettings: 'Settings',
  homeTitle: 'Today',
  homeDue: '{n} items due for review',
  homeStartReview: 'Start review',
  homeWeakest: 'Your weakest topics',
  homeNoData: 'Do a topic drill to see your weak points.',
  topicsTitle: 'Topic drills (Part 5)',
  topicsCount: '{n} questions',
  quizQuestionOf: 'Question {i} of {n}',
  quizNext: 'Next',
  quizFinish: 'See results',
  quizScore: 'Score: {c} / {n}',
  quizAgain: 'Practice again',
  quizEmpty: 'No questions available yet.',
  trapLabel: 'Tested point',
  showOtherLang: 'Show Thai explanation',
  showMainLang: 'Show English explanation',
  yourAnswer: 'Your answer',
  correctAnswer: 'Correct answer',
  mixedTitle: 'Mixed test (Part 5 + 6)',
  mixedIntro:
    'Up to {p5} Part 5 questions and {p6} Part 6 passages. Aim for about 20 seconds per Part 5 question. Explanations are shown at the end.',
  mixedStart: 'Start test',
  reviewTitle: 'Review',
  reviewNothing: 'Nothing is due today. Great work!',
  progressTitle: 'Progress',
  progressTopic: 'Topic',
  progressAccuracy: 'Accuracy (last 20)',
  progressAvgTime: 'Avg. time',
  progressAttempts: 'Attempts',
  progressWeakest: 'Focus on these',
  progressDrill: 'Drill this',
  progressBand: 'Estimated Reading band: {low}–{high}',
  progressBandNote:
    'Estimate from your last 3 mixed tests, assuming similar Part 7 performance. Not an official score.',
  progressBandNone: 'Take a mixed test to see a score estimate.',
  progressNoData: 'No attempts yet.',
  settingsTitle: 'Settings',
  settingsLanguage: 'Explanation and menu language',
  seconds: '{s}s',
  saveError: 'Your progress could not be saved. Please restart the app.'
} as const

export type StringKey = keyof typeof en

const th: Record<StringKey, string> = {
  appTitle: 'TOEIC Trainer',
  navHome: 'หน้าแรก',
  navTopics: 'ฝึกตามหัวข้อ',
  navMixed: 'แบบทดสอบรวม',
  navReview: 'ทบทวน',
  navProgress: 'ความก้าวหน้า',
  navSettings: 'ตั้งค่า',
  homeTitle: 'วันนี้',
  homeDue: 'มี {n} ข้อที่ถึงเวลาทบทวน',
  homeStartReview: 'เริ่มทบทวน',
  homeWeakest: 'หัวข้อที่ยังอ่อน',
  homeNoData: 'ลองฝึกตามหัวข้อก่อน แล้วระบบจะบอกจุดที่ควรปรับปรุง',
  topicsTitle: 'ฝึกตามหัวข้อ (Part 5)',
  topicsCount: '{n} ข้อ',
  quizQuestionOf: 'ข้อ {i} จาก {n}',
  quizNext: 'ข้อต่อไป',
  quizFinish: 'ดูผลลัพธ์',
  quizScore: 'คะแนน: {c} / {n}',
  quizAgain: 'ฝึกอีกครั้ง',
  quizEmpty: 'ยังไม่มีข้อสอบในหัวข้อนี้',
  trapLabel: 'จุดที่ออกสอบ',
  showOtherLang: 'ดูคำอธิบายภาษาอังกฤษ',
  showMainLang: 'ดูคำอธิบายภาษาไทย',
  yourAnswer: 'คำตอบของคุณ',
  correctAnswer: 'คำตอบที่ถูก',
  mixedTitle: 'แบบทดสอบรวม (Part 5 + 6)',
  mixedIntro:
    'Part 5 สูงสุด {p5} ข้อ และ Part 6 สูงสุด {p6} บทความ พยายามทำ Part 5 ให้ได้ข้อละประมาณ 20 วินาที คำอธิบายจะแสดงตอนจบ',
  mixedStart: 'เริ่มทำแบบทดสอบ',
  reviewTitle: 'ทบทวน',
  reviewNothing: 'วันนี้ไม่มีข้อที่ต้องทบทวน เยี่ยมมาก!',
  progressTitle: 'ความก้าวหน้า',
  progressTopic: 'หัวข้อ',
  progressAccuracy: 'ความแม่นยำ (20 ข้อล่าสุด)',
  progressAvgTime: 'เวลาเฉลี่ย',
  progressAttempts: 'จำนวนที่ทำ',
  progressWeakest: 'ควรฝึกเพิ่ม',
  progressDrill: 'ฝึกหัวข้อนี้',
  progressBand: 'ประมาณคะแนน Reading: {low}–{high}',
  progressBandNote:
    'ประมาณจากแบบทดสอบรวม 3 ครั้งล่าสุด โดยสมมติว่า Part 7 ทำได้ใกล้เคียงกัน ไม่ใช่คะแนนอย่างเป็นทางการ',
  progressBandNone: 'ทำแบบทดสอบรวมเพื่อดูคะแนนโดยประมาณ',
  progressNoData: 'ยังไม่มีข้อมูล',
  settingsTitle: 'ตั้งค่า',
  settingsLanguage: 'ภาษาของเมนูและคำอธิบาย',
  seconds: '{s} วิ',
  saveError: 'บันทึกความคืบหน้าไม่สำเร็จ กรุณาปิดแล้วเปิดแอปใหม่'
}

export const STRINGS: Record<Lang, Record<StringKey, string>> = { en, th }

export function t(lang: Lang, key: StringKey, vars: Record<string, string | number> = {}): string {
  return STRINGS[lang][key].replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
}

export const TOPIC_LABELS: Record<GrammarTopic, Record<Lang, string>> = {
  'word-form': { en: 'Word form', th: 'รูปคำ (Word form)' },
  'tense-voice': { en: 'Tense & voice', th: 'กาลและวอยซ์ (Tense & voice)' },
  'subject-verb-agreement': { en: 'Subject-verb agreement', th: 'ความสอดคล้องประธาน-กริยา' },
  prepositions: { en: 'Prepositions', th: 'คำบุพบท (Prepositions)' },
  'conj-vs-prep': { en: 'Conjunction vs preposition', th: 'คำสันธาน vs คำบุพบท' },
  pronouns: { en: 'Pronouns', th: 'คำสรรพนาม (Pronouns)' },
  'relative-clauses': { en: 'Relative clauses', th: 'ประโยคขยายคำนาม (Relative clauses)' },
  'reduced-clauses': { en: 'Reduced clauses', th: 'การลดรูปประโยค (Reduced clauses)' },
  conditionals: { en: 'Conditionals', th: 'ประโยคเงื่อนไข (Conditionals)' },
  inversion: { en: 'Inversion', th: 'การสลับประธาน-กริยา (Inversion)' },
  comparatives: { en: 'Comparatives & superlatives', th: 'ขั้นกว่าและขั้นสูงสุด' },
  'gerund-infinitive': { en: 'Gerund vs infinitive', th: 'Gerund กับ Infinitive' },
  collocations: { en: 'Collocations & vocabulary', th: 'คำที่มักใช้คู่กัน (Collocations)' },
  'sentence-insertion': { en: 'Sentence insertion', th: 'การเติมประโยค (Sentence insertion)' },
  transitions: { en: 'Transitions', th: 'คำเชื่อมความ (Transitions)' }
}

export const topicLabel = (topic: GrammarTopic, lang: Lang): string => TOPIC_LABELS[topic][lang]
