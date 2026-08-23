import type { FeatureCollection } from 'geojson'
import type {
  AnalyzedLocationOut,
  CascadeImpact,
  CategoryPoint,
  DamageBreakdown,
  DistributionPoint,
  InspectionAnalysisDataOut,
  InspectionMetricsSnapshot,
  NetworkData,
  NetworkNodeType,
  OptimizationResult,
  OptimizationStrategy,
  PriorityItem,
  RiskLevel,
  SimulationResult,
} from '@/types'

export function normalizeRiskLevel(level: string | undefined | null): RiskLevel {
  const value = (level ?? '').toLowerCase()
  if (value === 'critical') return 'critical'
  if (value === 'high') return 'high'
  if (value === 'medium') return 'medium'
  return 'low'
}

export function mapEntityToNodeType(entityType: string): NetworkNodeType {
  const t = entityType.toLowerCase()
  if (t.includes('hospital')) return 'hospital'
  if (t.includes('fire')) return 'fire_station'
  if (t.includes('police')) return 'police_station'
  if (t.includes('school')) return 'school'
  if (t.includes('road') || t.includes('highway')) return 'road'
  if (t.includes('bridge')) return 'bridge'
  return 'infrastructure'
}

export function getLocations(
  results: InspectionAnalysisDataOut | null | undefined,
): AnalyzedLocationOut[] {
  return results?.locations ?? []
}

export function findLocationById(
  results: InspectionAnalysisDataOut | null | undefined,
  id: string | null | undefined,
): AnalyzedLocationOut | undefined {
  if (!id) return undefined
  return getLocations(results).find((loc) => loc.location_id === id)
}

export function deriveInspectionMetrics(
  results: InspectionAnalysisDataOut | null | undefined,
): InspectionMetricsSnapshot | null {
  const locations = getLocations(results)
  if (locations.length === 0) return null

  const damageTotals: DamageBreakdown = { D00: 0, D10: 0, D20: 0, D40: 0 }
  let totalDetections = 0
  let totalImages = 0
  let nearbyEntityCount = 0
  let riskSum = 0
  let prioritySum = 0
  let maxRiskScore = 0

  const riskCounts: Record<RiskLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  }

  for (const loc of locations) {
    const bd = loc.risk.damage_breakdown
    damageTotals.D00 += bd.D00
    damageTotals.D10 += bd.D10
    damageTotals.D20 += bd.D20
    damageTotals.D40 += bd.D40
    totalDetections += loc.risk.detection_count
    totalImages += loc.images_analyzed
    nearbyEntityCount += loc.impact.nearby_entities.length
    riskSum += loc.risk.risk_score
    prioritySum += loc.priority.priority_score
    maxRiskScore = Math.max(maxRiskScore, loc.risk.risk_score)

    const level = normalizeRiskLevel(loc.risk.risk_prediction.label || loc.risk.risk_level)
    riskCounts[level] += 1
  }

  const riskDistribution: DistributionPoint[] = (
    ['low', 'medium', 'high', 'critical'] as RiskLevel[]
  ).map((level) => ({
    level,
    count: riskCounts[level],
    label: level.charAt(0).toUpperCase() + level.slice(1),
  }))

  const damageCategoryCounts: CategoryPoint[] = [
    { category: 'Longitudinal (D00)', count: damageTotals.D00, fill: '#60A5FA' },
    { category: 'Transverse (D10)', count: damageTotals.D10, fill: '#38BDF8' },
    { category: 'Alligator (D20)', count: damageTotals.D20, fill: '#F97316' },
    { category: 'Pothole (D40)', count: damageTotals.D40, fill: '#EF4444' },
  ]

  const top = locations[0]

  return {
    totalLocations: locations.length,
    highCriticalCount: riskCounts.high + riskCounts.critical,
    totalDetections,
    totalImages,
    nearbyEntityCount,
    averageRiskScore: Number((riskSum / locations.length).toFixed(1)),
    maxRiskScore: Number(maxRiskScore.toFixed(1)),
    highestPriorityName: top?.name ?? null,
    highestPriorityScore: top ? Number(top.priority.priority_score.toFixed(1)) : null,
    damageTotals,
    riskDistribution,
    damageCategoryCounts,
    averagePriorityScore: Number((prioritySum / locations.length).toFixed(1)),
  }
}

