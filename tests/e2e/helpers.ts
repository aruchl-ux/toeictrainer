import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { _electron as electron, test as base, type ElectronApplication, type Page } from '@playwright/test'

export { expect } from '@playwright/test'

const ROOT = join(__dirname, '../..')

export interface LaunchOptions {
  /** Reuse an existing profile (relaunch). A fresh temp profile is made when omitted. */
  userData?: string
  /** Written to settings.json before launch. `null` leaves settings.json absent (first run). */
  language?: 'th' | 'en' | null
  /** Written to progress.json before launch. */
  progress?: unknown
}

export interface Launched {
  app: ElectronApplication
  page: Page
  userData: string
  progressFile: string
  settingsFile: string
  /** Console errors and uncaught page errors seen since launch. */
  errors: string[]
}

function launchEnv(userData: string): Record<string, string> {
  const env: Record<string, string> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && k !== 'ELECTRON_RUN_AS_NODE') env[k] = v
  }
  env.TOEIC_USER_DATA = userData
  return env
}

export function newProfile(): string {
  return mkdtempSync(join(tmpdir(), 'toeic-e2e-'))
}

export const test = base.extend<{ launchApp: (opts?: LaunchOptions) => Promise<Launched> }>({
  launchApp: async ({}, use) => {
    const apps: ElectronApplication[] = []
    await use(async (opts = {}) => {
      const userData = opts.userData ?? newProfile()
      const progressFile = join(userData, 'progress.json')
      const settingsFile = join(userData, 'settings.json')
      const language = opts.language === undefined && !opts.userData ? 'en' : opts.language
      if (language) writeFileSync(settingsFile, JSON.stringify({ language }))
      if (opts.progress !== undefined) writeFileSync(progressFile, JSON.stringify(opts.progress))
      const app = await electron.launch({ args: ['.'], cwd: ROOT, env: launchEnv(userData) })
      apps.push(app)
      const page = await app.firstWindow()
      const errors: string[] = []
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text())
      })
      page.on('pageerror', (e) => errors.push(String(e)))
      await page.locator('nav').waitFor()
      return { app, page, userData, progressFile, settingsFile, errors }
    })
    for (const app of apps) await app.close().catch(() => {})
  }
})

export function readJsonFile(file: string): any {
  try {
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null
  } catch {
    return null
  }
}

export function progressOf(file: string): any {
  return readJsonFile(file)
}

export function emptyProgress(): Record<string, unknown> {
  return {
    version: 1,
    grammarAttempts: [],
    leitner: {},
    mixedTests: [],
    readingAttempts: [],
    readingTests: [],
    activeReadingTest: null
  }
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---- Content bank (approved items only, as the app loads them) ----

export interface Part5Item {
  id: string
  topic: string
  stem: string
  choices: string[]
  answer: number
  trap: string
  explain: { th: string; en: string }
  status: string
}

export function part5(topic: string): Part5Item[] {
  const items = JSON.parse(readFileSync(join(ROOT, 'content/grammar/part5', `${topic}.json`), 'utf8')) as Part5Item[]
  return items.filter((i) => i.status === 'approved')
}

export function part7(format: 'single' | 'double' | 'triple'): any[] {
  const sets = JSON.parse(readFileSync(join(ROOT, 'content/reading/part7', `${format}.json`), 'utf8')) as any[]
  return sets.filter((s) => s.status === 'approved')
}

/** The Part 5 item whose stem is on screen. */
export async function currentPart5(page: Page, topic: string): Promise<Part5Item> {
  const stem = (await page.locator('.stem').innerText()).trim()
  const item = part5(topic).find((i) => i.stem.trim() === stem)
  if (!item) throw new Error(`stem not found in ${topic}: ${stem}`)
  return item
}

/** The choice button whose text is exactly `text` (choices are shuffled on screen). */
export function choiceByText(page: Page, text: string) {
  return page.locator('button.choice').filter({ has: page.locator('.choice-text').getByText(text, { exact: true }) })
}

export async function nav(page: Page, name: string): Promise<void> {
  await page.locator('nav.rail-nav').getByRole('link', { name, exact: true }).click()
}

/** Route change the way a deep link would, leaving focus on the page body (not on a rail link). */
export async function goHash(page: Page, hash: string): Promise<void> {
  await page.evaluate((h) => {
    ;(document.activeElement as HTMLElement | null)?.blur()
    window.location.hash = h
  }, hash)
}

/** Wait until a question's choices are on screen and their key handler is live. */
export async function questionReady(page: Page): Promise<void> {
  await page.locator('button.choice').first().waitFor()
  await page.waitForTimeout(50)
}

/** Resolve once every running CSS animation/transition has finished. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))))
}
