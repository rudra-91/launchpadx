import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import type { InspectionPoint } from '@/types'

interface InspectionsChartProps {
  data: InspectionPoint[]
}

export function InspectionsChart({ data }: InspectionsChartProps) {
  return (
    <GlassCard padding="md" className="h-[280px]">
      <h3 className="mb-4 text-sm font-medium text-text-primary">Monthly Inspections</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} />
          <Bar dataKey="completed" fill="#C8C8C8" radius={[2, 2, 0, 0]} name="Completed" />
          <Bar
            dataKey="scheduled"
            fill="#666666"
            radius={[2, 2, 0, 0]}
            fillOpacity={0.9}
            name="Scheduled"
          />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
