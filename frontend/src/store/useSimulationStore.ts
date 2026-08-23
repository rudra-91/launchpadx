import { create } from 'zustand'
import type { OptimizationResult, SimulationResult } from '@/types'

interface SimulationState {
  selectedAssetId: string
  repairQuality: number
  budget: number
  strategy: 'safety' | 'accessibility' | 'economic'
  optimizerBudget: number
  simulationResult: SimulationResult | null
  optimizationResult: OptimizationResult | null
  isRunning: boolean
  setSelectedAssetId: (id: string) => void
  setRepairQuality: (quality: number) => void
  setBudget: (budget: number) => void
  setStrategy: (strategy: 'safety' | 'accessibility' | 'economic') => void
  setOptimizerBudget: (budget: number) => void
  setSimulationResult: (result: SimulationResult | null) => void
  setOptimizationResult: (result: OptimizationResult | null) => void
  setIsRunning: (running: boolean) => void
  reset: () => void
}

const initialState = {
  selectedAssetId: '',
  repairQuality: 50,
  budget: 150000,
  strategy: 'safety' as const,
  optimizerBudget: 500000,
  simulationResult: null as SimulationResult | null,
  optimizationResult: null as OptimizationResult | null,
  isRunning: false,
}

export const useSimulationStore = create<SimulationState>((set) => ({
  ...initialState,

  setSelectedAssetId: (id) => set({ selectedAssetId: id }),
  setRepairQuality: (quality) => set({ repairQuality: quality }),
  setBudget: (budget) => set({ budget }),
  setStrategy: (strategy) => set({ strategy }),
  setOptimizerBudget: (budget) => set({ optimizerBudget: budget }),
  setSimulationResult: (result) => set({ simulationResult: result }),
  setOptimizationResult: (result) => set({ optimizationResult: result }),
  setIsRunning: (running) => set({ isRunning: running }),
  reset: () => set(initialState),
}))
