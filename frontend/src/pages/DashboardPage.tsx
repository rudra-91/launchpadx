import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Building2, AlertTriangle, Activity, Gauge } from 'lucide-react'
import { fetchMetrics, fetchMapGeoJSON } from '@/services/assets'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { MapView } from '@/components/map/MapView'
import { MapSearch } from '@/components/map/MapSearch'
import { MapFilters } from '@/components/map/MapFilters'
import { TrendChart } from '@/components/charts/TrendChart'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'
import { AssetCategoriesChart } from '@/components/charts/AssetCategoriesChart'
import { InspectionsChart } from '@/components/charts/InspectionsChart'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { MapSearchResult } from '@/lib/mapUtils'

export function DashboardPage() {
  const navigate = useNavigate()
  const [focusNode, setFocusNode] = useState<MapSearchResult | null>(null)

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
  })

  const { data: geojson, isLoading: mapLoading } = useQuery({
    queryKey: ['mapGeoJSON'],
    queryFn: fetchMapGeoJSON,
  })

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Mecklenburg County Infrastructure Network · Real-time risk overview
        </p>
      </div>

      {metricsLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-stagger>
          <MetricCard
            title="Total Assets"
            value={formatNumber(metrics.totalAssets)}
            icon={Building2}
            accent="blue"
            trend={{ value: 2.4, label: 'vs last quarter' }}
          />
          <MetricCard
            title="Critical Assets"
            value={metrics.criticalAssets}
            icon={AlertTriangle}
            accent="critical"
            subtitle="Require immediate attention"
            trend={{ value: -5.2, label: 'vs last month' }}
          />
          <MetricCard
            title="Network Risk"
            value={formatPercent(metrics.networkRisk)}
            icon={Activity}
            accent="warning"
            trend={{ value: 1.8, label: 'vs last week' }}
          />
          <MetricCard
            title="Average Condition"
            value={metrics.averageCondition}
            icon={Gauge}
            accent="cyan"
            subtitle="Out of 100"
            trend={{ value: -1.2, label: 'declining trend' }}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4" data-reveal>
        <div className="relative lg:col-span-3">
          {mapLoading ? (
            <LoadingSkeleton variant="chart" className="h-[420px]" />
          ) : geojson ? (
            <div className="glass-card relative overflow-hidden p-1">
              <div className="absolute left-4 right-4 top-4 z-10">
                <MapSearch
                  geojson={geojson}
                  onSelect={setFocusNode}
                  selectedId={focusNode?.id}
                  onClear={() => setFocusNode(null)}
                />
              </div>
              <MapView
                geojson={geojson}
                focusNode={focusNode}
                className="h-[400px] lg:h-[420px]"
                onFeatureClick={(id, type) => {
                  if (type === 'bridge') navigate(`/assets/${id}`)
                }}
              />
            </div>
          ) : null}
        </div>
        <MapFilters />
      </div>

      {metrics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-stagger>
          <TrendChart data={metrics.conditionTrend} />
          <RiskDistributionChart data={metrics.riskDistribution} />
          <AssetCategoriesChart data={metrics.assetCategories} />
          <InspectionsChart data={metrics.monthlyInspections} />
        </div>
      )}
    </div>
  )
}
