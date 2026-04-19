import { ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-12 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-zinc-500">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-zinc-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-zinc-500 mb-5 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  )
}
