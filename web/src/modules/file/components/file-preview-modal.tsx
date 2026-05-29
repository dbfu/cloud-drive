// 文件预览模态框
import { useState, useEffect } from 'react'
import { Button } from '../../../shared/components'
import { fileApi } from '../../../shared/services/api'
import type { FileItem } from '../../../shared/types'
import { formatDate, formatFileSize } from '../../../shared/utils'
import { ImagePreview } from './preview/image-preview'
import { VideoPreview } from './preview/video-preview'
import { DocumentPreview } from './preview/document-preview'

interface FilePreviewModalProps {
  file: FileItem
  onClose: () => void
}

export function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // 根据文件类型选择预览组件
  const getPreviewComponent = () => {
    const previewUrl = fileApi.getPreviewUrl(file.id)

    switch (file.type) {
      case 'image':
        return <ImagePreview url={previewUrl} onLoad={() => setLoading(false)} />
      case 'video':
        return <VideoPreview url={previewUrl} onLoad={() => setLoading(false)} />
      case 'document':
        return <DocumentPreview file={file} onLoad={() => setLoading(false)} />
      default:
        return (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mb-4">此文件类型暂不支持在线预览</p>
            <Button onClick={() => window.open(fileApi.getDownloadUrl(file.id))}>
              下载文件
            </Button>
          </div>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full h-full flex items-center justify-center p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 z-10"
          aria-label="关闭"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* File Info */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xl rounded-lg p-3 border border-white/30 z-10">
          <p className="text-sm font-semibold text-gray-900">{file.name}</p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)} · {formatDate(file.updatedAt)}
          </p>
        </div>

        {/* Download Button */}
        <button
          onClick={() => window.open(fileApi.getDownloadUrl(file.id))}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
        </button>

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-4 text-white">加载中...</p>
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div className="max-w-4xl max-h-[80vh] rounded-lg overflow-hidden">
          {getPreviewComponent()}
        </div>
      </div>
    </div>
  )
}