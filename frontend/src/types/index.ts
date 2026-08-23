export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type AssetType = 'bridge' | 'road' | 'hospital'

export type NetworkNodeType =
  | AssetType
  | 'fire_station'
  | 'police_station'
  | 'school'
  | 'infrastructure'

export type AssetStatus = 'operational' | 'monitoring' | 'maintenance' | 'critical'

export interface User {
  id: string
  name: string
  email: string
  role?: string
}

export interface Asset {
  id: string
  assetId: string
  name: string
  type: AssetType
  latitude: number
  longitude: number
  condition: number
  predictedCondition: number
  riskScore: number
  confidence: number
  traffic: number
  age: number
  material: string
  status: AssetStatus
}

export interface Hospital {
  id: string
  name: string
  latitude: number
  longitude: number
  beds: number
  riskScore: number
}

export interface Road {
  id: string
  name: string
  capacity: number
  latitude: number
  longitude: number
  condition: number
  riskScore: number
}

export interface NetworkNode {
  id: string
  label: string
  type: NetworkNodeType
  riskScore: number
  distance_m?: number
  x?: number
  y?: number
}

export interface NetworkEdge {
  id: string
  sourceId: string
  targetId: string
  relation: 'CONNECTED_TO' | 'PROVIDES_ACCESS'
  weight?: number
}

export interface NetworkData {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

export interface CascadeImpact {
  affectedRoads: string[]
  affectedHospitals: string[]
  cascadeRisk: RiskLevel
  estimatedAccessTimeIncrease?: number
}

export interface MetricsData {
  totalAssets: number
  criticalAssets: number
  networkRisk: number
  averageCondition: number
  conditionTrend: TrendPoint[]
  riskDistribution: DistributionPoint[]
  assetCategories: CategoryPoint[]
  monthlyInspections: InspectionPoint[]
}

export interface TrendPoint {
  month: string
  condition: number
  predicted: number
}

export interface DistributionPoint {
  level: RiskLevel
  count: number
  label: string
}

export interface CategoryPoint {
  category: string
  count: number
  fill: string
}

export interface InspectionPoint {
  month: string
  completed: number
  scheduled: number
}

export interface DegradationPoint {
  year: number
  condition: number
  predicted: number
}

export interface FeatureImportance {
  feature: string
  importance: number
}

export interface SimulationInput {
  assetId: string
  repairQuality: number
  budget: number
}

export interface SimulationResult {
  beforeRisk: number
  afterRisk: number
  riskReduction: number
  estimatedAccessTime: number
  costEstimate: number
}

export type OptimizationStrategy = 'safety' | 'accessibility' | 'economic'

export interface OptimizationInput {
  budget: number
  strategy: OptimizationStrategy
}

export interface PriorityItem {
  rank: number
  assetId: string
  name: string
  priorityScore: number
  estimatedCost: number
  expectedImprovement: number
  riskScore: number
}

export interface OptimizationResult {
  items: PriorityItem[]
  budgetUsed: number
  expectedNetworkImprovement: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface MapFeatureProperties {
  id: string
  name: string
  type: AssetType
  riskScore: number
  condition?: number
  riskLevel: RiskLevel
}

// ============================================================================
// ROAD INSPECTION PIPELINE TYPES (FastAPI / YOLO / XGBoost / GIS Contract)
// ============================================================================

export interface InspectionLocationInput {
  location_id: string
  name: string
  latitude: number
  longitude: number
  road_name: string
  image_keys: string[]
}

export interface YOLOBoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface YOLODetection {
  damage_type: string
  damage_name: string
  confidence: number
  bbox: YOLOBoundingBox
}

export interface AnalyzedImageOut {
  image_key: string
  detections: YOLODetection[]
  image_width: number
  image_height: number
  preview_url?: string
}

export interface DamageBreakdown {
  D00: number
  D10: number
  D20: number
  D40: number
}

export interface RiskPredictionOut {
  class: number
  label: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  model: string
}

export interface RiskFeaturesOut {
  d00_count: number
  d10_count: number
  d20_count: number
  d40_count: number
  total_detections: number
  d00_area_ratio: number
  d10_area_ratio: number
  d20_area_ratio: number
  d40_area_ratio: number
  total_damage_area_ratio: number
  avg_bbox_area_ratio: number
  max_bbox_area_ratio: number
}

export interface LocationRiskOut {
  damage_score: number
  risk_score: number
  risk_level: string
  detection_count: number
  damage_breakdown: DamageBreakdown
  risk_prediction: RiskPredictionOut
  risk_features: RiskFeaturesOut
}

export interface NearbyEntityOut {
  type: string
  name: string
  latitude: number
  longitude: number
  distance_m: number
}

export interface ImpactOut {
  nearby_entities: NearbyEntityOut[]
  entity_exposure_score: number
  connectivity_score: number
}

export interface PriorityOut {
  priority_score: number
  priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export interface AnalyzedLocationOut {
  rank: number
  location_id: string
  name: string
  road_name?: string
  latitude: number
  longitude: number
  images_analyzed: number
  images: AnalyzedImageOut[]
  risk: LocationRiskOut
  impact: ImpactOut
  priority: PriorityOut
}

export interface InspectionMetricsSnapshot {
  totalLocations: number
  highCriticalCount: number
  totalDetections: number
  totalImages: number
  nearbyEntityCount: number
  averageRiskScore: number
  maxRiskScore: number
  highestPriorityName: string | null
  highestPriorityScore: number | null
  damageTotals: DamageBreakdown
  riskDistribution: DistributionPoint[]
  damageCategoryCounts: CategoryPoint[]
  averagePriorityScore: number
}

export interface InspectionAnalysisDataOut {
  locations: AnalyzedLocationOut[]
}
