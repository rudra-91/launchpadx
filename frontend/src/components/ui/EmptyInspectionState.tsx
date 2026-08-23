import { Link } from 'react-router-dom'
import { ArrowRight, FileSearch } from 'lucide-react'
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
      className="mx-auto flex max-w-lg flex-col items-center space-y-5 p-10 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-elevated text-accent-glow">
        <FileSearch className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div>
        <h3 className="text-[16px] font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{description}</p>
      </div>
      <Link
        to="/inspections"
        className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent px-5 py-2.5 text-[13px] font-semibold text-[color:var(--accent-foreground)] transition-colors duration-[160ms] ease-out hover:bg-[color:var(--accent-hover)]"
      >
        <span>Run Road Inspection</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </GlassCard>
  )
}
