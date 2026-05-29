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

// 认证中间件
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authorization = request.headers.authorization

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
    }

    const token = authorization.replace('Bearer ', '')

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

// 可选认证中间件（不强制要求登录）
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authorization = request.headers.authorization

    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
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