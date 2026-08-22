import type { FeatureCollection } from 'geojson'
import { apiGet, apiPost } from '@/services/api'
import { getRiskLevel } from '@/lib/utils'
import type {
  Asset,
  AssetStatus,
  DegradationPoint,
  FeatureImportance,
  MetricsData,
  OptimizationInput,
  OptimizationResult,
  SimulationInput,
  SimulationResult,
} from '@/types'

interface PredictionResponse {
  assetId: string
  currentCondition: number
  predictedCondition: number
  deterioration: number
  riskScore: number
  riskLevel: string
  confidence: number
  featureImportance: FeatureImportance[]
}

interface OptimizeApiResponse {
  strategy: string
  budget: number
  budgetUsed: number
  expectedNetworkImprovement: number
  priorities: Array<{
    assetId: string
    name: string
    priorityScore: number
    estimatedCost: number
  }>
}

function normalizeStatus(status: string): AssetStatus {
  if (status === 'critical') return 'critical'
  if (status === 'monitoring') return 'monitoring'
  if (status === 'maintenance') return 'maintenance'
  return 'operational'
}

function normalizeAsset(raw: Asset): Asset {
  return {
    ...raw,
    status: normalizeStatus(raw.status),
  }
}

export async function fetchMetrics(): Promise<MetricsData> {
  return apiGet<MetricsData>('/metrics')
}

export async function fetchMapGeoJSON(): Promise<FeatureCollection> {
  const assets = await apiGet<Asset[]>('/assets')
  return {
    type: 'FeatureCollection',
    features: assets.map((asset) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [asset.longitude, asset.latitude],
      },
      properties: {
        id: asset.assetId,
        name: asset.name,
        type: asset.type,
        riskScore: asset.riskScore,
        condition: asset.condition,
        riskLevel: getRiskLevel(asset.riskScore),
      },
    })),
  }
}

export async function fetchAssets(): Promise<Asset[]> {
  const assets = await apiGet<Asset[]>('/assets?type=bridge')
  return assets.map(normalizeAsset)
}

export async function fetchAssetById(id: string): Promise<Asset> {
  const asset = await apiGet<Asset>(`/assets/${id}`)
  return normalizeAsset(asset)
}

export async function fetchDegradation(assetId: string): Promise<DegradationPoint[]> {
  const asset = await fetchAssetById(assetId)
  const years = [2020, 2021, 2022, 2023, 2024, 2025]
  return years.map((year, index) => ({
    year,
    condition: Math.round(asset.condition + (years.length - 1 - index) * 1.5),
    predicted: Math.round(asset.predictedCondition + (years.length - 1 - index) * 1.2),
  }))
}

export async function fetchFeatureImportance(assetId: string): Promise<FeatureImportance[]> {
  const prediction = await apiGet<PredictionResponse>(`/predictions/${assetId}`)
  return prediction.featureImportance ?? []
}

export async function runSimulation(input: SimulationInput): Promise<SimulationResult> {
  const result = await apiPost<Omit<SimulationResult, 'costEstimate'> & { assetId?: string }>(
    '/simulate',
    {
      assetId: input.assetId,
      repairQuality: input.repairQuality,
      budget: input.budget,
    },
  )
  return {
    beforeRisk: result.beforeRisk,
    afterRisk: result.afterRisk,
    riskReduction: result.riskReduction,
    estimatedAccessTime: result.estimatedAccessTime,
    costEstimate: Math.min(input.budget, Math.round(25_000 + input.repairQuality * 800)),
  }
}

export async function runOptimization(input: OptimizationInput): Promise<OptimizationResult> {
  const result = await apiPost<OptimizeApiResponse>('/optimize', {
    budget: input.budget,
    strategy: input.strategy,
  })

  return {
    budgetUsed: result.budgetUsed,
    expectedNetworkImprovement: result.expectedNetworkImprovement,
    items: result.priorities.map((item, index) => ({
      rank: index + 1,
      assetId: item.assetId,
      name: item.name,
      priorityScore: item.priorityScore,
      estimatedCost: item.estimatedCost,
      expectedImprovement: Math.round(item.priorityScore * 0.35),
      riskScore: item.priorityScore,
    })),
  }
}
