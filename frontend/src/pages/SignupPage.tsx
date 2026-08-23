import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GlassCard } from '@/components/ui/GlassCard'
import { AetherFlowHero } from '@/components/ui/aether-flow-hero'
import { useAuthStore } from '@/store/useAuthStore'
import { getSupabaseConfigError } from '@/lib/supabase'

export function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const register = useAuthStore((s) => s.register)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const configError = getSupabaseConfigError()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, from, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (configError) {
      setError(configError)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      const result = await register(name, email, password)
      if (result.needsEmailConfirmation) {
        setSuccess('Account created. Please check your email and confirm your account before signing in.')
        return
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <AetherFlowHero backgroundOnly />
      </div>
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
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">Create Account</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Join INFRA-X infrastructure intelligence
          </p>
        </div>

        <GlassCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserPlus className="h-4 w-4" />}
              placeholder="Your name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              placeholder="At least 6 characters"
              required
            />

            {error && (
              <p className="rounded-lg border border-critical/30 bg-critical/12 px-4 py-2 text-sm text-critical">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg border border-success/30 bg-success/12 px-4 py-2 text-sm text-success">
                {success}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              icon={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/signup" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
