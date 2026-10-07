import { join } from 'path'
import { localDate } from '@shared/dates'
import {
  applyFinishedTest,
  applyGrammarAttempt,
  applyMixedTest,
  applyReadingAttempt,
  setActiveTest
} from '@shared/progress'
import {
  Progress,
  Settings,
  defaultSettings,
  emptyProgress,
  type ActiveReadingTest,
  type FinishReadingTest,
  type GrammarAttempt,
  type MixedTestResult,
  type ReadingAttempt,
  type SettingsPatch
} from '@shared/types'
import { readJson, writeJsonAtomic } from './jsonFile'

export interface Store {
  getProgress(): Progress
  recordGrammar(a: GrammarAttempt): Progress
  recordMixedTest(r: MixedTestResult): Progress
  recordReading(a: ReadingAttempt): Progress
  saveActiveTest(t: ActiveReadingTest | null): Progress
  finishReadingTest(f: FinishReadingTest): Progress
  getSettings(): Settings
  setSettings(patch: SettingsPatch): Settings
}

export function createStore(dir: string, today: () => string = () => localDate()): Store {
  const progressPath = join(dir, 'progress.json')
  const settingsPath = join(dir, 'settings.json')
  let progress = readJson(progressPath, Progress, emptyProgress)
  let settings = readJson(settingsPath, Settings, defaultSettings)

  const saveProgress = (next: Progress): Progress => {
    writeJsonAtomic(progressPath, next)
    progress = next
    return progress
  }

  return {
    getProgress: () => progress,
    recordGrammar: (a) => saveProgress(applyGrammarAttempt(progress, a, today())),
    recordMixedTest: (r) => saveProgress(applyMixedTest(progress, r)),
    recordReading: (a) => saveProgress(applyReadingAttempt(progress, a, today())),
    saveActiveTest: (t) => saveProgress(setActiveTest(progress, t)),
    finishReadingTest: (f) => saveProgress(applyFinishedTest(progress, f, today())),
    getSettings: () => settings,
    setSettings(patch) {
      const next = Settings.parse({ ...settings, ...patch })
      writeJsonAtomic(settingsPath, next)
      settings = next
      return settings
    }
  }
}
