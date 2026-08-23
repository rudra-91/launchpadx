import { useMemo } from 'react'
import { Play, TrendingUp, DollarSign, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { BudgetInput } from '@/components/optimizer/BudgetInput'
import { PriorityList } from '@/components/optimizer/PriorityList'
import { EmptyInspectionState } from '@/components/ui/EmptyInspectionState'
import { STRATEGY_OPTIONS } from '@/lib/constants'
import { formatCurrency, formatPercent } from '@/lib/utils'
import {
  getLocations,
  maintenanceRecommendation,
  optimizeFromInspection,
} from '@/lib/inspectionDerived'
import { useInspectionStore } from '@/store/useInspectionStore'
import { useSimulationStore } from '@/store/useSimulationStore'

export function OptimizerPage() {
  const navigate = useNavigate()
  const results = useInspectionStore((s) => s.results)
  const locations = getLocations(results)

  const {
    optimizerBudget,
    strategy,
    optimizationResult,
    isRunning,
    setOptimizerBudget,
    setStrategy,
    setOptimizationResult,
    setIsRunning,
  } = useSimulationStore()

  const rankedPreview = useMemo(
    () => [...locations].sort((a, b) => a.rank - b.rank),
    [locations],
  )

  const handleRun = () => {
    setIsRunning(true)
    try {
      const result = optimizeFromInspection(results, optimizerBudget, strategy)
      setOptimizationResult(result)
    } finally {
      setIsRunning(false)
    }
  }

  if (locations.length === 0) {
    return (
      <div className="space-y-6">
        <div data-reveal>
          <p className="text-sm text-text-secondary">
            Maintenance priorities derived from live inspection priority scores
          </p>
        </div>
        <EmptyInspectionState
          title="No maintenance priorities yet"
          description="Run a Road Inspection first. Priorities come from the live priority engine — not hardcoded bridge lists."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Budget-constrained maintenance using live inspection priority scores (
          {locations.length} location{locations.length === 1 ? '' : 's'})
        </p>
      </div>

      <GlassCard padding="md" className="space-y-3" data-reveal>
        <h3 className="text-sm font-semibold text-text-primary">
          Priority Engine Ranking (from inspection)
        </h3>
        {rankedPreview.map((loc) => (
          <div
            key={loc.location_id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-text-primary">
                #{loc.rank} {loc.name}
              </p>
              <p className="text-xs text-text-secondary">
                {maintenanceRecommendation(loc)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-accent">
                {loc.priority.priority_score.toFixed(1)}
              </p>
              <p className="text-xs text-text-secondary">{loc.priority.priority_level}</p>
            </div>
          </div>
        ))}
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" data-reveal>
        <GlassCard padding="lg" className="space-y-5">
          <h3 className="text-sm font-medium text-text-primary">Optimization Settings</h3>
          <BudgetInput value={optimizerBudget} onChange={setOptimizerBudget} />
          <Select
            label="Priority Strategy"
            value={strategy}
            onChange={(e) =>
              setStrategy(e.target.value as 'safety' | 'accessibility' | 'economic')
            }
            options={STRATEGY_OPTIONS}
          />
          <Button loading={isRunning} icon={<Play className="h-4 w-4" />} onClick={handleRun} className="w-full">
            Run Optimizer
          </Button>
        </GlassCard>

        {optimizationResult ? (
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-stagger>
              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs">Budget Used</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-text-primary">
                  {formatCurrency(optimizationResult.budgetUsed)}
                </p>
              </GlassCard>
              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Network Improvement</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-success">
                  {formatPercent(optimizationResult.expectedNetworkImprovement)}
                </p>
              </GlassCard>
              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Locations Selected</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-accent">
                  {optimizationResult.items.length}
                </p>
              </GlassCard>
            </div>
            <PriorityList
              items={optimizationResult.items}
              onItemClick={(item) => navigate(`/assets/${item.assetId}`)}
            />
          </div>
        ) : (
          <GlassCard
            padding="lg"
            className="flex min-h-[300px] items-center justify-center lg:col-span-2"
          >
            <p className="text-text-secondary">
              Set budget and strategy, then run optimizer on live inspection priorities
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
