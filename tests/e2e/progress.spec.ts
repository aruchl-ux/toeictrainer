import { emptyProgress, expect, nav, part5, test } from './helpers'

const at = '2026-10-01T09:00:00.000Z'

function attempts(topic: string, results: boolean[], ms: number) {
  const ids = part5(topic).map((i) => i.id)
  return results.map((correct, i) => ({ itemId: ids[i % ids.length], topic, correct, ms, at }))
}

/** prepositions: 25 attempts, last 20 have 5 right (25%), 12 s each.
 *  pronouns: 5 attempts, 2 right (40%), 3 s each.
 *  word-form: 6 attempts, all right, untimed (ms 0). */
const seeded = {
  ...emptyProgress(),
  grammarAttempts: [
    ...attempts('prepositions', [...Array(5).fill(false), ...Array(5).fill(true), ...Array(15).fill(false)], 12_000),
    ...attempts('pronouns', [true, true, false, false, false], 3000),
    ...attempts('word-form', Array(6).fill(true), 0)
  ],
  readingAttempts: [
    { itemId: 'p7-0001#q1', qtype: 'detail', correct: false, ms: 30_000, at },
    { itemId: 'p7-0001#q2', qtype: 'detail', correct: true, ms: 50_000, at }
  ]
}

test.describe('Progress dashboard', () => {
  test('PRG-01 with no history it shows the empty state and no score estimate', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Progress')
    await expect(page.getByText('No attempts yet.')).toBeVisible()
    await expect(page.locator('.band-none')).toHaveText('Take a Reading test or mixed test to see a score estimate.')
    await expect(page.locator('.weak-panel')).toHaveCount(0)
  })

  test('PRG-02 the topic table uses the last 20 attempts and shows a dash for untimed topics', async ({ launchApp }) => {
    const { page } = await launchApp({ progress: seeded })
    await nav(page, 'Progress')
    const row = (name: string) => page.locator('table.stats').first().locator('tr').filter({ has: page.getByRole('rowheader', { name }) })
    await expect(row('Prepositions')).toContainText('25%')
    await expect(row('Prepositions').locator('td').nth(1)).toHaveText('12s')
    await expect(row('Prepositions').locator('td').nth(2)).toHaveText('20')
    await expect(row('Pronouns')).toContainText('40%')
    await expect(row('Pronouns').locator('td').nth(1)).toHaveText('3s')
    await expect(row('Word form')).toContainText('100%')
    await expect(row('Word form').locator('td').nth(1)).toHaveText('—')
  })

  test('PRG-03 "Focus on these" lists the weakest topics in order and "Drill this" opens that drill', async ({ launchApp }) => {
    const { page } = await launchApp({ progress: seeded })
    await nav(page, 'Progress')
    await expect(page.locator('.weak-list .weak-name')).toHaveText(['Prepositions', 'Pronouns', 'Word form'])
    await page.locator('.weak-list li').first().getByRole('button', { name: /Drill this/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepositions')
    await expect(page.getByText('Question 1 of 10')).toBeVisible()
  })

  test('PRG-04 a Part 7 type row drills into the reading list filtered to that type', async ({ launchApp }) => {
    const { page } = await launchApp({ progress: seeded })
    await nav(page, 'Progress')
    await expect(page.getByRole('heading', { name: 'Reading question types (Part 7)' })).toBeVisible()
    await page.locator('table.stats').nth(1).getByRole('button', { name: /Drill this/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reading (Part 7)')
    expect(await page.evaluate(() => location.hash)).toContain('type=detail')
    await expect(page.locator('.type-chips button[aria-pressed="true"]')).toContainText('50%')
  })

  test('PRG-05 Home reflects the weakest topic when nothing is due', async ({ launchApp }) => {
    const { page } = await launchApp({ progress: seeded })
    await expect(page.locator('.poster-head')).toContainText('Keep going')
    await expect(page.locator('.poster-lead')).toContainText('Your weakest topic is Prepositions.')
    await page.locator('.poster-actions').getByRole('link', { name: /Drill this/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prepositions')
  })

  test('PRG-06 the band comes from mixed tests, then from the latest Reading test, always labelled an estimate', async ({
    launchApp
  }) => {
    const mixedOnly = { ...emptyProgress(), mixedTests: [{ at, correct: 40, total: 46, ms: 900_000 }] }
    let run = await launchApp({ progress: mixedOnly })
    await nav(run.page, 'Progress')
    await expect(run.page.locator('.band-panel h2')).toHaveText('Estimated Reading band: 400–450')
    await expect(run.page.locator('.band-panel p')).toContainText('last 3 mixed tests')
    await expect(run.page.locator('.band-panel p')).toContainText('Not an official score')
    await run.app.close()

    const withTest = {
      ...mixedOnly,
      readingTests: [
        {
          length: 'half',
          parts: { p5: { correct: 15, total: 15 }, p6: { correct: 4, total: 8 }, p7: { correct: 10, total: 27 } },
          ms: 1_800_000,
          at
        }
      ]
    }
    run = await launchApp({ progress: withTest })
    await nav(run.page, 'Progress')
    await expect(run.page.locator('.band-panel h2')).toHaveText('Estimated Reading band: 235–290')
    await expect(run.page.locator('.band-panel p')).toHaveText('Estimate from your latest Reading test. Not an official score.')
  })
})
