import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'

interface EmptyInspectionStateProps {
  title?: string
  description?: string
}

export function EmptyInspectionState({
  title = 'No live inspection data yet',
  description = 'Run a Road Inspection to generate live YOLO detections, XGBoost risk, GIS infrastructure, and priority rankings for this view.',
}: EmptyInspectionStateProps) {
  return (
    <GlassCard
      padding="lg"
      className="mx-auto flex max-w-xl flex-col items-center space-y-4 border border-accent/30 p-8 text-center shadow-xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent">
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p>
      </div>
      <Link
        to="/inspections"
        className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-background shadow-lg shadow-accent/20 transition-opacity hover:opacity-90"
      >
        <span>Run Road Inspection</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </GlassCard>
  )
}
