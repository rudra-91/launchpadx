import { useMemo, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Select } from '@/components/ui/Select'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'
import { EmptyInspectionState } from '@/components/ui/EmptyInspectionState'
import {
  deriveInspectionMetrics,
  getLocations,
  normalizeRiskLevel,
} from '@/lib/inspectionDerived'
import { useInspectionStore } from '@/store/useInspectionStore'

export function RiskPage() {
  const results = useInspectionStore((s) => s.results)
  const locations = getLocations(results)
  const metrics = useMemo(() => deriveInspectionMetrics(results), [results])
  const [selectedId, setSelectedId] = useState<string>('')

  const selected =
    locations.find((loc) => loc.location_id === selectedId) ?? locations[0] ?? null

  if (locations.length === 0 || !metrics) {
    return (
      <div className="space-y-6">
        <div data-reveal>
          <p className="text-sm text-text-secondary">
            XGBoost risk classification and YOLO damage metrics from live inspection
          </p>
        </div>
        <EmptyInspectionState
          title="No risk data yet"
          description="Run a Road Inspection to populate risk scores, damage breakdowns, and distribution charts."
        />
      </div>
    )
  }

  const options = locations.map((loc) => ({
    value: loc.location_id,
    label: `#${loc.rank} ${loc.name} (${loc.risk.risk_prediction.label})`,
  }))

  const riskLevel = normalizeRiskLevel(
    selected?.risk.risk_prediction.label || selected?.risk.risk_level,
  )

  return (
    <div className="space-y-6">
      <div data-reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">
            Live risk intelligence across {locations.length} inspected location
            {locations.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="min-w-[280px]">
          <Select
            label="Select location"
            value={selected?.location_id ?? ''}
            onChange={(e) => setSelectedId(e.target.value)}
            options={options}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-stagger>
        {locations.map((loc) => {
          const level = normalizeRiskLevel(loc.risk.risk_prediction.label || loc.risk.risk_level)
          return (
            <button
              key={loc.location_id}
              type="button"
              onClick={() => setSelectedId(loc.location_id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                selected?.location_id === loc.location_id
                  ? 'border-accent/50 bg-accent/10'
                  : 'border-border bg-surface/40 hover:border-accent/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text-primary">#{loc.rank} {loc.name}</p>
                <RiskBadge level={level} size="sm" />
              </div>
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {loc.risk.risk_score.toFixed(1)}
              </p>
              <p className="text-xs text-text-secondary">
                XGBoost {loc.risk.risk_prediction.label} · {loc.risk.detection_count} detections
              </p>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" data-reveal>
          <GlassCard padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">{selected.name}</h3>
              <RiskBadge level={riskLevel} score={selected.risk.risk_score} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Risk Score" value={selected.risk.risk_score.toFixed(1)} />
              <Stat label="Damage Score" value={selected.risk.damage_score.toFixed(1)} />
              <Stat label="XGBoost Class" value={String(selected.risk.risk_prediction.class)} />
              <Stat label="XGBoost Label" value={selected.risk.risk_prediction.label} />
              <Stat label="Detection Count" value={String(selected.risk.detection_count)} />
              <Stat
                label="Damage Area Ratio"
                value={(selected.risk.risk_features.total_damage_area_ratio * 100).toFixed(2) + '%'}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 border-t border-border pt-4">
              <DamageStat code="D00" count={selected.risk.damage_breakdown.D00} />
              <DamageStat code="D10" count={selected.risk.damage_breakdown.D10} />
              <DamageStat code="D20" count={selected.risk.damage_breakdown.D20} />
              <DamageStat code="D40" count={selected.risk.damage_breakdown.D40} />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
              <p className="text-text-secondary">
                D00 area:{' '}
                <span className="text-text-primary">
                  {(selected.risk.risk_features.d00_area_ratio * 100).toFixed(2)}%
                </span>
              </p>
              <p className="text-text-secondary">
                D10 area:{' '}
                <span className="text-text-primary">
                  {(selected.risk.risk_features.d10_area_ratio * 100).toFixed(2)}%
                </span>
              </p>
              <p className="text-text-secondary">
                D20 area:{' '}
                <span className="text-text-primary">
                  {(selected.risk.risk_features.d20_area_ratio * 100).toFixed(2)}%
                </span>
              </p>
              <p className="text-text-secondary">
                D40 area:{' '}
                <span className="text-text-primary">
                  {(selected.risk.risk_features.d40_area_ratio * 100).toFixed(2)}%
                </span>
              </p>
            </div>
          </GlassCard>

          <RiskDistributionChart data={metrics.riskDistribution} />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface/30 p-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
    </div>
  )
}

function DamageStat({ code, count }: { code: string; count: number }) {
  return (
    <div className="rounded-xl border border-border/50 p-3 text-center">
      <p className="text-xs text-text-secondary">{code}</p>
      <p className="text-xl font-bold text-text-primary">{count}</p>
    </div>
  )
}
