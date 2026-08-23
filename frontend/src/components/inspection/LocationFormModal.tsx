import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Building, Compass } from 'lucide-react'
import type { DraftLocationItem } from '@/services/inspection'

interface LocationFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (location: DraftLocationItem) => void
  initialData?: DraftLocationItem | null
}

export function LocationFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: LocationFormModalProps) {
  const [name, setName] = useState('')
  const [roadName, setRoadName] = useState('')
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setRoadName(initialData.road_name)
      setLatitude(String(initialData.latitude))
      setLongitude(String(initialData.longitude))
    } else {
      setName('')
      setRoadName('')
      setLatitude('')
      setLongitude('')
    }
    setError(null)
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Location name is required')
      return
    }
    if (!roadName.trim()) {
      setError('Road name is required')
      return
    }

    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Please enter a valid latitude between -90 and 90')
      return
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError('Please enter a valid longitude between -180 and 180')
      return
    }

    onSave({
      id: initialData?.id || `loc_${Date.now()}`,
      name: name.trim(),
      road_name: roadName.trim(),
      latitude: lat,
      longitude: lon,
    })

    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card relative w-full max-w-lg border border-border p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {initialData ? 'Edit Location' : 'Add Inspection Location'}
              </h2>
              <p className="text-xs text-text-secondary">
                Provide GPS coordinates and road identifiers for inspection
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-critical/30 bg-critical/10 p-3 text-xs text-critical">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Location Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Connaught Place Outer Circle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface/50 px-3.5 py-2.5 pl-9 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
                <Building className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Road / Corridor Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Radial Road 1 / Aurobindo Marg"
                  value={roadName}
                  onChange={(e) => setRoadName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface/50 px-3.5 py-2.5 pl-9 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
                <Compass className="absolute left-3 top-3 h-4 w-4 text-text-secondary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="28.6315"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface/50 px-3.5 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="77.2167"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface/50 px-3.5 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-90"
              >
                Save Location
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
