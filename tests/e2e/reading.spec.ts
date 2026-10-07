import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { _electron as electron, expect, test } from '@playwright/test'

function launchEnv(userData: string): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && k !== 'ELECTRON_RUN_AS_NODE') env[k] = v
  }
  env.TOEIC_USER_DATA = userData
  return env
}

function readProgress(file: string): any {
  try {
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
  } catch {
    return null
  }
}

test('a Part 7 drill answer is recorded and its evidence highlighted', async () => {
  const userData = mkdtempSync(join(tmpdir(), 'toeic-e2e-'))
  writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
  const app = await electron.launch({ args: ['.'], env: launchEnv(userData) })
  const page = await app.firstWindow()
  await page.locator('nav').getByRole('link', { name: 'Reading (Part 7)' }).click()
  await page.getByRole('button', { name: /Parking garage maintenance/ }).click()
  await page.locator('button.choice').first().click()
  await expect(page.locator('mark.evidence').first()).toBeVisible()
  const progressFile = join(userData, 'progress.json')
  await expect
    .poll(() => readProgress(progressFile)?.readingAttempts?.length ?? 0)
    .toBe(1)
  await app.close()
})

test('a half Reading test resumes with the same remaining time after restart, then submits', async () => {
  const userData = mkdtempSync(join(tmpdir(), 'toeic-e2e-'))
  writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
  const progressFile = join(userData, 'progress.json')
  let app = await electron.launch({ args: ['.'], env: launchEnv(userData) })
  let page = await app.firstWindow()
  await page.locator('nav').getByRole('link', { name: 'Reading test', exact: true }).click()
  await page.getByRole('button', { name: /Start test/ }).click()
  await page.locator('button.choice').first().click()
  const before = await page.getByRole('timer').innerText()
  await expect
    .poll(() => {
      const active = readProgress(progressFile)?.activeReadingTest
      return active ? Object.keys(active.answers).length : 0
    })
    .toBe(1)
  await app.close()

  app = await electron.launch({ args: ['.'], env: launchEnv(userData) })
  page = await app.firstWindow()
  await page.locator('nav').getByRole('link', { name: 'Reading test', exact: true }).click()
  await page.getByRole('button', { name: /Resume/ }).click()
  const after = await page.getByRole('timer').innerText()
  // Clock paused while closed: at most a few seconds of difference, never minutes.
  const secs = (s: string) => {
    const [m, ss] = s.slice(0, 5).split(':').map(Number)
    return m * 60 + ss
  }
  expect(Math.abs(secs(before) - secs(after))).toBeLessThanOrEqual(8)
  await page.getByRole('button', { name: 'Submit test' }).click()
  await page.getByRole('button', { name: 'Submit now' }).click()
  await expect(page.getByText('Reading test results').first()).toBeVisible()
  await expect
    .poll(() => readProgress(progressFile)?.readingTests?.length ?? 0)
    .toBe(1)
  const progress = readProgress(progressFile)
  expect(progress.activeReadingTest).toBeNull()
  await app.close()
})
