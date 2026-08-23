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
              background: '#171717',
              border: '1px solid #333333',
              borderRadius: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="condition"
            stroke="#E2E2E2"
            fill="#E2E2E2"
            fillOpacity={0.05}
            strokeWidth={1.5}
            name="Historical"
          />
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#A87A48"
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            name="Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
