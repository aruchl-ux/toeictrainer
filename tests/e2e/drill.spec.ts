import { addDays, localDate } from '../../src/shared/dates'
import { choiceByText, currentPart5, emptyProgress, expect, nav, part5, progressOf, test } from './helpers'

const TOPIC = 'prepositions'

async function openDrill(page: import('@playwright/test').Page, name = 'Prepositions') {
  await nav(page, 'Topic drills')
  await page.getByRole('link', { name: new RegExp(name) }).click()
  await expect(page.getByText('Question 1 of 10')).toBeVisible()
}

test.describe('Topic drill (instant feedback)', () => {
  test('DRL-01 a full 10-question drill is completable by keyboard only and the score matches saved attempts', async ({
    launchApp
  }) => {
    const { page, progressFile, errors } = await launchApp()
    await openDrill(page)
    const keys = ['A', 'B', 'C', 'D', '1', '2', '3', '4', 'a', 'b']
    for (let i = 0; i < 10; i++) {
      await expect(page.getByText(`Question ${i + 1} of 10`)).toBeVisible()
      await page.keyboard.press(keys[i])
      await expect(page.locator('.explain')).toBeVisible()
      await page.keyboard.press('Enter')
    }
    const score = page.locator('.summary-score')
    await expect(score).toBeVisible()
    await expect(page.locator('.summary-marks li')).toHaveCount(10)
    await expect.poll(() => progressOf(progressFile)?.grammarAttempts?.length ?? 0).toBe(10)
    const attempts = progressOf(progressFile).grammarAttempts
    const correct = attempts.filter((a: { correct: boolean }) => a.correct).length
    await expect(score).toHaveText(`Score: ${correct} / 10`)
    expect(new Set(attempts.map((a: { itemId: string }) => a.itemId)).size).toBe(10)
    for (const a of attempts) {
      expect(a.topic).toBe(TOPIC)
      expect(a.ms).toBeGreaterThanOrEqual(0)
    }
    expect(errors).toEqual([])
  })

  test('DRL-02 a correct answer is labelled "Correct" in text and shows the tested point and explanation', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await openDrill(page)
    const item = await currentPart5(page, TOPIC)
    await choiceByText(page, item.choices[item.answer]).click()
    await expect(choiceByText(page, item.choices[item.answer])).toContainText('Correct')
    await expect(page.locator('.explain .trap')).toContainText('Tested point')
    await expect(page.locator('.explain .trap strong')).toHaveText(item.trap)
    await expect(page.locator('.explain-body')).toHaveText(item.explain.en)
    await expect.poll(() => progressOf(progressFile)?.grammarAttempts?.[0]?.correct).toBe(true)
  })

  test('DRL-03 a wrong answer marks the chosen option "Wrong" and the right one "Correct" (not colour alone)', async ({
    launchApp
  }) => {
    const { page, progressFile } = await launchApp()
    await openDrill(page)
    const item = await currentPart5(page, TOPIC)
    const wrong = item.choices.find((_, i) => i !== item.answer)!
    await choiceByText(page, wrong).click()
    await expect(choiceByText(page, wrong)).toContainText('Wrong')
    await expect(choiceByText(page, item.choices[item.answer])).toContainText('Correct')
    await expect.poll(() => progressOf(progressFile)?.grammarAttempts?.[0]?.correct).toBe(false)
    // Wrong answer is scheduled for review tomorrow (Leitner box 1).
    expect(progressOf(progressFile).leitner[item.id]).toEqual({ box: 1, due: addDays(localDate(), 1) })
  })

  test('DRL-04 after answering, choices lock: more clicks and keys do not record a second attempt', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await openDrill(page)
    await page.keyboard.press('A')
    await expect(page.locator('.explain')).toBeVisible()
    for (const b of await page.locator('button.choice').all()) await expect(b).toBeDisabled()
    await page.keyboard.press('B')
    await page.keyboard.press('3')
    await page.waitForTimeout(500)
    expect(progressOf(progressFile).grammarAttempts).toHaveLength(1)
    await expect(page.getByText('Question 1 of 10')).toBeVisible()
  })

  test('DRL-05 modifier shortcuts (Ctrl+A, Alt+B) do not answer a question', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await openDrill(page)
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Alt+B')
    await page.waitForTimeout(400)
    await expect(page.locator('.explain')).toHaveCount(0)
    expect(progressOf(progressFile)).toBeNull()
  })

  test('DRL-06 the explanation flips between English and Thai and back', async ({ launchApp }) => {
    const { page } = await launchApp()
    await openDrill(page)
    const item = await currentPart5(page, TOPIC)
    await page.keyboard.press('A')
    await page.getByRole('button', { name: 'Show Thai explanation' }).click()
    await expect(page.locator('.explain-body')).toHaveAttribute('lang', 'th')
    await expect(page.locator('.explain-body')).toHaveText(item.explain.th)
    await page.getByRole('button', { name: 'Show English explanation' }).click()
    await expect(page.locator('.explain-body')).toHaveText(item.explain.en)
  })

  test('DRL-07 "Practice again" starts a fresh drill at question 1 and keeps earlier attempts', async ({ launchApp }) => {
    const { page, progressFile } = await launchApp()
    await openDrill(page)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('A')
      await page.getByRole('button', { name: i === 9 ? /See results/ : /^Next/ }).click()
    }
    await page.getByRole('button', { name: 'Practice again' }).click()
    await expect(page.getByText('Question 1 of 10')).toBeVisible()
    await page.keyboard.press('A')
    await expect.poll(() => progressOf(progressFile)?.grammarAttempts?.length).toBe(11)
  })

  test('DRL-08 the 20-second pace target shows an overrun cue in text, not colour only', async ({ launchApp }) => {
    test.setTimeout(60_000)
    const { page } = await launchApp()
    await openDrill(page)
    await expect(page.locator('.pace')).not.toHaveClass(/slow/)
    await expect(page.locator('.pace.slow')).toBeVisible({ timeout: 25_000 })
    await expect(page.locator('.pace-over')).toHaveText('/ 20s')
  })

  test('DRL-09 Topic list shows accuracy after a drill answer', async ({ launchApp }) => {
    const { page } = await launchApp()
    await openDrill(page)
    const item = await currentPart5(page, TOPIC)
    await choiceByText(page, item.choices[item.answer]).click()
    await nav(page, 'Topic drills')
    await expect(page.getByRole('link', { name: /Prepositions/ })).toContainText('100% right lately')
  })
})

