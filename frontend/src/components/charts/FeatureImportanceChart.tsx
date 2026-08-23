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
              background: 'rgba(18,18,18,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
          />
          <Bar dataKey="importance" fill="#60A5FA" radius={[0, 4, 4, 0]} fillOpacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
