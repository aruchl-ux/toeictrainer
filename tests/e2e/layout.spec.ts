import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { ElectronApplication, Page } from '@playwright/test'
import { emptyProgress, expect, goHash, nav, questionReady, readJsonFile, test } from './helpers'

const SHOTS = join(__dirname, '../../test-results/qa-screens')

async function resize(app: ElectronApplication, w: number, h: number) {
  await app.evaluate(({ BrowserWindow }, [w, h]) => BrowserWindow.getAllWindows()[0].setContentSize(w, h), [w, h])
}

/** Horizontal page overflow plus any element whose text is clipped by overflow:hidden. */
async function layoutIssues(page: Page) {
  return page.evaluate(() => {
    const issues: string[] = []
    const doc = document.documentElement
    if (doc.scrollWidth > doc.clientWidth + 1) issues.push(`page scrolls sideways: ${doc.scrollWidth} > ${doc.clientWidth}`)
    for (const el of document.querySelectorAll('main *, aside *')) {
      if (el.closest('.sr-only, [aria-hidden="true"], svg')) continue
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const clips = /hidden|clip/.test(cs.overflowX) && cs.textOverflow !== 'ellipsis'
      if (clips && (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 1 && (el as HTMLElement).innerText?.trim())
        issues.push(`clipped text in ${el.tagName.toLowerCase()}.${el.className}`)
      if (r.right > doc.clientWidth + 1 && cs.position !== 'fixed') issues.push(`off-screen right: ${el.tagName.toLowerCase()}.${el.className} (${Math.round(r.right)})`)
    }
    return [...new Set(issues)].slice(0, 10)
  })
}

const SIZES: [number, number][] = [
  [720, 560], // the window's minimum
  [1024, 768],
  [1280, 760], // default
  [1920, 1080]
]
const ROUTES = ['#/', '#/topics', '#/reading', '#/mixed', '#/reading-test', '#/review', '#/progress', '#/settings']

test.describe('UI layout and compatibility', () => {
  for (const lang of ['th', 'en'] as const) {
    test(`LAY-01 [${lang}] no sideways scrolling or clipped text at window sizes from minimum to 1080p`, async ({ launchApp }) => {
      test.setTimeout(120_000)
      mkdirSync(SHOTS, { recursive: true })
      const { app, page } = await launchApp({
        language: lang,
        progress: { ...emptyProgress(), mixedTests: [{ at: '2026-10-01T00:00:00Z', correct: 30, total: 46, ms: 1 }] }
      })
      const report: Record<string, string[]> = {}
      for (const [w, h] of SIZES) {
        await resize(app, w, h)
        for (const r of ROUTES) {
          await goHash(page, r)
          await page.locator('main h1').first().waitFor()
          await page.waitForTimeout(100)
          const issues = await layoutIssues(page)
          if (issues.length) report[`${w}x${h} ${r}`] = issues
          if (w === 720 || w === 1280) {
            await page.screenshot({ path: join(SHOTS, `${lang}-${w}x${h}-${r.replace(/[#/]/g, '') || 'home'}.png`) })
          }
        }
        // A question screen with the long Thai/English explanation open.
        await goHash(page, '#/drill/conj-vs-prep')
        await questionReady(page)
        await page.keyboard.press('A')
        await page.locator('.explain').waitFor()
        const issues = await layoutIssues(page)
        if (issues.length) report[`${w}x${h} drill`] = issues
        if (w === 720 || w === 1280) await page.screenshot({ path: join(SHOTS, `${lang}-${w}x${h}-drill.png`) })
      }
      expect(report).toEqual({})
    })
  }

  test('LAY-02 the window cannot be shrunk below 720 x 560', async ({ launchApp }) => {
    const { app } = await launchApp()
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(400, 300))
    const [w, h] = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].getSize())
    expect(w).toBeGreaterThanOrEqual(720)
    expect(h).toBeGreaterThanOrEqual(560)
  })

  test('LAY-03 Thai text gets generous line height (>= 1.5) in questions and explanations', async ({ launchApp }) => {
    const { page } = await launchApp({ language: 'th' })
    await goHash(page, '#/drill/word-form')
    await questionReady(page)
    await page.keyboard.press('A')
    await page.locator('.explain').waitFor()
    const ratios = await page.evaluate(() =>
      ['.explain-body', '.poster-lead, .keys-hint', '.explain .trap'].flatMap((sel) =>
        [...document.querySelectorAll(sel)].map((el) => {
          const cs = getComputedStyle(el)
          const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)
          return { sel, lh: Math.round(lh * 100) / 100 }
        })
      )
    )
    for (const r of ratios) expect(r, r.sel).toMatchObject({ lh: expect.any(Number) })
    expect(ratios.filter((r) => r.lh < 1.5)).toEqual([])
  })

  test('LAY-05 the question map stays still while the test timer counts down and when its warning appears', async ({
    launchApp
  }) => {
    test.setTimeout(90_000)
    const geometry = (page: Page) =>
      page.evaluate(() => {
        const box = (sel: string) => document.querySelector(sel)!.getBoundingClientRect()
        const cells = [...document.querySelectorAll('.qmap .cell')].map((c) => c.getBoundingClientRect())
        return {
          timer: document.querySelector('.test-timer .num')!.textContent,
          timerWidth: Math.round(box('.test-timer').width * 10) / 10,
          mapLeft: Math.round(box('.qmap').left * 10) / 10,
          barHeight: Math.round(box('.test-bar').height),
          rows: new Set(cells.map((r) => Math.round(r.top))).size,
          stemTop: Math.round(box('.question').top)
        }
      })
    const sample = async (page: Page, seconds: number) => {
      const out = []
      for (let i = 0; i < seconds; i++) {
        out.push(await geometry(page))
        await page.waitForTimeout(1000)
      }
      return out
    }
    const assertStill = (samples: Awaited<ReturnType<typeof geometry>>[], label: string) => {
      test.info().annotations.push({ type: 'layout', description: `${label}: ${JSON.stringify(samples)}` })
      const first = samples[0]
      for (const s of samples) {
        expect({ ...s, timer: '' }, `${label} at ${s.timer}`).toEqual({ ...first, timer: '' })
      }
    }

    for (const [w, h] of [
      [1280, 760],
      [1600, 900]
    ] as const) {
      const first = await launchApp({ language: 'th' })
      await resize(first.app, w, h)
      await nav(first.page, 'ข้อสอบ Reading')
      await first.page.getByRole('radio', { name: /เต็มชุด/ }).click()
      await first.page.getByRole('button', { name: /เริ่มทำข้อสอบ/ }).click()
      await first.page.getByRole('timer').waitFor()
      // Ten ticks cover every last digit 0-9.
      assertStill(await sample(first.page, 11), `${w}x${h} counting`)

      // Crossing into the 5-minute warning must not push the map either.
      await expect.poll(() => readJsonFile(first.progressFile)?.activeReadingTest?.ids?.length ?? 0).toBeGreaterThan(0)
      await first.app.close()
      const p = readJsonFile(first.progressFile)
      p.activeReadingTest.elapsedMs = 75 * 60_000 - 5 * 60_000 - 3000
      writeFileSync(first.progressFile, JSON.stringify(p))
      const second = await launchApp({ userData: first.userData })
      await resize(second.app, w, h)
      await nav(second.page, 'ข้อสอบ Reading')
      await second.page.getByRole('button', { name: /ทำต่อ/ }).click()
      await second.page.getByRole('timer').waitFor()
      const warn = await sample(second.page, 6)
      expect(warn.at(-1)!.timer! < '05:00').toBe(true)
      assertStill(warn, `${w}x${h} warning`)
      await second.app.close()
    }
  })

  test('LAY-04 interactive states: hover changes a choice, disabled choices look and behave disabled', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Topic drills')
    await page.getByRole('link', { name: /Pronouns/ }).click()
    const choice = page.locator('button.choice').nth(1)
    const style = () =>
      choice.evaluate((el) => {
        const cs = getComputedStyle(el)
        return `${cs.backgroundColor}|${cs.borderColor}|${cs.transform}|${cs.boxShadow}`
      })
    await page.mouse.move(0, 0)
    const idle = await style()
    await choice.hover()
    await page.waitForTimeout(250)
    expect(await style()).not.toBe(idle)
    await page.locator('button.choice').first().click()
    const cursor = await choice.evaluate((el) => getComputedStyle(el).cursor)
    await expect(choice).toBeDisabled()
    expect(cursor).not.toBe('pointer')
  })
})
