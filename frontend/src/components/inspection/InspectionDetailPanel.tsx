import { useState } from 'react'
import {
  X,
  Building,
  Shield,
  Hospital,
  Flame,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { AnalyzedLocationOut, YOLODetection } from '@/types'
import { cn } from '@/lib/utils'

interface InspectionDetailPanelProps {
  location: AnalyzedLocationOut | null
  onClose: () => void
  previewUrls?: string[]
}

function levelTone(level: string) {
  switch (level.toUpperCase()) {
    case 'CRITICAL':
      return 'text-critical'
    case 'HIGH':
      return 'text-warning'
    case 'MEDIUM':
      return 'text-accent'
    default:
      return 'text-success'
  }
}

export function InspectionDetailPanel({
  location,
  onClose,
  previewUrls = [],
}: InspectionDetailPanelProps) {
  const [showTechnicalFeatures, setShowTechnicalFeatures] = useState(false)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  if (!location) {
    return (
      <aside className="flex h-full min-h-[480px] items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-[14px] text-muted">Select an inspection to view details</p>
      </aside>
    )
  }

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
        return <Building className="h-4 w-4 text-muted" />
    }
  }

  const currentImage = location.images[activeImageIdx]
  const currentPreviewUrl = previewUrls[activeImageIdx]

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="rounded-[8px] bg-elevated px-2 py-1 text-[12px] font-semibold text-text-secondary">
              #{location.rank}
            </span>
            <h2 className="truncate text-[17px] font-semibold text-text-primary">
              {location.name}
            </h2>
          </div>
          <p className="mt-1.5 text-[12px] text-muted">
            {location.road_name ? `${location.road_name} · ` : ''}
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[8px] p-1.5 text-muted transition-colors duration-150 hover:bg-white/[0.04] hover:text-text-primary"
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* Risk Summary */}
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
            Risk Summary
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
            <SummaryItem
              label="Priority Score"
              value={location.priority.priority_score.toFixed(1)}
            />
            <SummaryItem
              label="Risk"
              value={location.priority.priority_level}
              valueClass={levelTone(location.priority.priority_level)}
            />
            <SummaryItem
              label="XGBoost Class"
              value={`Class ${location.risk.risk_prediction.class}`}
            />
            <SummaryItem
              label="XGBoost Label"
              value={location.risk.risk_prediction.label}
              valueClass="text-[#A855F7]"
            />
          </div>
        </section>

        {/* Damage Detection */}
        {currentImage && (
          <section>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
                Damage Detection
              </h3>
              <span className="text-[12px] text-muted">
                Image {activeImageIdx + 1}/{location.images.length}
              </span>
            </div>

            <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-background">
              {currentPreviewUrl ? (
                <img
                  src={currentPreviewUrl}
                  alt="Analyzed road"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[13px] text-muted">
                  Uploaded image ({currentImage.image_key})
                </div>
              )}

              {currentImage.detections.map((det: YOLODetection, idx: number) => {
                const { x1, y1, x2, y2 } = det.bbox
                const wImg = Math.max(1, currentImage.image_width)
                const hImg = Math.max(1, currentImage.image_height)
                const left = x1 > 1 ? (x1 / wImg) * 100 : x1 * 100
                const top = y1 > 1 ? (y1 / hImg) * 100 : y1 * 100
                const width = x1 > 1 ? ((x2 - x1) / wImg) * 100 : (x2 - x1) * 100
                const height = y1 > 1 ? ((y2 - y1) / hImg) * 100 : (y2 - y1) * 100
                const isPothole = det.damage_type === 'D40'
                const boxColor = isPothole ? 'rgba(239, 68, 68, 0.95)' : 'rgba(245, 158, 11, 0.95)'

                return (
                  <div
                    key={idx}
                    className="pointer-events-none absolute"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      border: `2px solid ${boxColor}`,
                      backgroundColor: `${boxColor}18`,
                    }}
                  >
                    <span
                      className="absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold text-black"
                      style={{ background: boxColor }}
                    >
                      {det.damage_type}: {det.damage_name}
                    </span>
                  </div>
                )
              })}
            </div>

            {location.images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {location.images.map((img, idx) => (
                  <button
                    key={img.image_key}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      'rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-colors duration-150',
                      activeImageIdx === idx
                        ? 'bg-accent text-background'
                        : 'bg-elevated text-text-secondary hover:text-text-primary',
                    )}
                  >
                    Image {idx + 1} · {img.detections.length} det
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Detection Breakdown */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              Detection Breakdown
            </h3>
            <span className="text-[12px] text-muted">
              Score {location.risk.damage_score.toFixed(1)} · {location.risk.detection_count}{' '}
              total
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <DamageRow code="D00" label="Longitudinal" count={location.risk.damage_breakdown.D00} />
            <DamageRow code="D10" label="Transverse" count={location.risk.damage_breakdown.D10} />
            <DamageRow
              code="D20"
              label="Alligator Crack"
              count={location.risk.damage_breakdown.D20}
            />
            <DamageRow
              code="D40"
              label="Pothole"
              count={location.risk.damage_breakdown.D40}
              emphasize
            />
          </div>
        </section>

        {/* GIS */}
        <section>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              Nearby Infrastructure
            </h3>
            <span className="text-[12px] text-muted">
              Exp {location.impact.entity_exposure_score.toFixed(1)} · Conn{' '}
              {location.impact.connectivity_score.toFixed(1)}
            </span>
          </div>

          {location.impact.nearby_entities.length > 0 ? (
            <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
              {location.impact.nearby_entities.map((entity, idx) => (
                <div
                  key={`${entity.name}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-elevated/50 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {getEntityIcon(entity.type)}
                    <span className="truncate text-[13px] font-medium text-text-primary">
                      {entity.name}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-[12px] text-muted">
                    {entity.distance_m.toFixed(0)}m
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-muted">
              No critical infrastructure within the GIS search radius.
            </p>
          )}
        </section>

        {/* Technical */}
        <section className="rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setShowTechnicalFeatures(!showTechnicalFeatures)}
            className="flex w-full items-center justify-between px-3.5 py-3 text-[13px] font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            <span>Technical details (12 XGBoost features)</span>
            {showTechnicalFeatures ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showTechnicalFeatures && (
            <div className="grid grid-cols-2 gap-3 border-t border-border px-3.5 py-3 text-[12px]">
              <TechItem
                label="Total damage area"
                value={`${(location.risk.risk_features.total_damage_area_ratio * 100).toFixed(2)}%`}
              />
              <TechItem
                label="Avg bbox area"
                value={`${(location.risk.risk_features.avg_bbox_area_ratio * 100).toFixed(2)}%`}
              />
              <TechItem
                label="Max bbox area"
                value={`${(location.risk.risk_features.max_bbox_area_ratio * 100).toFixed(2)}%`}
              />
              <TechItem
                label="D40 area ratio"
                value={`${(location.risk.risk_features.d40_area_ratio * 100).toFixed(2)}%`}
              />
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}

function SummaryItem({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className={cn('mt-1 text-[22px] font-semibold tracking-tight text-text-primary', valueClass)}>
        {value}
      </p>
    </div>
  )
}

function DamageRow({
  code,
  label,
  count,
  emphasize,
}: {
  code: string
  label: string
  count: number
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-elevated/40 px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[12px] font-semibold text-muted">{code}</span>
        <span className="text-[13px] text-text-secondary">{label}</span>
      </div>
      <span
        className={cn(
          'text-[15px] font-semibold',
          emphasize && count > 0 ? 'text-critical' : 'text-text-primary',
        )}
      >
        {count}
      </span>
    </div>
  )
}

function TechItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted">{label}</p>
      <p className="mt-0.5 font-semibold text-text-primary">{value}</p>
    </div>
  )
}
