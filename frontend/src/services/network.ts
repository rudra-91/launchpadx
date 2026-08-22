import { networkData, getCascadeImpact } from '@/data/mockData'
import { delay } from '@/lib/utils'
import type { CascadeImpact, NetworkData } from '@/types'

export async function fetchNetwork(): Promise<NetworkData> {
  await delay(400)
  return networkData
}

export async function fetchCascadeImpact(nodeId: string): Promise<CascadeImpact> {
  await delay(250)
  return getCascadeImpact(nodeId)
}
