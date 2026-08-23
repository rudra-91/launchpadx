import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import type { FeatureImportance } from '@/types'

interface FeatureImportanceChartProps {
  data: FeatureImportance[]
}

export function FeatureImportanceChart({ data }: FeatureImportanceChartProps) {
  return (
    <GlassCard padding="md" className="h-[320px]">
      <h3 className="mb-4 text-sm font-medium text-text-primary">XGBoost Feature Snapshot</h3>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="feature"
            tickLine={false}
            axisLine={false}
            width={100}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              background: '#171717',
              border: '1px solid #333333',
              borderRadius: 8,
            }}
          />
          <Bar dataKey="importance" fill="#A0A0A0" radius={[0, 2, 2, 0]} fillOpacity={0.95} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
