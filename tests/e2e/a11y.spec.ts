import type { Page } from '@playwright/test'
import { emptyProgress, expect, goHash, nav, questionReady, settle, test } from './helpers'

const at = '2026-10-01T09:00:00.000Z'
const withStats = {
  ...emptyProgress(),
  grammarAttempts: Array.from({ length: 6 }, (_, i) => ({ itemId: `p5-x${i}`, topic: 'pronouns', correct: i % 2 === 0, ms: 4000, at })),
  readingAttempts: [{ itemId: 'p7-0001#q1', qtype: 'detail', correct: true, ms: 30_000, at }]
}

/** Static a11y audit of what is on screen: names, headings, hidden decoration, labelled controls. */
async function audit(page: Page) {
  return page.evaluate(() => {
    const issues: string[] = []
    const visible = (el: Element) => {
      const r = (el as HTMLElement).getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
    }
    const name = (el: Element) => {
      const lb = el.getAttribute('aria-labelledby')
      if (lb) return lb.split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ').trim()
      return (el.getAttribute('aria-label') ?? (el as HTMLElement).innerText ?? '').trim()
    }
    const h1 = [...document.querySelectorAll('h1')].filter(visible)
    if (h1.length !== 1) issues.push(`expected 1 visible h1, found ${h1.length}`)
    for (const el of document.querySelectorAll('button, a[href], [role="button"], [role="tab"]')) {
      if (visible(el) && !name(el)) issues.push(`unnamed ${el.tagName.toLowerCase()}.${(el as HTMLElement).className}`)
    }
    for (const input of document.querySelectorAll('input, select, textarea')) {
      const labelled = input.closest('label') || input.getAttribute('aria-label') || (input.id && document.querySelector(`label[for="${input.id}"]`))
      if (!labelled) issues.push(`unlabelled ${input.tagName.toLowerCase()}`)
    }
    for (const svg of document.querySelectorAll('svg')) {
      const hidden = svg.closest('[aria-hidden="true"]')
      if (!hidden && !(svg.getAttribute('role') === 'img' && svg.getAttribute('aria-label'))) issues.push('svg not hidden and not labelled')
    }
    if (!document.documentElement.lang) issues.push('html has no lang')
    return issues
  })
}

function luminance([r, g, b]: number[]) {
  const c = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

/** Text-vs-background contrast for visible text in the content and the rail (WCAG 1.4.3). */
async function contrastFailures(page: Page, scope = 'body') {
  const samples = await page.evaluate((scope) => {
    const parse = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number)
    const bgOf = (el: Element | null): number[] => {
      const layers: number[][] = []
      for (let e = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor)
        const a = c.length === 4 ? c[3] : 1
        if (a > 0) layers.push([c[0], c[1], c[2], a])
        if (a >= 1) break
      }
      let out = [255, 255, 255]
      for (const [r, g, b, a] of layers.reverse()) out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), b * a + out[2] * (1 - a)]
      return out
    }
    const out: { text: string; fg: number[]; bg: number[]; size: number; weight: number; opacity: number }[] = []
    const walker = document.createTreeWalker(document.querySelector(scope)!, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement
      if (!el || !n.textContent?.trim()) continue
      if (el.closest('[aria-hidden="true"], .sr-only, button:disabled, [aria-disabled="true"]')) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const cs = getComputedStyle(el)
      let opacity = 1
      for (let e: Element | null = el; e; e = e.parentElement) opacity *= Number(getComputedStyle(e).opacity)
      const fg = parse(cs.color)
      out.push({ text: n.textContent.trim().slice(0, 40), fg, bg: bgOf(el), size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), opacity })
    }
    return out
  }, scope)
  const fails: string[] = []
  for (const s of samples) {
    const a = (s.fg[3] ?? 1) * s.opacity
    const fg = s.fg.slice(0, 3).map((v, i) => v * a + s.bg[i] * (1 - a))
    const [l1, l2] = [luminance(fg), luminance(s.bg)].sort((x, y) => y - x)
    const ratio = (l1 + 0.05) / (l2 + 0.05)
    const large = s.size >= 24 || (s.size >= 18.66 && s.weight >= 700)
    if (ratio < (large ? 3 : 4.5)) fails.push(`${ratio.toFixed(2)}:1 "${s.text}"`)
  }
  return [...new Set(fails)]
}

const ROUTES: [string, string][] = [
  ['Home', '#/'],
  ['Topics', '#/topics'],
  ['Reading', '#/reading'],
  ['Mixed', '#/mixed'],
  ['Reading test', '#/reading-test'],
  ['Review', '#/review'],
  ['Progress', '#/progress'],
  ['Settings', '#/settings']
]

