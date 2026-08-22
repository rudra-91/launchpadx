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
  md: 'p-5',
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
        hover && 'transition-all duration-300 hover:border-accent/20 hover:shadow-[0_0_24px_rgba(56,189,248,0.08)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
