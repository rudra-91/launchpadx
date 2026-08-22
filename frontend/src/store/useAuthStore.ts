import { create } from 'zustand'
import type { User } from '@/types'
import {
  fetchAuthMe,
  getCurrentSession,
  signIn,
  signOut,
  signUp,
} from '@/services/auth'
import { getSupabaseClient, getSupabaseConfigError } from '@/lib/supabase'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>
  logout: () => Promise<void>
  syncSession: () => Promise<void>
  initializeAuthListener: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  syncSession: async () => {
    const configError = getSupabaseConfigError()
    if (configError) {
      set({ user: null, isAuthenticated: false, isLoading: false })
      return
    }

    try {
      const session = await getCurrentSession()
      if (!session?.access_token) {
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }

      const user = await fetchAuthMe(session.access_token)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    const result = await signIn(email, password)
    set({
      user: result.user,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  register: async (name: string, email: string, password: string) => {
    const result = await signUp(email, password, name)
    if (result.needsEmailConfirmation || !result.user) {
      return { needsEmailConfirmation: true }
    }

    const session = await getCurrentSession()
    if (!session?.access_token) {
      return { needsEmailConfirmation: true }
    }

    const user = await fetchAuthMe(session.access_token)
    set({ user, isAuthenticated: true, isLoading: false })
    return { needsEmailConfirmation: false }
  },

  logout: async () => {
    await signOut()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  initializeAuthListener: () => {
    const configError = getSupabaseConfigError()
    if (configError) {
      set({ isLoading: false })
      return () => undefined
    }

    const supabase = getSupabaseClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.access_token) {
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }

      try {
        const user = await fetchAuthMe(session.access_token)
        set({ user, isAuthenticated: true, isLoading: false })
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    })

    return () => subscription.unsubscribe()
  },
}))
