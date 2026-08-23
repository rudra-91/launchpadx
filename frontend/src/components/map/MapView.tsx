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
import type { AssetType, RiskLevel, AnalyzedLocationOut } from '@/types'
import { cn } from '@/lib/utils'

interface MapViewProps {
  geojson?: FeatureCollection
  inspectionLocations?: AnalyzedLocationOut[]
  selectedLocationId?: string | null
  focusNode?: MapSearchResult | null
  className?: string
  onFeatureClick?: (id: string, type: AssetType) => void
  onLocationSelect?: (id: string) => void
}

export function MapView({
  geojson,
  inspectionLocations,
  selectedLocationId,
  focusNode,
  className,
  onFeatureClick,
  onLocationSelect,
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
    if (!geojson) return []
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

    const initialCenter: [number, number] =
      inspectionLocations && inspectionLocations.length > 0
        ? [inspectionLocations[0].longitude, inspectionLocations[0].latitude]
        : CHARLOTTE_CENTER

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
      center: initialCenter,
      zoom: inspectionLocations && inspectionLocations.length > 0 ? 11 : DEFAULT_MAP_ZOOM,
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

  // Render Inspection Markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (inspectionLocations && inspectionLocations.length > 0) {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const bounds = new maplibregl.LngLatBounds()

      inspectionLocations.forEach((loc) => {
        const isSelected = selectedLocationId === loc.location_id
        const level = loc.priority.priority_level
        bounds.extend([loc.longitude, loc.latitude])

        let levelColor = '#3b82f6'
        if (level === 'CRITICAL') levelColor = '#ef4444'
        else if (level === 'HIGH') levelColor = '#f59e0b'
        else if (level === 'MEDIUM') levelColor = '#3b82f6'
        else if (level === 'LOW') levelColor = '#10b981'

        const el = document.createElement('div')
        el.className = 'inspection-marker'
        el.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 8px;
          background: ${levelColor};
          color: #000;
          font-weight: bold;
          font-size: 12px;
          border-radius: 16px;
          border: 2px solid rgba(255, 255, 255, 0.9);
          cursor: pointer;
          box-shadow: 0 0 14px ${levelColor}aa;
          transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'};
          transition: transform 0.2s;
          z-index: ${isSelected ? '20' : '10'};
        `
        el.innerHTML = `#${loc.rank} · ${loc.priority.priority_score.toFixed(0)}`

        el.addEventListener('click', () => {
          onLocationSelect?.(loc.location_id)
        })

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([loc.longitude, loc.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
              <div style="font-family: Inter, sans-serif; padding: 4px;">
                <strong style="color: #FAFAFA; font-size: 13px;">#${loc.rank} ${loc.name}</strong>
                <div style="color: ${levelColor}; font-weight: bold; font-size: 11px; margin-top: 2px;">
                  Priority ${loc.priority.priority_score.toFixed(1)} (${loc.priority.priority_level})
                </div>
                <div style="color: #A1A1AA; font-size: 11px; margin-top: 2px;">
                  XGBoost: ${loc.risk.risk_prediction.label} · Detections: ${loc.risk.detection_count}
                </div>
              </div>
            `),
          )
          .addTo(map)

        markersRef.current.push(marker)

        // Render nearby entity markers if selected
        if (isSelected && loc.impact.nearby_entities) {
          loc.impact.nearby_entities.forEach((entity) => {
            const entEl = document.createElement('div')
            entEl.style.cssText = `
              width: 10px;
              height: 10px;
              background: #a855f7;
              border: 1.5px solid white;
              border-radius: 50%;
              box-shadow: 0 0 6px #a855f7;
            `
            const entMarker = new maplibregl.Marker({ element: entEl })
              .setLngLat([entity.longitude, entity.latitude])
              .setPopup(
                new maplibregl.Popup({ offset: 8, closeButton: false }).setHTML(`
                  <div style="font-size: 11px; font-family: Inter, sans-serif;">
                    <strong style="color: #c084fc;">${entity.name}</strong> (${entity.type})
                    <div style="color: #94a3b8;">${entity.distance_m.toFixed(0)}m from inspection</div>
                  </div>
                `),
              )
              .addTo(map)

            markersRef.current.push(entMarker)
          })
        }
      })

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      }
      return
    }

    // Default GeoJSON rendering
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
  }, [geojson, filteredFeatures, inspectionLocations, selectedLocationId, onFeatureClick, onLocationSelect])

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
