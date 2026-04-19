'use client'

import { useLocale, useTranslation } from './locale-provider'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()
  const { t } = useTranslation()
  const isFR = locale === 'fr'

  function toggle() {
    setLocale(isFR ? 'en' : 'fr')
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFR ? t('locale.toEnglish') : t('locale.toFrench')}
      className="lpill"
      style={{ fontWeight: 600, letterSpacing: '0.05em' }}
    >
      {isFR ? 'FR' : 'EN'}
    </button>
  )
}
