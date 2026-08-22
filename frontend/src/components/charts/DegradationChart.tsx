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
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
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
