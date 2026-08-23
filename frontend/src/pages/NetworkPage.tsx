import { useEffect, useMemo, useState } from 'react'
import { NetworkGraph, CascadePanel, NetworkLegend } from '@/components/network/NetworkGraph'
import { EmptyInspectionState } from '@/components/ui/EmptyInspectionState'
import { GlassCard } from '@/components/ui/GlassCard'
import {
  buildCascadeFromLocation,
  buildNetworkFromInspection,
  findLocationById,
  getLocations,
} from '@/lib/inspectionDerived'
import { useInspectionStore } from '@/store/useInspectionStore'

export function NetworkPage() {
  const results = useInspectionStore((s) => s.results)
  const locations = getLocations(results)
  const network = useMemo(() => buildNetworkFromInspection(results), [results])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  useEffect(() => {
    if (locations.length === 0) {
      setSelectedNodeId(null)
      return
    }
    const stillValid =
      selectedNodeId &&
      (locations.some((l) => l.location_id === selectedNodeId) ||
        selectedNodeId.includes('::'))
    if (!stillValid) {
      setSelectedNodeId(locations[0].location_id)
    }
  }, [locations, selectedNodeId])

  const selectedRoadId = selectedNodeId?.includes('::')
    ? selectedNodeId.split('::')[0]
    : selectedNodeId

  const selectedLocation = findLocationById(results, selectedRoadId)
  const cascade = useMemo(
    () => buildCascadeFromLocation(selectedLocation),
    [selectedLocation],
  )

  if (locations.length === 0 || !network) {
    return (
      <div className="space-y-6">
        <div data-reveal>
          <p className="text-sm text-text-secondary">
            Road → nearby critical infrastructure topology from live GIS
          </p>
        </div>
        <EmptyInspectionState
          title="Run a Road Inspection to generate the infrastructure network."
          description="Nearby hospitals, police, fire stations, and schools come from GIS results on the latest inspection — nothing is invented."
        />
      </div>
    )
  }

  const totalEntities = locations.reduce(
    (sum, loc) => sum + loc.impact.nearby_entities.length,
    0,
  )

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Live network · {locations.length} road location
          {locations.length === 1 ? '' : 's'} · {totalEntities} nearby entities from GIS · drag to
          pan across clusters
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2" data-reveal>
          <NetworkGraph
            data={network}
            selectedNodeId={selectedNodeId}
            cascade={cascade}
            onNodeSelect={setSelectedNodeId}
          />
        </div>

        <div className="space-y-4" data-reveal>
          <CascadePanel
            cascade={cascade}
            selectedLabel={selectedLocation?.name}
            exposureScore={selectedLocation?.impact.entity_exposure_score}
            connectivityScore={selectedLocation?.impact.connectivity_score}
          />
          <NetworkLegend />
          {selectedLocation && (
            <GlassCard padding="md" className="max-h-[280px] space-y-2 overflow-y-auto">
              <h3 className="sticky top-0 z-10 bg-surface/95 pb-1 text-sm font-semibold text-text-primary backdrop-blur">
                Nearby Entities ({selectedLocation.impact.nearby_entities.length})
              </h3>
              {selectedLocation.impact.nearby_entities.length === 0 ? (
                <p className="text-xs text-text-secondary">No entities for this location</p>
              ) : (
                selectedLocation.impact.nearby_entities.map((entity, idx) => (
                  <div
                    key={`${entity.name}-${idx}`}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="min-w-0 truncate text-text-primary">
                      {entity.name}{' '}
                      <span className="text-text-secondary">({entity.type})</span>
                    </span>
                    <span className="shrink-0 font-mono text-accent">
                      {Math.round(entity.distance_m)}m
                    </span>
                  </div>
                ))
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
