import { useApp } from '@renderer/app/AppContext'
import { SwapIcon } from './icons'
import { AgentMsg } from './Task'
import { Thread } from './Thread'
import { Typed } from './threads'
import { useO } from './strings'

/** Credit shown under About. A name, so it is not translated. */
const DEVELOPER = 'MILF dev'

const Keys = ({ keys }: { keys: string[] }) => (
  <span className="keys">
    {keys.map((k) => (
      <kbd key={k} className="key">
        {k}
      </kbd>
    ))}
  </span>
)

export function SettingsThread() {
  const { settings, updateSettings } = useApp()
  const { o, t } = useO()
  const theme = settings.officeTheme ?? 'dark'
  return (
    <Thread crumbs={[o('settingsHead')]} composer={{ placeholder: o('composerIdle') }}>
      <Typed cmd="/settings" />
      <AgentMsg anchor head={o('settingsHead')}>
        <fieldset className="radios">
          <legend className="sub">{t('settingsLanguage')}</legend>
          <p className="dim">{t('settingsLanguageHint')}</p>
          {(
            [
              { value: 'th', label: 'ภาษาไทย', sample: 'คำอธิบายภาษาไทย' },
              { value: 'en', label: 'English', sample: 'English explanations' }
            ] as const
          ).map((l) => (
            <label key={l.value} className="radio-row" lang={l.value}>
              <input type="radio" name="language" checked={settings.language === l.value} onChange={() => void updateSettings({ language: l.value })} />
              <span className="row-title">{l.label}</span>
              <span className="row-meta">{l.sample}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="radios">
          <legend className="sub">{o('theme')}</legend>
          <p className="dim">{o('themeHint')}</p>
          {(['dark', 'light'] as const).map((v) => (
            <label key={v} className="radio-row">
              <input type="radio" name="theme" checked={theme === v} onChange={() => void updateSettings({ officeTheme: v })} />
              <span className="row-title">{o(v === 'dark' ? 'themeDark' : 'themeLight')}</span>
            </label>
          ))}
        </fieldset>

        <p className="sub">{o('bossKey')}</p>
        <p className="kv">
          <Keys keys={['Ctrl', 'Alt', 'H']} />
          <span className="dim">{o('bossKeyHint')}</span>
        </p>

        <p className="sub">{o('view')}</p>
        <p className="dim">{o('viewHint')}</p>
        <div className="actions">
          <button type="button" className="btn" onClick={() => void window.api.app.setMode('trainer')}>
            <SwapIcon />
            {o('viewSwitch')}
          </button>
        </div>

        <p className="sub">{o('shortcuts')}</p>
        <dl className="shortcuts">
          {(
            [
              [['Ctrl', 'N'], 'kNew'],
              [['Ctrl', 'B'], 'kSidebar'],
              [['/'], 'kCommands'],
              [['Ctrl', 'Shift', 'M'], 'kView'],
              [['Ctrl', 'Alt', 'H'], 'kHide']
            ] as const
          ).map(([keys, label]) => (
            <div key={label}>
              <dt>
                <Keys keys={[...keys]} />
              </dt>
              <dd>{o(label)}</dd>
            </div>
          ))}
        </dl>

        <p className="sub">{t('settingsAbout')}</p>
        <p className="dim">{t('creditDeveloper', { name: DEVELOPER })}</p>
      </AgentMsg>
    </Thread>
  )
}
