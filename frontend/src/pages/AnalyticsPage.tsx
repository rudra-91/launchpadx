import { useMemo } from 'react'
import { Building2, AlertTriangle, Activity, Gauge } from 'lucide-react'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'
import { AssetCategoriesChart } from '@/components/charts/AssetCategoriesChart'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { EmptyInspectionState } from '@/components/ui/EmptyInspectionState'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatNumber } from '@/lib/utils'
import { deriveInspectionMetrics, getLocations } from '@/lib/inspectionDerived'
import { useInspectionStore } from '@/store/useInspectionStore'

export function AnalyticsPage() {
  const results = useInspectionStore((s) => s.results)
  const analyzedAt = useInspectionStore((s) => s.analyzedAt)
  const locations = getLocations(results)
  const metrics = useMemo(() => deriveInspectionMetrics(results), [results])

  if (locations.length === 0 || !metrics) {
    return (
      <div className="space-y-6">
        <div data-reveal>
          <p className="text-sm text-text-secondary">
            Analytics from the latest live road inspection snapshot
          </p>
        </div>
        <EmptyInspectionState
          title="No analytics snapshot yet"
          description="Charts require a completed road inspection. Historical time series are not fabricated — only live inspection metrics are shown."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Latest inspection snapshot
          {analyzedAt ? ` · ${new Date(analyzedAt).toLocaleString()}` : ''}
          {' · '}
          not a fabricated multi-month history
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-stagger>
        <MetricCard
          title="Locations Inspected"
          value={formatNumber(metrics.totalLocations)}
          icon={Building2}
          accent="blue"
          subtitle={`${metrics.totalImages} images`}
        />
        <MetricCard
          title="High / Critical"
          value={metrics.highCriticalCount}
          icon={AlertTriangle}
          accent="critical"
        />
        <MetricCard
          title="YOLO Detections"
          value={formatNumber(metrics.totalDetections)}
          icon={Activity}
          accent="warning"
          subtitle={`${metrics.nearbyEntityCount} GIS entities`}
        />
        <MetricCard
          title="Avg Priority / Risk"
          value={`${metrics.averagePriorityScore} / ${metrics.averageRiskScore}`}
          icon={Gauge}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-stagger>
        <RiskDistributionChart data={metrics.riskDistribution} />
        <AssetCategoriesChart data={metrics.damageCategoryCounts} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" data-stagger>
        <DamageCard label="Longitudinal (D00)" value={metrics.damageTotals.D00} />
        <DamageCard label="Transverse (D10)" value={metrics.damageTotals.D10} />
        <DamageCard label="Alligator (D20)" value={metrics.damageTotals.D20} />
        <DamageCard label="Pothole (D40)" value={metrics.damageTotals.D40} />
      </div>

      <GlassCard padding="md" data-reveal>
        <h3 className="mb-3 text-sm font-medium text-text-primary">Analytics Summary</h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Latest inspection covered {metrics.totalLocations} location
          {metrics.totalLocations === 1 ? '' : 's'} with {metrics.totalDetections} YOLO
          detections across {metrics.totalImages} images. {metrics.highCriticalCount} location
          {metrics.highCriticalCount === 1 ? '' : 's'} classified HIGH or CRITICAL by XGBoost.
          GIS discovered {metrics.nearbyEntityCount} nearby infrastructure entities. Highest
          priority location: {metrics.highestPriorityName ?? 'n/a'} (score{' '}
          {metrics.highestPriorityScore ?? 'n/a'}). Max risk score: {metrics.maxRiskScore}.
        </p>
      </GlassCard>
    </div>
  )
}

function DamageCard({ label, value }: { label: string; value: number }) {
  return (
    <GlassCard padding="md">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-primary">{value}</p>
    </GlassCard>
  )
}
