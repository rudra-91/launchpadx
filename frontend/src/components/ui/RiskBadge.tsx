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
        'inline-flex items-center rounded-lg border font-medium',
        getRiskBgClass(level),
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className,
      )}
    >
      {getRiskLabel(level)}
      {score !== undefined && (
        <span className="ml-1 opacity-70">({score})</span>
      )}
    </span>
  )
}
