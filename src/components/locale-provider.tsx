'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { Locale, TranslationKey, translate } from '@/lib/i18n'

type LocaleContextValue = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('locale') : null
    if (stored === 'en' || stored === 'fr') setLocaleState(stored)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem('locale', l)
      document.documentElement.lang = l
    } catch {}
  }, [])

  const t = useCallback((key: TranslationKey) => translate(locale, key), [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}

export function useTranslation() {
  const { t, locale } = useLocale()
  return { t, locale }
}
