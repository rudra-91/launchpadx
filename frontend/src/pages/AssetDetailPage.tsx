import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FlaskConical, Wrench } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { EmptyInspectionState } from '@/components/ui/EmptyInspectionState'
import { FeatureImportanceChart } from '@/components/charts/FeatureImportanceChart'
import {
  findLocationById,
  getLocations,
  maintenanceRecommendation,
  normalizeRiskLevel,
} from '@/lib/inspectionDerived'
import { useInspectionStore } from '@/store/useInspectionStore'
import type { FeatureImportance } from '@/types'

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const results = useInspectionStore((s) => s.results)
  const locations = getLocations(results)
  const location = findLocationById(results, id)

  const features = useMemo<FeatureImportance[]>(() => {
    if (!location) return []
    const f = location.risk.risk_features
    return [
      { feature: 'D00 Count', importance: f.d00_count },
      { feature: 'D10 Count', importance: f.d10_count },
      { feature: 'D20 Count', importance: f.d20_count },
      { feature: 'D40 Count', importance: f.d40_count },
      { feature: 'Total Detections', importance: f.total_detections },
      { feature: 'Total Damage Area', importance: Number((f.total_damage_area_ratio * 100).toFixed(2)) },
      { feature: 'Avg BBox Area', importance: Number((f.avg_bbox_area_ratio * 100).toFixed(2)) },
      { feature: 'Max BBox Area', importance: Number((f.max_bbox_area_ratio * 100).toFixed(2)) },
    ]
  }, [location])

  if (locations.length === 0) {
    return <EmptyInspectionState />
  }

  if (!location) {
    return (
      <GlassCard padding="lg" className="text-center">
        <p className="text-text-secondary">Location not found in the latest inspection</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/assets')}>
          Back to Assets
        </Button>
      </GlassCard>
    )
  }

  const riskLevel = normalizeRiskLevel(
    location.risk.risk_prediction.label || location.risk.risk_level,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4" data-reveal>
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/assets')}
        >
          Back
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{location.name}</h2>
          <p className="text-sm text-text-secondary">
            {location.road_name || 'Road'} · ID: {location.location_id} · Rank #{location.rank}
          </p>
        </div>
        <RiskBadge
          level={riskLevel}
          score={location.risk.risk_score}
          className="ml-auto"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
        <GlassCard padding="md">
          <p className="text-xs text-text-secondary">Risk Score</p>
          <p className="mt-1 text-2xl font-semibold text-critical">{location.risk.risk_score}</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-xs text-text-secondary">XGBoost Prediction</p>
          <p className="mt-1 text-2xl font-semibold text-warning">
            {location.risk.risk_prediction.label}
          </p>
          <p className="mt-1 text-xs text-muted">{location.risk.risk_prediction.model}</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-xs text-text-secondary">YOLO Detections</p>
          <p className="mt-1 text-2xl font-semibold text-accent">{location.risk.detection_count}</p>
          <p className="mt-1 text-xs text-muted">{location.images_analyzed} images analyzed</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-xs text-text-secondary">Priority</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">
            {location.priority.priority_score.toFixed(1)}
          </p>
          <p className="mt-1 text-xs text-muted">{location.priority.priority_level}</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" data-reveal>
        <GlassCard padding="md">
          <h3 className="mb-3 text-sm font-medium text-text-primary">Damage Breakdown</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ['D00', location.risk.damage_breakdown.D00, 'Longitudinal'],
                ['D10', location.risk.damage_breakdown.D10, 'Transverse'],
                ['D20', location.risk.damage_breakdown.D20, 'Alligator'],
                ['D40', location.risk.damage_breakdown.D40, 'Pothole'],
              ] as const
            ).map(([code, count, label]) => (
              <div key={code} className="rounded-xl border border-border/60 bg-surface/40 p-3">
                <p className="text-xs text-text-secondary">
                  {code} · {label}
                </p>
                <p className="mt-1 text-xl font-semibold text-text-primary">{count}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <h3 className="mb-3 text-sm font-medium text-text-primary">Location & Impact</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-text-secondary">Latitude</p>
              <p className="text-sm font-medium text-text-primary">{location.latitude.toFixed(5)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Longitude</p>
              <p className="text-sm font-medium text-text-primary">{location.longitude.toFixed(5)}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Entity Exposure</p>
              <p className="text-sm font-medium text-text-primary">
                {location.impact.entity_exposure_score.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">Connectivity</p>
              <p className="text-sm font-medium text-text-primary">
                {location.impact.connectivity_score.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-text-secondary">Nearby infrastructure</p>
            {location.impact.nearby_entities.length === 0 ? (
              <p className="text-xs text-muted">No nearby entities detected by GIS</p>
            ) : (
              location.impact.nearby_entities.map((entity, idx) => (
                <div
                  key={`${entity.name}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-xs"
                >
                  <span className="text-text-primary">
                    {entity.name}{' '}
                    <span className="text-text-secondary">({entity.type})</span>
                  </span>
                  <span className="font-mono text-accent">{Math.round(entity.distance_m)}m</span>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {features.length > 0 && <FeatureImportanceChart data={features} />}

      <GlassCard padding="md" data-reveal>
        <h3 className="mb-2 text-sm font-medium text-text-primary">Maintenance Recommendation</h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          {maintenanceRecommendation(location)}
        </p>
      </GlassCard>

      <div className="flex gap-3" data-reveal>
        <Button
          icon={<FlaskConical className="h-4 w-4" />}
          onClick={() => navigate('/simulation')}
        >
          Simulate Repair
        </Button>
        <Button
          variant="secondary"
          icon={<Wrench className="h-4 w-4" />}
          onClick={() => navigate('/optimizer')}
        >
          Open Maintenance
        </Button>
      </div>
    </div>
  )
}
