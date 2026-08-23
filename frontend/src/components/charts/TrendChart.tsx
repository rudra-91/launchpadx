import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import type { TrendPoint } from '@/types'

interface TrendChartProps {
  data: TrendPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <GlassCard padding="md" className="h-[280px]">
      <h3 className="mb-4 text-sm font-medium text-text-primary">Condition Trend</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis domain={[40, 80]} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}
          />
          <Area
            type="monotone"
            dataKey="condition"
            stroke="#E2E2E2"
            fill="#E2E2E2"
            fillOpacity={0.06}
            strokeWidth={1.5}
            name="Current"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#666666"
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            name="Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
