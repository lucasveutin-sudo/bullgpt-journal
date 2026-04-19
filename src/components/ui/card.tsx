import { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  variant?: 'default' | 'interactive' | 'raised'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const base = 'relative rounded-xl border backdrop-blur-[2px]'
  const variants = {
    default: 'bg-zinc-950/60 border-zinc-900',
    interactive:
      'bg-zinc-950/60 border-zinc-900 hover:border-emerald-500/40 hover:bg-zinc-950/80 transition-all',
    raised: 'bg-zinc-950/80 border-zinc-800/80 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]',
  }
  return <div className={`${base} ${variants[variant]} ${className}`}>{children}</div>
}

export function CardHeader({
  title,
  action,
  icon,
  hint,
}: {
  title: string
  action?: ReactNode
  icon?: ReactNode
  hint?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-zinc-900">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
              {icon}
            </span>
          )}
          <h2 className="font-semibold text-zinc-100 truncate">{title}</h2>
        </div>
        {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export function CardBody({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`p-5 ${className}`}>{children}</div>
}
