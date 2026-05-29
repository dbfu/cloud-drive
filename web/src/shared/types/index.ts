// API 响应格式
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

// 分页响应格式
export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// API 错误码
export const ErrorCode = {
  SUCCESS: 0,
  PARAM_ERROR: 1001,
  AUTH_FAILED: 1002,
  PERMISSION_DENIED: 1003,
  USER_EXISTS: 2001,
  LOGIN_FAILED: 2002,
  FILE_NOT_FOUND: 3001,
  FOLDER_NOT_FOUND: 3002,
  FILE_NAME_EXISTS: 3003,
  FILE_TYPE_NOT_SUPPORTED: 3004,
  FILE_SIZE_EXCEEDED: 3005,
  UPLOAD_FAILED: 3006,
} as const

// 用户类型
export interface User {
  id: number
  username: string
  nickname?: string | null
  avatar?: string | null
  createdAt?: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: User
}

// 注册响应
export interface RegisterResponse {
  id: number
  username: string
}

// 文件类型
export interface FileItem {
  id: number
  name: string
  type: 'folder' | 'image' | 'video' | 'document' | 'other'
  size: number
  mimeType?: string
  parentId?: number | null
  userId?: number
  path?: string
  createdAt: string
  updatedAt: string
}

// 文件上传参数
export interface UploadParams {
  file: File
  parentId?: number | null
}

// 创建文件夹参数
export interface CreateFolderParams {
  name: string
  parentId?: number | null
}

// 重命名参数
export interface RenameParams {
  name: string
}

// 移动文件参数
export interface MoveParams {
  targetId: number | null
}

// 文件列表查询参数
export interface FileListParams {
  parentId?: number | null
  page?: number
  pageSize?: number
}

// 预览文件类型
export type PreviewType = 'image' | 'video' | 'pdf' | 'text' | 'office'