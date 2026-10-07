import { readdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { expect, goHash, nav, newProfile, readJsonFile, test } from './helpers'

const SCREENS: [link: string, heading: RegExp][] = [
  ['Home', /Today/],
  ['Topic drills', /^Topic drills \(Part 5\)$/],
  ['Reading (Part 7)', /^Reading \(Part 7\)$/],
  ['Mixed test', /^Mixed test \(Part 5 \+ 6\)$/],
  ['Reading test', /^Reading test$/],
  ['Review', /^Review$/],
  ['Progress', /^Progress$/],
  ['Settings', /^Settings$/],
  ['Content review', /^Content review$/]
]

test.describe('Navigation', () => {
  test('NAV-01 every rail link opens its screen and marks itself current', async ({ launchApp }) => {
    const { page, errors } = await launchApp()
    for (const [link, heading] of SCREENS) {
      await nav(page, link)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading)
      await expect(page.locator('nav.rail-nav').getByRole('link', { name: link, exact: true })).toHaveAttribute(
        'aria-current',
        'page'
      )
      await expect(page.locator('nav.rail-nav [aria-current="page"]')).toHaveCount(1)
    }
    expect(errors).toEqual([])
  })

  test('NAV-02 brand link returns to Home from any screen', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Settings')
    await page.getByRole('link', { name: 'TOEIC Trainer' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Today')
  })

  test('NAV-03 a drill URL with an unknown topic redirects to the topic list', async ({ launchApp }) => {
    const { page } = await launchApp()
    await goHash(page, '#/drill/not-a-topic')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Topic drills (Part 5)')
    expect(await page.evaluate(() => location.hash)).toBe('#/topics')
  })

  test('NAV-04 an unknown route shows something instead of a blank content area', async ({ launchApp }) => {
    test.fail(true, 'BUG-05: no catch-all route; the content area renders empty')
    const { page } = await launchApp()
    await goHash(page, '#/does-not-exist')
    await expect(page.locator('main.content h1')).toBeVisible({ timeout: 3000 })
  })

  test('NAV-05 Home call-to-action with nothing due leads to Topic drills', async ({ launchApp }) => {
    const { page } = await launchApp()
    await expect(page.locator('.poster-head')).toContainText('Start here')
    await page.locator('.poster-actions').getByRole('link', { name: 'Topic drills' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Topic drills (Part 5)')
  })

  test('NAV-06 all 13 Part 5 topics are listed and each opens a 10-question drill', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Topic drills')
    const tiles = page.locator('ul.tile-grid a.tile')
    await expect(tiles).toHaveCount(13)
    for (let i = 0; i < 13; i++) {
      await nav(page, 'Topic drills')
      await page.locator('ul.tile-grid a.tile').nth(i).click()
      await expect(page.getByText('Question 1 of 10')).toBeVisible()
    }
  })
})

test.describe('Language (i18n)', () => {
  test('I18N-01 first run defaults to Thai UI and lang="th"', async ({ launchApp }) => {
    const { page } = await launchApp({ language: null })
    await expect(page.locator('nav.rail-nav').getByRole('link', { name: 'หน้าแรก' })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'th')
    await expect(page.locator('.app')).toHaveAttribute('data-lang', 'th')
  })

  test('I18N-02 switching to English updates the UI live, persists, and survives a restart', async ({ launchApp }) => {
    const first = await launchApp({ language: null })
    await first.page.locator('nav.rail-nav').getByRole('link', { name: 'ตั้งค่า' }).click()
    await first.page.getByRole('radio', { name: /English/ }).click()
    await expect(first.page.getByRole('radio', { name: /English/ })).toBeChecked()
    await expect(first.page.locator('nav.rail-nav').getByRole('link', { name: 'Settings', exact: true })).toBeVisible()
    await expect(first.page.locator('html')).toHaveAttribute('lang', 'en')
    await expect.poll(() => readJsonFile(first.settingsFile)?.language).toBe('en')
    await first.app.close()

    const second = await launchApp({ userData: first.userData })
    await expect(second.page.locator('nav.rail-nav').getByRole('link', { name: 'Home', exact: true })).toBeVisible()
    await nav(second.page, 'Settings')
    await expect(second.page.getByRole('radio', { name: /English/ })).toBeChecked()
  })

  test('I18N-03 an invalid language in settings.json falls back to Thai and quarantines the file', async ({ launchApp }) => {
    const userData = newProfile()
    writeFileSync(join(userData, 'settings.json'), JSON.stringify({ language: 'fr' }))
    const { page } = await launchApp({ userData })
    await expect(page.locator('nav.rail-nav').getByRole('link', { name: 'หน้าแรก' })).toBeVisible()
    expect(readdirSync(userData).some((f) => f.startsWith('settings.json.corrupt-'))).toBe(true)
  })

  test('I18N-04 Thai and English UIs both render every rail link with non-empty text', async ({ launchApp }) => {
    for (const language of ['th', 'en'] as const) {
      const { page, app } = await launchApp({ language })
      const names = await page.locator('nav.rail-nav a').allInnerTexts()
      expect(names.length).toBeGreaterThanOrEqual(8)
      for (const n of names) expect(n.trim()).not.toBe('')
      await app.close()
    }
  })

  test('I18N-05 bundled Kanit and Anuphan fonts load with no network requests', async ({ launchApp }) => {
    const { page } = await launchApp({ language: 'th' })
    const external: string[] = []
    page.on('request', (r) => {
      if (/^https?:/.test(r.url())) external.push(r.url())
    })
    await nav(page, 'ตั้งค่า')
    await nav(page, 'หน้าแรก')
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready
      return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''))
    })
    expect(loaded.some((f) => /Kanit/.test(f))).toBe(true)
    expect(loaded.some((f) => /Anuphan/.test(f))).toBe(true)
    expect(external).toEqual([])
  })
})
