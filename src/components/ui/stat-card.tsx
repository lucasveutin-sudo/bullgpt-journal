import { ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'danger' | 'brand'

export function StatCard({
  label,
  value,
  hint,
  tone = 'neutral',
  icon,
  trend,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: Tone
  icon?: ReactNode
  trend?: ReactNode
}) {
  const valueColor = {
    neutral: 'text-zinc-100',
    success: 'text-green-400',
    danger: 'text-red-400',
    brand: 'text-emerald-400',
  }[tone]

  const topSheen =
    tone === 'brand'
      ? 'from-transparent via-emerald-400/50 to-transparent'
      : tone === 'success'
        ? 'from-transparent via-green-400/40 to-transparent'
        : tone === 'danger'
          ? 'from-transparent via-red-400/40 to-transparent'
          : 'from-transparent via-white/10 to-transparent'

  return (
    <div className="group relative rounded-xl border border-zinc-900 bg-zinc-950/60 p-5 overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-950/80">
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${topSheen}`}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            'radial-gradient(400px circle at 50% 0%, rgba(16,185,129,0.08), transparent 60%)',
        }}
      />
      <div className="relative flex items-center justify-between mb-3">
        <p className="label-tiny">{label}</p>
        {icon && <span className="text-zinc-600">{icon}</span>}
      </div>
      <p
        className={`relative font-nums font-bold text-2xl md:text-3xl leading-none ${valueColor}`}
      >
        {value}
      </p>
      {(hint || trend) && (
        <div className="relative mt-2 flex items-center gap-2 text-xs text-zinc-500">
          {trend}
          {hint}
        </div>
      )}
    </div>
  )
}
