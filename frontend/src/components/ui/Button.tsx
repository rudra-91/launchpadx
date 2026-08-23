import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
}

const variants = {
  primary:
    'bg-accent text-[color:var(--accent-foreground)] hover:bg-[color:var(--accent-hover)] active:brightness-95',
  secondary:
    'bg-elevated border border-border-strong text-text-secondary hover:border-border-strong hover:bg-[color:var(--infra-hover,#202020)] hover:text-text-primary',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-[color:var(--infra-hover,#1c1c1c)]',
  danger:
    'bg-critical/10 text-critical border border-critical/25 hover:bg-critical/15',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-2 rounded-[var(--radius-md)]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[var(--radius-md)]',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-[var(--radius-lg)]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-[160ms] ease-out',
        'disabled:cursor-not-allowed disabled:opacity-45',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--infra-muted,var(--accent))]/60',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
