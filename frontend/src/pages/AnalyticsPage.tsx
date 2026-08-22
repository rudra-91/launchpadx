import { useQuery } from '@tanstack/react-query'
import { fetchMetrics } from '@/services/assets'
import { TrendChart } from '@/components/charts/TrendChart'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'
import { AssetCategoriesChart } from '@/components/charts/AssetCategoriesChart'
import { InspectionsChart } from '@/components/charts/InspectionsChart'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatNumber, formatPercent } from '@/lib/utils'
import { Building2, AlertTriangle, Activity, Gauge } from 'lucide-react'

export function AnalyticsPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="chart" />
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Deep analytics and trend analysis across the infrastructure network
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-stagger>
        <MetricCard
          title="Total Assets"
          value={formatNumber(metrics.totalAssets)}
          icon={Building2}
          accent="blue"
        />
        <MetricCard
          title="Critical Assets"
          value={metrics.criticalAssets}
          icon={AlertTriangle}
          accent="critical"
        />
        <MetricCard
          title="Network Risk"
          value={formatPercent(metrics.networkRisk)}
          icon={Activity}
          accent="warning"
        />
        <MetricCard
          title="Average Condition"
          value={metrics.averageCondition}
          icon={Gauge}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-stagger>
        <TrendChart data={metrics.conditionTrend} />
        <RiskDistributionChart data={metrics.riskDistribution} />
        <AssetCategoriesChart data={metrics.assetCategories} />
        <InspectionsChart data={metrics.monthlyInspections} />
      </div>

      <GlassCard padding="md" data-reveal>
        <h3 className="mb-3 text-sm font-medium text-text-primary">Analytics Summary</h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Network condition is declining at an average rate of 1.2 points per month.
          {metrics.criticalAssets} assets require immediate intervention.
          Inspection completion rate is at 92% across the county infrastructure portfolio.
          Predictive models indicate a 15% increase in cascade risk if current degradation trends continue.
        </p>
      </GlassCard>
    </div>
  )
}
