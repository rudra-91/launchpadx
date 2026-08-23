import type { AnalyzedLocationOut } from '@/types'
import { cn } from '@/lib/utils'

interface RankedLeaderboardProps {
  locations: AnalyzedLocationOut[]
  selectedLocationId: string | null
  onSelectLocation: (id: string) => void
}

function levelBadgeClass(level: string) {
  switch (level.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-critical/10 text-critical'
    case 'HIGH':
      return 'bg-warning/10 text-warning'
    case 'MEDIUM':
      return 'bg-accent/10 text-accent'
    default:
      return 'bg-success/10 text-success'
  }
}

export function RankedLeaderboard({
  locations,
  selectedLocationId,
  onSelectLocation,
}: RankedLeaderboardProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-[17px] font-semibold text-text-primary">Priority Rankings</h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Sorted by composite priority score
          </p>
        </div>
        <span className="rounded-full bg-elevated px-3 py-1 text-[12px] font-medium text-text-secondary">
          {locations.length} location{locations.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto p-4 xl:max-h-[460px]">
        {locations.map((loc) => {
          const isSelected = selectedLocationId === loc.location_id
          const priorityLevel = loc.priority.priority_level
          const xgbLabel = loc.risk.risk_prediction.label

          return (
            <button
              key={loc.location_id}
              type="button"
              onClick={() => onSelectLocation(loc.location_id)}
              className={cn(
                'w-full rounded-2xl border px-5 py-[18px] text-left transition-all duration-150',
                isSelected
                  ? 'border-accent/40 bg-accent/[0.07]'
                  : 'border-border bg-elevated/40 hover:border-border-strong hover:bg-elevated/70',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-semibold',
                      loc.rank === 1
                        ? 'bg-warning/15 text-warning'
                        : 'bg-background text-text-secondary',
                    )}
                  >
                    #{loc.rank}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold text-text-primary">
                      {loc.name}
                    </h3>
                    <p className="mt-1 text-[12px] text-muted">
                      {loc.road_name ? `${loc.road_name} · ` : ''}
                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    'shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                    levelBadgeClass(priorityLevel),
                  )}
                >
                  {priorityLevel}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                <Metric
                  label="Priority Score"
                  value={loc.priority.priority_score.toFixed(1)}
                />
                <Metric label="XGBoost Risk" value={xgbLabel} accent />
                <Metric label="Detections" value={String(loc.risk.detection_count)} />
                <Metric
                  label="Exposure"
                  value={loc.impact.entity_exposure_score.toFixed(1)}
                />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p
        className={cn(
          'mt-1 text-[15px] font-semibold',
          accent ? 'text-accent' : 'text-text-primary',
        )}
      >
        {value}
      </p>
    </div>
  )
}
