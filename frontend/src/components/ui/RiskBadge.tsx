import { cn, getRiskBgClass, getRiskLabel } from '@/lib/utils'
import type { RiskLevel } from '@/types'

interface RiskBadgeProps {
  level: RiskLevel
  score?: number
  size?: 'sm' | 'md'
  className?: string
}

export function RiskBadge({ level, score, size = 'md', className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] font-medium tracking-wide',
        getRiskBgClass(level),
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      {getRiskLabel(level)}
      {score !== undefined && <span className="ml-1 opacity-70">({score})</span>}
    </span>
  )
}
