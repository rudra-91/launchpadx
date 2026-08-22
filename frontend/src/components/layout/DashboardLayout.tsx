import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { NodeGraphBackground } from '@/components/layout/NodeGraphBackground'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/assets': 'Assets',
  '/network': 'Network',
  '/simulation': 'Simulation',
  '/optimizer': 'Optimizer',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function DashboardLayout() {
  const location = useLocation()
  useScrollReveal()

  const basePath = '/' + location.pathname.split('/')[1]
  const title = pageTitles[basePath] ?? 'INFRA-X'

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <NodeGraphBackground />
      <div className="relative z-10 flex min-w-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
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
