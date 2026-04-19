type LogoSize = 'sm' | 'md' | 'lg'

const SIZES: Record<LogoSize, { icon: number; text: string }> = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-base' },
  lg: { icon: 42, text: 'text-2xl' },
}

export function Logo({ size = 'md', showText = true }: { size?: LogoSize; showText?: boolean }) {
  const { icon, text } = SIZES[size]

  return (
    <div className="flex items-center gap-2.5">
      <BullMark size={icon} />
      {showText && (
        <span className={`font-bold tracking-tight ${text} text-zinc-100`}>
          BullGPT <span className="text-emerald-400">Journal</span>
        </span>
      )}
    </div>
  )
}

export function BullMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/bullgpt-logo.svg"
      width={size}
      height={size}
      alt="BullGPT"
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.45))',
      }}
    />
  )
}