test.describe('Review queue (Leitner)', () => {
  test('REV-01 nothing due shows the rest state and the rail says nothing is due', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Review')
    await expect(page.getByText('Nothing is due today. Great work!')).toBeVisible()
    await expect(page.locator('.rail-due')).toHaveText('Nothing due today')
  })

  test('REV-02 only due and overdue cards are queued; future cards and ids no longer in the bank are not', async ({
    launchApp
  }) => {
    const items = part5(TOPIC)
    const today = localDate()
    const progress = {
      ...emptyProgress(),
      leitner: {
        [items[0].id]: { box: 1, due: today },
        [items[1].id]: { box: 2, due: addDays(today, -5) },
        [items[2].id]: { box: 3, due: addDays(today, 1) },
        'p5-deleted-9999': { box: 1, due: today }
      }
    }
    const { page } = await launchApp({ progress })
    await expect(page.locator('.poster-head')).toContainText('Review 2')
    await expect(page.locator('.rail-due')).toContainText('2 due today')
    await nav(page, 'Review')
    await expect(page.getByText('Question 1 of 2')).toBeVisible()
  })

  test('REV-03 a wrong review answer sends the card back to box 1, due tomorrow', async ({ launchApp }) => {
    const item = part5(TOPIC)[0]
    const today = localDate()
    const { page, progressFile } = await launchApp({
      progress: { ...emptyProgress(), leitner: { [item.id]: { box: 4, due: today } } }
    })
    await nav(page, 'Review')
    await choiceByText(page, item.choices.find((_, i) => i !== item.answer)!).click()
    await expect.poll(() => progressOf(progressFile)?.grammarAttempts?.length ?? 0).toBe(1)
    expect(progressOf(progressFile).leitner[item.id]).toEqual({ box: 1, due: addDays(today, 1) })
  })

  test('REV-04 a box-5 card answered right stays in box 5 with a 30-day interval', async ({ launchApp }) => {
    const item = part5(TOPIC)[1]
    const today = localDate()
    const { page, progressFile } = await launchApp({
      progress: { ...emptyProgress(), leitner: { [item.id]: { box: 5, due: today } } }
    })
    await nav(page, 'Review')
    await choiceByText(page, item.choices[item.answer]).click()
    await expect.poll(() => progressOf(progressFile)?.grammarAttempts?.length ?? 0).toBe(1)
    expect(progressOf(progressFile).leitner[item.id]).toEqual({ box: 5, due: addDays(today, 30) })
  })

  test('REV-05 finishing the queue shows a summary and the rail due count drops to zero', async ({ launchApp }) => {
    const items = part5(TOPIC).slice(0, 2)
    const today = localDate()
    const { page } = await launchApp({
      progress: { ...emptyProgress(), leitner: Object.fromEntries(items.map((i) => [i.id, { box: 1, due: today }])) }
    })
    await nav(page, 'Review')
    for (let i = 0; i < 2; i++) {
      const stem = (await page.locator('.stem').innerText()).trim()
      const item = items.find((x) => x.stem.trim() === stem)!
      await choiceByText(page, item.choices[item.answer]).click()
      await page.getByRole('button', { name: i === 1 ? /See results/ : /^Next/ }).click()
    }
    await expect(page.locator('.summary-score')).toHaveText('Score: 2 / 2')
    await expect(page.locator('.rail-due')).toHaveText('Nothing due today')
  })

  test('REV-06 after opening Review from the rail, pressing A answers (keys hint says "Press A-D")', async ({ launchApp }) => {
    test.fail(true, 'BUG-01: focus stays on the rail link, and letter keys are ignored while a link has focus')
    const item = part5(TOPIC)[0]
    const { page } = await launchApp({
      progress: { ...emptyProgress(), leitner: { [item.id]: { box: 1, due: localDate() } } }
    })
    await nav(page, 'Review')
    await expect(page.getByText('Question 1 of 1')).toBeVisible()
    await expect(page.locator('.keys-hint')).toHaveText('Press A–D to answer · Enter for next')
    await page.keyboard.press('A')
    await expect(page.locator('.explain')).toBeVisible({ timeout: 2000 })
  })
})
