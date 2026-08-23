import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { getRiskColor } from '@/lib/utils'
import type { DistributionPoint } from '@/types'

interface RiskDistributionChartProps {
  data: DistributionPoint[]
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  return (
    <GlassCard padding="md" className="h-[280px]">
      <h3 className="mb-4 text-sm font-medium text-text-primary">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.level} fill={getRiskColor(entry.level)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
