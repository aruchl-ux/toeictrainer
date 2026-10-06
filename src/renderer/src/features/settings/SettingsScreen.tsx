import { useApp, useT } from '../../app/AppContext'

export function SettingsScreen() {
  const { settings, updateSettings } = useApp()
  const { t } = useT()
  return (
    <section>
      <h1>{t('settingsTitle')}</h1>
      <fieldset className="card">
        <legend>{t('settingsLanguage')}</legend>
        <label>
          <input
            type="radio"
            name="language"
            checked={settings.language === 'th'}
            onChange={() => void updateSettings({ language: 'th' })}
          />{' '}
          ภาษาไทย
        </label>
        <label>
          <input
            type="radio"
            name="language"
            checked={settings.language === 'en'}
            onChange={() => void updateSettings({ language: 'en' })}
          />{' '}
          English
        </label>
      </fieldset>
    </section>
  )
}
