import { apiPostForm } from '@/services/api'
import type { InspectionAnalysisDataOut, InspectionLocationInput } from '@/types'

export interface DraftLocationItem {
  id: string
  name: string
  latitude: number
  longitude: number
  road_name: string
}

export async function analyzeInspections(
  draftLocations: DraftLocationItem[],
  imagesMap: Record<string, File[]>,
): Promise<InspectionAnalysisDataOut> {
  const formData = new FormData()
  const payloadLocations: InspectionLocationInput[] = []

  draftLocations.forEach((loc) => {
    const files = imagesMap[loc.id] || []
    const imageKeys = files.map((_, idx) => `${loc.id}_img_${idx}`)

    payloadLocations.push({
      location_id: loc.id,
      name: loc.name,
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      road_name: loc.road_name,
      image_keys: imageKeys,
    })

    files.forEach((file, idx) => {
      const key = `${loc.id}_img_${idx}`
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
      const filename = `${key}.${ext}`
      formData.append('images', file, filename)
    })
  })

  formData.append('payload', JSON.stringify(payloadLocations))

  return apiPostForm<InspectionAnalysisDataOut>('/inspections/analyze', formData)
}
