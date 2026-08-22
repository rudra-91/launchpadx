import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'dark' | 'light'

interface ThemeState {
  mode: ThemeMode
  reducedMotion: boolean
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
  setReducedMotion: (value: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' })),
      setReducedMotion: (value) => set({ reducedMotion: value }),
    }),
    {
      name: 'infra-x-theme',
    },
  ),
)
