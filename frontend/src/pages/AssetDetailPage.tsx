import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FlaskConical, Wrench } from 'lucide-react'
import {
  fetchAssetById,
  fetchDegradation,
  fetchFeatureImportance,
} from '@/services/assets'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { ConditionBar } from '@/components/ui/ConditionBar'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { DegradationChart } from '@/components/charts/DegradationChart'
import { FeatureImportanceChart } from '@/components/charts/FeatureImportanceChart'
import { getRiskLevel, formatNumber } from '@/lib/utils'
import { useAssetStore } from '@/store/useAssetStore'
import { useEffect } from 'react'

export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const setSelectedAsset = useAssetStore((s) => s.setSelectedAsset)

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchAssetById(id!),
    enabled: !!id,
  })

  const { data: degradation } = useQuery({
    queryKey: ['degradation', id],
    queryFn: () => fetchDegradation(id!),
    enabled: !!id,
  })

  const { data: features } = useQuery({
    queryKey: ['features', id],
    queryFn: () => fetchFeatureImportance(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (asset) setSelectedAsset(asset)
    return () => setSelectedAsset(null)
  }, [asset, setSelectedAsset])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="card" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LoadingSkeleton variant="chart" />
          <LoadingSkeleton variant="chart" />
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <GlassCard padding="lg" className="text-center">
        <p className="text-text-secondary">Asset not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/assets')}>
          Back to Assets
        </Button>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4" data-reveal>
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/assets')}
        >
          Back
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">{asset.name}</h2>
          <p className="text-sm text-text-secondary">Asset ID: {asset.assetId}</p>
        </div>
        <RiskBadge level={getRiskLevel(asset.riskScore)} score={asset.riskScore} className="ml-auto" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-stagger>
        <GlassCard padding="md">
          <p className="text-xs text-text-secondary">Current Condition</p>
          <p className="mt-1 text-2xl font-semibold text-text-primary">{asset.condition}</p>
          <ConditionBar value={asset.condition} showLabel={false} size="sm" className="mt-2" />
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-xs text-text-secondary">Predicted Condition</p>
          <p className="mt-1 text-2xl font-semibold text-warning">{asset.predictedCondition}</p>
          <p className="mt-1 text-xs text-muted">AI forecast (12 mo)</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-xs text-text-secondary">Risk Score</p>
          <p className="mt-1 text-2xl font-semibold text-critical">{asset.riskScore}</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-xs text-text-secondary">Confidence</p>
          <p className="mt-1 text-2xl font-semibold text-accent">{asset.confidence}%</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" data-reveal>
        {degradation && <DegradationChart data={degradation} />}
        {features && <FeatureImportanceChart data={features} />}
      </div>

      <GlassCard padding="md" data-reveal>
        <h3 className="mb-4 text-sm font-medium text-text-primary">Asset Information</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Latitude', value: asset.latitude.toFixed(4) },
            { label: 'Longitude', value: asset.longitude.toFixed(4) },
            { label: 'Traffic', value: `${formatNumber(asset.traffic)}/day` },
            { label: 'Age', value: `${asset.age} years` },
            { label: 'Material', value: asset.material },
            { label: 'Status', value: asset.status },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-text-secondary">{item.label}</p>
              <p className="mt-0.5 text-sm font-medium capitalize text-text-primary">{item.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="flex gap-3" data-reveal>
        <Button
          icon={<FlaskConical className="h-4 w-4" />}
          onClick={() => navigate('/simulation', { state: { assetId: asset.id } })}
        >
          Simulate
        </Button>
        <Button variant="secondary" icon={<Wrench className="h-4 w-4" />}>
          Recommend Maintenance
        </Button>
      </div>
    </div>
  )
}
