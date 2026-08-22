import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Play, Clock, TrendingDown, Shield } from 'lucide-react'
import { fetchAssets, runSimulation } from '@/services/assets'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { BudgetInput } from '@/components/optimizer/BudgetInput'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { REPAIR_QUALITY_OPTIONS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { useSimulationStore } from '@/store/useSimulationStore'

export function SimulationPage() {
  const location = useLocation()
  const stateAssetId = (location.state as { assetId?: string })?.assetId

  const {
    selectedAssetId,
    repairQuality,
    budget,
    simulationResult,
    isRunning,
    setSelectedAssetId,
    setRepairQuality,
    setBudget,
    setSimulationResult,
    setIsRunning,
  } = useSimulationStore()

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
  })

  useEffect(() => {
    if (stateAssetId) setSelectedAssetId(stateAssetId)
  }, [stateAssetId, setSelectedAssetId])

  const handleRun = async () => {
    setIsRunning(true)
    try {
      const result = await runSimulation({
        assetId: selectedAssetId,
        repairQuality,
        budget,
      })
      setSimulationResult(result)
    } finally {
      setIsRunning(false)
    }
  }

  const assetOptions =
    assets?.map((a) => ({ value: a.id, label: `${a.assetId} — ${a.name}` })) ?? []

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          What-if repair simulation with predicted risk and access time outcomes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-reveal>
        <GlassCard padding="lg" className="space-y-5">
          <h3 className="text-sm font-medium text-text-primary">Simulation Parameters</h3>

          {isLoading ? (
            <LoadingSkeleton variant="card" />
          ) : (
            <>
              <Select
                label="Select Bridge"
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                options={assetOptions}
              />
              <Select
                label="Repair Quality"
                value={String(repairQuality)}
                onChange={(e) => setRepairQuality(Number(e.target.value))}
                options={REPAIR_QUALITY_OPTIONS}
              />
              <BudgetInput value={budget} onChange={setBudget} label="Repair Budget" />
              <Button
                loading={isRunning}
                icon={<Play className="h-4 w-4" />}
                onClick={handleRun}
                className="w-full"
              >
                Run Simulation
              </Button>
            </>
          )}
        </GlassCard>

        <div className="space-y-4">
          {simulationResult ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-stagger>
              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">Before Risk</span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-critical">
                  {simulationResult.beforeRisk}
                </p>
              </GlassCard>
              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs">After Risk</span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-success">
                  {simulationResult.afterRisk}
                </p>
              </GlassCard>
              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs">Risk Reduction</span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-accent">
                  -{simulationResult.riskReduction}
                </p>
              </GlassCard>
              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Est. Access Time</span>
                </div>
                <p className="mt-2 text-3xl font-semibold text-text-primary">
                  {simulationResult.estimatedAccessTime} min
                </p>
              </GlassCard>
              <GlassCard padding="md" className="sm:col-span-2">
                <p className="text-xs text-text-secondary">Estimated Cost</p>
                <p className="mt-1 text-xl font-semibold text-text-primary">
                  {formatCurrency(simulationResult.costEstimate)}
                </p>
              </GlassCard>
            </div>
          ) : (
            <GlassCard padding="lg" className="flex h-full min-h-[300px] items-center justify-center">
              <p className="text-text-secondary">Configure parameters and run simulation</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
