import type { FeatureCollection } from 'geojson'
import {
  BRIDGE_NAMES,
  HOSPITAL_NAMES,
  MATERIALS,
  ROAD_NAMES,
} from '@/lib/constants'
import { getRiskLevel } from '@/lib/utils'
import type {
  Asset,
  AssetStatus,
  DegradationPoint,
  FeatureImportance,
  Hospital,
  MetricsData,
  NetworkData,
  CascadeImpact,
  OptimizationResult,
  Road,
  SimulationResult,
} from '@/types'

const CENTER_LAT = 35.2271
const CENTER_LNG = -80.8431

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function randomInRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randomInRange(rng, min, max + 1))
}

function generateCoordinates(rng: () => number, index: number): { lat: number; lng: number } {
  const angle = (index / 60) * Math.PI * 2
  const radius = 0.08 + rng() * 0.12
  return {
    lat: CENTER_LAT + Math.sin(angle) * radius,
    lng: CENTER_LNG + Math.cos(angle) * radius,
  }
}

function getStatus(riskScore: number): AssetStatus {
  if (riskScore >= 80) return 'critical'
  if (riskScore >= 60) return 'maintenance'
  if (riskScore >= 40) return 'monitoring'
  return 'operational'
}

const rng = seededRandom(42)

export const bridges: Asset[] = BRIDGE_NAMES.map((name, i) => {
  const { lat, lng } = generateCoordinates(rng, i)
  const condition = randomInt(rng, 35, 92)
  const riskScore = randomInt(rng, 15, 95)
  const id = `B${String(i + 1).padStart(2, '0')}`

  return {
    id,
    assetId: id,
    name: `Bridge ${name}`,
    type: 'bridge',
    latitude: lat,
    longitude: lng,
    condition,
    predictedCondition: Math.max(20, condition - randomInt(rng, 3, 18)),
    riskScore,
    confidence: randomInt(rng, 78, 97),
    traffic: randomInt(rng, 8000, 65000),
    age: randomInt(rng, 12, 55),
    material: MATERIALS[randomInt(rng, 0, MATERIALS.length - 1)]!,
    status: getStatus(riskScore),
  }
})

export const roads: Road[] = ROAD_NAMES.map((name, i) => {
  const { lat, lng } = generateCoordinates(rng, i + 40)
  const condition = randomInt(rng, 40, 88)
  const riskScore = randomInt(rng, 10, 85)

  return {
    id: `R${String(i + 1).padStart(2, '0')}`,
    name,
    capacity: randomInt(rng, 15000, 120000),
    latitude: lat,
    longitude: lng,
    condition,
    riskScore,
  }
})

export const hospitals: Hospital[] = HOSPITAL_NAMES.map((name, i) => {
  const { lat, lng } = generateCoordinates(rng, i + 55)
  return {
    id: `H${String(i + 1).padStart(2, '0')}`,
    name,
    latitude: lat,
    longitude: lng,
    beds: randomInt(rng, 150, 900),
    riskScore: randomInt(rng, 20, 75),
  }
})

export const allAssets: Asset[] = [
  ...bridges,
  ...roads.map((r) => ({
    id: r.id,
    assetId: r.id,
    name: r.name,
    type: 'road' as const,
    latitude: r.latitude,
    longitude: r.longitude,
    condition: r.condition,
    predictedCondition: Math.max(25, r.condition - randomInt(rng, 2, 12)),
    riskScore: r.riskScore,
    confidence: randomInt(rng, 72, 94),
    traffic: r.capacity,
    age: randomInt(rng, 8, 40),
    material: 'Asphalt',
    status: getStatus(r.riskScore),
  })),
  ...hospitals.map((h) => ({
    id: h.id,
    assetId: h.id,
    name: h.name,
    type: 'hospital' as const,
    latitude: h.latitude,
    longitude: h.longitude,
    condition: randomInt(rng, 60, 95),
    predictedCondition: randomInt(rng, 55, 90),
    riskScore: h.riskScore,
    confidence: randomInt(rng, 80, 96),
    traffic: h.beds * 12,
    age: randomInt(rng, 5, 35),
    material: 'Composite',
    status: getStatus(h.riskScore),
  })),
]

