import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileSearch,
  ArrowRight,
  Building,
  Hospital,
  Flame,
  Shield,
  GraduationCap,
  Wrench,
} from 'lucide-react'
import { useInspectionStore } from '@/store/useInspectionStore'

export function LatestInspectionWidget() {
  const results = useInspectionStore((s) => s.results)

  const topLocation =
    results?.locations && Array.isArray(results.locations) && results.locations.length > 0
      ? results.locations[0]
      : null

  const getRecommendedAction = (score: number, level: string) => {
    if (score >= 70 || level === 'CRITICAL') {
      return 'CRITICAL HAZARD: Deploy emergency paving crew within 24h. Issue traffic advisory for emergency hospital access corridors.'
    }
    if (score >= 50 || level === 'HIGH') {
      return 'HIGH PRIORITY: Schedule mill & overlay resurfacing within 7 days. Perform structural scan on adjacent bridge joints.'
    }
    if (score >= 35 || level === 'MEDIUM') {
      return 'MEDIUM PRIORITY: Include location in next monthly maintenance cycle for pothole patching and crack sealing.'
    }
    return 'ROUTINE MONITORING: Road condition stable. Re-inspect after next inspection cycle.'
  }

  const getEntityIcon = (type: string = '') => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return <Hospital className="h-3.5 w-3.5 text-rose-400" />
      case 'fire_station':
        return <Flame className="h-3.5 w-3.5 text-amber-400" />
      case 'police_station':
      case 'police':
        return <Shield className="h-3.5 w-3.5 text-[color:var(--info)]" />
      case 'school':
        return <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
      default:
        return <Building className="h-3.5 w-3.5 text-text-secondary" />
    }
  }

  // EMPTY STATE when no live inspection analysis has been performed yet
  if (!topLocation || !topLocation.priority || !topLocation.risk || !topLocation.impact) {
    return (
      <div className="glass-card flex flex-col items-center justify-between gap-4 border border-border p-5 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-elevated text-[color:var(--warm-grey)]">
            <FileSearch className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Latest AI Road Inspection</h3>
            <p className="text-xs text-muted">
              No live inspection yet — Run Road Inspection to detect YOLO damage, calculate XGBoost
              risk & GIS impact.
            </p>
          </div>
        </div>

        <Link
          to="/inspections"
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] bg-accent px-4 py-2 text-xs font-semibold text-[color:var(--accent-foreground)] transition-colors duration-[160ms] hover:bg-[color:var(--accent-hover)]"
        >
          <span>Run Road Inspection</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  const level = topLocation.priority?.priority_level ?? 'MEDIUM'
  const score = topLocation.priority?.priority_score ?? 50.0
  const riskLevel = topLocation.risk?.risk_level ?? level
  const actionText = getRecommendedAction(score, level)
  const nearbyEntities = Array.isArray(topLocation.impact?.nearby_entities)
    ? topLocation.impact.nearby_entities.slice(0, 3)
    : []

  const riskPredClass = topLocation.risk?.risk_prediction?.class ?? 1
  const riskPredLabel = topLocation.risk?.risk_prediction?.label ?? 'MEDIUM'
  const detectionCount = topLocation.risk?.detection_count ?? 0
  const potholeCount = topLocation.risk?.damage_breakdown?.D40 ?? 0
  const d00Count = topLocation.risk?.damage_breakdown?.D00 ?? 0
  const d20Count = topLocation.risk?.damage_breakdown?.D20 ?? 0
  const exposureScore = topLocation.impact?.entity_exposure_score ?? 0.0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-4 overflow-hidden border border-border p-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-border bg-elevated text-xs font-semibold text-[color:var(--warm-grey)]">
            #{topLocation.rank ?? 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-text-primary">Latest AI Road Inspection</h3>
              <span className="rounded-[var(--radius-sm)] bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--warm-grey)]">
                Live result
              </span>
            </div>
            <p className="text-xs text-muted">
              Location: <strong className="text-text-secondary">{topLocation.name}</strong> · GPS: (
              {topLocation.latitude?.toFixed(4) ?? '0.0000'},{' '}
              {topLocation.longitude?.toFixed(4) ?? '0.0000'})
            </p>
          </div>
        </div>

        <Link
          to="/inspections"
          className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border bg-elevated px-3.5 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-[160ms] hover:text-text-primary"
        >
          <FileSearch className="h-4 w-4" />
          View Detailed Inspection
        </Link>
      </div>

      {/* Grid of Key AI Intelligence Indicators */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[var(--radius-lg)] border border-border bg-elevated/40 p-3.5">
          <span className="kpi-label">Risk Level</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-semibold text-text-primary">{riskLevel}</span>
            <span className="rounded-[var(--radius-sm)] bg-background px-2 py-0.5 text-xs text-muted">
              {topLocation.name.split(' ')[0]}
            </span>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-elevated/40 p-3.5">
          <span className="kpi-label">Priority Score</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-semibold text-text-primary">{score.toFixed(1)}</span>
            <span className="rounded-[var(--radius-sm)] bg-accent/20 px-2 py-0.5 text-xs font-semibold text-[color:var(--warm-grey)]">
              {level}
            </span>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-elevated/40 p-3.5">
          <span className="kpi-label">XGBoost Prediction</span>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-semibold text-text-primary">Class {riskPredClass}</span>
            <span className="rounded-[var(--radius-sm)] bg-background px-2 py-0.5 text-xs font-semibold text-text-secondary">
              {riskPredLabel}
            </span>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-border bg-elevated/40 p-3.5">
          <span className="kpi-label">YOLO Damage</span>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-xl font-semibold text-text-primary">{detectionCount}</span>
            <span className="text-[11px] text-muted">
              Potholes: {potholeCount} · Cracks: {d00Count + d20Count}
            </span>
          </div>
        </div>
      </div>

      {/* Infrastructure Impact & Recommended Action */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Nearby Infrastructure Entities */}
        <div className="rounded-xl border border-border bg-surface/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-primary">
              Nearby Infrastructure Entities ({topLocation.impact?.nearby_entities?.length ?? 0} found within 2000m)
            </span>
            <span className="text-[11px] font-bold text-accent">
              Exposure: {exposureScore.toFixed(1)}
            </span>
          </div>
          {nearbyEntities.length > 0 ? (
            <div className="space-y-1.5">
              {nearbyEntities.map((ent, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-black/20 p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {getEntityIcon(ent.type)}
                    <span className="font-medium text-text-primary">{ent.name}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-text-secondary">
                    {ent.distance_m?.toFixed(0) ?? 0}m away
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

        {/* Recommended Action */}
        <div className="rounded-xl border border-warning/40 bg-warning/15 p-3.5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-warning flex items-center gap-1.5 mb-1.5">
              <Wrench className="h-4 w-4 text-warning" />
              Recommended Infrastructure Maintenance Action
            </span>
            <p className="text-xs text-text-primary font-medium leading-relaxed">
              {actionText}
            </p>
          </div>
          <div className="mt-3 text-[10px] text-text-secondary border-t border-warning/20 pt-1.5">
            Calculated by LaunchpadX Decision Engine (Weights: 50% XGBoost, 20% Damage, 20% GIS Exposure, 10% Road Conn)
          </div>
        </div>
      </div>
    </motion.div>
  )
}
