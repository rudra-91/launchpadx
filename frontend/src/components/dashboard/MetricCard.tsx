import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  accent?: 'blue' | 'critical' | 'warning' | 'cyan' | 'success'
  subtitle?: string
  trend?: { value: number; label: string }
}

const iconTone = {
  blue: 'text-accent',
  critical: 'text-critical',
  warning: 'text-warning',
  cyan: 'text-accent-glow',
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
    <div className="rounded-2xl border border-border bg-surface p-5 transition-colors duration-150 hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-3">
          <p className="kpi-label">{title}</p>
          <p className="text-[30px] font-semibold tracking-tight text-text-primary">{value}</p>
          {subtitle && <p className="text-[13px] text-muted">{subtitle}</p>}
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
              <span className="text-muted">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-elevated',
            iconTone[accent],
          )}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  )
}
