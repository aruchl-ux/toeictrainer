import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type Api } from '@shared/api'

const api: Api = {
  content: { bank: () => ipcRenderer.invoke(IPC.contentBank) },
  progress: {
    get: () => ipcRenderer.invoke(IPC.progressGet),
    recordGrammar: (a) => ipcRenderer.invoke(IPC.progressRecordGrammar, a),
    recordMixedTest: (r) => ipcRenderer.invoke(IPC.progressRecordMixed, r)
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC.settingsGet),
    set: (patch) => ipcRenderer.invoke(IPC.settingsSet, patch)
  },
  dev: {
    isDev: () => ipcRenderer.invoke(IPC.devIsDev),
    listDrafts: () => ipcRenderer.invoke(IPC.devListDrafts),
    approveDraft: (file, id, item) => ipcRenderer.invoke(IPC.devApproveDraft, file, id, item),
    rejectDraft: (file, id) => ipcRenderer.invoke(IPC.devRejectDraft, file, id)
  }
}

contextBridge.exposeInMainWorld('api', api)
