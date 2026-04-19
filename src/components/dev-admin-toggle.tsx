'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ShieldOff } from 'lucide-react'

const COOKIE = 'bullgpt_dev_admin'

export function DevAdminToggle() {
  const router = useRouter()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(document.cookie.split('; ').some((c) => c === `${COOKIE}=1`))
  }, [])

  function toggle() {
    const next = !enabled
    setEnabled(next)
    if (next) {
      document.cookie = `${COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
    } else {
      document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax`
    }
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="lnav-item"
      style={{
        width: '100%',
        justifyContent: 'flex-start',
        cursor: 'pointer',
        border: '1px dashed',
        borderColor: enabled ? '#8b7ad0' : 'rgba(255,255,255,0.12)',
        color: enabled ? '#b5a7e3' : undefined,
        background: 'transparent',
        fontSize: 12,
      }}
      title={
        enabled
          ? 'Mode admin dev activé — clique pour désactiver'
          : 'Activer le mode admin dev (cookie local)'
      }
    >
      {enabled ? <Shield size={14} /> : <ShieldOff size={14} />}
      <span className="lnav-label">{enabled ? 'Admin dev ON' : 'Admin dev OFF'}</span>
    </button>
  )
}
