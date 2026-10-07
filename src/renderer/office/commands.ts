import { useNavigate } from 'react-router'
import { useApp } from '@renderer/app/AppContext'
import { topicLabel } from '@renderer/app/i18n'
import { PART5_TOPICS, PART7_FORMATS } from '@shared/types'
import { useO } from './strings'

export interface CommandArg {
  value: string
  label: string
}

export interface Command {
  name: string
  hint: string
  args?: CommandArg[]
  /** True when the command cannot run without an argument. */
  needsArg?: boolean
  run(arg?: string): void
}

/** Commands every thread offers. Threads add their own (next, flag, submit…) in front of these. */
export function useGlobalCommands(): Command[] {
  const navigate = useNavigate()
  const { updateSettings } = useApp()
  const { o, t, lang } = useO()
  const formats = PART7_FORMATS.map((f) => ({
    value: f,
    label: t(f === 'single' ? 'readingSingle' : f === 'double' ? 'readingDouble' : 'readingTriple')
  }))
  return [
    { name: 'review', hint: o('cmdReview'), run: () => navigate('/review') },
    {
      name: 'drill',
      hint: o('cmdDrill'),
      needsArg: true,
      args: PART5_TOPICS.map((tp) => ({ value: tp, label: topicLabel(tp, lang) })),
      run: (arg) => navigate(`/drill/${arg}`)
    },
    { name: 'read', hint: o('cmdRead'), args: formats, run: (arg) => navigate(arg ? `/read?format=${arg}` : '/read') },
    { name: 'mixed', hint: o('cmdMixed'), run: () => navigate('/mixed') },
    {
      name: 'test',
      hint: o('cmdTest'),
      args: [
        { value: 'half', label: t('testHalf') },
        { value: 'full', label: t('testFull') }
      ],
      run: (arg) => navigate(arg ? `/test?start=${arg}` : '/test')
    },
    { name: 'status', hint: o('cmdStatus'), run: () => navigate('/status') },
    { name: 'settings', hint: o('cmdSettings'), run: () => navigate('/settings') },
    {
      name: 'lang',
      hint: o('cmdLang'),
      needsArg: true,
      args: [
        { value: 'th', label: o('langTh') },
        { value: 'en', label: o('langEn') }
      ],
      run: (arg) => void updateSettings({ language: arg === 'en' ? 'en' : 'th' })
    },
    {
      name: 'theme',
      hint: o('cmdTheme'),
      needsArg: true,
      args: [
        { value: 'dark', label: o('themeDark') },
        { value: 'light', label: o('themeLight') }
      ],
      run: (arg) => void updateSettings({ officeTheme: arg === 'light' ? 'light' : 'dark' })
    },
    { name: 'trainer', hint: o('cmdTrainer'), run: () => void window.api.app.setMode('trainer') },
    { name: 'new', hint: o('cmdNew'), run: () => navigate('/') }
  ]
}
