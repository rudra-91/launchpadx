/** Normalize so `https://host` and `https://host/api` both work. */
function resolveApiBase(raw: string | undefined): string {
  const value = (raw ?? '').trim()
  if (!value) return '/api'

  const trimmed = value.replace(/\/+$/, '')
  if (trimmed === '/api' || trimmed.endsWith('/api')) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return `${trimmed}/api`
  return trimmed
}

export const API_BASE = resolveApiBase(import.meta.env.VITE_API_URL)

export const RISK_THRESHOLDS = {
  critical: 80,
  high: 60,
  medium: 35,
  low: 0,
} as const

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/inspections', label: 'Road Inspection', icon: 'FileSearch' },
  { path: '/assets', label: 'Assets', icon: 'Building2' },
  { path: '/risk', label: 'Risk', icon: 'AlertTriangle' },
  { path: '/network', label: 'Network', icon: 'Network' },
  { path: '/simulation', label: 'Simulation', icon: 'FlaskConical' },
  { path: '/optimizer', label: 'Maintenance', icon: 'Target' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const

export const REPAIR_QUALITY_OPTIONS = [
  { value: '25', label: 'Basic Patch (25%)' },
  { value: '50', label: 'Standard Repair (50%)' },
  { value: '75', label: 'Major Rehab (75%)' },
  { value: '100', label: 'Full Replacement (100%)' },
]

export const STRATEGY_OPTIONS = [
  { value: 'safety', label: 'Safety First' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'economic', label: 'Economic Impact' },
]
