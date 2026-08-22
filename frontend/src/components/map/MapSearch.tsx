import { useState, useRef, useEffect } from 'react'
import { Search, X, MapPin } from 'lucide-react'
import type { FeatureCollection } from 'geojson'
import { searchMapFeatures, type MapSearchResult } from '@/lib/mapUtils'
import { getRiskBgClass } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MapSearchProps {
  geojson: FeatureCollection
  onSelect: (result: MapSearchResult) => void
  selectedId?: string
  onClear: () => void
}

export function MapSearch({
  geojson,
  onSelect,
  selectedId,
  onClear,
}: MapSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = query.length >= 1 ? searchMapFeatures(geojson, query) : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (result: MapSearchResult) => {
    setQuery(result.name)
    setIsOpen(false)
    onSelect(result)
  }

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <div ref={containerRef} className="relative max-w-md">
      <div className="glass-surface flex items-center gap-2 rounded-xl px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search bridges, roads, hospitals..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-muted/60 focus:outline-none"
        />
        {(query || selectedId) && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1 text-text-secondary hover:bg-white/5 hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-elevated shadow-lg">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result)}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5',
                selectedId === result.id && 'bg-accent/10',
              )}
            >
              <MapPin className="h-4 w-4 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-text-primary">{result.name}</p>
                <p className="text-xs capitalize text-text-secondary">{result.type}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-md border px-2 py-0.5 text-xs',
                  getRiskBgClass(result.riskLevel),
                )}
              >
                {result.riskLevel}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
