import { writeFileSync } from 'fs'
import { emptyProgress, expect, nav, part7, progressOf, test } from './helpers'

const HALF_MS = 38 * 60_000

async function startHalf(page: import('@playwright/test').Page) {
  await nav(page, 'Reading test')
  await page.getByRole('button', { name: /Start test/ }).click()
  await expect(page.getByRole('timer')).toBeVisible()
}

const count = async (page: import('@playwright/test').Page) => {
  const m = (await page.locator('.quiz-count').innerText()).match(/Question (\d+) of (\d+)/)!
  return { i: Number(m[1]), n: Number(m[2]) }
}

test.describe('Part 7 reading drill', () => {
  test('RD-01 a question-type filter marks its chip pressed, updates the URL, and narrows the set list', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Reading (Part 7)')
    const all = 30 // 20 single + 4 double + 6 triple approved sets
    await expect(page.locator('.set-row')).toHaveCount(all)
    const chip = page.locator('.type-chips button').nth(1)
    await chip.click()
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.type-chips button').first()).toHaveAttribute('aria-pressed', 'false')
    expect(await page.evaluate(() => location.hash)).toMatch(/\?type=/)
    const filtered = await page.locator('.set-row').count()
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThanOrEqual(all)
    await page.getByRole('button', { name: 'All question types' }).click()
    await expect(page.locator('.set-row')).toHaveCount(all)
  })

  test('RD-02 a double-passage set exposes document tabs that switch the visible document', async ({ launchApp }) => {
    const set = part7('double')[0]
    const { page } = await launchApp()
    await nav(page, 'Reading (Part 7)')
    await page.getByRole('button', { name: new RegExp(set.docs[0].title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click()
    const tabs = page.getByRole('tab')
    await expect(tabs).toHaveCount(set.docs.length)
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true')
    await tabs.nth(1).click()
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('.p7-passage h3')).toHaveText(set.docs[1].title)
  })

  test('RD-03 "Random set" opens a set of that format and "All sets" returns to the list', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Reading (Part 7)')
    await page.locator('.set-group').filter({ hasText: 'Triple passages' }).getByRole('button', { name: /Random set/ }).click()
    await expect(page.getByRole('tab')).toHaveCount(3)
    await page.getByRole('button', { name: 'All sets' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reading (Part 7)')
  })
})

test.describe('Reading test (timed, free navigation)', () => {
  test('RT-01 Previous is disabled on Q1, Next on the last question; the map jumps anywhere', async ({ launchApp }) => {
    const { page } = await launchApp()
    await startHalf(page)
    const { n } = await count(page)
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await page.getByRole('button', { name: /^Next/ }).click()
    expect((await count(page)).i).toBe(2)
    await page.getByRole('button', { name: new RegExp(`^Question ${n},`) }).click()
    expect((await count(page)).i).toBe(n)
    await expect(page.getByRole('button', { name: /^Next/ })).toBeDisabled()
    await expect(page.getByRole('button', { name: new RegExp(`^Question ${n},`) })).toHaveAttribute('aria-current', 'true')
  })

  test('RT-02 answers can be changed and the map labels answered/flagged state; both are saved', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await startHalf(page)
    await page.keyboard.press('A')
    await page.keyboard.press('C')
    await expect(page.locator('button.choice').nth(2)).toHaveClass(/selected/)
    await page.getByRole('button', { name: 'Flag', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Remove flag' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'Question 1, answered, flagged' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Question 2, unanswered' })).toBeVisible()
    await expect
      .poll(() => {
        const a = progressOf(progressFile)?.activeReadingTest
        return a ? [Object.values(a.answers), a.flags.length] : null
      })
      .toEqual([[2], 1])
  })

  test('RT-03 answer keys work while focus is on the Flag button (keyboard-only test taking)', async ({ launchApp }) => {
    const { page } = await launchApp()
    await startHalf(page)
    await page.getByRole('button', { name: 'Flag', exact: true }).focus()
    await page.keyboard.press('B')
    await expect(page.locator('button.choice').nth(1)).toHaveClass(/selected/)
  })

  test('RT-04 submitting with unanswered questions asks first, with the exact count; "Keep working" cancels', async ({
    launchApp
  }) => {
    const { page } = await launchApp()
    await startHalf(page)
    const { n } = await count(page)
    await page.keyboard.press('A')
    await page.getByRole('button', { name: 'Submit test' }).click()
    await expect(page.getByRole('alert')).toContainText(`${n - 1} questions are unanswered. Submit anyway?`)
    await page.getByRole('button', { name: 'Keep working' }).click()
    await expect(page.getByRole('alert')).toHaveCount(0)
    await expect(page.getByRole('timer')).toBeVisible()
  })

  test('RT-05 results show per-part scores, an estimate label, a drill link, and clear the active test', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await startHalf(page)
    await page.keyboard.press('A')
    await page.getByRole('button', { name: 'Submit test' }).click()
    await page.getByRole('button', { name: 'Submit now' }).click()
    await expect(page.getByRole('heading', { name: 'Reading test results' })).toBeVisible()
    await expect(page.locator('.part-scores li')).toHaveCount(4) // Parts 5, 6, 7 + time used
    await expect(page.locator('.band-panel')).toContainText('Not an official score')
    await expect.poll(() => progressOf(progressFile)?.readingTests?.length ?? 0).toBe(1)
    expect(progressOf(progressFile).activeReadingTest).toBeNull()
    // Only the one answered question becomes an attempt; unanswered ones are not counted as wrong attempts.
    const p = progressOf(progressFile)
    expect(p.grammarAttempts.length + p.readingAttempts.length).toBe(1)
    await page.getByRole('button', { name: /Practice again/ }).click()
    await expect(page.getByRole('button', { name: /Start test/ })).toBeVisible()
  })

  test('RT-06 when time runs out the test submits itself', async ({ launchApp }) => {
    const first = await launchApp()
    await startHalf(first.page)
    await first.page.keyboard.press('A')
    await expect.poll(() => progressOf(first.progressFile)?.activeReadingTest?.ids?.length ?? 0).toBeGreaterThan(0)
    await first.app.close()

    const p = progressOf(first.progressFile)
    p.activeReadingTest.elapsedMs = HALF_MS - 3000
    writeFileSync(first.progressFile, JSON.stringify(p))
    const second = await launchApp({ userData: first.userData })
    await nav(second.page, 'Reading test')
    await second.page.getByRole('button', { name: /Resume/ }).click()
    await expect(second.page.getByRole('heading', { name: 'Reading test results' })).toBeVisible({ timeout: 10_000 })
    await expect.poll(() => progressOf(second.progressFile)?.readingTests?.length ?? 0).toBe(1)
  })

  test('RT-07 the timer announces "5 minutes left" and "1 minute left" as text cues', async ({ launchApp }) => {
    const first = await launchApp()
    await startHalf(first.page)
    await expect.poll(() => progressOf(first.progressFile)?.activeReadingTest?.ids?.length ?? 0).toBeGreaterThan(0)
    await first.app.close()

    const p = progressOf(first.progressFile)
    p.activeReadingTest.elapsedMs = HALF_MS - 4 * 60_000
    writeFileSync(first.progressFile, JSON.stringify(p))
    let run = await launchApp({ userData: first.userData })
    await nav(run.page, 'Reading test')
    await expect(run.page.getByText('min left')).toContainText('4 min left')
    await run.page.getByRole('button', { name: /Resume/ }).click()
    await expect(run.page.locator('.timer-cue')).toHaveText('5 minutes left')
    await expect(run.page.getByRole('timer')).toHaveClass(/warn/)
    await run.app.close()

    const q = progressOf(first.progressFile)
    q.activeReadingTest.elapsedMs = HALF_MS - 50_000
    writeFileSync(first.progressFile, JSON.stringify(q))
    run = await launchApp({ userData: first.userData })
    await nav(run.page, 'Reading test')
    await run.page.getByRole('button', { name: /Resume/ }).click()
    await expect(run.page.locator('.timer-cue')).toHaveText('1 minute left')
    await expect(run.page.getByRole('timer')).toHaveClass(/urgent/)
  })

  test('RT-08 "Discard" removes the unfinished test from the screen and from disk', async ({ launchApp }) => {
    const first = await launchApp()
    await startHalf(first.page)
    await first.page.keyboard.press('A')
    await expect.poll(() => progressOf(first.progressFile)?.activeReadingTest?.ids?.length ?? 0).toBeGreaterThan(0)
    await first.app.close()

    const second = await launchApp({ userData: first.userData })
    await nav(second.page, 'Reading test')
    await second.page.getByRole('button', { name: 'Discard' }).click()
    await expect(second.page.getByRole('button', { name: /Resume/ })).toHaveCount(0)
    await expect.poll(() => progressOf(second.progressFile)?.activeReadingTest).toBeNull()
  })

  test('RT-09 a saved test whose questions left the bank is discarded with a message', async ({ launchApp }) => {
    const progress = {
      ...emptyProgress(),
      activeReadingTest: {
        length: 'half',
        ids: ['p5-gone-0001', 'p5-gone-0002'],
        orders: [
          [0, 1, 2, 3],
          [0, 1, 2, 3]
        ],
        answers: { 'p5-gone-0001': 1 },
        flags: [],
        index: 0,
        elapsedMs: 1000
      }
    }
    const { page, progressFile } = await launchApp({ progress })
    await nav(page, 'Reading test')
    await expect(page.getByText('no longer in the bank')).toBeVisible()
    await expect(page.getByRole('button', { name: /Resume/ })).toHaveCount(0)
    await expect.poll(() => progressOf(progressFile)?.activeReadingTest).toBeNull()
  })

  test('RT-10 the Full test shows its question count and the same count appears when started', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Reading test')
    await page.getByRole('radio', { name: /Full test/ }).click()
    await expect(page.getByRole('radio', { name: /Full test/ })).toBeChecked()
    const meta = await page.locator('.lang-option').filter({ hasText: 'Full test' }).locator('.lang-sample').innerText()
    const shown = Number(meta.match(/^(\d+) questions · 75 minutes$/)![1])
    await page.getByRole('button', { name: /Start test/ }).click()
    expect((await count(page)).n).toBe(shown)
    await expect(page.getByRole('timer')).toContainText(/^7[45]:\d\d/)
  })
})
