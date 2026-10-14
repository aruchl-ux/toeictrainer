/** Explanations are shown with shuffled choices, so they must never point at a choice by position. */
export const POSITIONAL = /\(\s*[A-D]\s*\)|\b(?:option|choice|answer)\s+[A-D]\b|ตัวเลือก(?:ที่)?\s*[A-Dก-ง1-4]|\b(?:first|second|third|fourth|last)\s+(?:option|choice)\b/i

/** True when the English explanation names the correct answer (first word is enough); long answers are not checked. */
export function mentionsAnswer(explainEn: string, answer: string): boolean {
  if (answer.length >= 40) return true
  return explainEn.toLowerCase().includes(answer.toLowerCase().split(' ')[0])
}
