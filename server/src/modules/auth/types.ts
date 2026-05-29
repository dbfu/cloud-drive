// 注册请求
export interface RegisterRequest {
  username: string
  password: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  avatar: string | null
  createdAt?: Date
}

// 登录响应
export interface LoginResponse {
  token: string
  user: UserInfo
}

// 用户数据库模型（从 Prisma 生成）
export interface User {
  id: number
  username: string
  password: string
  nickname: string | null
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}