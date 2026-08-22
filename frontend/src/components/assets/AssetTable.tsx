import { useMemo } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConditionBar } from '@/components/ui/ConditionBar'
import { GlassCard } from '@/components/ui/GlassCard'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { Button } from '@/components/ui/Button'
import { getRiskLevel } from '@/lib/utils'
import type { Asset } from '@/types'

interface AssetTableProps {
  assets: Asset[]
  onRowClick?: (asset: Asset) => void
}

export function AssetTable({ assets, onRowClick }: AssetTableProps) {
  const navigate = useNavigate()

  const sorted = useMemo(
    () => [...assets].sort((a, b) => b.riskScore - a.riskScore),
    [assets],
  )

  const handleClick = (asset: Asset) => {
    if (onRowClick) {
      onRowClick(asset)
    } else {
      navigate(`/assets/${asset.id}`)
    }
  }

  if (sorted.length === 0) {
    return (
      <GlassCard padding="lg" className="text-center">
        <Search className="mx-auto mb-3 h-8 w-8 text-muted" />
        <p className="text-text-secondary">No assets match your filters</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-secondary">
              <th className="px-6 py-3 font-medium">Bridge ID</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Condition</th>
              <th className="px-6 py-3 font-medium">Risk</th>
              <th className="px-6 py-3 font-medium">Traffic</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-border/50 transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-6 py-3 font-mono text-accent">{asset.assetId}</td>
                <td className="px-6 py-3 font-medium text-text-primary">{asset.name}</td>
                <td className="w-36 px-6 py-3">
                  <ConditionBar value={asset.condition} showLabel={false} size="sm" />
                </td>
                <td className="px-6 py-3">
                  <RiskBadge level={getRiskLevel(asset.riskScore)} score={asset.riskScore} size="sm" />
                </td>
                <td className="px-6 py-3 text-text-secondary">
                  {asset.traffic.toLocaleString()}/day
                </td>
                <td className="px-6 py-3 capitalize text-text-secondary">{asset.status}</td>
                <td className="px-6 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ArrowRight className="h-3.5 w-3.5" />}
                    onClick={() => handleClick(asset)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
