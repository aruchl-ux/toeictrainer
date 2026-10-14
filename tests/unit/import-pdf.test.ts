import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import { cached, hashOf, pool } from '../../scripts/lib/import/cache'
import { GIT_PDFTOTEXT, findPdftotext, pageCount, singlePagePdf } from '../../scripts/lib/import/pdf'

const GIT = 'C:\\Program Files\\Git\\mingw64\\bin\\pdftotext.exe'

describe('findPdftotext', () => {
  it('prefers PDFTOTEXT', () => {
    expect(findPdftotext({ PDFTOTEXT: 'X:/pdftotext.exe' }, () => true, () => true)).toBe('X:/pdftotext.exe')
  })
  it('uses the one on PATH next', () => {
    expect(findPdftotext({}, () => true, () => true)).toBe('pdftotext')
  })
  it('falls back to the copy shipped with Git for Windows', () => {
    expect(findPdftotext({}, () => false, (p) => p === GIT)).toBe(GIT)
  })
  it('keeps the Git path escapes intact', () => {
    expect(GIT).toContain('\\mingw64\\bin\\')
    expect(GIT).toBe(GIT_PDFTOTEXT)
  })
  it('explains how to fix a missing pdftotext', () => {
    expect(() => findPdftotext({}, () => false, () => false)).toThrow(/Git for Windows/)
  })
})

describe('pdf pages', () => {
  it('counts pages and cuts one page out as its own PDF', async () => {
    const doc = await PDFDocument.create()
    for (let i = 0; i < 3; i++) doc.addPage([200, 200])
    const file = join(mkdtempSync(join(tmpdir(), 'toeic-pdf-')), 'three.pdf')
    writeFileSync(file, await doc.save())
    expect(await pageCount(file)).toBe(3)
    const one = await PDFDocument.load(Buffer.from(await singlePagePdf(file, 2), 'base64'))
    expect(one.getPageCount()).toBe(1)
  })
})

describe('cache', () => {
  it('runs make once per key and reads the saved value after', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'toeic-cache-'))
    let calls = 0
    const make = async () => ({ n: ++calls })
    expect(await cached(dir, 'a/b', make)).toEqual({ n: 1 })
    expect(await cached(dir, 'a/b', make)).toEqual({ n: 1 })
    expect(calls).toBe(1)
  })
  it('recomputes when the saved file is corrupt', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'toeic-cache-'))
    writeFileSync(join(dir, 'k.json'), '{"n":', 'utf8')
    expect(await cached(dir, 'k', async () => ({ n: 7 }))).toEqual({ n: 7 })
    expect(await cached(dir, 'k', async () => ({ n: 8 }))).toEqual({ n: 7 })
  })
  it('hashes equal values equally', () => {
    expect(hashOf(['x', 1])).toBe(hashOf(['x', 1]))
    expect(hashOf(['x', 1])).not.toBe(hashOf(['x', 2]))
  })
  it('pool keeps result order and respects the limit', async () => {
    let running = 0
    let peak = 0
    const out = await pool([30, 10, 20, 5], 2, async (ms, i) => {
      running++
      peak = Math.max(peak, running)
      await new Promise((r) => setTimeout(r, ms))
      running--
      return i
    })
    expect(out).toEqual([0, 1, 2, 3])
    expect(peak).toBe(2)
  })
})
