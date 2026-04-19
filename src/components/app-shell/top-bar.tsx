'use client'

import { Menu, Sparkles, Bell, Filter, Calendar, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/components/locale-provider'
import type { TranslationKey } from '@/lib/i18n'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'

const SEGMENT_KEYS: Record<string, TranslationKey> = {
  dashboard: 'breadcrumb.dashboard',
  journal: 'breadcrumb.journal',
  analytics: 'breadcrumb.analytics',
  calculator: 'breadcrumb.calculator',
  trades: 'breadcrumb.trades',
  new: 'breadcrumb.new',
}

export function TopBar({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const { t } = useTranslation()
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const lastSeg = segments[segments.length - 1] ?? 'dashboard'
  const key = SEGMENT_KEYS[lastSeg]
  const label = key
    ? t(key)
    : /^[a-f0-9-]{20,}$/i.test(lastSeg)
      ? t('breadcrumb.detail')
      : lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1)

  return (
    <header className="ltopbar">
      <div className="ltopbar-left flex items-center gap-3">
        <button
          onClick={onOpenDrawer}
          className="md:hidden ltop-icon"
          aria-label={t('nav.openMenu')}
        >
          <Menu size={16} />
        </button>
        <div className="lcrumb">
          <span className="dim">BullGPT</span>
          <span className="sep">/</span>
          <span>{label}</span>
        </div>
      </div>
      <div className="ltopbar-right">
        <button className="lpill hidden md:inline-flex">
          <Filter size={14} />
          {t('top.filters')}
          <ChevronDown size={12} />
        </button>
        <button className="lpill hidden lg:inline-flex">
          <Calendar size={14} />
          {t('top.dateRange')}
          <ChevronDown size={12} />
        </button>
        <button className="lpill lpill-ai">
          <Sparkles size={14} />
          {t('top.askBullGPT')}
        </button>
        <LanguageToggle />
        <ThemeToggle />
        <button className="ltop-icon" aria-label="Notifications">
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
