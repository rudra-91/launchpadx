import { Bell, Moon, Shield, User } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const { reducedMotion, setReducedMotion } = useThemeStore()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Account preferences and application settings
        </p>
      </div>

      <GlassCard padding="lg" className="space-y-5" data-reveal>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/12">
            <User className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">Profile</h3>
            <p className="text-xs text-text-secondary">Manage your account information</p>
          </div>
        </div>
        <Input label="Name" defaultValue={user?.name ?? ''} />
        <Input label="Email" type="email" defaultValue={user?.email ?? ''} />
        <Button variant="secondary" size="sm">Save Profile</Button>
      </GlassCard>

      <GlassCard padding="lg" className="space-y-5" data-reveal>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/12">
            <Bell className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">Notifications</h3>
            <p className="text-xs text-text-secondary">Alert preferences for critical assets</p>
          </div>
        </div>
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm text-text-primary">Critical asset alerts</span>
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-accent" />
        </label>
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm text-text-primary">Weekly risk reports</span>
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-accent" />
        </label>
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm text-text-primary">Inspection reminders</span>
          <input type="checkbox" className="h-4 w-4 accent-accent" />
        </label>
      </GlassCard>

      <GlassCard padding="lg" className="space-y-5" data-reveal>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/12">
            <Moon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">Appearance</h3>
            <p className="text-xs text-text-secondary">Visual and accessibility preferences</p>
          </div>
        </div>
        <label className="flex cursor-pointer items-center justify-between">
          <span className="text-sm text-text-primary">Reduce motion</span>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </label>
      </GlassCard>

      <GlassCard padding="lg" className="space-y-3" data-reveal>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/12">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-primary">About</h3>
            <p className="text-xs text-text-secondary">INFRA-X v0.1.0 — MVP</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Temporal Infrastructure Risk Intelligence platform for Mecklenburg County.
          Predictive models are mocked — ready for AI integration.
        </p>
      </GlassCard>
    </div>
  )
}
