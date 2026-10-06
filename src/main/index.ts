import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { registerIpc } from './ipc'
import { contentRoot } from './paths'
import { createStore } from './store'

if (!app.isPackaged && process.env.TOEIC_USER_DATA) app.setPath('userData', process.env.TOEIC_USER_DATA)

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
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
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.whenReady().then(() => {
    registerIpc({
      store: createStore(app.getPath('userData')),
      contentRoot: contentRoot(),
      isDev: !app.isPackaged
    })
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
