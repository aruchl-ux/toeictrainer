import { readFileSync } from 'fs'
import { expect, progressOf, readJsonFile, test } from './helpers'

test.describe('Security: renderer isolation and IPC hardening', () => {
  test('SEC-01 the renderer has no Node access and only the typed window.api bridge', async ({ launchApp }) => {
    const { page } = await launchApp()
    const probe = await page.evaluate(() => ({
      require: typeof (window as any).require,
      process: typeof (window as any).process,
      module: typeof (window as any).module,
      Buffer: typeof (window as any).Buffer,
      api: Object.keys((window as any).api).sort()
    }))
    expect(probe).toEqual({
      require: 'undefined',
      process: 'undefined',
      module: 'undefined',
      Buffer: 'undefined',
      api: ['content', 'dev', 'progress', 'settings']
    })
    // contextBridge objects are frozen copies: page scripts cannot swap the bridge's functions.
    const tampered = await page.evaluate(() => {
      try {
        ;(window as any).api.progress.get = () => 'hacked'
      } catch {
        /* frozen */
      }
      return (window as any).api.progress.get === undefined || String((window as any).api.progress.get()) === 'hacked'
    })
    expect(tampered).toBe(false)
  })

  test('SEC-02 a Content-Security-Policy blocks inline script injection', async ({ launchApp }) => {
    const { page } = await launchApp()
    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')
    expect(csp).toContain("script-src 'self'")
    const ran = await page.evaluate(async () => {
      const s = document.createElement('script')
      s.textContent = 'window.__xss = true'
      document.body.appendChild(s)
      const img = document.createElement('img')
      img.setAttribute('src', 'x')
      img.setAttribute('onerror', 'window.__xss2 = true')
      document.body.appendChild(img)
      await new Promise((r) => setTimeout(r, 300))
      return { inline: (window as any).__xss === true, handler: (window as any).__xss2 === true }
    })
    expect(ran).toEqual({ inline: false, handler: false })
  })

  test('SEC-03 the window cannot navigate away from the app', async ({ launchApp }) => {
    const { page } = await launchApp()
    const before = page.url()
    await page.evaluate(() => {
      window.location.href = 'https://example.com/'
    })
    await page.waitForTimeout(800)
    expect(page.url()).toBe(before)
    // Read the DOM directly: Playwright locators would wait on the cancelled navigation.
    expect(await page.evaluate(() => document.querySelectorAll('nav.rail-nav a').length)).toBeGreaterThanOrEqual(8)
  })

  test('SEC-04 window.open never opens an in-app window; only https goes to the system browser', async ({ launchApp }) => {
    const { app, page } = await launchApp()
    // Stub the system browser so the test never opens a real one.
    const stubbed = await app.evaluate(({ shell }) => {
      ;(globalThis as any).__opened = []
      ;(shell as any).openExternal = async (u: string) => {
        ;(globalThis as any).__opened.push(u)
      }
      return String(shell.openExternal).includes('__opened')
    })
    expect(stubbed).toBe(true)
    await page.evaluate(() => {
      window.open('http://example.com/insecure')
      window.open('file:///C:/Windows/win.ini')
      window.open('javascript:alert(1)')
      window.open('https://example.com/ok')
    })
    await page.waitForTimeout(500)
    expect(app.windows()).toHaveLength(1)
    expect(await app.evaluate(() => (globalThis as any).__opened)).toEqual(['https://example.com/ok'])
  })

  test('SEC-05 IPC rejects malformed progress and settings payloads without touching disk', async ({ launchApp }) => {
    const { page, progressFile, settingsFile } = await launchApp()
    const settingsBefore = readFileSync(settingsFile, 'utf8')
    const results = await page.evaluate(async () => {
      const api = (window as any).api
      const tryCall = async (f: () => Promise<unknown>) => {
        try {
          await f()
          return 'accepted'
        } catch {
          return 'rejected'
        }
      }
      return {
        emptyId: await tryCall(() => api.progress.recordGrammar({ itemId: '', topic: 'word-form', correct: true, ms: 1, at: 'x' })),
        badTopic: await tryCall(() => api.progress.recordGrammar({ itemId: 'p5-x', topic: 'hacking', correct: true, ms: 1, at: 'x' })),
        negMs: await tryCall(() => api.progress.recordGrammar({ itemId: 'p5-x', topic: 'word-form', correct: true, ms: -5, at: 'x' })),
        badReadingId: await tryCall(() =>
          api.progress.recordReading({ itemId: '../../etc', qtype: 'detail', correct: true, ms: 1, at: 'x' })
        ),
        badMixed: await tryCall(() => api.progress.recordMixedTest({ at: 'x', correct: 5, total: 0, ms: 1 })),
        badLang: await tryCall(() => api.settings.set({ language: 'fr' }))
      }
    })
    expect(results).toEqual({
      emptyId: 'rejected',
      badTopic: 'rejected',
      negMs: 'rejected',
      badReadingId: 'rejected',
      badMixed: 'rejected',
      badLang: 'rejected'
    })
    expect(progressOf(progressFile)).toBeNull()
    expect(readFileSync(settingsFile, 'utf8')).toBe(settingsBefore)
  })

  test('SEC-06 unknown settings keys are stripped before they are saved', async ({ launchApp }) => {
    const { page, settingsFile } = await launchApp()
    await page.evaluate(() => (window as any).api.settings.set({ language: 'th', isAdmin: true, __proto__: { polluted: 1 } }))
    expect(readJsonFile(settingsFile)).toEqual({ language: 'th' })
    expect(await page.evaluate(() => ({} as any).polluted)).toBeUndefined()
  })

  test('SEC-07 dev draft IPC refuses path traversal in draft file names', async ({ launchApp }) => {
    const { page } = await launchApp()
    const results = await page.evaluate(async () => {
      const api = (window as any).api.dev
      const tryCall = async (f: () => Promise<unknown>) => {
        try {
          const r = await f()
          return r && typeof r === 'object' && 'ok' in (r as object) && !(r as { ok: boolean }).ok ? 'refused' : 'accepted'
        } catch (e) {
          return String(e).includes('invalid draft file name') ? 'refused' : `error: ${String(e)}`
        }
      }
      return [
        await tryCall(() => api.rejectDraft('../qa-nonexistent.json', 'p5-x')),
        await tryCall(() => api.rejectDraft('..\\qa-nonexistent.json', 'p5-x')),
        await tryCall(() => api.rejectDraft('C:\\qa-nonexistent.json', 'p5-x')),
        await tryCall(() => api.approveDraft('../grammar/part5/qa-nonexistent.json', 'p5-x', {})),
        await tryCall(() => api.rejectDraft('qa-nonexistent.txt', 'p5-x'))
      ]
    })
    expect(results).toEqual(['refused', 'refused', 'refused', 'refused', 'refused'])
  })
})
