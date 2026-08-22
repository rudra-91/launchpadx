import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

interface AuthInitializerProps {
  children: ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const isLoading = useAuthStore((s) => s.isLoading)
  const syncSession = useAuthStore((s) => s.syncSession)
  const initializeAuthListener = useAuthStore((s) => s.initializeAuthListener)

  useEffect(() => {
    void syncSession()
    const unsubscribe = initializeAuthListener()
    return unsubscribe
  }, [syncSession, initializeAuthListener])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-secondary">
        Loading…
      </div>
    )
  }

  return <>{children}</>
}
