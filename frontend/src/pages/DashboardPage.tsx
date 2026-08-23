import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  AlertTriangle,
  Activity,
  Gauge,
  MapPin,
  Crosshair,
} from 'lucide-react'
import type { FeatureCollection } from 'geojson'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { LatestInspectionWidget } from '@/components/dashboard/LatestInspectionWidget'
import { MapView } from '@/components/map/MapView'
import { MapSearch } from '@/components/map/MapSearch'
import { MapFilters } from '@/components/map/MapFilters'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'
import { AssetCategoriesChart } from '@/components/charts/AssetCategoriesChart'
import { EmptyInspectionState } from '@/components/ui/EmptyInspectionState'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatNumber } from '@/lib/utils'
import {
  buildInspectionGeoJSON,
  deriveInspectionMetrics,
  getLocations,
} from '@/lib/inspectionDerived'
import { useInspectionStore } from '@/store/useInspectionStore'
import type { MapSearchResult } from '@/lib/mapUtils'

export function DashboardPage() {
  const navigate = useNavigate()
  const [focusNode, setFocusNode] = useState<MapSearchResult | null>(null)
  const results = useInspectionStore((s) => s.results)
  const analyzedAt = useInspectionStore((s) => s.analyzedAt)
  const locations = getLocations(results)
  const metrics = useMemo(() => deriveInspectionMetrics(results), [results])
  const geojson = useMemo(() => buildInspectionGeoJSON(results), [results])

  if (locations.length === 0 || !metrics) {
    return (
      <div className="space-y-6">
        <div data-reveal className="border-b border-border/50 pb-3">
          <h2 className="text-lg font-bold text-text-primary">
            Infrastructure Network Risk Intelligence Platform
          </h2>
          <p className="text-xs text-text-secondary">
            Live road inspection intelligence — awaiting first analysis
          </p>
        </div>
        <LatestInspectionWidget />
        <EmptyInspectionState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div data-reveal className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Infrastructure Network Risk Intelligence Platform
          </h2>
          <p className="text-xs text-text-secondary">
            Live AI road inspection · {locations.length} location
            {locations.length === 1 ? '' : 's'} analyzed
            {analyzedAt
              ? ` · Updated ${new Date(analyzedAt).toLocaleString()}`
              : ''}
          </p>
        </div>
      </div>

      <div data-reveal>
        <LatestInspectionWidget />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-stagger>
        <MetricCard
          title="Inspected Locations"
          value={formatNumber(metrics.totalLocations)}
          icon={Building2}
          accent="blue"
          subtitle={`${metrics.totalImages} images analyzed`}
        />
        <MetricCard
          title="High / Critical Risk"
          value={metrics.highCriticalCount}
          icon={AlertTriangle}
          accent="critical"
          subtitle="XGBoost HIGH or CRITICAL"
        />
        <MetricCard
          title="Total YOLO Detections"
          value={formatNumber(metrics.totalDetections)}
          icon={Activity}
          accent="warning"
          subtitle={`${metrics.nearbyEntityCount} nearby entities`}
        />
        <MetricCard
          title="Avg / Max Risk Score"
          value={`${metrics.averageRiskScore} / ${metrics.maxRiskScore}`}
          icon={Gauge}
          accent="blue"
          subtitle={
            metrics.highestPriorityName
              ? `Top priority: ${metrics.highestPriorityName}`
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4" data-reveal>
        <div className="relative lg:col-span-3">
          <div className="glass-card relative overflow-hidden p-1">
            <div className="absolute left-4 right-4 top-4 z-10">
              <MapSearch
                geojson={geojson as FeatureCollection}
                onSelect={setFocusNode}
                selectedId={focusNode?.id}
                onClear={() => setFocusNode(null)}
              />
            </div>
            <MapView
              geojson={geojson ?? undefined}
              inspectionLocations={locations}
              focusNode={focusNode}
              className="h-[400px] lg:h-[420px]"
              onLocationSelect={(id) => navigate(`/assets/${id}`)}
              onFeatureClick={(id) => navigate(`/assets/${id}`)}
            />
          </div>
        </div>
        <div className="space-y-4">
          <MapFilters />
          <GlassCard padding="md" className="space-y-2">
            <div className="flex items-center gap-2 text-text-secondary">
              <Crosshair className="h-4 w-4" />
              <span className="text-xs font-semibold">Highest Priority</span>
            </div>
            <p className="text-sm font-bold text-text-primary">
              {metrics.highestPriorityName ?? '—'}
            </p>
            <p className="text-xs text-accent">
              Priority score {metrics.highestPriorityScore ?? '—'}
            </p>
            <div className="flex items-center gap-2 pt-2 text-text-secondary">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs">Map markers use live inspection coordinates</span>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-stagger>
        <RiskDistributionChart data={metrics.riskDistribution} />
        <AssetCategoriesChart data={metrics.damageCategoryCounts} />
      </div>
    </div>
  )
}
