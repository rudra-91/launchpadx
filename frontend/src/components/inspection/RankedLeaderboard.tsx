import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import type { AnalyzedLocationOut } from '@/types'
import { cn } from '@/lib/utils'

interface RankedLeaderboardProps {
  locations: AnalyzedLocationOut[]
  selectedLocationId: string | null
  onSelectLocation: (id: string) => void
}

export function RankedLeaderboard({
  locations,
  selectedLocationId,
  onSelectLocation,
}: RankedLeaderboardProps) {
  const getLevelBadgeClass = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return 'border-critical/30 bg-critical/10 text-critical'
      case 'HIGH':
        return 'border-warning/30 bg-warning/10 text-warning'
      case 'MEDIUM':
        return 'border-accent/30 bg-accent/10 text-accent'
      default:
        return 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    }
  }

  return (
    <div className="glass-card flex flex-col overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-accent" />
          <h3 className="text-sm font-semibold text-text-primary">
            Priority Ranked Network Leaderboard
          </h3>
        </div>
        <span className="text-xs text-text-secondary">
          {locations.length} Location{locations.length === 1 ? '' : 's'} Sorted
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[520px] pr-1">
        {locations.map((loc) => {
          const isSelected = selectedLocationId === loc.location_id
          const priorityLevel = loc.priority.priority_level
          const xgbLabel = loc.risk.risk_prediction.label

          return (
            <motion.div
              key={loc.location_id}
              whileHover={{ scale: 1.01 }}
              onClick={() => onSelectLocation(loc.location_id)}
              className={cn(
                'group relative cursor-pointer rounded-xl border p-3.5 transition-all duration-200',
                isSelected
                  ? 'border-accent bg-accent/10 shadow-lg shadow-accent/5'
                  : 'border-border bg-surface/40 hover:border-accent/40 hover:bg-surface/80',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-bold text-xs',
                      loc.rank === 1
                        ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                        : loc.rank === 2
                          ? 'border-gray-400/40 bg-gray-400/15 text-gray-300'
                          : 'border-border bg-surface text-text-secondary',
                    )}
                  >
                    #{loc.rank}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent">
                      {loc.name}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      ({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})
                    </p>
                  </div>
                </div>

                {/* Priority Level Badge */}
                <span
                  className={cn(
                    'inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
                    getLevelBadgeClass(priorityLevel),
                  )}
                >
                  {priorityLevel}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-black/20 p-2 text-xs">
                <div>
                  <span className="block text-[10px] text-text-secondary">Priority Score</span>
                  <span className="font-semibold text-text-primary">
                    {loc.priority.priority_score.toFixed(1)}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-text-secondary">XGBoost Risk</span>
                  <span className="font-semibold text-accent">{xgbLabel}</span>
                </div>

                <div>
                  <span className="block text-[10px] text-text-secondary">Detections</span>
                  <span className="font-semibold text-text-primary">
                    {loc.risk.detection_count}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-text-secondary">Entity Exposure</span>
                  <span className="font-semibold text-text-primary">
                    {loc.impact.entity_exposure_score.toFixed(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
