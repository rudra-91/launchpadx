import { useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploaderProps {
  locationId: string
  files: File[]
  previews: string[]
  onAddImages: (files: File[]) => void
  onRemoveImage: (index: number) => void
}

export function ImageUploader({
  files,
  previews,
  onAddImages,
  onRemoveImage,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      onAddImages(selectedFiles)
      // Reset input
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type.toLowerCase()),
      )
      if (droppedFiles.length > 0) {
        onAddImages(droppedFiles)
      }
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="glass-surface flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center transition-colors hover:border-accent/50 hover:bg-white/5"
      >
        <Upload className="mb-2 h-5 w-5 text-accent" />
        <p className="text-xs font-medium text-text-primary">
          Upload Road Inspection Images
        </p>
        <p className="text-[11px] text-text-secondary">
          Drag & drop or click to select multiple files (JPG, PNG, WEBP)
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((previewUrl, idx) => (
            <div
              key={idx}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface"
            >
              <img
                src={previewUrl}
                alt={`Uploaded ${idx + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveImage(idx)
                }}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-critical"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-text-secondary">
                {files[idx]?.name || `Image ${idx + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-warning">
          <ImageIcon className="h-3.5 w-3.5" />
          At least 1 image is required for YOLO analysis
        </div>
      )}
    </div>
  )
}
