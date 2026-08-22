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
              background: '#121212',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
            }}
          />
          <Area
            type="monotone"
            dataKey="condition"
            stroke="#60A5FA"
            fill="#60A5FA"
            fillOpacity={0.08}
            strokeWidth={2}
            name="Current"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#A1A1AA"
            fill="none"
            strokeWidth={2}
            strokeDasharray="4 4"
            name="Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
