import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
}

export function Select({ label, options, error, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-[13px] font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none rounded-[var(--radius-md)] border border-border bg-[color:var(--infra-bg-secondary,var(--elevated))] px-3.5 py-2.5 pr-10 text-sm text-text-primary',
            'transition-colors duration-[160ms] ease-out',
            'hover:border-border-strong focus:border-[color:var(--infra-muted,var(--accent))] focus:outline-none focus:ring-0',
            error && 'border-critical/50',
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  )
}
