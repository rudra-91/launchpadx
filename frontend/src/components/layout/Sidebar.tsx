import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Network,
  FlaskConical,
  Target,
  BarChart3,
  Settings,
  FileSearch,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inspections', label: 'Road Inspection', icon: FileSearch },
  { path: '/assets', label: 'Assets', icon: Building2 },
  { path: '/risk', label: 'Risk', icon: AlertTriangle },
  { path: '/network', label: 'Network', icon: Network },
  { path: '/simulation', label: 'Simulation', icon: FlaskConical },
  { path: '/optimizer', label: 'Optimizer', icon: Target },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 248 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative z-20 flex h-full shrink-0 flex-col border-r border-border bg-[color:var(--infra-bg-secondary)]"
    >
      <div className="flex h-16 items-center justify-between px-3.5">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-w-0 items-center gap-2.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-border bg-elevated text-[11px] font-semibold tracking-wide text-[color:var(--infra-text)]">
                IX
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-wide text-[color:var(--infra-bright)]">
                  INFRA-X
                </p>
                <p className="truncate text-[10px] uppercase tracking-[0.12em] text-[color:var(--infra-muted)]">
                  Command
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-[var(--radius-md)] p-2 text-[color:var(--infra-muted)] transition-colors duration-[160ms] ease-out hover:bg-[color:var(--infra-hover)] hover:text-[color:var(--infra-text)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="mx-3 h-px bg-border" />

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group relative flex h-10 items-center gap-3 rounded-[var(--radius-md)] px-3 text-[13px] font-medium transition-colors duration-[160ms] ease-out',
                isActive
                  ? 'bg-[color:var(--infra-active)] text-[color:var(--infra-bright)]'
                  : 'text-[color:var(--infra-secondary)] hover:bg-[#151515] hover:text-[color:var(--infra-text)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-px -translate-y-1/2 bg-[color:var(--infra-muted)]" />
                )}
                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors duration-[160ms]',
                    isActive
                      ? 'text-[color:var(--infra-text)]'
                      : 'text-[color:var(--infra-muted)] group-hover:text-[color:var(--infra-text)]',
                  )}
                  strokeWidth={1.6}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  )
}
