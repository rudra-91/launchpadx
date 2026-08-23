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
  { path: '/optimizer', label: 'Maintenance', icon: Target },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 252 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative z-20 flex h-full shrink-0 flex-col border-r border-border bg-surface"
    >
      <div className="flex h-[72px] items-center justify-between px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/15 text-accent">
                <span className="text-sm font-bold tracking-tight">IX</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-tight text-text-primary">
                  INFRA-X
                </p>
                <p className="truncate text-xs text-muted">Risk Intelligence</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-[10px] p-2 text-muted transition-colors duration-150 hover:bg-white/[0.04] hover:text-text-primary"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="mx-4 border-t border-border" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-[10px] px-3.5 text-[14px] font-medium transition-colors duration-150',
                isActive
                  ? 'bg-accent/12 text-accent'
                  : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary',
              )
            }
          >
            <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  )
}
