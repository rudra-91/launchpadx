import type { FeatureCollection } from 'geojson'
import {
  allAssets,
  getAssetById,
  getDegradationData,
  getFeatureImportance,
  mapGeoJSON,
  metrics,
  mockOptimization,
  mockSimulation,
} from '@/data/mockData'
import { delay } from '@/lib/utils'
import type {
  Asset,
  DegradationPoint,
  FeatureImportance,
  MetricsData,
  OptimizationInput,
  OptimizationResult,
  SimulationInput,
  SimulationResult,
} from '@/types'

export async function fetchMetrics(): Promise<MetricsData> {
  await delay(400)
  return metrics
}

export async function fetchMapGeoJSON(): Promise<FeatureCollection> {
  await delay(300)
  return mapGeoJSON
}

export async function fetchAssets(): Promise<Asset[]> {
  await delay(350)
  return allAssets.filter((a) => a.type === 'bridge')
}

export async function fetchAssetById(id: string): Promise<Asset> {
  await delay(300)
  const asset = getAssetById(id)
  if (!asset) throw new Error(`Asset ${id} not found`)
  return asset
}

export async function fetchDegradation(assetId: string): Promise<DegradationPoint[]> {
  await delay(250)
  return getDegradationData(assetId)
}

export async function fetchFeatureImportance(
  assetId: string,
): Promise<FeatureImportance[]> {
  await delay(250)
  return getFeatureImportance(assetId)
}

export async function runSimulation(input: SimulationInput): Promise<SimulationResult> {
  await delay(800)
  return mockSimulation(input.assetId, input.repairQuality, input.budget)
}

export async function runOptimization(
  input: OptimizationInput,
): Promise<OptimizationResult> {
  await delay(900)
  return mockOptimization(input.budget, input.strategy)
}
