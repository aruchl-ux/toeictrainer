import { ipcMain } from 'electron'
import { IPC } from '@shared/api'
import { GrammarAttempt, MixedTestResult, SettingsPatch } from '@shared/types'
import { loadContent } from './content'
import { approveDraft, listDrafts, rejectDraft } from './drafts'
import type { Store } from './store'

export interface IpcDeps {
  store: Store
  contentRoot: string
  isDev: boolean
}

export function registerIpc({ store, contentRoot, isDev }: IpcDeps): void {
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
  ipcMain.handle(IPC.settingsGet, () => store.getSettings())
  ipcMain.handle(IPC.settingsSet, (_e, patch: unknown) => store.setSettings(SettingsPatch.parse(patch)))
  ipcMain.handle(IPC.devIsDev, () => isDev)
  if (isDev) {
    ipcMain.handle(IPC.devListDrafts, () => listDrafts(contentRoot))
    ipcMain.handle(IPC.devApproveDraft, (_e, file: string, id: string, item: unknown) =>
      approveDraft(contentRoot, file, id, item)
    )
    ipcMain.handle(IPC.devRejectDraft, (_e, file: string, id: string) => rejectDraft(contentRoot, file, id))
  }
}
