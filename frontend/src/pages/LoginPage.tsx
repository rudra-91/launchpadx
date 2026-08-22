import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GlassCard } from '@/components/ui/GlassCard'
import { HeroBackground } from '@/components/auth/HeroBackground'
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <HeroBackground />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(96,165,250,0.06)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 accent-glow">
            <span className="text-xl font-bold text-accent">IX</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">INFRA-X</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Temporal Infrastructure Risk Intelligence
          </p>
        </div>

        <GlassCard padding="lg" className="accent-glow">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <p className="rounded-lg bg-critical/10 px-3 py-2 text-sm text-critical">{error}</p>
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

          <p className="mt-5 text-center text-xs text-muted">
            Demo credentials: admin@infra-x.gov / admin123
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
