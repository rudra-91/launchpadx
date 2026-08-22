import { Bell, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'

interface NavbarProps {
  title?: string
}

export function Navbar({ title }: NavbarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="glass-surface flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-xl p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-critical" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
            <User className="h-4 w-4 text-accent" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">{user?.name ?? 'User'}</p>
            <p className="text-[10px] text-text-secondary">{user?.email ?? ''}</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
