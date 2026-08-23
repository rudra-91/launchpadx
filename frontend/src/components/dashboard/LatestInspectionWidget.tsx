import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileSearch,
  ArrowRight,
  Sparkles,
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
        return <Shield className="h-3.5 w-3.5 text-blue-400" />
      case 'school':
        return <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
      default:
        return <Building className="h-3.5 w-3.5 text-text-secondary" />
    }
  }

  // EMPTY STATE when no live inspection analysis has been performed yet
  if (!topLocation || !topLocation.priority || !topLocation.risk || !topLocation.impact) {
    return (
      <div className="glass-card flex flex-col items-center justify-between p-5 border border-accent/30 sm:flex-row shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent/15 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Latest AI Road Inspection
            </h3>
            <p className="text-xs text-text-secondary">
              No live inspection yet — Run Road Inspection to detect YOLO damage, calculate XGBoost risk & GIS impact.
            </p>
          </div>
        </div>

        <Link
          to="/inspections"
          className="mt-4 sm:mt-0 flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-background shadow-lg shadow-accent/20 transition-opacity hover:opacity-90 cursor-pointer"
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
      className="glass-card overflow-hidden p-5 border border-accent/40 shadow-xl space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/15 text-amber-400 font-bold text-xs">
            #{topLocation.rank ?? 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-text-primary">Latest AI Road Inspection</h3>
              <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-extrabold text-accent uppercase tracking-wider">
                REAL ANALYSIS RESULT
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Location: <strong className="text-text-primary">{topLocation.name}</strong> · GPS: ({topLocation.latitude?.toFixed(4) ?? '0.0000'}, {topLocation.longitude?.toFixed(4) ?? '0.0000'})
            </p>
          </div>
        </div>

        <Link
          to="/inspections"
          className="flex items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
        >
          <FileSearch className="h-4 w-4" />
          View Detailed Inspection
        </Link>
      </div>

      {/* Grid of Key AI Intelligence Indicators */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Location & Risk Level */}
        <div className="rounded-xl border border-border bg-surface/40 p-3">
          <span className="text-[10px] font-semibold uppercase text-text-secondary tracking-wider">
            Risk Level
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-text-primary">
              {riskLevel}
            </span>
            <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
              {topLocation.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Priority Level / Score */}
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
          <span className="text-[10px] font-semibold uppercase text-accent tracking-wider">
            Priority Score & Level
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-text-primary">
              {score.toFixed(1)}
            </span>
            <span className="rounded bg-accent/30 px-2 py-0.5 text-xs font-extrabold text-accent">
              {level}
            </span>
          </div>
        </div>

        {/* XGBoost Prediction */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3">
          <span className="text-[10px] font-semibold uppercase text-purple-400 tracking-wider">
            XGBoost Model Prediction
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-text-primary">
              Class {riskPredClass}
            </span>
            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-bold text-purple-300">
              {riskPredLabel}
            </span>
          </div>
        </div>

        {/* Damage Counts */}
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
          <span className="text-[10px] font-semibold uppercase text-warning tracking-wider">
            YOLO Damage Summary
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-warning">
              {detectionCount} Items
            </span>
            <span className="text-[11px] font-semibold text-text-secondary">
              Potholes: {potholeCount} | Cracks: {d00Count + d20Count}
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
