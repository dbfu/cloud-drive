// 文档预览组件
import { useEffect, useState } from 'react'
import type { FileItem } from '../../../../shared/types'
import { fileApi } from '../../../../shared/services/api'

interface DocumentPreviewProps {
  file: FileItem
  onLoad?: () => void
}

export function DocumentPreview({ file, onLoad }: DocumentPreviewProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 根据文件类型加载预览内容
    const loadPreview = async () => {
      try {
        // PDF 使用 iframe
        if (file.mimeType === 'application/pdf') {
          setContent('pdf')
          setLoading(false)
          onLoad?.()
          return
        }

        // 纯文本文件直接加载内容
        if (file.mimeType === 'text/plain') {
          const response = await fetch(fileApi.getPreviewUrl(file.id))
          const text = await response.text()
          setContent(text)
          setLoading(false)
          onLoad?.()
          return
        }

        // 其他文档类型暂不支持预览
        setContent(null)
        setLoading(false)
        onLoad?.()
      } catch (err) {
        setError('加载失败')
        setLoading(false)
      }
    }

    loadPreview()
  }, [file, onLoad])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-white">{error}</p>
      </div>
    )
  }

  // PDF 预览
  if (content === 'pdf') {
    return (
      <iframe
        src={fileApi.getPreviewUrl(file.id)}
        className="w-full h-[80vh] rounded-lg"
        title={file.name}
      />
    )
  }

  // 纯文本预览
  if (content) {
    return (
      <div className="w-full max-w-3xl h-full max-h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold text-gray-900">{file.name}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="font-mono text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      </div>
    )
  }

  // 不支持的文档类型
  return (
    <div className="text-center py-16">
      <svg className="w-24 h-24 mx-auto mb-6 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-white mb-4">此文档类型暂不支持在线预览</p>
      <button
        onClick={() => window.open(fileApi.getDownloadUrl(file.id))}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        下载文件
      </button>
    </div>
  )
}