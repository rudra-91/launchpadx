import { apiGet } from '@/services/api'
import type { CascadeImpact, NetworkData, RiskLevel } from '@/types'

interface NetworkApiResponse {
  nodes: NetworkData['nodes']
  edges: NetworkData['edges']
}

interface NetworkNodeApiResponse {
  node: NetworkData['nodes'][number]
  cascade: {
    affectedRoads: string[]
    affectedHospitals: string[]
    cascadeRisk: string
    estimatedAccessTimeIncrease: number
  }
}

export async function fetchNetwork(): Promise<NetworkData> {
  return apiGet<NetworkApiResponse>('/network')
}

export async function fetchCascadeImpact(nodeId: string): Promise<CascadeImpact> {
  const response = await apiGet<NetworkNodeApiResponse>(`/network/${nodeId}`)
  return {
    affectedRoads: response.cascade.affectedRoads,
    affectedHospitals: response.cascade.affectedHospitals,
    cascadeRisk: response.cascade.cascadeRisk as RiskLevel,
    estimatedAccessTimeIncrease: response.cascade.estimatedAccessTimeIncrease,
  }
}
