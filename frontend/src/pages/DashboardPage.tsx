import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Building2, AlertTriangle, Activity, Gauge } from 'lucide-react'
import type { FeatureCollection } from 'geojson'
import { fetchMetrics, fetchMapGeoJSON } from '@/services/assets'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { LatestInspectionWidget } from '@/components/dashboard/LatestInspectionWidget'
import { MapView } from '@/components/map/MapView'
import { MapSearch } from '@/components/map/MapSearch'
import { MapFilters } from '@/components/map/MapFilters'
import { TrendChart } from '@/components/charts/TrendChart'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'
import { AssetCategoriesChart } from '@/components/charts/AssetCategoriesChart'
import { InspectionsChart } from '@/components/charts/InspectionsChart'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatNumber, formatPercent } from '@/lib/utils'
import { useInspectionStore } from '@/store/useInspectionStore'
import type { MapSearchResult } from '@/lib/mapUtils'

export function DashboardPage() {
  const navigate = useNavigate()
  const [focusNode, setFocusNode] = useState<MapSearchResult | null>(null)
  const results = useInspectionStore((s) => s.results)

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
  })

  const { data: defaultGeojson, isLoading: mapLoading } = useQuery({
    queryKey: ['mapGeoJSON'],
    queryFn: fetchMapGeoJSON,
  })

  const activeGeoJSON = useMemo<FeatureCollection | undefined>(() => {
    if (results?.locations && results.locations.length > 0) {
      return {
        type: 'FeatureCollection',
        features: results.locations.map((loc) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [loc.longitude, loc.latitude],
          },
          properties: {
            id: loc.location_id,
            name: loc.name,
            type: 'road',
            riskScore: loc.priority.priority_score,
            riskLevel: loc.priority.priority_level,
            rank: loc.rank,
          },
        })),
      }
    }
    return defaultGeojson
  }, [results, defaultGeojson])

  return (
    <div className="space-y-6">
      <div data-reveal className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Infrastructure Network Risk Intelligence Platform
          </h2>
          <p className="text-xs text-text-secondary">
            {results?.locations && results.locations.length > 0
              ? `Displaying Real AI Road Inspection Results · ${results.locations.length} Locations Analyzed`
              : 'Indian Road Network AI Damage, XGBoost Risk & GIS Priority Intelligence (Demo Baseline)'}
          </p>
        </div>
      </div>

      {/* Latest Live Road Inspection AI Widget */}
      <div data-reveal>
        <LatestInspectionWidget />
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
            title="Total Assets Monitored"
            value={formatNumber(metrics.totalAssets)}
            icon={Building2}
            accent="blue"
            trend={{ value: 2.4, label: 'vs last quarter' }}
          />
          <MetricCard
            title="Critical High-Risk Locations"
            value={metrics.criticalAssets}
            icon={AlertTriangle}
            accent="critical"
            subtitle="Require immediate attention"
            trend={{ value: -5.2, label: 'vs last month' }}
          />
          <MetricCard
            title="Network Risk Index"
            value={formatPercent(metrics.networkRisk)}
            icon={Activity}
            accent="warning"
            trend={{ value: 1.8, label: 'vs last week' }}
          />
          <MetricCard
            title="Average Condition Score"
            value={metrics.averageCondition}
            icon={Gauge}
            accent="blue"
            subtitle="Out of 100"
            trend={{ value: -1.2, label: 'declining trend' }}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4" data-reveal>
        <div className="relative lg:col-span-3">
          {mapLoading ? (
            <LoadingSkeleton variant="chart" className="h-[420px]" />
          ) : activeGeoJSON ? (
            <div className="glass-card relative overflow-hidden p-1">
              <div className="absolute left-4 right-4 top-4 z-10">
                <MapSearch
                  geojson={activeGeoJSON}
                  onSelect={setFocusNode}
                  selectedId={focusNode?.id}
                  onClear={() => setFocusNode(null)}
                />
              </div>
              <MapView
                geojson={activeGeoJSON}
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
