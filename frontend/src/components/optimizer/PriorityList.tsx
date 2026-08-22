import { ArrowUpRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, getRiskLevel } from '@/lib/utils'
import type { PriorityItem } from '@/types'

interface PriorityListProps {
  items: PriorityItem[]
  onItemClick?: (item: PriorityItem) => void
}

export function PriorityList({ items, onItemClick }: PriorityListProps) {
  if (items.length === 0) {
    return (
      <GlassCard padding="lg" className="text-center">
        <p className="text-text-secondary">Run optimization to see ranked priorities</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-medium text-text-primary">Maintenance Priority List</h3>
      </div>
      <div className="divide-y divide-border/50">
        {items.map((item) => (
          <div
            key={item.assetId}
            className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
              {item.rank}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text-primary">{item.name}</p>
              <p className="text-xs text-text-secondary">
                Score: {item.priorityScore} · Cost: {formatCurrency(item.estimatedCost)} ·
                +{item.expectedImprovement}% improvement
              </p>
            </div>
            <RiskBadge level={getRiskLevel(item.riskScore)} size="sm" />
            {onItemClick && (
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                onClick={() => onItemClick(item)}
              >
                View
              </Button>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
