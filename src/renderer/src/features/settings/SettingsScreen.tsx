import type { Language } from '@shared/types'
import { useApp, useT } from '../../app/AppContext'

/** Credit shown in Settings › About. A name, so it is not translated. */
const DEVELOPER = 'MILF dev'

const OPTIONS:{ value: Language; label: string; sample: string }[] = [
  { value: 'th', label: 'ภาษาไทย', sample: 'คำอธิบายภาษาไทย' },
  { value: 'en', label: 'English', sample: 'English explanations' }
]

export function SettingsScreen() {
  const { settings, updateSettings } = useApp()
  const { t } = useT()
  return (
    <section className="settings">
      <header className="page-head">
        <h1 className="page-title">{t('settingsTitle')}</h1>
      </header>
      <fieldset className="lang-field">
        <legend>{t('settingsLanguage')}</legend>
        <p className="muted">{t('settingsLanguageHint')}</p>
        <div className="lang-options">
          {OPTIONS.map((o) => (
            <label key={o.value} className="lang-option" lang={o.value}>
              <input
                type="radio"
                name="language"
                checked={settings.language === o.value}
                onChange={() => void updateSettings({ language: o.value })}
              />
              <span className="lang-label">{o.label}</span>
              <span className="lang-sample">{o.sample}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <section className="office-switch" aria-labelledby="office-title">
        <h2 id="office-title" className="panel-title">
          {t('settingsOffice')}
        </h2>
        <p className="muted">{t('settingsOfficeHint')}</p>
        <button type="button" onClick={() => void window.api.app.setMode('office')}>
          {t('settingsOfficeSwitch')}
        </button>
      </section>
      <section className="about" aria-labelledby="about-title">
        <h2 id="about-title" className="panel-title">
          {t('settingsAbout')}
        </h2>
        <p className="credit">{t('creditDeveloper', { name: DEVELOPER })}</p>
      </section>
    </section>
  )
}
