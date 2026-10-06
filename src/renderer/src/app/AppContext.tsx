import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type {
  ContentBank,
  GrammarAttempt,
  GrammarTopic,
  MixedTestResult,
  Progress,
  Settings,
  SettingsPatch
} from '@shared/types'
import { t as translate, topicLabel, type Lang, type StringKey } from './i18n'

interface Loaded {
  bank: ContentBank
  progress: Progress
  settings: Settings
  isDev: boolean
}

export interface AppData extends Loaded {
  recordGrammar(a: GrammarAttempt): Promise<void>
  recordMixedTest(r: MixedTestResult): Promise<void>
  updateSettings(patch: SettingsPatch): Promise<void>
  reloadBank(): Promise<void>
  /** True once any progress/settings write has failed. */
  saveError: boolean
}

const AppCtx = createContext<AppData | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState(false)

  useEffect(() => {
    Promise.all([
      window.api.content.bank(),
      window.api.progress.get(),
      window.api.settings.get(),
      window.api.dev.isDev()
    ])
      .then(([bank, progress, settings, isDev]) => setState({ bank, progress, settings, isDev }))
      .catch((e: unknown) => setError(String(e)))
  }, [])

  const recordGrammar = useCallback(async (a: GrammarAttempt) => {
    try {
      const progress = await window.api.progress.recordGrammar(a)
      setState((s) => s && { ...s, progress })
    } catch {
      setSaveError(true)
    }
  }, [])
  const recordMixedTest = useCallback(async (r: MixedTestResult) => {
    try {
      const progress = await window.api.progress.recordMixedTest(r)
      setState((s) => s && { ...s, progress })
    } catch {
      setSaveError(true)
    }
  }, [])
  const updateSettings = useCallback(async (patch: SettingsPatch) => {
    try {
      const settings = await window.api.settings.set(patch)
      setState((s) => s && { ...s, settings })
    } catch {
      setSaveError(true)
    }
  }, [])
  const reloadBank = useCallback(async () => {
    const bank = await window.api.content.bank()
    setState((s) => s && { ...s, bank })
  }, [])

  if (error) return <p className="error">Failed to load: {error}</p>
  if (!state) return <p className="loading">Loading…</p>
  return (
    <AppCtx.Provider value={{ ...state, recordGrammar, recordMixedTest, updateSettings, reloadBank, saveError }}>
      {children}
    </AppCtx.Provider>
  )
}

export function useApp(): AppData {
  const value = useContext(AppCtx)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}

export function useT() {
  const lang: Lang = useApp().settings.language
  return {
    lang,
    t: (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    topic: (topic: GrammarTopic) => topicLabel(topic, lang)
  }
}
