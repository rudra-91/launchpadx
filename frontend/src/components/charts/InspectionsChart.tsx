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
              background: 'rgba(18,18,18,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#A1A1AA' }}
          />
          <Bar dataKey="completed" fill="#60A5FA" radius={[4, 4, 0, 0]} name="Completed" />
          <Bar dataKey="scheduled" fill="#38BDF8" radius={[4, 4, 0, 0]} fillOpacity={0.5} name="Scheduled" />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
