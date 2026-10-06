import { join } from 'path'
import { localDate } from '@shared/dates'
import { applyGrammarAttempt, applyMixedTest } from '@shared/progress'
import {
  Progress,
  Settings,
  defaultSettings,
  emptyProgress,
  type GrammarAttempt,
  type MixedTestResult,
  type SettingsPatch
} from '@shared/types'
import { readJson, writeJsonAtomic } from './jsonFile'

export interface Store {
  getProgress(): Progress
  recordGrammar(a: GrammarAttempt): Progress
  recordMixedTest(r: MixedTestResult): Progress
  getSettings(): Settings
  setSettings(patch: SettingsPatch): Settings
}

export function createStore(dir: string, today: () => string = () => localDate()): Store {
  const progressPath = join(dir, 'progress.json')
  const settingsPath = join(dir, 'settings.json')
  let progress = readJson(progressPath, Progress, emptyProgress)
  let settings = readJson(settingsPath, Settings, defaultSettings)

  const saveProgress = (next: Progress): Progress => {
    progress = next
    writeJsonAtomic(progressPath, progress)
    return progress
  }

  return {
    getProgress: () => progress,
    recordGrammar: (a) => saveProgress(applyGrammarAttempt(progress, a, today())),
    recordMixedTest: (r) => saveProgress(applyMixedTest(progress, r)),
    getSettings: () => settings,
    setSettings(patch) {
      settings = Settings.parse({ ...settings, ...patch })
      writeJsonAtomic(settingsPath, settings)
      return settings
    }
  }
}
