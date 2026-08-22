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
          <defs>
            <linearGradient id="conditionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis domain={[40, 80]} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'rgba(18,18,18,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="condition"
            stroke="#60A5FA"
            fill="url(#conditionGrad)"
            strokeWidth={2}
            name="Current"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#38BDF8"
            fill="url(#predictedGrad)"
            strokeWidth={2}
            strokeDasharray="4 4"
            name="Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
