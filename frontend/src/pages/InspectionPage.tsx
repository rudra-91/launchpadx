import { useState } from 'react'
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
    loadSampleLocations,
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

  // Validation: At least 1 location, at least 1 image per location, valid lat/lon
  const isValidToAnalyze =
    locations.length > 0 &&
    locations.every(
      (loc) =>
        (imagesMap[loc.id] || []).length > 0 &&
        !isNaN(loc.latitude) &&
        !isNaN(loc.longitude),
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
    } catch (err: any) {
      setStatus('error')
      const msg =
        err.message ||
        'Failed to connect to inspection server. Please ensure backend is running.'
      setError(msg)
    }
  }

  const selectedResultLocation =
    results?.locations.find((l) => l.location_id === selectedLocationId) ||
    results?.locations[0] ||
    null

  // Previews for selected location
  const selectedLocationPreviews = selectedResultLocation
    ? previewsMap[selectedResultLocation.location_id] || []
    : []

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" data-reveal>
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/40 bg-accent/15 text-accent">
              <FileSearch className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              ROAD INSPECTION INTELLIGENCE
            </h1>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            AI-powered road damage detection, XGBoost risk classification, and GIS infrastructure prioritization
          </p>
        </div>

        <div className="flex items-center gap-3">
          {status === 'idle' && (
            <>
              <button
                type="button"
                onClick={loadSampleLocations}
                className="rounded-xl border border-border bg-surface/50 px-3.5 py-2 text-xs font-medium text-text-secondary hover:border-accent/40 hover:text-text-primary"
              >
                Load Sample Locations
              </button>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-2 text-xs font-semibold text-accent hover:bg-accent/20"
              >
                <Plus className="h-4 w-4" />
                Add Location
              </button>
            </>
          )}

          {results && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary"
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
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-lg ${
                isValidToAnalyze
                  ? 'bg-accent text-background shadow-accent/20 hover:opacity-90 cursor-pointer'
                  : 'bg-surface/50 text-text-secondary/50 cursor-not-allowed border border-border'
              }`}
            >
              <Play className="h-4 w-4 fill-current" />
              Analyze Road Network
            </button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-critical/40 bg-critical/10 p-4 text-xs text-critical">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Analysis Failed</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* INDETERMINATE PROCESSING OVERLAY */}
      {status === 'loading' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex flex-col items-center justify-center p-12 text-center border border-accent/30"
        >
          <div className="relative mb-6">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-amber-400 animate-pulse" />
          </div>

          <h2 className="text-lg font-bold text-text-primary">
            Running Multi-Location Road Inspection Analysis...
          </h2>
          <p className="mt-1 text-xs text-text-secondary max-w-md">
            Querying YOLOv8 model, extracting 12 XGBoost tabular features, calculating GIS infrastructure exposure, and generating priority rankings.
          </p>

          <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-3 text-left sm:grid-cols-5 text-xs">
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span>1. Image Upload</span>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span>2. YOLOv8 Detections</span>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span>3. XGBoost Risk</span>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span>4. GIS Impact</span>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
              <span>5. Priority Ranking</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* INPUT DRAFT LOCATIONS VIEW */}
      {status !== 'loading' && !results && (
        <div className="space-y-6">
          {locations.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface">
                <FileSearch className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">
                No Inspection Locations Added
              </h3>
              <p className="mt-1 text-xs text-text-secondary max-w-sm">
                Add road inspection locations and upload damage photos to run YOLOv8 & XGBoost risk prioritization.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={loadSampleLocations}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary"
                >
                  Load Sample Locations
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add Location
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" data-stagger>
              {locations.map((loc) => {
                const files = imagesMap[loc.id] || []
                const previews = previewsMap[loc.id] || []

                return (
                  <div
                    key={loc.id}
                    className="glass-card flex flex-col justify-between p-4 border border-border"
                  >
                    <div>
                      <div className="flex items-start justify-between border-b border-border pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-text-primary">{loc.name}</h4>
                          <p className="text-xs text-accent font-medium">{loc.road_name}</p>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            ({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(loc)}
                            className="rounded-lg p-1.5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLocation(loc.id)}
                            className="rounded-lg p-1.5 text-text-secondary hover:bg-critical/20 hover:text-critical"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* RESULTS DASHBOARD VIEW */}
      {results && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-stagger>
            <MetricCard
              title="Total Locations"
              value={results.locations.length}
              icon={Building2}
              accent="blue"
            />
            <MetricCard
              title="Critical Risk Locations"
              value={
                results.locations.filter(
                  (l) => l.priority.priority_level === 'CRITICAL' || l.priority.priority_level === 'HIGH',
                ).length
              }
              icon={AlertTriangle}
              accent="critical"
              subtitle="High / Critical priority score"
            />
            <MetricCard
              title="Highest Priority Score"
              value={results.locations[0]?.priority.priority_score.toFixed(1) || '0'}
              icon={Award}
              accent="warning"
              subtitle={`Rank #1: ${results.locations[0]?.name || ''}`}
            />
            <MetricCard
              title="Max Entity Exposure"
              value={
                Math.max(...results.locations.map((l) => l.impact.entity_exposure_score)).toFixed(1)
              }
              icon={Activity}
              accent="blue"
              subtitle="Infrastructure proximity index"
            />
          </div>

          {/* Main Results Split Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left: Ranked Leaderboard */}
            <div className="lg:col-span-5">
              <RankedLeaderboard
                locations={results.locations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={(id) => setSelectedLocation(id)}
              />
            </div>

            {/* Middle: Map View */}
            <div className="lg:col-span-4 glass-card relative overflow-hidden p-1 min-h-[480px]">
              <MapView
                inspectionLocations={results.locations}
                selectedLocationId={selectedLocationId}
                className="h-full min-h-[480px]"
                onLocationSelect={(id) => setSelectedLocation(id)}
              />
            </div>

            {/* Right: Inspection Detail Panel */}
            <div className="lg:col-span-3 min-h-[480px]">
              <InspectionDetailPanel
                location={selectedResultLocation}
                previewUrls={selectedLocationPreviews}
                onClose={() => setSelectedLocation(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Location Form Modal */}
      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocation}
        initialData={editingLocation}
      />
    </div>
  )
}
