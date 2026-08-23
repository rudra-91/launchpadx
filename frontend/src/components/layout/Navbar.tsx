import { LogOut } from 'lucide-react'
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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-[color:var(--infra-bg-secondary)] px-6 xl:px-8">
      <div className="min-w-0">
        {title && <h1 className="ix-page-title truncate text-[22px] xl:text-[24px]">{title}</h1>}
        {subtitle && (
          <p className="mt-0.5 truncate text-[12px] text-[color:var(--infra-muted)]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-elevated text-[10px] font-semibold text-[color:var(--infra-text)]">
            {initials}
          </div>
          <p className="hidden max-w-[120px] truncate text-[12px] font-medium text-[color:var(--infra-secondary)] md:block">
            {user?.name ?? 'User'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="ml-1 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1.5 text-[12px] font-medium text-[color:var(--infra-muted)] transition-colors duration-[160ms] ease-out hover:bg-[color:var(--infra-hover)] hover:text-[color:var(--infra-text)]"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
