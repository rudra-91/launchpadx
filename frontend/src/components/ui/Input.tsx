import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl border border-border bg-elevated px-4 py-2 text-sm text-text-primary',
            'placeholder:text-muted transition-colors duration-200',
            'focus:border-border-strong focus:outline-none focus:ring-2 focus:ring-accent/20',
            icon && 'pl-10',
            error && 'border-critical/50',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  )
}
