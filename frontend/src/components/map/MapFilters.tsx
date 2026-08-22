import { Filter, RotateCcw } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { useFilterStore } from '@/store/useFilterStore'
import { cn, getRiskBgClass, getRiskLabel } from '@/lib/utils'
import type { RiskLevel } from '@/types'

const RISK_LEVELS: RiskLevel[] = ['low', 'medium', 'high', 'critical']

export function MapFilters() {
  const {
    showBridges,
    showRoads,
    showHospitals,
    riskLevels,
    conditionMin,
    conditionMax,
    setShowBridges,
    setShowRoads,
    setShowHospitals,
    toggleRiskLevel,
    setConditionRange,
    resetFilters,
  } = useFilterStore()

  return (
    <GlassCard padding="md" className="h-fit">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-medium text-text-primary">Map Filters</h3>
        </div>
        <Button variant="ghost" size="sm" icon={<RotateCcw className="h-3.5 w-3.5" />} onClick={resetFilters}>
          Reset
        </Button>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Asset Types
          </p>
          <div className="space-y-2">
            {[
              { label: 'Bridges', checked: showBridges, onChange: setShowBridges },
              { label: 'Roads', checked: showRoads, onChange: setShowRoads },
              { label: 'Hospitals', checked: showHospitals, onChange: setShowHospitals },
            ].map((item) => (
              <label key={item.label} className="flex cursor-pointer items-center gap-2.5 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-surface accent-accent"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Risk Level
          </p>
          <div className="flex flex-wrap gap-2">
            {RISK_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => toggleRiskLevel(level)}
                className={cn(
                  'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
                  getRiskBgClass(level),
                  riskLevels.includes(level)
                    ? 'ring-2 ring-accent/40'
                    : 'opacity-50 hover:opacity-80',
                )}
              >
                {getRiskLabel(level)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Condition Range
          </p>
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={100}
              value={conditionMin}
              onChange={(e) => setConditionRange(Number(e.target.value), conditionMax)}
              className="w-full accent-accent"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={conditionMax}
              onChange={(e) => setConditionRange(conditionMin, Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Min: {conditionMin}</span>
              <span>Max: {conditionMax}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
