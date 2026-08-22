import { create } from 'zustand'
import type { AssetType, RiskLevel } from '@/types'

interface FilterState {
  search: string
  riskLevels: RiskLevel[]
  assetTypes: AssetType[]
  conditionMin: number
  conditionMax: number
  showBridges: boolean
  showRoads: boolean
  showHospitals: boolean
  setSearch: (search: string) => void
  toggleRiskLevel: (level: RiskLevel) => void
  toggleAssetType: (type: AssetType) => void
  setConditionRange: (min: number, max: number) => void
  setShowBridges: (show: boolean) => void
  setShowRoads: (show: boolean) => void
  setShowHospitals: (show: boolean) => void
  resetFilters: () => void
}

const defaultState = {
  search: '',
  riskLevels: [] as RiskLevel[],
  assetTypes: [] as AssetType[],
  conditionMin: 0,
  conditionMax: 100,
  showBridges: true,
  showRoads: true,
  showHospitals: true,
}

export const useFilterStore = create<FilterState>((set) => ({
  ...defaultState,

  setSearch: (search) => set({ search }),

  toggleRiskLevel: (level) =>
    set((state) => ({
      riskLevels: state.riskLevels.includes(level)
        ? state.riskLevels.filter((l) => l !== level)
        : [...state.riskLevels, level],
    })),

  toggleAssetType: (type) =>
    set((state) => ({
      assetTypes: state.assetTypes.includes(type)
        ? state.assetTypes.filter((t) => t !== type)
        : [...state.assetTypes, type],
    })),

  setConditionRange: (min, max) => set({ conditionMin: min, conditionMax: max }),

  setShowBridges: (show) => set({ showBridges: show }),
  setShowRoads: (show) => set({ showRoads: show }),
  setShowHospitals: (show) => set({ showHospitals: show }),

  resetFilters: () => set(defaultState),
}))
