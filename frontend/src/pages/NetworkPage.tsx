import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNetwork, fetchCascadeImpact } from '@/services/network'
import { NetworkGraph, CascadePanel, NetworkLegend } from '@/components/network/NetworkGraph'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

export function NetworkPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('B17')

  const { data: network, isLoading } = useQuery({
    queryKey: ['network'],
    queryFn: fetchNetwork,
  })

  const { data: cascade } = useQuery({
    queryKey: ['cascade', selectedNodeId],
    queryFn: () => fetchCascadeImpact(selectedNodeId!),
    enabled: !!selectedNodeId,
  })

  return (
    <div className="space-y-6">
      <div data-reveal>
        <p className="text-sm text-text-secondary">
          Bridge → Road → Hospital topology · Click a node to analyze cascade impact
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2" data-reveal>
          {isLoading ? (
            <LoadingSkeleton variant="chart" className="h-[450px]" />
          ) : network ? (
            <NetworkGraph
              data={network}
              selectedNodeId={selectedNodeId}
              cascade={cascade ?? null}
              onNodeSelect={setSelectedNodeId}
            />
          ) : null}
        </div>

        <div className="space-y-4" data-reveal>
          <CascadePanel cascade={cascade ?? null} />
          <NetworkLegend />
        </div>
      </div>
    </div>
  )
}
