import { Bell, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

interface NavbarProps {
  title?: string
  subtitle?: string
}

export function Navbar({ title, subtitle }: NavbarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-surface/80 px-7 backdrop-blur-sm xl:px-9">
      <div className="min-w-0">
        {title && (
          <h1 className="truncate text-[28px] font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-0.5 truncate text-[13px] text-muted">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative rounded-[10px] p-2.5 text-muted transition-colors duration-150 hover:bg-white/[0.04] hover:text-text-primary"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-critical" />
        </button>

        <div className="hidden h-8 w-px bg-border sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-elevated text-[11px] font-semibold text-text-secondary ring-1 ring-border">
            {initials}
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="max-w-[140px] truncate text-[13px] font-medium text-text-primary">
              {user?.name ?? 'User'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-white/[0.04] hover:text-text-primary"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
