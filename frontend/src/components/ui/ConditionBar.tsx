import { cn } from '@/lib/utils'

interface ConditionBarProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

function getBarColor(value: number): string {
  if (value >= 70) return 'bg-success'
  if (value >= 50) return 'bg-warning'
  if (value >= 30) return 'bg-orange-500'
  return 'bg-critical'
}

export function ConditionBar({
  value,
  max = 100,
  showLabel = true,
  size = 'md',
  className,
}: ConditionBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Condition</span>
          <span className="font-medium text-text-primary">{value}/{max}</span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-white/5',
          size === 'sm' ? 'h-1.5' : 'h-2',
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500', getBarColor(value))}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
