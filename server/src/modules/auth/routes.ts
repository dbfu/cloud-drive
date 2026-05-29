import type { FastifyPluginAsync } from 'fastify'
import { success, error, ErrorCode } from '../health/routes'
import { register, login, getUserInfo, AuthErrorCode } from './service'
import type { RegisterRequest, LoginRequest } from './types'
import { authMiddleware } from '../../shared/middleware/auth'

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // 用户注册
  fastify.post<{ Body: RegisterRequest }>(
    '/auth/register',
    async (request, reply) => {
      try {
        const result = await register(request.body)
        return success(result, '注册成功')
      } catch (err) {
        const message = err instanceof Error ? err.message : '注册失败'

        // 判断是否是用户名已存在错误
        if (message === '用户名已存在') {
          return reply.status(400).send(error(AuthErrorCode.USERNAME_EXISTS, message))
        }

        // 参数错误
        if (message.includes('必须') || message.includes('不能')) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, message))
        }

        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )

  // 用户登录
  fastify.post<{ Body: LoginRequest }>(
    '/auth/login',
    async (request, reply) => {
      try {
        const result = await login(request.body, async (payload) => {
          return fastify.jwt.sign(payload)
        })
        return success(result, '登录成功')
      } catch (err) {
        const message = err instanceof Error ? err.message : '登录失败'

        // 参数错误
        if (message === '用户名和密码不能为空') {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, message))
        }

        // 登录失败
        return reply.status(401).send(error(AuthErrorCode.LOGIN_FAILED, message))
      }
    },
  )

  // 获取当前用户信息
  fastify.get(
    '/auth/me',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const user = await getUserInfo(request.userId)

        if (!user) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '用户不存在'))
        }

        return success(user, 'success')
      } catch (err) {
        request.log.error(err)
        return reply.status(500).send(error(ErrorCode.AUTH_FAILED, '获取用户信息失败'))
      }
    },
  )
}