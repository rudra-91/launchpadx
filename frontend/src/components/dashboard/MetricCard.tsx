import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  /** Kept for API compat; icons stay monochrome except muted risk tones */
  accent?: 'blue' | 'critical' | 'warning' | 'cyan' | 'success'
  subtitle?: string
  trend?: { value: number; label: string }
}

const iconTone = {
  blue: 'text-[color:var(--infra-icon,#777)]',
  cyan: 'text-[color:var(--infra-icon,#777)]',
  critical: 'text-critical',
  warning: 'text-warning',
  success: 'text-success',
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  accent = 'blue',
  subtitle,
  trend,
}: MetricCardProps) {
  const isPositiveTrend = trend && trend.value > 0

  return (
    <div className="rounded-lg border border-border bg-surface p-5 transition-colors duration-[160ms] ease-out hover:border-border-strong hover:bg-elevated">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2.5">
          <p className="kpi-label">{title}</p>
          <p className="text-[28px] font-semibold tracking-tight text-[color:var(--infra-bright,#E2E2E2)]">
            {value}
          </p>
          {subtitle && (
            <p className="text-[12px] text-[color:var(--infra-muted,#666)]">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 text-[12px]">
              {isPositiveTrend ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-critical" />
              )}
              <span className={isPositiveTrend ? 'text-success' : 'text-critical'}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-[color:var(--infra-muted,#666)]">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-elevated',
            iconTone[accent],
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.6} />
        </div>
      </div>
    </div>
  )
}
