import type { FastifyRequest, FastifyReply } from 'fastify'
import { ErrorCode, error } from '../../modules/health/routes'

// 扩展 Fastify 类型
declare module 'fastify' {
  interface FastifyRequest {
    userId?: number
  }
}

// JWT payload 类型
export interface JwtPayload {
  userId: number
  iat: number
  exp: number
}

// 从请求中提取 token（支持 Header 和 URL query 参数）
function extractToken(request: FastifyRequest): string | null {
  // 1. 先尝试从 Authorization header 获取
  const authorization = request.headers.authorization
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }

  // 2. 再尝试从 URL query 参数获取（用于图片/视频预览）
  const query = request.query as { token?: string }
  if (query && query.token) {
    return query.token
  }

  return null
}

// 认证中间件（支持 Header 和 URL query 参数）
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const token = extractToken(request)

    if (!token) {
      return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
    }

    try {
      const decoded = await request.server.jwt.verify<JwtPayload>(token)
      request.userId = decoded.userId
    } catch {
      return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '登录已过期，请重新登录'))
    }
  } catch (err) {
    request.log.error(err)
    return reply.status(500).send(error(ErrorCode.AUTH_FAILED, '认证失败'))
  }
}

// 可选认证中间件（不强制要求登录，支持 Header 和 URL query 参数）
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const token = extractToken(request)

    if (token) {
      try {
        const decoded = await request.server.jwt.verify<JwtPayload>(token)
        request.userId = decoded.userId
      } catch {
        // 忽略错误，可选认证
      }
    }
  } catch (err) {
    request.log.error(err)
  }
}