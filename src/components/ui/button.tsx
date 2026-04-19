import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const variantCls: Record<Variant, string> = {
  primary:
    'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-glow-brand hover:shadow-glow-brand-md',
  secondary:
    'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 hover:border-zinc-700',
  ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900',
  danger:
    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50',
  outline:
    'bg-transparent text-zinc-300 border border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400',
}

const sizeCls: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-5 text-base rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon,
    iconRight,
    fullWidth,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const isPrimary = variant === 'primary'
  return (
    <button
      ref={ref}
      {...rest}
      className={`group/btn relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${variantCls[variant]} ${sizeCls[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {isPrimary && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-[800ms] ease-out pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
          }}
        />
      )}
      {icon && <span className="relative">{icon}</span>}
      <span className="relative">{children}</span>
      {iconRight && <span className="relative">{iconRight}</span>}
    </button>
  )
})
