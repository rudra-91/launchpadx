export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type AssetType = 'bridge' | 'road' | 'hospital'

export type AssetStatus = 'operational' | 'monitoring' | 'maintenance' | 'critical'

export interface User {
  id: string
  name: string
  email: string
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
  type: AssetType
  riskScore: number
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
