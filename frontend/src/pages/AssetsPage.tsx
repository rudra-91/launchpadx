import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { fetchAssets } from '@/services/assets'
import { AssetTable } from '@/components/assets/AssetTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { getRiskLevel } from '@/lib/utils'
export function AssetsPage() {
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [conditionFilter, setConditionFilter] = useState<string>('all')

  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
  })

  const filtered = useMemo(() => {
    if (!assets) return []

    return assets.filter((asset) => {
      const matchesSearch =
        !search ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.assetId.toLowerCase().includes(search.toLowerCase())

      const level = getRiskLevel(asset.riskScore)
      const matchesRisk = riskFilter === 'all' || level === riskFilter

      let matchesCondition = true
      if (conditionFilter === 'good') matchesCondition = asset.condition >= 70
      if (conditionFilter === 'fair') matchesCondition = asset.condition >= 50 && asset.condition < 70
      if (conditionFilter === 'poor') matchesCondition = asset.condition < 50

      return matchesSearch && matchesRisk && matchesCondition
    })
  }, [assets, search, riskFilter, conditionFilter])

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Manage and inspect bridge assets across the network
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" data-reveal>
        <Input
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
        <Select
          label="Risk Level"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Risk Levels' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ]}
        />
        <Select
          label="Condition"
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Conditions' },
            { value: 'good', label: 'Good (70+)' },
            { value: 'fair', label: 'Fair (50-69)' },
            { value: 'poor', label: 'Poor (<50)' },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="table-row" />
          ))}
        </div>
      ) : (
        <div data-reveal>
          <AssetTable assets={filtered} />
        </div>
      )}
    </div>
  )
}
