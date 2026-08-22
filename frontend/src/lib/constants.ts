export const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const RISK_THRESHOLDS = {
  critical: 80,
  high: 60,
  medium: 35,
  low: 0,
} as const

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/assets', label: 'Assets', icon: 'Building2' },
  { path: '/network', label: 'Network', icon: 'Network' },
  { path: '/simulation', label: 'Simulation', icon: 'FlaskConical' },
  { path: '/optimizer', label: 'Optimizer', icon: 'Target' },
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

export const MATERIALS = ['Steel', 'Concrete', 'Composite', 'Timber', 'Prestressed Concrete']

export const BRIDGE_NAMES = [
  'Independence Blvd',
  'I-485 Overpass',
  'Brookshire Freeway',
  'Tyvola Road',
  'South Blvd',
  'Graham Street',
  'North Tryon',
  'Eastway Drive',
  'Sharon Road',
  'Park Road',
  'Providence Road',
  'Monroe Road',
  'Central Avenue',
  'Wilkinson Blvd',
  'Statesville Road',
  'Beatties Ford',
  'Freedom Drive',
  'Tuckaseegee',
  'Harris Blvd',
  'Albemarle Road',
  'Mallard Creek',
  'W.T. Harris',
  'Rea Road',
  'Johnston Road',
  'Matthews-Mint Hill',
  'Steele Creek',
  'Ballantyne Blvd',
  'Pineville-Matthews',
  'Nations Ford',
  'Archdale Drive',
  'Scaleybark',
  'Remount Road',
]

export const ROAD_NAMES = [
  'I-77 North Corridor',
  'I-85 Connector',
  'US-29 North',
  'US-74 East',
  'NC-49 West',
  'NC-16 South',
  'I-485 Inner Loop',
  'I-485 Outer Loop',
  'Tryon Street',
  'Trade Street',
  'Morehead Street',
  'Queens Road',
  'Randolph Road',
  'Colony Road',
  'McKee Road',
  'Lawyers Road',
  'Idlewild Road',
  'Robinson Church',
  'Concord Mills Blvd',
  'Davidson Gateway',
]

export const HOSPITAL_NAMES = [
  'Atrium Health Main',
  'Novant Presbyterian',
  'Carolinas Medical Center',
  'Novant Matthews',
  'Atrium Pineville',
  'Atrium University',
  'Novant Huntersville',
  'CaroMont Regional',
]
