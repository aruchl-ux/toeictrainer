import type {
  ContentBank,
  GrammarAttempt,
  MixedTestResult,
  Progress,
  Settings,
  SettingsPatch
} from './types'

export const IPC = {
  contentBank: 'content:bank',
  progressGet: 'progress:get',
  progressRecordGrammar: 'progress:recordGrammar',
  progressRecordMixed: 'progress:recordMixedTest',
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  devIsDev: 'dev:isDev'
} as const

export interface Api {
  content: { bank(): Promise<ContentBank> }
  progress: {
    get(): Promise<Progress>
    recordGrammar(a: GrammarAttempt): Promise<Progress>
    recordMixedTest(r: MixedTestResult): Promise<Progress>
  }
  settings: {
    get(): Promise<Settings>
    set(patch: SettingsPatch): Promise<Settings>
  }
  dev: { isDev(): Promise<boolean> }
}
