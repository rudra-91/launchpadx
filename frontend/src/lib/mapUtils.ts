import type { FeatureCollection } from 'geojson'
import { getRiskLevel } from '@/lib/utils'
import type { AssetType, RiskLevel } from '@/types'

export interface MapSearchResult {
  id: string
  name: string
  type: AssetType
  riskLevel: RiskLevel
  coordinates: [number, number]
}

export function searchMapFeatures(
  geojson: FeatureCollection,
  query: string,
): MapSearchResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return geojson.features
    .filter((feature) => {
      const props = feature.properties ?? {}
      const name = String(props.name ?? '').toLowerCase()
      const id = String(props.id ?? '').toLowerCase()
      return name.includes(normalized) || id.includes(normalized)
    })
    .slice(0, 8)
    .map((feature) => {
      const props = feature.properties ?? {}
      const coords = feature.geometry.type === 'Point'
        ? (feature.geometry.coordinates as [number, number])
        : ([0, 0] as [number, number])

      const riskScore = Number(props.riskScore ?? 0)

      return {
        id: String(props.id ?? ''),
        name: String(props.name ?? ''),
        type: (props.type as AssetType) ?? 'bridge',
        riskLevel: (props.riskLevel as RiskLevel) ?? getRiskLevel(riskScore),
        coordinates: coords,
      }
    })
}

export function getMarkerColor(riskLevel: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    low: '#22C55E',
    medium: '#EAB308',
    high: '#F97316',
    critical: '#EF4444',
  }
  return colors[riskLevel]
}

export const CHARLOTTE_CENTER: [number, number] = [-80.8431, 35.2271]

export const DEFAULT_MAP_ZOOM = 10.5

export const FOCUS_ZOOM = 14
