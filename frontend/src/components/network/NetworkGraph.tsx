import { useState, useCallback } from 'react'
import { Building2, Route, Hospital } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { RiskBadge } from '@/components/ui/RiskBadge'
import type { NetworkData, NetworkNode, CascadeImpact } from '@/types'

interface NetworkGraphProps {
  data: NetworkData
  cascade?: CascadeImpact | null
  onNodeSelect?: (nodeId: string) => void
  selectedNodeId?: string | null
}

const NODE_ICONS = {
  bridge: Building2,
  road: Route,
  hospital: Hospital,
}

const NODE_COLORS = {
  bridge: '#60A5FA',
  road: '#38BDF8',
  hospital: '#22C55E',
}

export function NetworkGraph({
  data,
  cascade,
  onNodeSelect,
  selectedNodeId,
}: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  const getNodePos = useCallback(
    (nodeId: string) => {
      const node = data.nodes.find((n) => n.id === nodeId)
      return node ? { x: node.x ?? 0, y: node.y ?? 0 } : { x: 0, y: 0 }
    },
    [data.nodes]
  )

  const isAffected = (nodeId: string) => {
    if (!cascade) return false
    return (
      cascade.affectedRoads.includes(nodeId) ||
      cascade.affectedHospitals.includes(nodeId) ||
      selectedNodeId === nodeId
    )
  }

  return (
    <GlassCard padding="none" className="relative overflow-hidden">
      <svg viewBox="0 0 600 500" className="w-full min-h-[420px]">
        {data.edges.map((edge) => {
          const source = getNodePos(edge.sourceId)
          const target = getNodePos(edge.targetId)
          const isHighlighted =
            selectedNodeId === edge.sourceId ||
            selectedNodeId === edge.targetId ||
            isAffected(edge.sourceId) ||
            isAffected(edge.targetId)

          return (
            <g key={edge.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? '#60A5FA' : 'rgba(255,255,255,0.1)'}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeDasharray={edge.relation === 'PROVIDES_ACCESS' ? '6 4' : undefined}
              />
              {edge.relation === 'PROVIDES_ACCESS' && (
                <text
                  x={(source.x + target.x) / 2 + 8}
                  y={(source.y + target.y) / 2}
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="Inter, sans-serif"
                >
                  ACCESS
                </text>
              )}
            </g>
          )
        })}

        {data.nodes.map((node) => (
          <NetworkNodeElement
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isHovered={hoveredNode === node.id}
            isAffected={isAffected(node.id)}
            onSelect={() => onNodeSelect?.(node.id)}
            onHover={(h) => setHoveredNode(h ? node.id : null)}
          />
        ))}
      </svg>
    </GlassCard>
  )
}

function NetworkNodeElement({
  node,
  isSelected,
  isHovered,
  isAffected,
  onSelect,
  onHover,
}: {
  node: NetworkNode
  isSelected: boolean
  isHovered: boolean
  isAffected: boolean
  onSelect: () => void
  onHover: (hover: boolean) => void
}) {
  const Icon = NODE_ICONS[node.type]
  const color = NODE_COLORS[node.type]
  const x = node.x ?? 0
  const y = node.y ?? 0
  const radius = node.type === 'hospital' ? 28 : 24

  const bridgeRiskColor =
    node.type === 'bridge' && node.riskScore >= 80
      ? '#EF4444'
      : node.riskScore >= 60
        ? '#F97316'
        : node.riskScore >= 30
          ? '#F59E0B'
          : '#22C55E'

  const strokeColor =
    node.type === 'bridge' ? bridgeRiskColor : isSelected || isAffected ? color : `${color}60`

  return (
    <g
      className="cursor-pointer"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <circle
        cx={x}
        cy={y}
        r={radius + (isHovered ? 4 : 0)}
        fill={`${node.type === 'bridge' ? bridgeRiskColor : color}${isSelected ? '28' : '18'}`}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        className="transition-all duration-200"
      />
      <foreignObject x={x - 10} y={y - 10} width={20} height={20}>
        <div className="flex h-full w-full items-center justify-center">
          <Icon
            className="h-4 w-4"
            style={{ color: node.type === 'bridge' ? bridgeRiskColor : color }}
            strokeWidth={1.75}
          />
        </div>
      </foreignObject>
      <text
        x={x}
        y={y + radius + 14}
        textAnchor="middle"
        fill="#FAFAFA"
        fontSize="11"
        fontWeight="500"
        fontFamily="Inter, sans-serif"
      >
        {node.label}
      </text>
      {node.type === 'bridge' && (
        <text
          x={x}
          y={y + radius + 28}
          textAnchor="middle"
          fill={node.riskScore >= 80 ? '#EF4444' : '#94A3B8'}
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >
          Risk {node.riskScore}%
        </text>
      )}
    </g>
  )
}

export function CascadePanel({ cascade }: { cascade: CascadeImpact | null }) {
  if (!cascade) {
    return (
      <GlassCard className="py-10 text-center">
        <p className="text-sm text-text-secondary">
          Click a node to analyze cascade impact
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Cascade Impact</h3>
        <p className="text-xs text-text-secondary">Downstream network effects</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
          Affected Roads
        </p>
        <div className="flex flex-wrap gap-2">
          {cascade.affectedRoads.map((road) => (
            <span
              key={road}
              className="rounded-lg border border-accent/30 bg-accent/12 px-2 py-1 font-mono text-xs text-accent"
            >
              {road}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
          Affected Hospitals
        </p>
        <div className="flex flex-wrap gap-2">
          {cascade.affectedHospitals.map((h) => (
            <span
              key={h}
              className="rounded-lg border border-success/30 bg-success/12 px-2 py-1 font-mono text-xs text-success"
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-text-secondary">Cascade Risk</span>
        <RiskBadge level={cascade.cascadeRisk} />
      </div>

      {cascade.estimatedAccessTimeIncrease !== undefined && (
        <div className="rounded-xl bg-critical/10 p-3">
          <p className="text-xs text-text-secondary">Estimated Access Time Increase</p>
          <p className="text-lg font-bold text-critical">
            +{cascade.estimatedAccessTimeIncrease} min
          </p>
        </div>
      )}
    </GlassCard>
  )
}

export function NetworkLegend() {
  return (
    <GlassCard>
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Legend</h3>
      <div className="space-y-2 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent" /> Bridge nodes
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent" /> Road segments
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-success" /> Hospital access points
        </div>
        <div className="mt-3 border-t border-border pt-3 space-y-1">
          <p>Solid lines = CONNECTED_TO</p>
          <p>Dashed lines = PROVIDES_ACCESS</p>
        </div>
      </div>
    </GlassCard>
  )
}
