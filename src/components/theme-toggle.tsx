'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTranslation } from './locale-provider'

type Theme = 'light' | 'dark'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  const { t } = useTranslation()

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'light'
    setTheme(stored)
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(next)
    localStorage.setItem('theme', next)
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      className="ltop-icon"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
