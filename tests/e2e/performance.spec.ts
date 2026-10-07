import { statSync } from 'fs'
import { localDate } from '../../src/shared/dates'
import { emptyProgress, expect, goHash, nav, part5, questionReady, readJsonFile, test } from './helpers'

const note = (description: string) => test.info().annotations.push({ type: 'perf', description })

/** Two years of heavy use: 20k grammar attempts, 5k reading attempts, 200 tests, 130 Leitner cards. */
function heavyProgress() {
  const topics = ['word-form', 'prepositions', 'pronouns', 'tense-voice', 'collocations']
  const ids = topics.flatMap((t) => part5(t).map((i) => ({ id: i.id, topic: t })))
  const at = '2026-01-01T00:00:00.000Z'
  return {
    ...emptyProgress(),
    grammarAttempts: Array.from({ length: 20_000 }, (_, i) => ({
      itemId: ids[i % ids.length].id,
      topic: ids[i % ids.length].topic,
      correct: i % 3 !== 0,
      ms: 5000 + (i % 20) * 1000,
      at
    })),
    readingAttempts: Array.from({ length: 5000 }, (_, i) => ({
      itemId: `p7-${String((i % 30) + 1).padStart(4, '0')}#q${(i % 3) + 1}`,
      qtype: ['detail', 'inference', 'main-idea'][i % 3],
      correct: i % 2 === 0,
      ms: 40_000,
      at
    })),
    mixedTests: Array.from({ length: 200 }, () => ({ at, correct: 30, total: 46, ms: 1_000_000 })),
    leitner: Object.fromEntries(ids.map((x) => [x.id, { box: 3, due: '2099-01-01' }]))
  }
}

test.describe('Performance and load', () => {
  test('PERF-01 cold start to an interactive Home screen is under 5 s', async ({ launchApp }) => {
    const times: number[] = []
    for (let i = 0; i < 3; i++) {
      const t0 = Date.now()
      const { app, page } = await launchApp()
      await page.locator('.poster-head').waitFor()
      times.push(Date.now() - t0)
      await app.close()
    }
    note(`cold start ms: ${times.join(', ')}`)
    expect(Math.max(...times)).toBeLessThan(5000)
  })

  test('PERF-02 a two-year history (25k attempts) loads, renders Progress, and saves an answer quickly', async ({ launchApp }) => {
    test.setTimeout(120_000)
    const t0 = Date.now()
    const { page, progressFile, errors } = await launchApp({ progress: heavyProgress() })
    await page.locator('.poster-head').waitFor()
    const startMs = Date.now() - t0
    const sizeKb = Math.round(statSync(progressFile).size / 1024)

    let t = Date.now()
    await nav(page, 'Progress')
    await page.locator('table.stats').first().waitFor()
    const progressMs = Date.now() - t

    await goHash(page, '#/drill/word-form')
    await questionReady(page)
    const before = statSync(progressFile).mtimeMs
    t = Date.now()
    await page.keyboard.press('A')
    await expect.poll(() => statSync(progressFile).mtimeMs, { intervals: [20] }).not.toBe(before)
    const saveMs = Date.now() - t
    const savedKb = Math.round(statSync(progressFile).size / 1024)

    t = Date.now()
    await page.keyboard.press('Enter')
    await page.getByText('Question 2 of 10').waitFor()
    const nextMs = Date.now() - t

    note(`start ${startMs} ms · Progress ${progressMs} ms · save ${saveMs} ms · next ${nextMs} ms · file ${sizeKb} KB -> ${savedKb} KB`)
    expect(startMs).toBeLessThan(8000)
    expect(progressMs).toBeLessThan(1500)
    expect(saveMs).toBeLessThan(1000)
    expect(nextMs).toBeLessThan(500)
    expect(errors).toEqual([])
  })

  test('PERF-03 rapid answering (10 keystrokes in a row) loses no attempts', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await goHash(page, '#/drill/collocations')
    await questionReady(page)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('A')
      await page.keyboard.press('Enter')
    }
    await expect(page.locator('.summary-score')).toBeVisible()
    await expect.poll(() => readJsonFile(progressFile)?.grammarAttempts?.length ?? 0).toBe(10)
  })

  test('PERF-04 200 screen switches cause no errors and no runaway memory growth', async ({ launchApp }) => {
    test.setTimeout(120_000)
    const { page, errors } = await launchApp()
    const routes = ['#/', '#/topics', '#/reading', '#/mixed', '#/reading-test', '#/review', '#/progress', '#/settings']
    const heap = () => page.evaluate(() => (performance as any).memory?.usedJSHeapSize ?? 0)
    for (const r of routes) await goHash(page, r)
    const start = await heap()
    for (let i = 0; i < 200; i++) {
      await goHash(page, routes[i % routes.length])
      await page.locator('main h1').first().waitFor()
    }
    const end = await heap()
    const growthMb = (end - start) / 1024 / 1024
    note(`heap ${Math.round(start / 1048576)} MB -> ${Math.round(end / 1048576)} MB after 200 switches`)
    expect(growthMb).toBeLessThan(40)
    expect(errors).toEqual([])
  })

  test('PERF-05 a 100-question Full reading test keeps answering and navigation snappy', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Reading test')
    await page.getByRole('radio', { name: /Full test/ }).click()
    await expect(page.getByRole('radio', { name: /Full test/ })).toBeChecked()
    await page.getByRole('button', { name: /Start test/ }).click()
    const t = Date.now()
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press(['A', 'B', 'C', 'D'][i % 4])
      await page.getByRole('button', { name: /^Next/ }).click()
    }
    await expect(page.locator('.quiz-count')).toHaveText(/^Question 31 of/)
    const per = Math.round((Date.now() - t) / 30)
    note(`answer+next round trip: ${per} ms avg`)
    expect(per).toBeLessThan(400)
    // Today's date is used for Leitner scheduling at submit; make sure the local date helper agrees with the OS.
    expect(localDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
