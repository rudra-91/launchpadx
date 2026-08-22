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
import type { DegradationPoint } from '@/types'

interface DegradationChartProps {
  data: DegradationPoint[]
}

export function DegradationChart({ data }: DegradationChartProps) {
  return (
    <GlassCard padding="md" className="h-[320px]">
      <h3 className="mb-4 text-sm font-medium text-text-primary">Degradation Forecast</h3>
      <ResponsiveContainer width="100%" height="88%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="degradGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
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
            fill="url(#degradGrad)"
            strokeWidth={2}
            name="Historical"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#F97316"
            fill="none"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
