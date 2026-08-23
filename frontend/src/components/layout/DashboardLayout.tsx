import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const pageMeta: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Live inspection intelligence across your road network',
  },
  '/inspections': {
    title: 'Road Inspection',
    subtitle: 'Monitor road conditions, damage detections, and inspection priorities.',
  },
  '/assets': {
    title: 'Assets',
    subtitle: 'Inspected road locations from the latest analysis',
  },
  '/risk': {
    title: 'Risk',
    subtitle: 'XGBoost risk classification and YOLO damage metrics',
  },
  '/network': {
    title: 'Network',
    subtitle: 'Road corridors and nearby critical infrastructure',
  },
  '/simulation': {
    title: 'Simulation',
    subtitle: 'What-if repair outcomes for inspected roads',
  },
  '/optimizer': {
    title: 'Maintenance',
    subtitle: 'Budget-aware prioritization from live inspection scores',
  },
  '/analytics': {
    title: 'Analytics',
    subtitle: 'Latest inspection snapshot metrics',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Account preferences and application settings',
  },
}

export function DashboardLayout() {
  const location = useLocation()
  useScrollReveal()

  const basePath = '/' + location.pathname.split('/')[1]
  const meta = pageMeta[basePath] ?? { title: 'INFRA-X' }

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div className="relative z-10 flex min-w-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar title={meta.title} subtitle={meta.subtitle} />
          <main className="flex-1 overflow-y-auto px-7 py-6 xl:px-9 xl:py-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="mx-auto w-full max-w-[1600px]"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
