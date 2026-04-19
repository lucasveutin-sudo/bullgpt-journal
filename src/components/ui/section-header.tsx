import { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

export function SectionHeader({
  title,
  hint,
  action,
  showArrow = true,
}: {
  title: string
  hint?: string
  action?: ReactNode
  showArrow?: boolean
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <span className="truncate">{title}</span>
          {showArrow && <ArrowRight size={16} className="text-zinc-600 flex-shrink-0" />}
        </h2>
        {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
