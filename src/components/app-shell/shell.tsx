'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { LocaleProvider, useTranslation } from '@/components/locale-provider'

export function Shell({
  email,
  isAdmin = false,
  children,
}: {
  email: string
  isAdmin?: boolean
  children: ReactNode
}) {
  return (
    <LocaleProvider>
      <ShellInner email={email} isAdmin={isAdmin}>
        {children}
      </ShellInner>
    </LocaleProvider>
  )
}

function ShellInner({
  email,
  isAdmin,
  children,
}: {
  email: string
  isAdmin: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <div className="lapp">
      <div className="hidden md:block">
        <Sidebar email={email} isAdmin={isAdmin} />
      </div>

      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative h-full animate-fade-in-up">
            <Sidebar email={email} isAdmin={isAdmin} onNavigate={() => setDrawerOpen(false)} />
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-[-44px] flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-[var(--line-2)] text-[var(--text-dim)]"
              aria-label={t('nav.closeMenu')}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="lmain">
        <TopBar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="lcontent">{children}</main>
      </div>
    </div>
  )
}
