import { useEffect, useMemo } from 'react'
import { Play, Clock, TrendingDown, Shield, Wrench } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { BudgetInput } from '@/components/optimizer/BudgetInput'
import { EmptyInspectionState } from '@/components/ui/EmptyInspectionState'
import { REPAIR_QUALITY_OPTIONS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { getLocations, simulateFromInspection } from '@/lib/inspectionDerived'
import { useSimulationStore } from '@/store/useSimulationStore'
import { useInspectionStore } from '@/store/useInspectionStore'

export function SimulationPage() {
  const results = useInspectionStore((s) => s.results)

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

  const locations = useMemo(() => getLocations(results), [results])

  const roadOptions = useMemo(() => {
    return locations.map((loc) => ({
      value: loc.location_id,
      label: `${loc.name} (Priority ${loc.priority.priority_score.toFixed(1)})`,
    }))
  }, [locations])

  useEffect(() => {
    if (locations.length === 0) return
    const match = locations.find((l) => l.location_id === selectedAssetId)
    if (!match) {
      setSelectedAssetId(locations[0].location_id)
      setSimulationResult(null)
    }
  }, [locations, selectedAssetId, setSelectedAssetId, setSimulationResult])

  const selectedLocation = useMemo(() => {
    return locations.find((l) => l.location_id === selectedAssetId) ?? locations[0]
  }, [locations, selectedAssetId])

  const handleRun = () => {
    if (!selectedLocation) return
    setIsRunning(true)
    try {
      const result = simulateFromInspection(selectedLocation, repairQuality, budget)
      setSimulationResult(result)
    } finally {
      setIsRunning(false)
    }
  }

  if (locations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Road Repair What-If Simulation</h2>
          <p className="text-xs text-text-secondary">
            Simulate repair quality vs budget using live inspected road risk scores
          </p>
        </div>
        <EmptyInspectionState title="Run a Road Inspection first." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div data-reveal className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Road Repair What-If Simulation</h2>
          <p className="text-xs text-text-secondary">
            What-if repair simulation for live inspected road corridors ({locations.length}{' '}
            location{locations.length === 1 ? '' : 's'} available)
          </p>
        </div>
      </div>

      {selectedLocation && (
        <GlassCard padding="md" className="border border-accent/40 bg-accent/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/40 bg-accent/20 text-xs font-bold text-accent">
                #{selectedLocation.rank}
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">{selectedLocation.name}</h3>
                <p className="text-xs text-text-secondary">
                  {selectedLocation.road_name || 'Road'} · GPS: (
                  {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}) ·
                  Priority {selectedLocation.priority.priority_score.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-accent/20 px-2.5 py-1 text-xs font-extrabold text-accent">
                XGBoost {selectedLocation.risk.risk_prediction.label}
              </span>
              <span className="rounded bg-warning/20 px-2.5 py-1 text-xs font-bold text-warning">
                Risk {selectedLocation.risk.risk_score.toFixed(1)}
              </span>
              <span className="rounded bg-warning/20 px-2.5 py-1 text-xs font-bold text-warning">
                {selectedLocation.risk.detection_count} Damage Items
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-reveal>
        <GlassCard padding="lg" className="space-y-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary">
            <Wrench className="h-4 w-4 text-accent" />
            Road Repair Simulation Parameters
          </h3>

          <Select
            label="Select Inspected Road Location"
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            options={roadOptions}
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
        </GlassCard>

        <div className="space-y-4">
          {simulationResult ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-stagger>
              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-semibold">Before Risk Score</span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-critical">
                  {simulationResult.beforeRisk}
                </p>
                <p className="mt-1 text-xs text-muted">From live inspection risk_score</p>
              </GlassCard>

              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-semibold">After Risk Score</span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-emerald-400">
                  {simulationResult.afterRisk}
                </p>
              </GlassCard>

              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <TrendingDown className="h-4 w-4 text-accent" />
                  <span className="text-xs font-semibold">Risk Reduction</span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-accent">
                  -{simulationResult.riskReduction}
                </p>
              </GlassCard>

              <GlassCard padding="md">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold">Est. Access Time</span>
                </div>
                <p className="mt-2 text-3xl font-extrabold text-text-primary">
                  {simulationResult.estimatedAccessTime} min
                </p>
              </GlassCard>

              <GlassCard padding="md" className="sm:col-span-2">
                <p className="text-xs font-semibold text-text-secondary">Estimated Repair Cost</p>
                <p className="mt-1 text-xl font-extrabold text-text-primary">
                  {formatCurrency(simulationResult.costEstimate)}
                </p>
              </GlassCard>
            </div>
          ) : (
            <GlassCard
              padding="lg"
              className="flex h-full min-h-[300px] items-center justify-center border border-dashed border-border"
            >
              <p className="text-xs font-medium text-text-secondary">
                Select parameters and click &quot;Run Simulation&quot;
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
