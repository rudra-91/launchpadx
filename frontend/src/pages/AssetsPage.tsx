import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { EmptyInspectionState } from '@/components/ui/EmptyInspectionState'
import { getLocations, normalizeRiskLevel } from '@/lib/inspectionDerived'
import { useInspectionStore } from '@/store/useInspectionStore'
import type { AnalyzedLocationOut } from '@/types'

export function AssetsPage() {
  const navigate = useNavigate()
  const results = useInspectionStore((s) => s.results)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const locations = getLocations(results)

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      const haystack = `${loc.name} ${loc.location_id} ${loc.road_name ?? ''}`.toLowerCase()
      const matchesSearch = !search || haystack.includes(search.toLowerCase())
      const risk = normalizeRiskLevel(loc.risk.risk_prediction.label || loc.risk.risk_level)
      const matchesRisk = riskFilter === 'all' || risk === riskFilter
      const matchesPriority =
        priorityFilter === 'all' ||
        loc.priority.priority_level.toLowerCase() === priorityFilter
      return matchesSearch && matchesRisk && matchesPriority
    })
  }, [locations, search, riskFilter, priorityFilter])

  if (locations.length === 0) {
    return (
      <div className="space-y-6">
        <div data-reveal>
          <p className="text-sm text-text-secondary">
            Inspected road locations from the latest live analysis
          </p>
        </div>
        <EmptyInspectionState
          title="No inspected road assets yet"
          description="Run a Road Inspection to populate this table with live location assets, risk scores, and priorities."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Live inspected road infrastructure · {locations.length} location
          {locations.length === 1 ? '' : 's'} from latest analysis
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" data-reveal>
        <Input
          placeholder="Search by name, road, or ID..."
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
          label="Priority Level"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Priorities' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ]}
        />
      </div>

      <InspectionAssetTable
        locations={filtered}
        onRowClick={(loc) => navigate(`/assets/${loc.location_id}`)}
      />
    </div>
  )
}

function InspectionAssetTable({
  locations,
  onRowClick,
}: {
  locations: AnalyzedLocationOut[]
  onRowClick: (loc: AnalyzedLocationOut) => void
}) {
  const sorted = useMemo(
    () => [...locations].sort((a, b) => a.rank - b.rank),
    [locations],
  )

  if (sorted.length === 0) {
    return (
      <GlassCard padding="lg" className="text-center">
        <Search className="mx-auto mb-3 h-8 w-8 text-muted" />
        <p className="text-text-secondary">No locations match your filters</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard padding="none" className="overflow-hidden" data-reveal>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[color:var(--infra-elevated)] text-left text-xs text-[color:var(--infra-secondary)]">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Road</th>
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">XGBoost</th>
              <th className="px-4 py-3 font-medium">Detections</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((loc) => {
              const riskLevel = normalizeRiskLevel(
                loc.risk.risk_prediction.label || loc.risk.risk_level,
              )
              return (
                <tr
                  key={loc.location_id}
                  className="border-b border-border transition-colors hover:bg-[color:var(--infra-elevated)]"
                >
                  <td className="px-4 py-3 font-mono text-[color:var(--infra-text)]">#{loc.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{loc.name}</p>
                    <p className="font-mono text-xs text-text-secondary">{loc.location_id}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{loc.road_name || '—'}</td>
                  <td className="px-4 py-3">
                    <RiskBadge level={riskLevel} score={loc.risk.risk_score} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {loc.risk.risk_prediction.label}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {loc.risk.detection_count}
                    <span className="ml-1 text-xs text-muted">
                      (D00:{loc.risk.damage_breakdown.D00} D10:{loc.risk.damage_breakdown.D10}{' '}
                      D20:{loc.risk.damage_breakdown.D20} D40:{loc.risk.damage_breakdown.D40})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-text-primary">
                      {loc.priority.priority_score.toFixed(1)}
                    </span>
                    <span className="ml-2 text-xs text-text-secondary">
                      {loc.priority.priority_level}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ArrowRight className="h-3.5 w-3.5" />}
                      onClick={() => onRowClick(loc)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
