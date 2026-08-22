import { DEMO_TOKEN, DEMO_USER } from '@/data/mockData'
import { delay } from '@/lib/utils'
import type { AuthResponse } from '@/types'

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthResponse> {
  await delay(600)

  if (!email || password.length < 4) {
    throw new Error('Invalid credentials')
  }

  return {
    token: DEMO_TOKEN,
    user: { ...DEMO_USER, email },
  }
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  await delay(700)

  if (!name || !email || password.length < 4) {
    throw new Error('Invalid registration data')
  }

  return {
    token: DEMO_TOKEN,
    user: { id: 'user-new', name, email },
  }
}
