import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6',
}

export function GlassCard({
  children,
  className,
  hover = false,
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card',
        paddingMap[padding],
        hover && 'glass-card-interactive',
        className,
      )}
    >
      {children}
    </div>
  )
}
