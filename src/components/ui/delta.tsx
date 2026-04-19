import { TrendingUp, TrendingDown } from 'lucide-react'

export function Delta({
  value,
  suffix = '%',
  size = 'sm',
  showIcon = true,
}: {
  value: number
  suffix?: string
  size?: 'sm' | 'md'
  showIcon?: boolean
}) {
  const positive = value >= 0
  const color = positive ? 'text-green-400' : 'text-red-400'
  const bg = positive ? 'bg-green-500/10' : 'bg-red-500/10'
  const Icon = positive ? TrendingUp : TrendingDown
  const sizeCls = size === 'md' ? 'text-sm px-2 py-0.5' : 'text-xs px-1.5 py-0.5'
  return (
    <span
      className={`inline-flex items-center gap-1 font-nums font-semibold rounded ${color} ${bg} ${sizeCls}`}
    >
      {showIcon && <Icon size={size === 'md' ? 14 : 12} />}
      {positive ? '+' : ''}
      {value.toFixed(2)}
      {suffix}
    </span>
  )
}
