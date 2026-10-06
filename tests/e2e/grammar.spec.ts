import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { _electron as electron, expect, test } from '@playwright/test'
import { addDays, localDate } from '../../src/shared/dates'

function launchEnv(userData: string): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && k !== 'ELECTRON_RUN_AS_NODE') env[k] = v
  }
  env.TOEIC_USER_DATA = userData
  return env
}

test('a topic drill answer is saved to progress', async () => {
  const userData = mkdtempSync(join(tmpdir(), 'toeic-e2e-'))
  writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
  const progressFile = join(userData, 'progress.json')

  const app = await electron.launch({ args: ['.'], env: launchEnv(userData) })
  const page = await app.firstWindow()

  await page.locator('nav').getByRole('link', { name: 'Topic drills' }).click()
  await page.getByRole('link', { name: /Word form/ }).click()
  await expect(page.getByText(/Question 1 of \d+/)).toBeVisible()
  await page.locator('button.choice').first().click()
  await expect(page.locator('.explain')).toBeVisible()

  await expect.poll(() => existsSync(progressFile)).toBe(true)
  await app.close()
  const progress = JSON.parse(readFileSync(progressFile, 'utf8'))
  expect(progress.grammarAttempts).toHaveLength(1)
  expect(progress.grammarAttempts[0].topic).toBe('word-form')
})

test('a due review card is answered and rescheduled', async () => {
  const userData = mkdtempSync(join(tmpdir(), 'toeic-e2e-'))
  writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
  const items = JSON.parse(
    readFileSync(join(__dirname, '../../content/grammar/part5/word-form.json'), 'utf8')
  )
  const item = items.find((i: { status: string }) => i.status === 'approved')
  const today = localDate()
  const progressFile = join(userData, 'progress.json')
  writeFileSync(
    progressFile,
    JSON.stringify({
      version: 1,
      grammarAttempts: [],
      leitner: { [item.id]: { box: 1, due: today } },
      mixedTests: []
    })
  )

  const app = await electron.launch({ args: ['.'], env: launchEnv(userData) })
  const page = await app.firstWindow()

  await page.locator('nav').getByRole('link', { name: 'Review', exact: true }).click()
  await page.locator('button.choice').nth(item.answer).click()
  await expect(page.locator('.explain')).toBeVisible()

  await expect
    .poll(() => JSON.parse(readFileSync(progressFile, 'utf8')).grammarAttempts.length)
    .toBe(1)
  await app.close()
  const progress = JSON.parse(readFileSync(progressFile, 'utf8'))
  expect(progress.grammarAttempts[0].itemId).toBe(item.id)
  expect(progress.grammarAttempts[0].correct).toBe(true)
  expect(progress.leitner[item.id]).toEqual({ box: 2, due: addDays(today, 3) })
})
