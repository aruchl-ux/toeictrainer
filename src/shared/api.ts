import type {
  ActiveReadingTest,
  ContentBank,
  FinishReadingTest,
  GrammarAttempt,
  MixedTestResult,
  Progress,
  ReadingAttempt,
  Settings,
  SettingsPatch
} from './types'

export interface DraftEntry {
  file: string
  id: string
  item: Record<string, unknown>
}

export type DraftResult = { ok: true } | { ok: false; error: string }

export const IPC = {
  contentBank: 'content:bank',
  progressGet: 'progress:get',
  progressRecordGrammar: 'progress:recordGrammar',
  progressRecordMixed: 'progress:recordMixedTest',
  progressRecordReading: 'progress:recordReading',
  progressSaveActiveTest: 'progress:saveActiveTest',
  progressFinishReadingTest: 'progress:finishReadingTest',
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  devIsDev: 'dev:isDev',
  devListDrafts: 'dev:listDrafts',
  devApproveDraft: 'dev:approveDraft',
  devRejectDraft: 'dev:rejectDraft'
} as const

export interface Api {
  content: { bank(): Promise<ContentBank> }
  progress: {
    get(): Promise<Progress>
    recordGrammar(a: GrammarAttempt): Promise<Progress>
    recordMixedTest(r: MixedTestResult): Promise<Progress>
    recordReading(a: ReadingAttempt): Promise<Progress>
    saveActiveTest(t: ActiveReadingTest | null): Promise<Progress>
    finishReadingTest(f: FinishReadingTest): Promise<Progress>
  }
  settings: {
    get(): Promise<Settings>
    set(patch: SettingsPatch): Promise<Settings>
  }
  dev: {
    isDev(): Promise<boolean>
    listDrafts(): Promise<DraftEntry[]>
    approveDraft(file: string, id: string, item: unknown): Promise<DraftResult>
    rejectDraft(file: string, id: string): Promise<void>
  }
}
