// 文件类型
export type FileType = 'folder' | 'image' | 'video' | 'document' | 'other'

// 文件信息（用于返回给前端）
export interface FileInfo {
  id: number
  name: string
  type: FileType
  size: number
  parentId: number | null
  mimeType?: string | null
  path?: string
  userId?: number
  createdAt: Date
  updatedAt: Date
}

// 文件列表查询参数
export interface FileListQuery {
  parentId?: number | null
  page?: number
  pageSize?: number
}

// 创建文件夹请求
export interface CreateFolderRequest {
  name: string
  parentId?: number | null
}

// 重命名请求
export interface RenameRequest {
  name: string
}

// 移动文件请求
export interface MoveRequest {
  targetId: number | null
}

// 分页响应
export interface PaginatedList<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 文件数据库模型（Prisma）
export interface FileRecord {
  id: number
  name: string
  type: string
  size: number
  path: string
  mimeType: string | null
  parentId: number | null
  userId: number
  createdAt: Date
  updatedAt: Date
}