export const metrics: MetricsData = {
  totalAssets: allAssets.length,
  criticalAssets: allAssets.filter((a) => a.riskScore >= 80).length,
  networkRisk: Math.round(
    allAssets.reduce((sum, a) => sum + a.riskScore, 0) / allAssets.length,
  ),
  averageCondition: Math.round(
    allAssets.reduce((sum, a) => sum + a.condition, 0) / allAssets.length,
  ),
  conditionTrend: [
    { month: 'Jan', condition: 71, predicted: 69 },
    { month: 'Feb', condition: 70, predicted: 68 },
    { month: 'Mar', condition: 69, predicted: 67 },
    { month: 'Apr', condition: 68, predicted: 66 },
    { month: 'May', condition: 67, predicted: 65 },
    { month: 'Jun', condition: 66, predicted: 63 },
    { month: 'Jul', condition: 65, predicted: 62 },
    { month: 'Aug', condition: 64, predicted: 60 },
    { month: 'Sep', condition: 63, predicted: 59 },
    { month: 'Oct', condition: 62, predicted: 58 },
    { month: 'Nov', condition: 61, predicted: 57 },
    { month: 'Dec', condition: 60, predicted: 56 },
  ],
  riskDistribution: [
    { level: 'low', count: allAssets.filter((a) => getRiskLevel(a.riskScore) === 'low').length, label: 'Low' },
    { level: 'medium', count: allAssets.filter((a) => getRiskLevel(a.riskScore) === 'medium').length, label: 'Medium' },
    { level: 'high', count: allAssets.filter((a) => getRiskLevel(a.riskScore) === 'high').length, label: 'High' },
    { level: 'critical', count: allAssets.filter((a) => getRiskLevel(a.riskScore) === 'critical').length, label: 'Critical' },
  ],
  assetCategories: [
    { category: 'Bridges', count: bridges.length, fill: '#60A5FA' },
    { category: 'Roads', count: roads.length, fill: '#38BDF8' },
    { category: 'Hospitals', count: hospitals.length, fill: '#818CF8' },
  ],
  monthlyInspections: [
    { month: 'Jan', completed: 18, scheduled: 22 },
    { month: 'Feb', completed: 21, scheduled: 24 },
    { month: 'Mar', completed: 19, scheduled: 22 },
    { month: 'Apr', completed: 24, scheduled: 26 },
    { month: 'May', completed: 22, scheduled: 25 },
    { month: 'Jun', completed: 26, scheduled: 28 },
    { month: 'Jul', completed: 23, scheduled: 26 },
    { month: 'Aug', completed: 27, scheduled: 30 },
    { month: 'Sep', completed: 25, scheduled: 28 },
    { month: 'Oct', completed: 28, scheduled: 30 },
    { month: 'Nov', completed: 24, scheduled: 27 },
    { month: 'Dec', completed: 20, scheduled: 24 },
  ],
}

/** MVP-focused topology: Bridge → Road → Hospital */
export const networkData: NetworkData = {
  nodes: [
    { id: 'B17', label: 'Bridge B17', type: 'bridge', riskScore: 82, x: 120, y: 280 },
    { id: 'B31', label: 'Bridge B31', type: 'bridge', riskScore: 74, x: 120, y: 420 },
    { id: 'B62', label: 'Bridge B62', type: 'bridge', riskScore: 76, x: 320, y: 350 },
    { id: 'R42', label: 'Road R42', type: 'road', riskScore: 45, x: 240, y: 200 },
    { id: 'R51', label: 'Road R51', type: 'road', riskScore: 38, x: 240, y: 350 },
    { id: 'R63', label: 'Road R63', type: 'road', riskScore: 42, x: 400, y: 280 },
    { id: 'H03', label: 'Hospital H03', type: 'hospital', riskScore: 15, x: 240, y: 80 },
    { id: 'H04', label: 'Hospital H04', type: 'hospital', riskScore: 18, x: 480, y: 200 },
    { id: 'H07', label: 'Hospital H07', type: 'hospital', riskScore: 12, x: 480, y: 400 },
  ],
  edges: [
    { id: 'e1', sourceId: 'B17', targetId: 'R42', relation: 'CONNECTED_TO' },
    { id: 'e2', sourceId: 'B31', targetId: 'R51', relation: 'CONNECTED_TO' },
    { id: 'e3', sourceId: 'B62', targetId: 'R63', relation: 'CONNECTED_TO' },
    { id: 'e4', sourceId: 'R42', targetId: 'R51', relation: 'CONNECTED_TO' },
    { id: 'e5', sourceId: 'R51', targetId: 'R63', relation: 'CONNECTED_TO' },
    { id: 'e6', sourceId: 'R42', targetId: 'H03', relation: 'PROVIDES_ACCESS' },
    { id: 'e7', sourceId: 'R63', targetId: 'H04', relation: 'PROVIDES_ACCESS' },
    { id: 'e8', sourceId: 'R63', targetId: 'H07', relation: 'PROVIDES_ACCESS' },
    { id: 'e9', sourceId: 'B17', targetId: 'R51', relation: 'CONNECTED_TO' },
  ],
}

export function getCascadeImpact(nodeId: string): CascadeImpact {
  const impacts: Record<string, CascadeImpact> = {
    B17: {
      affectedRoads: ['R42', 'R51'],
      affectedHospitals: ['H03'],
      cascadeRisk: 'high',
      estimatedAccessTimeIncrease: 18,
    },
    B31: {
      affectedRoads: ['R51'],
      affectedHospitals: ['H03'],
      cascadeRisk: 'medium',
      estimatedAccessTimeIncrease: 12,
    },
    B62: {
      affectedRoads: ['R63'],
      affectedHospitals: ['H04', 'H07'],
      cascadeRisk: 'high',
      estimatedAccessTimeIncrease: 22,
    },
    R42: {
      affectedRoads: ['R51'],
      affectedHospitals: ['H03', 'H04'],
      cascadeRisk: 'critical',
      estimatedAccessTimeIncrease: 28,
    },
    R51: {
      affectedRoads: ['R63'],
      affectedHospitals: ['H03'],
      cascadeRisk: 'medium',
      estimatedAccessTimeIncrease: 14,
    },
    R63: {
      affectedRoads: ['R51'],
      affectedHospitals: ['H04', 'H07'],
      cascadeRisk: 'high',
      estimatedAccessTimeIncrease: 20,
    },
  }

  return (
    impacts[nodeId] ?? {
      affectedRoads: ['R42'],
      affectedHospitals: ['H03'],
      cascadeRisk: 'medium',
      estimatedAccessTimeIncrease: 15,
    }
  )
}

