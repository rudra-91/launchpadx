import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { DEMO_TOKEN, DEMO_USER } from '@/data/mockData'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 600))

        if (email && password.length >= 4) {
          set({
            user: { ...DEMO_USER, email },
            token: DEMO_TOKEN,
            isAuthenticated: true,
          })
          return true
        }
        return false
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'infra-x-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
