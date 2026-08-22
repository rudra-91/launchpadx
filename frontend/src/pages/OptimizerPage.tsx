import { Play, TrendingUp, DollarSign, Target } from 'lucide-react'
import { runOptimization } from '@/services/assets'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { BudgetInput } from '@/components/optimizer/BudgetInput'
import { PriorityList } from '@/components/optimizer/PriorityList'
import { STRATEGY_OPTIONS } from '@/lib/constants'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { useSimulationStore } from '@/store/useSimulationStore'
import { useNavigate } from 'react-router-dom'

export function OptimizerPage() {
  const navigate = useNavigate()
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

  const handleRun = async () => {
    setIsRunning(true)
    try {
      const result = await runOptimization({
        budget: optimizerBudget,
        strategy,
      })
      setOptimizationResult(result)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Budget-constrained maintenance prioritization across the network
        </p>
      </div>

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
          <Button
            loading={isRunning}
            icon={<Play className="h-4 w-4" />}
            onClick={handleRun}
            className="w-full"
          >
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
                  <span className="text-xs">Assets Selected</span>
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
          <GlassCard padding="lg" className="flex min-h-[300px] items-center justify-center lg:col-span-2">
            <p className="text-text-secondary">Set budget and strategy, then run optimizer</p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
