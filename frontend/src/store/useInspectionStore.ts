import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DraftLocationItem } from '@/services/inspection'
import type { InspectionAnalysisDataOut } from '@/types'

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

interface InspectionState {
  locations: DraftLocationItem[]
  imagesMap: Record<string, File[]>
  previewsMap: Record<string, string[]>
  selectedLocationId: string | null
  results: InspectionAnalysisDataOut | null
  analyzedAt: string | null
  status: AnalysisStatus
  error: string | null

  addLocation: (loc: DraftLocationItem) => void
  removeLocation: (id: string) => void
  updateLocation: (id: string, updated: Partial<DraftLocationItem>) => void
  addImages: (locationId: string, files: File[]) => void
  removeImage: (locationId: string, imageIndex: number) => void
  setSelectedLocation: (id: string | null) => void
  setResults: (res: InspectionAnalysisDataOut | null) => void
  setStatus: (st: AnalysisStatus) => void
  setError: (err: string | null) => void
  reset: () => void
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set) => ({
      locations: [],
      imagesMap: {},
      previewsMap: {},
      selectedLocationId: null,
      results: null,
      analyzedAt: null,
      status: 'idle',
      error: null,

      addLocation: (loc) =>
        set((state) => ({
          locations: [...state.locations, loc],
          imagesMap: { ...state.imagesMap, [loc.id]: state.imagesMap[loc.id] || [] },
          previewsMap: { ...state.previewsMap, [loc.id]: state.previewsMap[loc.id] || [] },
        })),

      removeLocation: (id) =>
        set((state) => {
          const nextLocs = state.locations.filter((l) => l.id !== id)
          const nextImages = { ...state.imagesMap }
          const nextPreviews = { ...state.previewsMap }

          if (nextPreviews[id]) {
            nextPreviews[id].forEach((url) => URL.revokeObjectURL(url))
          }
          delete nextImages[id]
          delete nextPreviews[id]

          return {
            locations: nextLocs,
            imagesMap: nextImages,
            previewsMap: nextPreviews,
            selectedLocationId: state.selectedLocationId === id ? null : state.selectedLocationId,
          }
        }),

      updateLocation: (id, updated) =>
        set((state) => ({
          locations: state.locations.map((loc) => (loc.id === id ? { ...loc, ...updated } : loc)),
        })),

      addImages: (locationId, files) =>
        set((state) => {
          const existingFiles = state.imagesMap[locationId] || []
          const existingPreviews = state.previewsMap[locationId] || []

          const newPreviews = files.map((file) => URL.createObjectURL(file))

          return {
            imagesMap: {
              ...state.imagesMap,
              [locationId]: [...existingFiles, ...files],
            },
            previewsMap: {
              ...state.previewsMap,
              [locationId]: [...existingPreviews, ...newPreviews],
            },
          }
        }),

      removeImage: (locationId, imageIndex) =>
        set((state) => {
          const files = [...(state.imagesMap[locationId] || [])]
          const previews = [...(state.previewsMap[locationId] || [])]

          if (previews[imageIndex]) {
            URL.revokeObjectURL(previews[imageIndex])
          }

          files.splice(imageIndex, 1)
          previews.splice(imageIndex, 1)

          return {
            imagesMap: { ...state.imagesMap, [locationId]: files },
            previewsMap: { ...state.previewsMap, [locationId]: previews },
          }
        }),

      setSelectedLocation: (id) => set({ selectedLocationId: id }),
      setResults: (res) =>
        set({
          results: res,
          analyzedAt: res ? new Date().toISOString() : null,
          status: res ? 'success' : 'idle',
          error: null,
        }),
      setStatus: (st) => set({ status: st }),
      setError: (err) => set({ error: err }),

      reset: () =>
        set((state) => {
          Object.values(state.previewsMap).forEach((urls) =>
            urls.forEach((url) => URL.revokeObjectURL(url)),
          )
          return {
            locations: [],
            imagesMap: {},
            previewsMap: {},
            selectedLocationId: null,
            results: null,
            analyzedAt: null,
            status: 'idle',
            error: null,
          }
        }),
    }),
    {
      name: 'launchpadx-inspection-storage',
      partialize: (state) => ({
        results: state.results,
        selectedLocationId: state.selectedLocationId,
        analyzedAt: state.analyzedAt,
      }),
    },
  ),
)
