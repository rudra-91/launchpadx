import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock, TrendingDown, Shield, Sparkles, ArrowRight, Wrench } from 'lucide-react'
import { runSimulation } from '@/services/assets'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { BudgetInput } from '@/components/optimizer/BudgetInput'
import { REPAIR_QUALITY_OPTIONS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
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

  const locations = useMemo(() => results?.locations ?? [], [results])

  const roadOptions = useMemo(() => {
    return locations.map((loc) => ({
      value: loc.location_id,
      label: `${loc.name} (Priority ${loc.priority?.priority_score?.toFixed(1) ?? 'N/A'})`,
    }))
  }, [locations])

  useEffect(() => {
    if (locations.length > 0) {
      const match = locations.find((l) => l.location_id === selectedAssetId)
      if (!match) {
        setSelectedAssetId(locations[0].location_id)
      }
    }
  }, [locations, selectedAssetId, setSelectedAssetId])

  const selectedLocation = useMemo(() => {
    return locations.find((l) => l.location_id === selectedAssetId) ?? locations[0]
  }, [locations, selectedAssetId])

  const handleRun = async () => {
    if (!selectedAssetId) return
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

  if (!results || locations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Road Repair What-If Simulation
          </h2>
          <p className="text-xs text-text-secondary">
            Simulate paviing & structural repair quality vs budget outcomes for analyzed Indian road locations.
          </p>
        </div>

        <GlassCard padding="lg" className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-xl mx-auto border border-accent/30 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Run a Road Inspection first</h3>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              To run what-if repair simulations, perform a live road damage inspection. The simulation engine will evaluate risk reduction and emergency access time for your inspected road corridors.
            </p>
          </div>
          <Link
            to="/inspections"
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-background shadow-lg shadow-accent/20 transition-opacity hover:opacity-90 cursor-pointer"
          >
            <span>Run Road Inspection</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div data-reveal className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Road Repair What-If Simulation
          </h2>
          <p className="text-xs text-text-secondary">
            What-if repair simulation for live inspected Indian road corridors ({locations.length} Location{locations.length === 1 ? '' : 's'} Available)
          </p>
        </div>
      </div>

      {/* Selected Location Context Card */}
      {selectedLocation && (
        <GlassCard padding="md" className="border border-accent/40 bg-accent/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/40 bg-accent/20 text-accent font-bold text-xs">
                #{selectedLocation.rank}
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">{selectedLocation.name}</h3>
                <p className="text-xs text-text-secondary">
                  GPS: ({selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}) · Priority Score: {selectedLocation.priority?.priority_score?.toFixed(1) ?? 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-accent/20 px-2.5 py-1 text-xs font-extrabold text-accent">
                XGBoost {selectedLocation.risk?.risk_prediction?.label ?? 'MEDIUM'}
              </span>
              <span className="rounded bg-warning/20 px-2.5 py-1 text-xs font-bold text-warning">
                {selectedLocation.risk?.detection_count ?? 0} Damage Items
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-reveal>
        <GlassCard padding="lg" className="space-y-5">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
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
                <p className="text-xs text-text-secondary font-semibold">Estimated Repair Cost</p>
                <p className="mt-1 text-xl font-extrabold text-text-primary">
                  {formatCurrency(simulationResult.costEstimate)}
                </p>
              </GlassCard>
            </div>
          ) : (
            <GlassCard padding="lg" className="flex h-full min-h-[300px] items-center justify-center border border-dashed border-border">
              <p className="text-xs text-text-secondary font-medium">Select parameters and click "Run Simulation"</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}
