'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Plus, Calculator, BookOpen, LogOut, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/components/locale-provider'
import { DevAdminToggle } from '@/components/dev-admin-toggle'
import type { TranslationKey } from '@/lib/i18n'

const NAV_ITEMS: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/journal', labelKey: 'nav.journal', icon: BookOpen },
  { href: '/calculator', labelKey: 'nav.calculator', icon: Calculator },
]

export function Sidebar({
  email,
  isAdmin = false,
  onNavigate,
}: {
  email: string
  isAdmin?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslation()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const initials = email.charAt(0).toUpperCase() + (email.charAt(1) || '').toUpperCase()

  return (
    <aside className="lsidebar w-[232px]">
      <div className="lbrand">
        <Link href="/dashboard" onClick={onNavigate} className="lbrand-mark" aria-label="BullGPT">
          B
        </Link>
        <div className="lbrand-name">
          BullGPT<span>Journal</span>
        </div>
      </div>

      <nav className="lnav">
        <Link href="/trades/new" onClick={onNavigate} className="lnav-add">
          <Plus size={14} strokeWidth={2.5} />
          {t('nav.newTrade')}
        </Link>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`lnav-item ${active ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span className="lnav-label">{t(item.labelKey)}</span>
            </Link>
          )
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className={`lnav-item ${pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            <Shield size={16} />
            <span className="lnav-label">{t('nav.admin')}</span>
          </Link>
        )}

        <div style={{ marginTop: 10, padding: '0 6px' }}>
          <DevAdminToggle />
        </div>
      </nav>

      <div className="lprofile">
        <div className="lavatar">{initials}</div>
        <div>
          <div className="lprofile-name">{email}</div>
          <div className="lprofile-plan">Pro plan</div>
        </div>
        <button
          onClick={handleSignOut}
          className="lprofile-signout"
          title={t('nav.signOut')}
          aria-label={t('nav.signOut')}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}
