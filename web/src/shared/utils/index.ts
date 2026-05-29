// 工具函数

/**
 * 格式化日期
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 获取文件类型图标颜色
 */
export function getFileTypeColor(type: string): string {
  const colors: Record<string, string> = {
    folder: 'text-blue-600 bg-blue-50',
    image: 'text-green-600 bg-green-50',
    video: 'text-red-600 bg-red-50',
    document: 'text-blue-600 bg-blue-50',
    other: 'text-gray-600 bg-gray-100',
  }
  return colors[type] || colors.other
}

/**
 * 获取文件图标
 */
export function getFileIcon(type: string): string {
  return type
}

/**
 * 判断是否为图片类型
 */
export function isImageType(mimeType?: string): boolean {
  if (!mimeType) return false
  return mimeType.startsWith('image/')
}

/**
 * 判断是否为视频类型
 */
export function isVideoType(mimeType?: string): boolean {
  if (!mimeType) return false
  return mimeType.startsWith('video/')
}

/**
 * 判断是否为文档类型
 */
export function isDocumentType(mimeType?: string): boolean {
  if (!mimeType) return false
  const docTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ]
  return docTypes.includes(mimeType)
}