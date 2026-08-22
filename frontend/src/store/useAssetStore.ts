import { create } from 'zustand'
import type { Asset } from '@/types'

interface AssetState {
  selectedAsset: Asset | null
  setSelectedAsset: (asset: Asset | null) => void
}

export const useAssetStore = create<AssetState>((set) => ({
  selectedAsset: null,
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
}))
