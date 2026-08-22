import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'chart' | 'table-row'
  className?: string
}

export function LoadingSkeleton({ variant = 'text', className }: LoadingSkeletonProps) {
  const base = 'animate-pulse rounded-xl bg-white/5'

  if (variant === 'card') {
    return (
      <div className={cn('glass-card p-5', className)}>
        <div className={cn(base, 'mb-3 h-4 w-24')} />
        <div className={cn(base, 'mb-2 h-8 w-32')} />
        <div className={cn(base, 'h-3 w-20')} />
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div className={cn('glass-card p-5', className)}>
        <div className={cn(base, 'mb-4 h-4 w-36')} />
        <div className={cn(base, 'h-full min-h-[200px] w-full')} />
      </div>
    )
  }

  if (variant === 'table-row') {
    return (
      <div className={cn('flex items-center gap-4 px-4 py-3', className)}>
        <div className={cn(base, 'h-4 w-16')} />
        <div className={cn(base, 'h-4 flex-1')} />
        <div className={cn(base, 'h-4 w-20')} />
        <div className={cn(base, 'h-4 w-16')} />
      </div>
    )
  }

  return <div className={cn(base, 'h-4 w-full', className)} />
}
