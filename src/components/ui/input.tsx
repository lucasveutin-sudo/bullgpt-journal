import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, forwardRef } from 'react'

export function Field({
  label,
  hint,
  error,
  children,
  action,
}: {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="space-y-2">
      {(label || action) && (
        <div className="flex items-center justify-between">
          {label && <label className="label-tiny">{label}</label>}
          {action}
        </div>
      )}
      {children}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

const inputBase =
  'w-full h-11 px-3.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 font-nums focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 hover:border-zinc-700 transition-colors'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} {...rest} className={`${inputBase} ${className}`} />
  }
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = '', ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={`w-full px-3.5 py-3 bg-zinc-950/80 border border-zinc-800 rounded-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 hover:border-zinc-700 resize-none transition-colors ${className}`}
    />
  )
})
