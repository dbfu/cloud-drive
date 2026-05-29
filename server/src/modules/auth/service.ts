import bcrypt from 'bcrypt'
import prisma from '../../lib/prisma'
import type { RegisterRequest, LoginRequest, UserInfo, User } from './types'

// 错误码
export const AuthErrorCode = {
  USERNAME_EXISTS: 2001,
  LOGIN_FAILED: 2002,
}

// 密码加密轮数
const SALT_ROUNDS = 10

// 用户注册
export async function register(data: RegisterRequest): Promise<{ id: number; username: string }> {
  const { username, password } = data

  // 验证参数
  if (!username || username.length < 3 || username.length > 50) {
    throw new Error('用户名长度必须在3-50个字符之间')
  }

  if (!password || password.length < 6 || password.length > 100) {
    throw new Error('密码长度必须在6-100个字符之间')
  }

  // 检查用户名是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { username },
  })

  if (existingUser) {
    throw new Error('用户名已存在')
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  // 创建用户
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  })

  return {
    id: user.id,
    username: user.username,
  }
}

// 用户登录
export async function login(
  data: LoginRequest,
  jwtSign: (payload: { userId: number }) => Promise<string>,
): Promise<{ token: string; user: UserInfo }> {
  const { username, password } = data

  // 验证参数
  if (!username || !password) {
    throw new Error('用户名和密码不能为空')
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    throw new Error('用户名或密码错误')
  }

  // 验证密码
  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    throw new Error('用户名或密码错误')
  }

  // 生成 JWT Token
  const token = await jwtSign({ userId: user.id })

  return {
    token,
    user: formatUserInfo(user),
  }
}

// 获取用户信息
export async function getUserInfo(userId: number): Promise<UserInfo | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return null
  }

  return formatUserInfo(user)
}

// 格式化用户信息
function formatUserInfo(user: User): UserInfo {
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    avatar: user.avatar,
    createdAt: user.createdAt,
  }
}