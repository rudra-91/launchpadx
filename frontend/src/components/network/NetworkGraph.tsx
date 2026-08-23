import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Building2,
  Route,
  Hospital,
  Flame,
  Shield,
  GraduationCap,
  Building,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { RiskBadge } from '@/components/ui/RiskBadge'
import type { CascadeImpact, NetworkData, NetworkNode, NetworkNodeType } from '@/types'

interface NetworkGraphProps {
  data: NetworkData
  cascade?: CascadeImpact | null
  onNodeSelect?: (nodeId: string) => void
  selectedNodeId?: string | null
}

const NODE_ICONS: Record<NetworkNodeType, typeof Building2> = {
  bridge: Building2,
  road: Route,
  hospital: Hospital,
  fire_station: Flame,
  police_station: Shield,
  school: GraduationCap,
  infrastructure: Building,
}

const NODE_COLORS: Record<NetworkNodeType, string> = {
  bridge: '#60A5FA',
  road: '#38BDF8',
  hospital: '#22C55E',
  fire_station: '#F59E0B',
  police_station: '#818CF8',
  school: '#34D399',
  infrastructure: '#A78BFA',
}

const MIN_ZOOM = 0.35
const MAX_ZOOM = 2.2
const VIEWPORT_H = 520

function getContentBounds(nodes: NetworkNode[]) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 500, width: 800, height: 500 }
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const node of nodes) {
    const x = node.x ?? 0
    const y = node.y ?? 0
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  const pad = 90
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad + 36,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2 + 36,
  }
}

export function NetworkGraph({
  data,
  cascade,
  onNodeSelect,
  selectedNodeId,
}: NetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [pan, setPan] = useState({ x: 40, y: 20 })
  const [zoom, setZoom] = useState(0.85)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{
    active: boolean
    startX: number
    startY: number
    originX: number
    originY: number
    moved: boolean
  } | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  const bounds = useMemo(() => getContentBounds(data.nodes), [data.nodes])

  const getNodePos = useCallback(
    (nodeId: string) => {
      const node = data.nodes.find((n) => n.id === nodeId)
      return node ? { x: node.x ?? 0, y: node.y ?? 0 } : { x: 0, y: 0 }
    },
    [data.nodes],
  )

  const selectedRoadId = selectedNodeId?.includes('::')
    ? selectedNodeId.split('::')[0]
    : selectedNodeId

  const isAffected = (nodeId: string) => {
    if (!cascade) return false
    return (
      cascade.affectedRoads.includes(nodeId) ||
      cascade.affectedHospitals.includes(nodeId) ||
      selectedNodeId === nodeId
    )
  }

  const belongsToSelection = (nodeId: string) => {
    if (!selectedRoadId) return true
    return nodeId === selectedRoadId || nodeId.startsWith(`${selectedRoadId}::`)
  }

  const resetView = useCallback(() => {
    setZoom(0.85)
    setPan({ x: 40, y: 20 })
  }, [])

  useEffect(() => {
    resetView()
  }, [data.nodes, resetView])

  useEffect(() => {
    if (!selectedRoadId) return
    const hub = data.nodes.find((n) => n.id === selectedRoadId)
    if (!hub || hub.x === undefined || hub.y === undefined) return
    const viewport = viewportRef.current
    if (!viewport) return
    const vw = viewport.clientWidth
    const vh = viewport.clientHeight
    const z = zoomRef.current
    setPan({
      x: vw / 2 - hub.x * z,
      y: Math.max(20, vh * 0.22 - hub.y * z),
    })
  }, [selectedRoadId, data.nodes])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
      moved: false,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag?.active) return
    const dx = e.clientX - drag.startX
    const dy = e.clientY - drag.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true
    setPan({ x: drag.originX + dx, y: drag.originY + dy })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    dragRef.current = null
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const viewport = viewportRef.current
    if (!viewport) return
    const rect = viewport.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    const prev = zoomRef.current
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * factor))
    const worldX = (mx - pan.x) / prev
    const worldY = (my - pan.y) / prev
    setZoom(next)
    setPan({
      x: mx - worldX * next,
      y: my - worldY * next,
    })
  }

  return (
    <GlassCard padding="none" className="relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Move className="h-3.5 w-3.5 text-accent" />
          <span>Drag / swipe to pan · scroll to zoom</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.15))}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.15))}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1.5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
            onClick={resetView}
            aria-label="Reset view"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          <span className="ml-1 min-w-[3rem] text-right font-mono text-[11px] text-muted">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="relative touch-none select-none overflow-hidden bg-[#0A0A0A]/40"
        style={{ height: VIEWPORT_H, cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <svg
          width={bounds.width}
          height={bounds.height}
          className="block"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {data.edges.map((edge) => {
            const source = getNodePos(edge.sourceId)
            const target = getNodePos(edge.targetId)
            const edgeSelected =
              selectedNodeId === edge.sourceId ||
              selectedNodeId === edge.targetId ||
              isAffected(edge.sourceId) ||
              isAffected(edge.targetId)
            const inFocus = belongsToSelection(edge.sourceId)
            const showDistance =
              edgeSelected || hoveredNode === edge.sourceId || hoveredNode === edge.targetId

            return (
              <g key={edge.id} opacity={inFocus ? 1 : 0.18}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={edgeSelected ? '#60A5FA' : 'rgba(255,255,255,0.14)'}
                  strokeWidth={edgeSelected ? 2.25 : 1.25}
                  strokeDasharray="5 4"
                />
                {showDistance && edge.weight !== undefined && (
                  <text
                    x={(source.x + target.x) / 2}
                    y={(source.y + target.y) / 2 - 6}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10"
                    className="pointer-events-none"
                  >
                    {Math.round(edge.weight)}m
                  </text>
                )}
              </g>
            )
          })}

          {data.nodes.map((node) => (
            <NetworkNodeElement
              key={node.id}
              node={node}
              dimmed={!belongsToSelection(node.id)}
              isSelected={selectedNodeId === node.id}
              isHovered={hoveredNode === node.id}
              isAffected={isAffected(node.id)}
              onSelect={() => onNodeSelect?.(node.id)}
              onHover={(h) => setHoveredNode(h ? node.id : null)}
            />
          ))}
        </svg>
      </div>
    </GlassCard>
  )
}

