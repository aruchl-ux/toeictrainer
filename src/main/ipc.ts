import { ipcMain } from 'electron'
import { IPC } from '@shared/api'
import {
  ActiveReadingTest,
  FinishReadingTest,
  GrammarAttempt,
  MixedTestResult,
  ReadingAttempt,
  SettingsPatch,
  UiMode,
  type Settings
} from '@shared/types'
import { loadContent } from './content'
import { approveDraft, listDrafts, rejectDraft } from './drafts'
import type { Store } from './store'

export interface IpcDeps {
  store: Store
  contentRoot: string
  isDev: boolean
  /** Reloads the sender's window into the chosen view. */
  setMode(sender: Electron.WebContents, mode: UiMode): void
  /** Called after every successful settings write (window chrome follows the Office theme). */
  onSettings(settings: Settings): void
}

export function registerIpc({ store, contentRoot, isDev, setMode, onSettings }: IpcDeps): void {
  ipcMain.handle(IPC.contentBank, () => {
    const { bank, errors } = loadContent(contentRoot)
    for (const e of errors) console.error('[content]', e)
    return bank
  })
  ipcMain.handle(IPC.progressGet, () => store.getProgress())
  ipcMain.handle(IPC.progressRecordGrammar, (_e, a: unknown) =>
    store.recordGrammar(GrammarAttempt.parse(a))
  )
  ipcMain.handle(IPC.progressRecordMixed, (_e, r: unknown) =>
    store.recordMixedTest(MixedTestResult.parse(r))
  )
  ipcMain.handle(IPC.progressRecordReading, (_e, a: unknown) => store.recordReading(ReadingAttempt.parse(a)))
  ipcMain.handle(IPC.progressSaveActiveTest, (_e, t: unknown) =>
    store.saveActiveTest(t === null ? null : ActiveReadingTest.parse(t))
  )
  ipcMain.handle(IPC.progressFinishReadingTest, (_e, f: unknown) => store.finishReadingTest(FinishReadingTest.parse(f)))
  ipcMain.handle(IPC.settingsGet, () => store.getSettings())
  ipcMain.handle(IPC.settingsSet, (_e, patch: unknown) => {
    const settings = store.setSettings(SettingsPatch.parse(patch))
    onSettings(settings)
    return settings
  })
  ipcMain.handle(IPC.appSetMode, (e, mode: unknown) => {
    const m = UiMode.parse(mode)
    store.setSettings({ uiMode: m })
    setMode(e.sender, m)
  })
  ipcMain.handle(IPC.devIsDev, () => isDev)
  if (isDev) {
    ipcMain.handle(IPC.devListDrafts, () => listDrafts(contentRoot))
    ipcMain.handle(IPC.devApproveDraft, (_e, file: string, id: string, item: unknown) =>
      approveDraft(contentRoot, file, id, item)
    )
    ipcMain.handle(IPC.devRejectDraft, (_e, file: string, id: string) => rejectDraft(contentRoot, file, id))
  }
}
