import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { _electron as electron } from '@playwright/test'
import { choiceByText, currentPart5, emptyProgress, expect, nav, newProfile, part5, progressOf, test } from './helpers'

async function answerOne(page: import('@playwright/test').Page) {
  await nav(page, 'Topic drills')
  await page.getByRole('link', { name: /Word form/ }).click()
  await expect(page.getByText('Question 1 of 10')).toBeVisible()
  await page.keyboard.press('A')
  await expect(page.locator('.explain')).toBeVisible()
}

test.describe('Data integrity and resilience', () => {
  test('DAT-01 a corrupt progress.json is quarantined byte-for-byte and the app starts fresh', async ({ launchApp }) => {
    const userData = newProfile()
    const garbage = '{"version":1,"grammarAttempts":[{"itemId":'
    writeFileSync(join(userData, 'progress.json'), garbage)
    writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
    const { page, progressFile } = await launchApp({ userData })
    await expect(page.locator('.poster-head')).toContainText('Start here')
    const backup = readdirSync(userData).find((f) => f.startsWith('progress.json.corrupt-'))
    expect(backup).toBeDefined()
    expect(readFileSync(join(userData, backup!), 'utf8')).toBe(garbage)
    await answerOne(page)
    await expect.poll(() => progressOf(progressFile)?.grammarAttempts?.length ?? 0).toBe(1)
  })

  test('DAT-02 a failed progress save shows an alert instead of failing silently', async ({ launchApp }) => {
    const userData = newProfile()
    // A directory where the temp file must go makes every atomic write fail.
    mkdirSync(join(userData, 'progress.json.tmp'))
    const { page } = await launchApp({ userData, language: 'en' })
    await answerOne(page)
    await expect(page.getByRole('alert')).toHaveText('Your progress could not be saved. Please restart the app.')
    // The drill itself keeps working.
    await page.keyboard.press('Enter')
    await expect(page.getByText('Question 2 of 10')).toBeVisible()
  })

  test('DAT-03 a failed settings save shows an alert and the language does not falsely switch', async ({ launchApp }) => {
    const userData = newProfile()
    writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
    mkdirSync(join(userData, 'settings.json.tmp'))
    const { page, settingsFile } = await launchApp({ userData })
    await nav(page, 'Settings')
    await page.getByRole('radio', { name: /ภาษาไทย/ }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('radio', { name: /English/ })).toBeChecked()
    expect(JSON.parse(readFileSync(settingsFile, 'utf8')).language).toBe('en')
  })

  test('DAT-04 progress survives a restart and no temp files are left behind', async ({ launchApp }) => {
    const first = await launchApp()
    await nav(first.page, 'Topic drills')
    await first.page.getByRole('link', { name: /Prepositions/ }).click()
    const item = await currentPart5(first.page, 'prepositions')
    await choiceByText(first.page, item.choices[item.answer]).click()
    await expect.poll(() => progressOf(first.progressFile)?.grammarAttempts?.length ?? 0).toBe(1)
    await first.app.close()
    expect(readdirSync(first.userData).filter((f) => f.endsWith('.tmp'))).toEqual([])

    const second = await launchApp({ userData: first.userData })
    await nav(second.page, 'Topic drills')
    await expect(second.page.getByRole('link', { name: /Prepositions/ })).toContainText('100% right lately')
  })

  test('DAT-05 a malformed saved test is dropped on its own; the rest of the history is kept', async ({ launchApp }) => {
    const item = part5('pronouns')[0]
    const progress = {
      ...emptyProgress(),
      grammarAttempts: Array.from({ length: 5 }, () => ({
        itemId: item.id,
        topic: 'pronouns',
        correct: false,
        ms: 5000,
        at: '2026-10-01T00:00:00Z'
      })),
      activeReadingTest: { length: 'weird', ids: 'nope' }
    }
    const { page, userData } = await launchApp({ progress })
    await nav(page, 'Progress')
    await expect(page.locator('.weak-list')).toContainText('Pronouns')
    expect(readdirSync(userData).some((f) => f.includes('corrupt'))).toBe(false)
    await nav(page, 'Reading test')
    await expect(page.getByRole('button', { name: /Resume/ })).toHaveCount(0)
  })

  test('DAT-06 a second app instance on the same profile exits and the first keeps running', async ({ launchApp }) => {
    const first = await launchApp()
    const env: Record<string, string> = {}
    for (const [k, v] of Object.entries(process.env)) if (v !== undefined && k !== 'ELECTRON_RUN_AS_NODE') env[k] = v
    env.TOEIC_USER_DATA = first.userData
    let secondWindows = -1
    try {
      const second = await electron.launch({ args: ['.'], env, timeout: 15_000 })
      await new Promise((r) => setTimeout(r, 2000))
      secondWindows = second.windows().length
      await second.close().catch(() => {})
    } catch {
      secondWindows = 0 // process quit before Playwright could attach: also an exit
    }
    expect(secondWindows).toBe(0)
    await nav(first.page, 'Settings')
    await expect(first.page.getByRole('heading', { level: 1 })).toHaveText('Settings')
  })

  test('DAT-07 a progress.json from an unknown future version is backed up, not silently overwritten', async ({ launchApp }) => {
    const userData = newProfile()
    const future = JSON.stringify({ ...emptyProgress(), version: 2 })
    writeFileSync(join(userData, 'progress.json'), future)
    writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'en' }))
    await launchApp({ userData })
    const backup = readdirSync(userData).find((f) => f.startsWith('progress.json.corrupt-'))
    expect(backup).toBeDefined()
    expect(readFileSync(join(userData, backup!), 'utf8')).toBe(future)
    expect(existsSync(join(userData, 'progress.json'))).toBe(false)
  })
})