export function buildInspectionGeoJSON(
  results: InspectionAnalysisDataOut | null | undefined,
): FeatureCollection | null {
  const locations = getLocations(results)
  if (locations.length === 0) return null

  return {
    type: 'FeatureCollection',
    features: locations.map((loc) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [loc.longitude, loc.latitude],
      },
      properties: {
        id: loc.location_id,
        name: loc.name,
        type: 'road',
        riskScore: loc.risk.risk_score,
        condition: Math.max(0, Math.round(100 - loc.risk.damage_score)),
        riskLevel: normalizeRiskLevel(loc.risk.risk_prediction.label || loc.risk.risk_level),
        priorityLevel: loc.priority.priority_level,
        priorityScore: loc.priority.priority_score,
        detections: loc.risk.detection_count,
        rank: loc.rank,
      },
    })),
  }
}

/** Spaced cluster layout: each road is a hub with entities in a grid below it. */
export function buildNetworkFromInspection(
  results: InspectionAnalysisDataOut | null | undefined,
): NetworkData | null {
  const locations = getLocations(results)
  if (locations.length === 0) return null

  const nodes: NetworkData['nodes'] = []
  const edges: NetworkData['edges'] = []

  const ENTITY_COLS = 3
  const ENTITY_COL_W = 168
  const ENTITY_ROW_H = 118
  const ROAD_Y = 72
  const CLUSTER_PAD_X = 120
  const CLUSTER_GAP = 80

  let cursorX = CLUSTER_PAD_X

  locations.forEach((loc) => {
    const entityCount = loc.impact.nearby_entities.length
    const cols = Math.min(ENTITY_COLS, Math.max(entityCount, 1))
    const gridWidth = Math.max(cols - 1, 0) * ENTITY_COL_W
    const clusterWidth = Math.max(gridWidth, 220)
    const roadX = cursorX + clusterWidth / 2
    const roadId = loc.location_id

    nodes.push({
      id: roadId,
      label: loc.name,
      type: 'road',
      riskScore: loc.risk.risk_score,
      x: roadX,
      y: ROAD_Y,
    })

    loc.impact.nearby_entities.forEach((entity, eIdx) => {
      const col = eIdx % ENTITY_COLS
      const row = Math.floor(eIdx / ENTITY_COLS)
      const entityId = `${roadId}::${entity.type}::${entity.name}::${eIdx}`
      const x = roadX - gridWidth / 2 + col * ENTITY_COL_W
      const y = ROAD_Y + 130 + row * ENTITY_ROW_H

      nodes.push({
        id: entityId,
        label: entity.name,
        type: mapEntityToNodeType(entity.type),
        riskScore: loc.risk.risk_score,
        distance_m: entity.distance_m,
        x,
        y,
      })
      edges.push({
        id: `${roadId}->${entityId}`,
        sourceId: roadId,
        targetId: entityId,
        relation: 'PROVIDES_ACCESS',
        weight: entity.distance_m,
      })
    })

    cursorX += clusterWidth + CLUSTER_GAP + CLUSTER_PAD_X
  })

  return { nodes, edges }
}

export function buildCascadeFromLocation(loc: AnalyzedLocationOut | undefined): CascadeImpact | null {
  if (!loc) return null

  const affected = loc.impact.nearby_entities.map(
    (entity, idx) => `${loc.location_id}::${entity.type}::${entity.name}::${idx}`,
  )

  return {
    affectedRoads: [loc.location_id],
    affectedHospitals: affected.filter((id) => id.toLowerCase().includes('hospital')),
    cascadeRisk: normalizeRiskLevel(loc.priority.priority_level),
    estimatedAccessTimeIncrease: Number(
      (loc.impact.entity_exposure_score * 0.35 + loc.risk.risk_score * 0.08).toFixed(1),
    ),
  }
}

