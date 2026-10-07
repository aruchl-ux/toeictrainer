import { app, BrowserWindow, globalShortcut, nativeTheme, shell } from 'electron'
import { join } from 'path'
import type { Settings, UiMode } from '@shared/types'
import { registerIpc } from './ipc'
import { contentRoot } from './paths'
import { createStore, type Store } from './store'

if (!app.isPackaged && process.env.TOEIC_USER_DATA) app.setPath('userData', process.env.TOEIC_USER_DATA)

/** Launch flag for the Office view (desktop shortcut, jump list task, `npm run dev:office`). */
const OFFICE_FLAG = '--office'
/** Hides the window from screen and taskbar; pressing it again brings it back. */
const BOSS_KEY = 'Control+Alt+H'

const PAGE: Record<UiMode, string> = { trainer: 'index.html', office: 'office.html' }

let mainWindow: BrowserWindow | null = null
let store: Store
let mode: UiMode = 'trainer'

const wantsOffice = (argv: string[]): boolean => argv.includes(OFFICE_FLAG)

function backgroundFor(m: UiMode, settings: Settings): string {
  if (m === 'trainer') return '#f3ead7'
  return settings.officeTheme === 'light' ? '#f7f6f3' : '#161615'
}

/** Native chrome (title bar, menu, window ground) follows the active view and the Office theme. */
function applyChrome(win: BrowserWindow, settings: Settings): void {
  const office = mode === 'office'
  nativeTheme.themeSource = office ? (settings.officeTheme ?? 'dark') : 'system'
  win.setBackgroundColor(backgroundFor(mode, settings))
  win.setAutoHideMenuBar(office)
  win.setMenuBarVisibility(!office)
}

function loadMode(win: BrowserWindow, next: UiMode): void {
  mode = next
  applyChrome(win, store.getSettings())
  const dev = !app.isPackaged ? process.env['ELECTRON_RENDERER_URL'] : undefined
  if (dev) void win.loadURL(`${dev}/${PAGE[next]}`)
  else void win.loadFile(join(__dirname, '../renderer', PAGE[next]))
}

function reveal(win: BrowserWindow): void {
  if (win.isMinimized()) win.restore()
  win.show()
  win.focus()
}

function toggleBossKey(): void {
  const win = mainWindow
  if (!win) return
  if (win.isVisible() && !win.isMinimized()) win.hide()
  else reveal(win)
}

function createWindow(initial: UiMode): void {
  mode = initial
  const win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: backgroundFor(initial, store.getSettings()),
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  mainWindow = win
  win.on('closed', () => {
    mainWindow = null
  })
  win.on('ready-to-show', () => win.show())
  win.webContents.on('will-navigate', (e, url) => {
    // Allow only dev-server reloads of the app itself.
    const dev = !app.isPackaged ? process.env['ELECTRON_RENDERER_URL'] : undefined
    if (!dev || !url.startsWith(dev)) e.preventDefault()
  })
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })
  loadMode(win, initial)
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', (_e, argv) => {
    if (!mainWindow) return
    // Opening the Office shortcut while the trainer runs switches the open window over.
    if (wantsOffice(argv) && mode !== 'office') loadMode(mainWindow, 'office')
    reveal(mainWindow)
  })

  app.whenReady().then(() => {
    store = createStore(app.getPath('userData'))
    registerIpc({
      store,
      contentRoot: contentRoot(),
      isDev: !app.isPackaged,
      setMode: (sender, next) => {
        const win = BrowserWindow.fromWebContents(sender)
        if (win) loadMode(win, next)
      },
      onSettings: (settings) => {
        if (mainWindow) applyChrome(mainWindow, settings)
      }
    })
    // The flag opens Office for this launch only; the saved choice comes from the in-app switch.
    createWindow(wantsOffice(process.argv) ? 'office' : (store.getSettings().uiMode ?? 'trainer'))
    if (!globalShortcut.register(BOSS_KEY, toggleBossKey)) console.warn(`[boss key] ${BOSS_KEY} is taken by another app`)
    if (process.platform === 'win32' && app.isPackaged) {
      app.setUserTasks([
        {
          program: process.execPath,
          arguments: OFFICE_FLAG,
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'Office mode',
          description: 'Open TOEIC Trainer in the Office view'
        }
      ])
    }
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow(mode)
    })
  })
}

app.on('will-quit', () => globalShortcut.unregisterAll())

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
