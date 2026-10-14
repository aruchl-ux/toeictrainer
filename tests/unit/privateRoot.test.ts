import { join } from 'path'
import { describe, expect, it } from 'vitest'
import { privateContentRoot } from '../../src/main/privateRoot'

describe('privateContentRoot', () => {
  it('uses TOEIC_PRIVATE_CONTENT first', () => {
    expect(privateContentRoot('C:/AppData', { TOEIC_PRIVATE_CONTENT: 'D:/pack', TOEIC_USER_DATA: 'E:/u' })).toBe('D:/pack')
  })
  it('uses a folder inside TOEIC_USER_DATA next', () => {
    expect(privateContentRoot('C:/AppData', { TOEIC_USER_DATA: 'E:/u' })).toBe(join('E:/u', 'private-content'))
  })
  it('defaults to a fixed folder name under AppData', () => {
    expect(privateContentRoot('C:/AppData', {})).toBe(join('C:/AppData', 'toeic-trainer', 'private-content'))
  })
})
