import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export function getSupabaseConfigError(): string | null {
  if (!supabaseUrl && !supabasePublishableKey) {
    return 'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env.local'
  }
  if (!supabaseUrl) {
    return 'Missing VITE_SUPABASE_URL in frontend/.env.local'
  }
  if (!supabasePublishableKey) {
    return 'Missing VITE_SUPABASE_PUBLISHABLE_KEY in frontend/.env.local'
  }
  return null
}

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  const configError = getSupabaseConfigError()
  if (configError) {
    throw new Error(configError)
  }

  if (!client) {
    client = createClient(supabaseUrl!, supabasePublishableKey!)
  }

  return client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseClient(), prop, receiver)
  },
})
