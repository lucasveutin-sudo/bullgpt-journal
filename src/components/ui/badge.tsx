import { ReactNode } from 'react'

type Tone = 'neutral' | 'brand' | 'success' | 'danger' | 'info' | 'warning'

const toneCls: Record<Tone, string> = {
  neutral: 'bg-zinc-900/80 text-zinc-400 border border-zinc-800',
  brand: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  success: 'bg-green-500/10 text-green-400 border border-green-500/30',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
}

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  icon?: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide rounded-md ${toneCls[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  )
}
