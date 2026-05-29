// 图片预览组件
import { useState } from 'react'

interface ImagePreviewProps {
  url: string
  onLoad?: () => void
}

export function ImagePreview({ url, onLoad }: ImagePreviewProps) {
  const [scale, setScale] = useState(1)

  const handleZoomIn = () => setScale(Math.min(scale + 0.25, 3))
  const handleZoomOut = () => setScale(Math.max(scale - 0.25, 0.5))
  const handleResetZoom = () => setScale(1)

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
          aria-label="缩小"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
          aria-label="放大"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
          aria-label="重置"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <img
        src={url}
        alt="预览图片"
        className="rounded-lg shadow-2xl transition-transform duration-200"
        style={{ transform: `scale(${scale})`, maxHeight: '80vh' }}
        onLoad={onLoad}
      />
    </div>
  )
}