test.describe('Accessibility', () => {
  for (const lang of ['en', 'th'] as const) {
    test(`A11Y-01 [${lang}] every screen has one h1, named controls, labelled inputs and hidden decoration`, async ({ launchApp }) => {
      const { page } = await launchApp({ language: lang, progress: withStats })
      const report: Record<string, string[]> = {}
      for (const [label, hash] of ROUTES) {
        await goHash(page, hash)
        await page.locator('main h1').first().waitFor()
        report[label] = await audit(page)
      }
      await goHash(page, '#/drill/prepositions')
      await questionReady(page)
      await page.keyboard.press('A')
      await page.locator('.explain').waitFor()
      report['Drill (answered)'] = await audit(page)
      expect(report).toEqual(Object.fromEntries(Object.keys(report).map((k) => [k, []])))
    })
  }

  test('A11Y-02 Tab moves through the rail in order with a visible focus ring', async ({ launchApp }) => {
    const { page } = await launchApp()
    await page.locator('body').focus()
    const seen: { text: string; outline: string }[] = []
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      seen.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement
          const cs = getComputedStyle(el)
          return { text: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim(), outline: `${cs.outlineStyle} ${cs.outlineWidth}` }
        })
      )
    }
    expect(seen.map((s) => s.text)).toEqual([
      'TOEIC Trainer',
      'Home',
      'Topic drills',
      'Reading (Part 7)',
      'Mixed test',
      'Reading test',
      'Review',
      'Progress',
      'Settings',
      'Content review'
    ])
    for (const s of seen) expect(s.outline).not.toMatch(/^none|\b0px$/)
  })

  test('A11Y-03 a drill can be answered with Tab + Space on a choice button', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Topic drills')
    await page.getByRole('link', { name: /Pronouns/ }).click()
    await page.locator('button.choice').first().focus()
    await page.keyboard.press('Space')
    await expect(page.locator('.explain')).toBeVisible()
  })

  test('A11Y-04 after a mouse answer, Enter moves to the next question (keyboard and mouse can be mixed)', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Topic drills')
    await page.getByRole('link', { name: /Pronouns/ }).click()
    await page.locator('button.choice').first().click()
    await expect(page.locator('.explain')).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.getByText('Question 2 of 10')).toBeVisible({ timeout: 3000 })
  })

  test('A11Y-05 every data-table column has a header with text', async ({ launchApp }) => {
    test.fail(true, 'BUG-03: Progress Part 7 table has an empty <td> in its header row')
    const { page } = await launchApp({ progress: withStats })
    await nav(page, 'Progress')
    await expect(page.locator('table.stats')).toHaveCount(2)
    const empty = await page.evaluate(() =>
      [...document.querySelectorAll('table.stats thead tr')].flatMap((tr, t) =>
        [...tr.children].map((c, i) => ({ t, i, tag: c.tagName, text: (c.textContent ?? '').trim() })).filter((c) => c.tag !== 'TH' || !c.text)
      )
    )
    expect(empty).toEqual([])
  })

  test('A11Y-06 the reading-test map exposes state in each cell name; the timer has role="timer"', async ({ launchApp }) => {
    const { page } = await launchApp()
    await nav(page, 'Reading test')
    await page.getByRole('button', { name: /Start test/ }).click()
    await expect(page.getByRole('timer')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Reading test' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Question 1, unanswered' })).toHaveAttribute('aria-current', 'true')
    await page.keyboard.press('A')
    await expect(page.getByRole('button', { name: 'Question 1, answered' })).toBeVisible()
  })

  test('A11Y-07 text contrast meets WCAG AA (4.5:1, 3:1 for large text) on key screens', async ({ launchApp }) => {
    const { page } = await launchApp({ progress: withStats })
    const report: Record<string, string[]> = {}
    for (const [label, hash] of ROUTES) {
      await goHash(page, hash)
      await page.locator('main h1').first().waitFor()
      await settle(page)
      report[label] = await contrastFailures(page)
    }
    await goHash(page, '#/drill/prepositions')
    await questionReady(page)
    await settle(page)
    report['Drill (question)'] = await contrastFailures(page, 'main')
    await page.keyboard.press('A')
    await page.locator('.explain').waitFor()
    await settle(page)
    report['Drill (answered)'] = await contrastFailures(page, 'main')
    expect(report).toEqual(Object.fromEntries(Object.keys(report).map((k) => [k, []])))
  })

  test('A11Y-08 reduced-motion users get no long animations or transitions', async ({ launchApp }) => {
    const { page } = await launchApp()
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await nav(page, 'Topic drills')
    await page.getByRole('link', { name: /Pronouns/ }).click()
    const slow = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((el) => {
          const cs = getComputedStyle(el)
          const max = (v: string) => Math.max(...v.split(',').map((x) => parseFloat(x) * (x.trim().endsWith('ms') ? 1 : 1000)))
          return { el: `${el.tagName.toLowerCase()}.${el.className}`, ms: Math.max(max(cs.transitionDuration), cs.animationName !== 'none' ? max(cs.animationDuration) : 0) }
        })
        .filter((x) => x.ms > 100)
    )
    expect(slow).toEqual([])
  })

  test('A11Y-09 a running Reading test has a page heading (h1)', async ({ launchApp }) => {
    test.fail(true, 'BUG-02: the running Reading test renders no h1')
    const { page } = await launchApp()
    await nav(page, 'Reading test')
    await page.getByRole('button', { name: /Start test/ }).click()
    await page.getByRole('timer').waitFor()
    expect(await audit(page)).toEqual([])
  })

  test('A11Y-10 rail text stays readable (AA contrast) while a question is on screen', async ({ launchApp }) => {
    test.fail(true, 'BUG-04: the rail is dimmed during questions; "Nothing due today" drops to ~1.9:1')
    const { page } = await launchApp()
    await goHash(page, '#/drill/prepositions')
    await questionReady(page)
    await settle(page)
    expect(await contrastFailures(page, 'aside')).toEqual([])
  })
})
