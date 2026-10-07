import { describe, expect, it } from 'vitest'
import { GRAMMAR_TOPICS } from '@shared/types'
import { STRINGS, TOPIC_LABELS, t, skillLabel } from '@renderer/app/i18n'

describe('i18n', () => {
  it('interpolates variables', () => {
    expect(t('en', 'quizQuestionOf', { i: 1, n: 5 })).toBe('Question 1 of 5')
  })
  it('has the same keys in Thai and English', () => {
    expect(Object.keys(STRINGS.th).sort()).toEqual(Object.keys(STRINGS.en).sort())
  })
  it('labels every grammar topic in both languages', () => {
    for (const topic of GRAMMAR_TOPICS) {
      expect(TOPIC_LABELS[topic].th.length).toBeGreaterThan(0)
      expect(TOPIC_LABELS[topic].en.length).toBeGreaterThan(0)
    }
  })
  it('labels grammar topics and Part 7 question types in both languages', () => {
    expect(skillLabel('word-form', 'en')).toBe('Word form')
    expect(skillLabel('inference', 'en')).toBe('Inference')
    expect(skillLabel('inference', 'th')).toBe('การอนุมาน')
  })
})
