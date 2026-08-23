import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js'
import { API_BASE } from '@/lib/constants'
import { getSupabaseClient } from '@/lib/supabase'
import type { AuthResponse, User } from '@/types'

interface ApiMeResponse {
  success: boolean
  data?: {
    id: string
    email: string
    role: string
    display_name?: string | null
  }
  error?: {
    code: string
    message: string
  }
}

export interface SignUpResult {
  needsEmailConfirmation: boolean
  user: SupabaseUser | null
}

function mapSupabaseError(error: AuthError): string {
  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) {
    return 'Invalid login credentials'
  }
  if (message.includes('email not confirmed')) {
    return 'Email not confirmed. Please check your inbox and confirm your account.'
  }
  if (message.includes('user already registered')) {
    return 'An account with this email already exists.'
  }
  if (message.includes('password')) {
    return error.message
  }
  if (error.status === 0 || message.includes('fetch') || message.includes('network')) {
    return 'Network error. Please check your connection and try again.'
  }

  return error.message
}

function mapProfileToUser(profile: NonNullable<ApiMeResponse['data']>): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.display_name?.trim() || profile.email.split('@')[0] || 'User',
    role: profile.role,
  }
}

export async function fetchAuthMe(accessToken: string): Promise<User> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
  } catch {
    throw new Error(
      `Cannot reach API at ${API_BASE}. Check VITE_API_URL and Render CORS (FRONTEND_URL must match your Vercel origin).`,
    )
  }

  if (!response.ok) {
    throw new Error('Unable to load your profile. Please try signing in again.')
  }

  const body = (await response.json()) as ApiMeResponse
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Unable to load your profile.')
  }

  return mapProfileToUser(body.data)
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(mapSupabaseError(error))
  }

  if (!data.session?.access_token) {
    throw new Error('Sign in failed. No session was returned.')
  }

  const user = await fetchAuthMe(data.session.access_token)

  return {
    token: data.session.access_token,
    user,
  }
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string,
): Promise<SignUpResult> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: displayName
      ? { data: { display_name: displayName, full_name: displayName, name: displayName } }
      : undefined,
  })

  if (error) {
    throw new Error(mapSupabaseError(error))
  }

  return {
    needsEmailConfirmation: !data.session,
    user: data.user,
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(mapSupabaseError(error))
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error(mapSupabaseError(error))
  }
  return data.session
}

export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    throw new Error(mapSupabaseError(error))
  }
  return data.user
}

/** @deprecated Use signIn */
export const loginRequest = signIn

/** @deprecated Use signUp */
export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const result = await signUp(email, password, name)

  if (result.needsEmailConfirmation) {
    throw new Error('Please confirm your email before signing in.')
  }

  const session = await getCurrentSession()
  if (!session?.access_token) {
    throw new Error('Please confirm your email before signing in.')
  }

  const user = await fetchAuthMe(session.access_token)
  return {
    token: session.access_token,
    user,
  }
}
