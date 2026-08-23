import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Building,
  Shield,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Hospital,
  Flame,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import type { AnalyzedLocationOut, YOLODetection } from '@/types'
import { cn } from '@/lib/utils'

interface InspectionDetailPanelProps {
  location: AnalyzedLocationOut | null
  onClose: () => void
  previewUrls?: string[]
}

export function InspectionDetailPanel({
  location,
  onClose,
  previewUrls = [],
}: InspectionDetailPanelProps) {
  const [showTechnicalFeatures, setShowTechnicalFeatures] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  if (!location) return null

  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return <Hospital className="h-4 w-4 text-rose-400" />
      case 'fire_station':
        return <Flame className="h-4 w-4 text-amber-400" />
      case 'police_station':
      case 'police':
        return <Shield className="h-4 w-4 text-blue-400" />
      case 'school':
        return <GraduationCap className="h-4 w-4 text-emerald-400" />
      default:
        return <Building className="h-4 w-4 text-text-secondary" />
    }
  }

  const currentImage = location.images[activeImageIdx]
  const currentPreviewUrl = previewUrls[activeImageIdx]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-card flex h-full flex-col overflow-hidden p-5 border border-border"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/15 text-accent font-bold text-sm">
            #{location.rank}
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">{location.name}</h3>
            <p className="text-xs text-text-secondary">
              GPS: ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-text-secondary hover:bg-white/10 hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
        {/* PRIORITY & AI RISK SCORE CARDS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
            <span className="text-[10px] font-semibold uppercase text-accent tracking-wider">
              Priority Score
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-text-primary">
                {location.priority.priority_score.toFixed(1)}
              </span>
              <span className="rounded-md bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                {location.priority.priority_level}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3">
            <span className="text-[10px] font-semibold uppercase text-purple-400 tracking-wider">
              XGBoost Risk Class
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-text-primary">
                Class {location.risk.risk_prediction.class}
              </span>
              <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300">
                {location.risk.risk_prediction.label}
              </span>
            </div>
          </div>
        </div>

        {/* IMAGE & BBOX VISUALIZER SECTION */}
        {currentImage && (
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                YOLOv8 Damage Bounding Boxes
              </span>
              <span className="text-[11px] text-text-secondary">
                Image {activeImageIdx + 1} of {location.images.length} ({currentImage.image_width}x{currentImage.image_height})
              </span>
            </div>

            {/* Bounding Box Image Canvas */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
              {currentPreviewUrl ? (
                <img
                  src={currentPreviewUrl}
                  alt="Analyzed Road"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary">
                  Uploaded Road Image ({currentImage.image_key})
                </div>
              )}

              {/* Bounding Box Overlays */}
              {currentImage.detections.map((det: YOLODetection, idx: number) => {
                const { x1, y1, x2, y2 } = det.bbox
                const w_img = maxVal(1, currentImage.image_width)
                const h_img = maxVal(1, currentImage.image_height)

                // Scale bounding boxes relative to percentage
                const left = x1 > 1.0 ? (x1 / w_img) * 100 : x1 * 100
                const top = y1 > 1.0 ? (y1 / h_img) * 100 : y1 * 100
                const width = x1 > 1.0 ? ((x2 - x1) / w_img) * 100 : (x2 - x1) * 100
                const height = y1 > 1.0 ? ((y2 - y1) / h_img) * 100 : (y2 - y1) * 100

                const isPothole = det.damage_type === 'D40'
                const boxColor = isPothole ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)'

                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      border: `2px solid ${boxColor}`,
                      backgroundColor: `${boxColor}22`,
                      boxShadow: `0 0 10px ${boxColor}`,
                      pointerEvents: 'none',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '-18px',
                        left: '0',
                        background: boxColor,
                        color: '#000',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {det.damage_type}: {det.damage_name} ({(det.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Image selector tabs */}
            {location.images.length > 1 && (
              <div className="mt-2 flex gap-1.5 overflow-x-auto">
                {location.images.map((img, idx) => (
                  <button
                    key={img.image_key}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
                      activeImageIdx === idx
                        ? 'bg-accent text-background font-semibold'
                        : 'bg-surface text-text-secondary hover:text-text-primary',
                    )}
                  >
                    Image {idx + 1} ({img.detections.length} det)
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DETAILED DAMAGE BREAKDOWN */}
        <div className="rounded-xl border border-border bg-surface/30 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-warning" />
              YOLO Damage Breakdown ({location.risk.detection_count} Detections)
            </span>
            <span className="text-xs font-bold text-warning">
              Damage Score: {location.risk.damage_score.toFixed(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-black/20 p-2">
              <span className="text-text-secondary">D00 Longitudinal</span>
              <span className="font-bold text-text-primary">{location.risk.damage_breakdown.D00}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-black/20 p-2">
              <span className="text-text-secondary">D10 Transverse</span>
              <span className="font-bold text-text-primary">{location.risk.damage_breakdown.D10}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-black/20 p-2">
              <span className="text-text-secondary">D20 Alligator Crack</span>
              <span className="font-bold text-text-primary">{location.risk.damage_breakdown.D20}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-black/20 p-2">
              <span className="text-text-secondary">D40 Pothole</span>
              <span className="font-bold text-critical">{location.risk.damage_breakdown.D40}</span>
            </div>
          </div>
        </div>

        {/* INFRASTRUCTURE IMPACT & NEARBY ENTITIES */}
        <div className="rounded-xl border border-border bg-surface/30 p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Building className="h-4 w-4 text-accent" />
              GIS Infrastructure Exposure
            </span>
            <div className="flex gap-2 text-[11px]">
              <span className="rounded bg-accent/15 px-2 py-0.5 text-accent font-semibold">
                Exp: {location.impact.entity_exposure_score.toFixed(1)}
              </span>
              <span className="rounded bg-blue-500/15 px-2 py-0.5 text-blue-400 font-semibold">
                Conn: {location.impact.connectivity_score.toFixed(1)}
              </span>
            </div>
          </div>

          {location.impact.nearby_entities.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {location.impact.nearby_entities.map((entity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-black/20 p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {getEntityIcon(entity.type)}
                    <span className="font-medium text-text-primary">{entity.name}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-text-secondary">
                    {entity.distance_m.toFixed(0)}m away
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-secondary italic">
              No critical infrastructure entities detected within 2000m radius.
            </p>
          )}
        </div>

        {/* COMPACT EXPANDABLE TECHNICAL MODEL FEATURES */}
        <div className="rounded-xl border border-border bg-surface/30">
          <button
            type="button"
            onClick={() => setShowTechnicalFeatures(!showTechnicalFeatures)}
            className="flex w-full items-center justify-between p-3 text-xs font-semibold text-text-secondary hover:text-text-primary"
          >
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-purple-400" />
              Technical Details (12 XGBoost Features)
            </span>
            {showTechnicalFeatures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showTechnicalFeatures && (
            <div className="border-t border-border/50 p-3 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-text-secondary">Total Damage Area:</span>{' '}
                <span className="font-bold text-text-primary">
                  {(location.risk.risk_features.total_damage_area_ratio * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-text-secondary">Avg BBox Area:</span>{' '}
                <span className="font-bold text-text-primary">
                  {(location.risk.risk_features.avg_bbox_area_ratio * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-text-secondary">Max BBox Area:</span>{' '}
                <span className="font-bold text-text-primary">
                  {(location.risk.risk_features.max_bbox_area_ratio * 100).toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-text-secondary">D40 Area Ratio:</span>{' '}
                <span className="font-bold text-text-primary">
                  {(location.risk.risk_features.d40_area_ratio * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function maxVal(a: number, b: number): number {
  return a > b ? a : b
}