export const mapGeoJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    ...bridges.map((b) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [b.longitude, b.latitude] as [number, number],
      },
      properties: {
        id: b.id,
        name: b.name,
        type: 'bridge',
        riskScore: b.riskScore,
        condition: b.condition,
        riskLevel: getRiskLevel(b.riskScore),
      },
    })),
    ...roads.map((r) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [r.longitude, r.latitude] as [number, number],
      },
      properties: {
        id: r.id,
        name: r.name,
        type: 'road',
        riskScore: r.riskScore,
        condition: r.condition,
        riskLevel: getRiskLevel(r.riskScore),
      },
    })),
    ...hospitals.map((h) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [h.longitude, h.latitude] as [number, number],
      },
      properties: {
        id: h.id,
        name: h.name,
        type: 'hospital',
        riskScore: h.riskScore,
        riskLevel: getRiskLevel(h.riskScore),
      },
    })),
  ],
}

export function getDegradationData(assetId: string): DegradationPoint[] {
  const asset = allAssets.find((a) => a.id === assetId)
  const base = asset?.condition ?? 70
  const currentYear = 2026

  return Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - 9 + i
    const decline = i * 2.5
    return {
      year,
      condition: Math.max(20, Math.round(base + 15 - decline)),
      predicted: Math.max(15, Math.round(base + 10 - decline - 5)),
    }
  })
}

export function getFeatureImportance(assetId: string): FeatureImportance[] {
  const asset = allAssets.find((a) => a.id === assetId)
  const seed = asset ? asset.id.charCodeAt(1) : 5

  return [
    { feature: 'Age', importance: 18 + (seed % 8) },
    { feature: 'Traffic Load', importance: 15 + (seed % 6) },
    { feature: 'Material Fatigue', importance: 12 + (seed % 5) },
    { feature: 'Weather Exposure', importance: 10 + (seed % 4) },
    { feature: 'Inspection Gap', importance: 9 + (seed % 3) },
    { feature: 'Seismic Risk', importance: 7 + (seed % 4) },
    { feature: 'Foundation', importance: 6 + (seed % 3) },
    { feature: 'Corrosion', importance: 5 + (seed % 2) },
  ].sort((a, b) => b.importance - a.importance)
}

export function mockSimulation(
  assetId: string,
  repairQuality: number,
  budget: number,
): SimulationResult {
  const asset = allAssets.find((a) => a.id === assetId)
  const beforeRisk = asset?.riskScore ?? 65
  const reduction = Math.min(beforeRisk - 10, (repairQuality / 100) * 45 + budget / 50000)
  const afterRisk = Math.max(8, Math.round(beforeRisk - reduction))

  return {
    beforeRisk,
    afterRisk,
    riskReduction: Math.round(beforeRisk - afterRisk),
    estimatedAccessTime: Math.round(12 + (afterRisk / 100) * 28),
    costEstimate: Math.min(budget, Math.round(25000 + repairQuality * 800)),
  }
}

export function mockOptimization(
  budget: number,
  strategy: 'safety' | 'accessibility' | 'economic',
): OptimizationResult {
  const sorted = [...bridges]
    .map((b) => {
      let score = b.riskScore
      if (strategy === 'safety') score += b.traffic / 5000
      if (strategy === 'accessibility') score += b.riskScore * 0.3
      if (strategy === 'economic') score += b.age * 0.5

      return {
        rank: 0,
        assetId: b.id,
        name: b.name,
        priorityScore: Math.round(score * 10) / 10,
        estimatedCost: Math.round(35000 + b.riskScore * 1200),
        expectedImprovement: Math.round(8 + b.riskScore * 0.15),
        riskScore: b.riskScore,
      }
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)

  let remaining = budget
  const items = []

  for (const item of sorted) {
    if (remaining <= 0) break
    if (item.estimatedCost <= remaining) {
      items.push({ ...item, rank: items.length + 1 })
      remaining -= item.estimatedCost
    }
  }

  const budgetUsed = budget - remaining
  const expectedNetworkImprovement =
    items.reduce((sum, i) => sum + i.expectedImprovement, 0) / Math.max(items.length, 1)

  return {
    items,
    budgetUsed,
    expectedNetworkImprovement: Math.round(expectedNetworkImprovement * 10) / 10,
  }
}

export function getAssetById(id: string): Asset | undefined {
  return allAssets.find((a) => a.id === id || a.assetId === id)
}

export const DEMO_USER = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'admin@infra-x.gov',
}

export const DEMO_TOKEN = 'demo-jwt-token-infra-x-2026'
