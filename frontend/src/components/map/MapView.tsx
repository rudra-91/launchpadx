import { useEffect, useRef, useMemo } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { FeatureCollection } from 'geojson'
import {
  CHARLOTTE_CENTER,
  DEFAULT_MAP_ZOOM,
  FOCUS_ZOOM,
  getMarkerColor,
  type MapSearchResult,
} from '@/lib/mapUtils'
import { getRiskLevel } from '@/lib/utils'
import { useFilterStore } from '@/store/useFilterStore'
import type { AssetType, RiskLevel } from '@/types'
import { cn } from '@/lib/utils'

interface MapViewProps {
  geojson: FeatureCollection
  focusNode?: MapSearchResult | null
  className?: string
  onFeatureClick?: (id: string, type: AssetType) => void
}

export function MapView({
  geojson,
  focusNode,
  className,
  onFeatureClick,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const {
    riskLevels,
    showBridges,
    showRoads,
    showHospitals,
    conditionMin,
    conditionMax,
  } = useFilterStore()

  const filteredFeatures = useMemo(() => {
    return geojson.features.filter((feature) => {
      const props = feature.properties ?? {}
      const type = props.type as AssetType
      const riskLevel = (props.riskLevel as RiskLevel) ?? getRiskLevel(Number(props.riskScore ?? 0))
      const condition = Number(props.condition ?? 100)

      if (type === 'bridge' && !showBridges) return false
      if (type === 'road' && !showRoads) return false
      if (type === 'hospital' && !showHospitals) return false
      if (riskLevels.length > 0 && !riskLevels.includes(riskLevel)) return false
      if (condition < conditionMin || condition > conditionMax) return false

      return true
    })
  }, [
    geojson,
    riskLevels,
    showBridges,
    showRoads,
    showHospitals,
    conditionMin,
    conditionMax,
  ])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap &copy; CARTO',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: CHARLOTTE_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    filteredFeatures.forEach((feature) => {
      if (feature.geometry.type !== 'Point') return

      const props = feature.properties ?? {}
      const coords = feature.geometry.coordinates as [number, number]
      const riskLevel = (props.riskLevel as RiskLevel) ?? getRiskLevel(Number(props.riskScore ?? 0))
      const color = getMarkerColor(riskLevel)
      const type = props.type as AssetType

      const el = document.createElement('div')
      el.className = 'map-marker'
      el.style.cssText = `
        width: ${type === 'hospital' ? '14px' : '12px'};
        height: ${type === 'hospital' ? '14px' : '12px'};
        background: ${color};
        border: 2px solid rgba(255,255,255,0.9);
        border-radius: ${type === 'hospital' ? '3px' : '50%'};
        cursor: pointer;
        box-shadow: 0 0 8px ${color}66;
        transition: transform 0.2s;
      `
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(
          new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
            <div style="font-family: Inter, sans-serif;">
              <strong style="color: #FAFAFA;">${props.name ?? ''}</strong>
              <div style="color: #A1A1AA; font-size: 12px; margin-top: 4px;">
                ${type} · Risk ${props.riskScore ?? 0}
              </div>
            </div>
          `),
        )
        .addTo(map)

      el.addEventListener('click', () => {
        onFeatureClick?.(String(props.id ?? ''), type)
      })

      markersRef.current.push(marker)
    })
  }, [filteredFeatures, onFeatureClick])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focusNode) return

    map.flyTo({
      center: focusNode.coordinates,
      zoom: FOCUS_ZOOM,
      duration: 1200,
      essential: true,
    })
  }, [focusNode])

  return (
    <div
      ref={mapContainer}
      className={cn('w-full rounded-2xl overflow-hidden', className)}
    />
  )
}
