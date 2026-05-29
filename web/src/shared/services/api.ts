// API 服务
import type { ApiResponse, PaginatedData, LoginResponse, RegisterResponse, FileItem, FileListParams, CreateFolderParams, RenameParams, MoveParams } from '../types'

// 基础 URL
const BASE_URL = '/api'

// 获取 Token
function getToken(): string | null {
  return localStorage.getItem('token')
}

// 设置 Token
export function setToken(token: string): void {
  localStorage.setItem('token', token)
}

// 清除 Token
export function clearToken(): void {
  localStorage.removeItem('token')
}

// 基础请求函数
async function request<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean },
): Promise<ApiResponse<T>> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  // 添加认证头（除非明确跳过）
  if (token && !options?.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  })

  const result = await response.json()

  // 处理认证失败
  if (result.code === 1002) {
    clearToken()
    window.location.href = '/login'
  }

  return result
}

// 认证 API
export const authApi = {
  // 注册
  register: (username: string, password: string) =>
    request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    }),

  // 登录
  login: (username: string, password: string) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      skipAuth: true,
    }),

  // 获取当前用户信息
  me: () => request<{ id: number; username: string; nickname?: string; avatar?: string; createdAt: string }>('/auth/me'),
}

// 文件 API
export const fileApi = {
  // 获取文件列表
  list: (params?: FileListParams) => {
    const query = new URLSearchParams()
    if (params?.parentId) query.set('parentId', String(params.parentId))
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    return request<PaginatedData<FileItem>>(`/files?${query.toString()}`)
  },

  // 获取文件详情
  get: (id: number) => request<FileItem>(`/files/${id}`),

  // 上传文件
  upload: async (file: File, parentId?: number | null): Promise<ApiResponse<FileItem>> => {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)
    if (parentId) formData.append('parentId', String(parentId))

    const response = await fetch(`${BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    })

    return response.json()
  },

  // 创建文件夹
  createFolder: (params: CreateFolderParams) =>
    request<FileItem>('/files/folder', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // 删除文件/文件夹
  delete: (id: number) =>
    request<null>(`/files/${id}`, {
      method: 'DELETE',
    }),

  // 重命名
  rename: (id: number, params: RenameParams) =>
    request<FileItem>(`/files/${id}/rename`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    }),

  // 移动文件
  move: (id: number, params: MoveParams) =>
    request<FileItem>(`/files/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // 获取下载 URL
  getDownloadUrl: (id: number) => `${BASE_URL}/files/${id}/download?token=${getToken()}`,

  // 获取预览 URL
  getPreviewUrl: (id: number) => `${BASE_URL}/files/${id}/preview?token=${getToken()}`,
}

// 健康检查 API
export const healthApi = {
  check: () => request<{ status: string; timestamp: string }>('/health'),
  ready: () => request<{ status: string; database: string; timestamp: string }>('/ready'),
}