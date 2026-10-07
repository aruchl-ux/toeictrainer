import { expect, nav, progressOf, test } from './helpers'

test.describe('Mixed test (deferred feedback)', () => {
  test('MIX-01 a full mixed test runs end-to-end, hides explanations until the end, and saves one result', async ({
    launchApp
  }) => {
    test.setTimeout(180_000)
    const { page, progressFile, errors } = await launchApp()
    await nav(page, 'Mixed test')
    await expect(page.getByText('No mixed tests yet.', { exact: false })).toBeVisible()
    await page.getByRole('button', { name: 'Start test' }).click()

    const total = Number((await page.locator('.quiz-count').innerText()).match(/of (\d+)/)![1])
    expect(total).toBe(30 + 4 * 4) // 30 Part 5 items + 4 Part 6 passages x 4 blanks
    for (let i = 1; i <= total; i++) {
      await expect(page.locator('.quiz-count')).toHaveText(`Question ${i} of ${total}`)
      await expect(page.locator('.explain')).toHaveCount(0)
      await page.waitForTimeout(300) // past the 250 ms double-click guard
      await page.keyboard.press(['A', 'B', 'C', 'D'][i % 4])
    }

    await expect(page.locator('.summary-score')).toBeVisible()
    await expect(page.locator('.review-list > li')).toHaveCount(total)
    await expect.poll(() => progressOf(progressFile)?.mixedTests?.length ?? 0).toBe(1)
    const p = progressOf(progressFile)
    const result = p.mixedTests[0]
    expect(result.total).toBe(total)
    await expect(page.locator('.summary-score')).toHaveText(`Score: ${result.correct} / ${total}`)
    // Every answer is also saved as a grammar attempt.
    expect(p.grammarAttempts).toHaveLength(total)
    expect(p.grammarAttempts.filter((a: { correct: boolean }) => a.correct)).toHaveLength(result.correct)

    await nav(page, 'Home')
    await expect(page.locator('.home-recent .recent-score').first()).toHaveText(`${result.correct} of ${total} correct`)
    await nav(page, 'Progress')
    await expect(page.locator('.band-panel h2')).toContainText('Estimated Reading band')
    await expect(page.locator('.band-panel')).toContainText('Not an official score')
    expect(errors).toEqual([])
  })

  test('MIX-02 a double-click records one answer and advances one question only', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await nav(page, 'Mixed test')
    await page.getByRole('button', { name: 'Start test' }).click()
    await page.waitForTimeout(400)
    await page.locator('button.choice').first().dblclick()
    await expect(page.locator('.quiz-count')).toHaveText(/^Question 2 of/)
    await page.waitForTimeout(500)
    await expect(page.locator('.quiz-count')).toHaveText(/^Question 2 of/)
    expect(progressOf(progressFile).grammarAttempts).toHaveLength(1)
  })

  test('MIX-03 leaving a mixed test midway saves answers given but no test result', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await nav(page, 'Mixed test')
    await page.getByRole('button', { name: 'Start test' }).click()
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(300)
      await page.keyboard.press('A')
    }
    await expect(page.locator('.quiz-count')).toHaveText(/^Question 4 of/)
    await nav(page, 'Home')
    await expect.poll(() => progressOf(progressFile)?.grammarAttempts?.length ?? 0).toBe(3)
    expect(progressOf(progressFile).mixedTests).toEqual([])
  })
})
