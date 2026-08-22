import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GlassCard } from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/useAuthStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState('admin@infra-x.gov')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        navigate(from, { replace: true })
      } else {
        setError('Invalid email or password')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-elevated">
            <span className="text-xl font-bold text-accent">IX</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">INFRA-X</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Temporal Infrastructure Risk Intelligence
          </p>
        </div>

        <GlassCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              placeholder="admin@infra-x.gov"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              placeholder="Enter your password"
              required
            />

            {error && (
              <p className="rounded-lg border border-critical/30 bg-critical/12 px-4 py-2 text-sm text-critical">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              icon={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Demo credentials: admin@infra-x.gov / admin123
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
