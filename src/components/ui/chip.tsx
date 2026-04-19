import { ReactNode } from 'react'

type ChipTone = 'brand' | 'danger'

export function Chip({
  active,
  onClick,
  children,
  className = '',
  tone = 'brand',
  type = 'button',
}: {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  className?: string
  tone?: ChipTone
  type?: 'button' | 'submit'
}) {
  const activeCls =
    tone === 'brand'
      ? 'bg-emerald-500 border-emerald-500 text-black font-semibold shadow-glow-brand'
      : 'bg-red-500 border-red-500 text-black font-semibold shadow-glow-danger'
  const inactive =
    'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 h-9 text-sm rounded-lg border transition-all ${active ? activeCls : inactive} ${className}`}
    >
      {children}
    </button>
  )
}
