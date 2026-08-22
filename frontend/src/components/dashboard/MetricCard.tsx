import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  accent?: 'blue' | 'critical' | 'warning' | 'cyan' | 'success'
  subtitle?: string
  trend?: { value: number; label: string }
}

const accentStyles = {
  blue: 'text-accent bg-accent/12 border border-accent/30',
  critical: 'text-critical bg-critical/12 border border-critical/30',
  warning: 'text-warning bg-warning/12 border border-warning/30',
  cyan: 'text-accent-glow bg-accent-glow/12 border border-accent-glow/30',
  success: 'text-success bg-success/12 border border-success/30',
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
    <GlassCard hover padding="md">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 text-xs">
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
            'flex h-8 w-8 items-center justify-center rounded-lg',
            accentStyles[accent],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </GlassCard>
  )
}