export function maintenanceRecommendation(loc: AnalyzedLocationOut): string {
  const level = loc.priority.priority_level
  const detections = loc.risk.detection_count
  const entities = loc.impact.nearby_entities.length

  if (level === 'CRITICAL') {
    return `Immediate intervention required (${detections} detections, ${entities} nearby critical entities). Deploy emergency repair crew.`
  }
  if (level === 'HIGH') {
    return `Schedule priority resurfacing within 7 days. Address dominant damage classes and protect nearby infrastructure access.`
  }
  if (level === 'MEDIUM') {
    return `Include in next maintenance cycle for crack sealing / pothole patching based on YOLO damage breakdown.`
  }
  return `Routine monitoring. Re-inspect after the next cycle unless conditions worsen.`
}

export function optimizeFromInspection(
  results: InspectionAnalysisDataOut | null | undefined,
  budget: number,
  strategy: OptimizationStrategy,
): OptimizationResult | null {
  const locations = getLocations(results)
  if (locations.length === 0) return null

  const ranked = [...locations].sort((a, b) => {
    if (strategy === 'accessibility') {
      return (
        b.impact.entity_exposure_score + b.impact.connectivity_score -
        (a.impact.entity_exposure_score + a.impact.connectivity_score)
      )
    }
    if (strategy === 'economic') {
      return b.risk.detection_count * 2 + b.risk.risk_score - (a.risk.detection_count * 2 + a.risk.risk_score)
    }
    return b.priority.priority_score - a.priority.priority_score
  })

  const items: PriorityItem[] = []
  let used = 0

  for (const loc of ranked) {
    // Cost scales with priority + detections from THIS inspection (not hardcoded US assets)
    const estimatedCost = Math.round(
      40_000 + loc.priority.priority_score * 1_800 + loc.risk.detection_count * 2_500,
    )
    if (used + estimatedCost > budget) continue
    used += estimatedCost
    items.push({
      rank: items.length + 1,
      assetId: loc.location_id,
      name: loc.name,
      priorityScore: Number(loc.priority.priority_score.toFixed(1)),
      estimatedCost,
      expectedImprovement: Number((loc.priority.priority_score * 0.35).toFixed(1)),
      riskScore: Number(loc.risk.risk_score.toFixed(1)),
    })
  }

  const improvement = Math.min(
    35,
    items.length * 4.5 + (budget > 0 ? (used / budget) * 10 : 0),
  )

  return {
    items,
    budgetUsed: used,
    expectedNetworkImprovement: Number(improvement.toFixed(1)),
  }
}

export function simulateFromInspection(
  loc: AnalyzedLocationOut,
  repairQuality: number,
  budget: number,
): SimulationResult {
  const beforeRisk = loc.risk.risk_score
  const qualityFactor = repairQuality / 100
  const budgetFactor = Math.min(budget / 500_000, 1)
  const improvement = (qualityFactor * 0.6 + budgetFactor * 0.4) * 28
  const afterRisk = Math.max(5, beforeRisk - improvement)
  const reduction = beforeRisk - afterRisk
  const accessTime = Math.max(0, 24 - reduction * 0.4)

  return {
    beforeRisk: Number(beforeRisk.toFixed(1)),
    afterRisk: Number(afterRisk.toFixed(1)),
    riskReduction: Number(reduction.toFixed(1)),
    estimatedAccessTime: Number(accessTime.toFixed(1)),
    costEstimate: Math.min(budget, Math.round(25_000 + repairQuality * 800 + loc.risk.detection_count * 1_200)),
  }
}

export function mapCenterFromInspection(
  results: InspectionAnalysisDataOut | null | undefined,
): [number, number] | null {
  const locations = getLocations(results)
  if (locations.length === 0) return null
  const lng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length
  const lat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length
  return [lng, lat]
}
