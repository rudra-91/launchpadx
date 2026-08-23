import { API_BASE } from '@/lib/constants'
import { getCurrentSession } from '@/services/auth'
import { getSupabaseConfigError } from '@/lib/supabase'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> | undefined),
  }

  if (!getSupabaseConfigError()) {
    const session = await getCurrentSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError(
      `Cannot reach API at ${API_BASE}. Check VITE_API_URL and Render CORS (FRONTEND_URL).`,
      0,
    )
  }

  let body: ApiEnvelope<T>
  try {
    body = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError(
      `Invalid response from API (${response.status}). Is VITE_API_URL set to .../api?`,
      response.status,
    )
  }

  if (!response.ok || !body.success) {
    throw new ApiError(
      body.error?.message ?? `Request failed: ${response.statusText}`,
      response.status,
    )
  }

  return body.data as T
}

export function apiGet<T>(endpoint: string): Promise<T> {
  return apiFetch<T>(endpoint.startsWith('/') ? endpoint : `/${endpoint}`)
}

export function apiPost<T>(endpoint: string, payload?: unknown): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return apiFetch<T>(path, {
    method: 'POST',
    body: payload ? JSON.stringify(payload) : undefined,
  })
}

export function apiPostForm<T>(endpoint: string, formData: FormData): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return apiFetch<T>(path, {
    method: 'POST',
    body: formData,
  })
}
