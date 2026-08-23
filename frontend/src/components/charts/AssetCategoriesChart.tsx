import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import type { CategoryPoint } from '@/types'

interface AssetCategoriesChartProps {
  data: CategoryPoint[]
}

export function AssetCategoriesChart({ data }: AssetCategoriesChartProps) {
  return (
    <GlassCard padding="md" className="h-[280px]">
      <h3 className="mb-4 text-sm font-medium text-text-primary">Damage Categories</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.category} fill={entry.fill} fillOpacity={0.85} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(18,18,18,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex justify-center gap-4">
        {data.map((d) => (
          <div key={d.category} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
            {d.category}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
