import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileSearch,
  Plus,
  Play,
  RotateCcw,
  Building2,
  AlertTriangle,
  Award,
  Activity,
  Trash2,
  Edit,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { analyzeInspections } from '@/services/inspection'
import { useInspectionStore } from '@/store/useInspectionStore'
import { LocationFormModal } from '@/components/inspection/LocationFormModal'
import { ImageUploader } from '@/components/inspection/ImageUploader'
import { RankedLeaderboard } from '@/components/inspection/RankedLeaderboard'
import { InspectionDetailPanel } from '@/components/inspection/InspectionDetailPanel'
import { MapView } from '@/components/map/MapView'
import { MetricCard } from '@/components/dashboard/MetricCard'
import type { DraftLocationItem } from '@/services/inspection'

export function InspectionPage() {
  const {
    locations,
    imagesMap,
    previewsMap,
    selectedLocationId,
    results,
    status,
    error,
    addLocation,
    removeLocation,
    updateLocation,
    addImages,
    removeImage,
    setSelectedLocation,
    setResults,
    setStatus,
    setError,
    reset,
  } = useInspectionStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<DraftLocationItem | null>(null)

  const handleOpenAddModal = () => {
    setEditingLocation(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (loc: DraftLocationItem) => {
    setEditingLocation(loc)
    setIsModalOpen(true)
  }

  const handleSaveLocation = (savedLoc: DraftLocationItem) => {
    if (editingLocation) {
      updateLocation(editingLocation.id, savedLoc)
    } else {
      addLocation(savedLoc)
    }
  }

  const isValidToAnalyze =
    locations.length > 0 &&
    locations.every(
      (loc) =>
        (imagesMap[loc.id] || []).length > 0 &&
        !Number.isNaN(loc.latitude) &&
        !Number.isNaN(loc.longitude),
    )

  const handleAnalyze = async () => {
    if (!isValidToAnalyze) return

    setStatus('loading')
    setError(null)

    try {
      const data = await analyzeInspections(locations, imagesMap)
      setResults(data)
      setStatus('success')
      if (data.locations.length > 0) {
        setSelectedLocation(data.locations[0].location_id)
      }
    } catch (err: unknown) {
      setStatus('error')
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to connect to inspection server. Please ensure backend is running.'
      setError(msg)
    }
  }

  const selectedResultLocation =
    results?.locations.find((l) => l.location_id === selectedLocationId) ||
    results?.locations[0] ||
    null

  const selectedLocationPreviews = selectedResultLocation
    ? previewsMap[selectedResultLocation.location_id] || []
    : []

  const kpi = useMemo(() => {
    if (!results?.locations.length) return null
    const locs = results.locations
    const highRisk = locs.filter(
      (l) =>
        l.priority.priority_level === 'CRITICAL' || l.priority.priority_level === 'HIGH',
    ).length
    const detections = locs.reduce((sum, l) => sum + l.risk.detection_count, 0)
    const avgPriority =
      locs.reduce((sum, l) => sum + l.priority.priority_score, 0) / locs.length
    return {
      locations: locs.length,
      highRisk,
      detections,
      avgPriority: avgPriority.toFixed(1),
      topName: locs[0]?.name ?? '',
      maxExposure: Math.max(...locs.map((l) => l.impact.entity_exposure_score)).toFixed(1),
    }
  }, [results])

  return (
    <div className="space-y-6">
      {/* Actions toolbar */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {status === 'idle' && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-elevated px-4 text-[13px] font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        )}

        {results && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-elevated px-4 text-[13px] font-medium text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary"
          >
            <RotateCcw className="h-4 w-4" />
            New Inspection
          </button>
        )}

        {status === 'idle' && (
          <button
            type="button"
            disabled={!isValidToAnalyze}
            onClick={handleAnalyze}
            className={`inline-flex h-10 items-center gap-2 rounded-[10px] px-5 text-[13px] font-semibold transition-opacity duration-150 ${
              isValidToAnalyze
                ? 'bg-accent text-[color:var(--accent-foreground)] hover:bg-[color:var(--accent-hover)]'
                : 'cursor-not-allowed border border-border bg-elevated/50 text-muted'
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            Analyze Road Network
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-critical/25 bg-critical/8 px-5 py-4 text-[13px] text-critical">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Analysis Failed</p>
            <p className="mt-1 text-critical/90">{error}</p>
          </div>
        </div>
      )}

      {status === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-8 py-16 text-center"
        >
          <div className="relative mb-6">
            <Loader2 className="h-11 w-11 animate-spin text-accent" />
            <Sparkles className="absolute -right-1 -top-1 h-4 w-4 animate-pulse text-warning" />
          </div>
          <h2 className="text-[20px] font-semibold text-text-primary">
            Running multi-location road inspection analysis
          </h2>
          <p className="mt-2 max-w-lg text-[14px] text-muted">
            Querying YOLOv8, extracting XGBoost features, calculating GIS exposure, and ranking
            priorities.
          </p>
          <div className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-5">
            {[
              'Image Upload',
              'YOLOv8 Detections',
              'XGBoost Risk',
              'GIS Impact',
              'Priority Ranking',
            ].map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-2 rounded-xl border border-border bg-elevated/50 px-3 py-2.5 text-[12px] text-text-secondary"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                <span>
                  {i + 1}. {step}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {status !== 'loading' && !results && (
        <div className="space-y-6">
          {locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface px-8 py-20 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated text-accent">
                <FileSearch className="h-7 w-7" />
              </div>
              <h3 className="text-[18px] font-semibold text-text-primary">
                No inspection locations added
              </h3>
              <p className="mt-2 max-w-md text-[14px] text-muted">
                Add road inspection locations and upload damage photos to run YOLOv8 and XGBoost
                risk prioritization.
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-7 inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] bg-accent px-5 text-[13px] font-semibold text-[color:var(--accent-foreground)] transition-colors duration-150 hover:bg-[color:var(--accent-hover)]"
              >
                <Plus className="h-4 w-4" />
                Add Location
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {locations.map((loc) => {
                const files = imagesMap[loc.id] || []
                const previews = previewsMap[loc.id] || []

                return (
                  <div
                    key={loc.id}
                    className="flex flex-col rounded-2xl border border-border bg-surface p-5"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                      <div className="min-w-0">
                        <h4 className="truncate text-[15px] font-semibold text-text-primary">
                          {loc.name}
                        </h4>
                        <p className="mt-1 text-[13px] text-accent">{loc.road_name}</p>
                        <p className="mt-1 text-[12px] text-muted">
                          {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(loc)}
                          className="rounded-[8px] p-2 text-muted transition-colors duration-150 hover:bg-white/[0.04] hover:text-text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLocation(loc.id)}
                          className="rounded-[8px] p-2 text-muted transition-colors duration-150 hover:bg-critical/10 hover:text-critical"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <ImageUploader
                        locationId={loc.id}
                        files={files}
                        previews={previews}
                        onAddImages={(newFiles) => addImages(loc.id, newFiles)}
                        onRemoveImage={(idx) => removeImage(loc.id, idx)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {results && kpi && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="High Risk Locations"
              value={kpi.highRisk}
              icon={AlertTriangle}
              accent="warning"
              subtitle="HIGH or CRITICAL priority"
            />
            <MetricCard
              title="Total Inspections"
              value={kpi.locations}
              icon={Building2}
              accent="blue"
              subtitle="Locations in latest run"
            />
            <MetricCard
              title="Active Detections"
              value={kpi.detections}
              icon={Activity}
              accent="cyan"
              subtitle="YOLO damage instances"
            />
            <MetricCard
              title="Average Priority Score"
              value={kpi.avgPriority}
              icon={Award}
              accent="blue"
              subtitle={`Top: ${kpi.topName}`}
            />
          </div>

          {/* Primary workspace: stacked rows — list → map → details */}
          <div className="flex min-w-0 flex-col gap-6">
            <RankedLeaderboard
              locations={results.locations}
              selectedLocationId={selectedLocationId}
              onSelectLocation={(id) => setSelectedLocation(id)}
            />

            <section className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-[17px] font-semibold text-text-primary">
                    Spatial Intelligence
                  </h2>
                  <p className="mt-0.5 text-[13px] text-muted">
                    Inspection coordinates and nearby infrastructure markers
                  </p>
                </div>
              </div>
              <div className="p-3">
                <MapView
                  inspectionLocations={results.locations}
                  selectedLocationId={selectedLocationId}
                  className="h-[480px] min-h-[480px] rounded-xl xl:h-[520px]"
                  onLocationSelect={(id) => setSelectedLocation(id)}
                />
              </div>
            </section>

            <div className="min-w-0">
              <InspectionDetailPanel
                location={selectedResultLocation}
                previewUrls={selectedLocationPreviews}
                onClose={() => setSelectedLocation(null)}
              />
            </div>
          </div>
        </div>
      )}

      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocation}
        initialData={editingLocation}
      />
    </div>
  )
}