function NetworkNodeElement({
  node,
  dimmed,
  isSelected,
  isHovered,
  isAffected,
  onSelect,
  onHover,
}: {
  node: NetworkNode
  dimmed: boolean
  isSelected: boolean
  isHovered: boolean
  isAffected: boolean
  onSelect: () => void
  onHover: (hover: boolean) => void
}) {
  const Icon = NODE_ICONS[node.type] ?? Building
  const color = NODE_COLORS[node.type] ?? '#A78BFA'
  const x = node.x ?? 0
  const y = node.y ?? 0
  const radius = node.type === 'road' ? 30 : 20
  const label = node.label.length > 18 ? `${node.label.slice(0, 16)}…` : node.label

  const riskColor =
    node.riskScore >= 80
      ? '#EF4444'
      : node.riskScore >= 60
        ? '#F97316'
        : node.riskScore >= 30
          ? '#F59E0B'
          : '#22C55E'

  const strokeColor =
    node.type === 'road' ? riskColor : isSelected || isAffected ? color : `${color}90`

  return (
    <g
      className="cursor-pointer"
      opacity={dimmed ? 0.22 : 1}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <circle
        cx={x}
        cy={y}
        r={radius + (isHovered || isSelected ? 5 : 0)}
        fill={node.type === 'road' ? `${riskColor}22` : `${color}22`}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.75 : 1.75}
      />
      <foreignObject x={x - 10} y={y - 10} width={20} height={20}>
        <div className="flex h-full w-full items-center justify-center">
          <Icon
            className="h-4 w-4"
            style={{ color: node.type === 'road' ? riskColor : color }}
            strokeWidth={1.75}
          />
        </div>
      </foreignObject>

      <rect
        x={x - 52}
        y={y + radius + 6}
        width={104}
        height={node.type === 'road' || node.distance_m !== undefined ? 34 : 20}
        rx={6}
        fill="rgba(10,10,10,0.88)"
        stroke="rgba(255,255,255,0.08)"
      />
      <text
        x={x}
        y={y + radius + 19}
        textAnchor="middle"
        fill="#FAFAFA"
        fontSize="10"
        fontWeight="600"
      >
        {label}
      </text>
      {node.type === 'road' && (
        <text x={x} y={y + radius + 32} textAnchor="middle" fill={riskColor} fontSize="9">
          Risk {node.riskScore.toFixed(0)}
        </text>
      )}
      {node.distance_m !== undefined && node.type !== 'road' && (
        <text x={x} y={y + radius + 32} textAnchor="middle" fill="#94A3B8" fontSize="9">
          {Math.round(node.distance_m)}m
        </text>
      )}
    </g>
  )
}

export function CascadePanel({
  cascade,
  selectedLabel,
  exposureScore,
  connectivityScore,
}: {
  cascade: CascadeImpact | null
  selectedLabel?: string
  exposureScore?: number
  connectivityScore?: number
}) {
  if (!cascade) {
    return (
      <GlassCard className="py-10 text-center">
        <p className="text-sm text-text-secondary">
          Click a road location to inspect nearby infrastructure
        </p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Infrastructure Impact</h3>
        <p className="text-xs text-text-secondary">
          {selectedLabel ? `Selected: ${selectedLabel}` : 'Downstream network effects'}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
          Inspected Road
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
          Nearby Critical Entities
        </p>
        <div className="flex flex-wrap gap-2">
          {cascade.affectedHospitals.length > 0 ? (
            cascade.affectedHospitals.map((h) => (
              <span
                key={h}
                className="rounded-lg border border-success/30 bg-success/12 px-2 py-1 text-xs text-success"
              >
                {h.split('::')[2] ?? h}
              </span>
            ))
          ) : (
            <span className="text-xs text-text-secondary">No hospital entities in selection</span>
          )}
        </div>
      </div>

      {(exposureScore !== undefined || connectivityScore !== undefined) && (
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
          {exposureScore !== undefined && (
            <div>
              <p className="text-xs text-text-secondary">Entity Exposure</p>
              <p className="text-sm font-semibold text-text-primary">{exposureScore.toFixed(1)}</p>
            </div>
          )}
          {connectivityScore !== undefined && (
            <div>
              <p className="text-xs text-text-secondary">Connectivity</p>
              <p className="text-sm font-semibold text-text-primary">
                {connectivityScore.toFixed(1)}
              </p>
            </div>
          )}
        </div>
      )}

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
          <span className="h-3 w-3 rounded-full bg-sky-400" /> Road inspection location
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-success" /> Hospital
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-400" /> Fire / Police / School
        </div>
        <div className="mt-3 space-y-1 border-t border-border pt-3">
          <p>Each road is a separate cluster — swipe/drag to explore</p>
          <p>Unselected clusters are dimmed for clarity</p>
        </div>
      </div>
    </GlassCard>
  )
}
