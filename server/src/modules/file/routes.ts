import type { FastifyPluginAsync, FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify'
import { success, error, ErrorCode } from '../health/routes'
import { authMiddleware } from '../../shared/middleware/auth'
import {
  getFileList,
  getFileDetail,
  uploadFile,
  createFolder,
  deleteFileOrFolder,
  renameFile,
  moveFile,
  downloadFile,
  previewFile,
  FileErrorCode,
} from './service'
import type { FileListQuery, CreateFolderRequest, RenameRequest, MoveRequest } from './types'
import { validateFilename } from '../../lib/upload'

export const fileRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取文件列表
  fastify.get(
    '/files',
    {
      preHandler: authMiddleware,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            parentId: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const query = request.query as FileListQuery
        const params = {
          parentId: query.parentId ? Number(query.parentId) : null,
          page: query.page ? Number(query.page) : 1,
          pageSize: query.pageSize ? Number(query.pageSize) : 50,
        }

        const result = await getFileList(request.userId!, params)
        return success(result, 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取文件列表失败'
        if (message === '文件夹不存在') {
          return reply.status(404).send(error(FileErrorCode.FOLDER_NOT_FOUND, message))
        }
        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )

  // 获取文件详情
  fastify.get(
    '/files/:id',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const params = request.params as { id: string }
        const fileId = Number(params.id)
        if (!fileId) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件ID无效'))
        }

        const result = await getFileDetail(request.userId!, fileId)
        return success(result, 'success')
      } catch (err) {
        const message = err instanceof Error ? err.message : '获取文件详情失败'
        if (message === '文件不存在') {
          return reply.status(404).send(error(FileErrorCode.FILE_NOT_FOUND, message))
        }
        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )

  // 上传文件
  fastify.post(
    '/files/upload',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const data = await request.file()
        if (!data) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '请选择要上传的文件'))
        }

        // 获取 parentId
        const query = request.query as { parentId?: string }
        const parentId = query.parentId ? Number(query.parentId) : null

        // 读取文件内容
        const buffer = await data.toBuffer()

        const result = await uploadFile(
          request.userId!,
          data.filename,
          data.mimetype,
          buffer,
          parentId,
        )

        return success(result, '上传成功')
      } catch (err) {
        const message = err instanceof Error ? err.message : '上传失败'
        if (message.includes('不存在')) {
          return reply.status(404).send(error(FileErrorCode.FOLDER_NOT_FOUND, message))
        }
        if (message.includes('已存在')) {
          return reply.status(400).send(error(FileErrorCode.NAME_EXISTS, message))
        }
        if (message.includes('超过限制')) {
          return reply.status(400).send(error(FileErrorCode.FILE_SIZE_EXCEEDED, message))
        }
        return reply.status(500).send(error(FileErrorCode.UPLOAD_FAILED, message))
      }
    },
  )

  // 创建文件夹
  fastify.post(
    '/files/folder',
    {
      preHandler: authMiddleware,
      schema: {
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            parentId: { type: ['number', 'null'] },
          },
          required: ['name'],
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const body = request.body as CreateFolderRequest
        const { name, parentId } = body

        // 验证文件夹名
        if (!name) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件夹名不能为空'))
        }

        if (!validateFilename(name)) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件夹名无效'))
        }

        const result = await createFolder(request.userId!, {
          name,
          parentId: parentId ?? null,
        })

        return success(result, '创建成功')
      } catch (err) {
        const message = err instanceof Error ? err.message : '创建文件夹失败'
        if (message.includes('不存在')) {
          return reply.status(404).send(error(FileErrorCode.FOLDER_NOT_FOUND, message))
        }
        if (message.includes('已存在')) {
          return reply.status(400).send(error(FileErrorCode.NAME_EXISTS, message))
        }
        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )

  // 删除文件或文件夹
  fastify.delete(
    '/files/:id',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const params = request.params as { id: string }
        const fileId = Number(params.id)
        if (!fileId) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件ID无效'))
        }

        await deleteFileOrFolder(request.userId!, fileId)
        return success(null, '删除成功')
      } catch (err) {
        const message = err instanceof Error ? err.message : '删除失败'
        if (message === '文件不存在') {
          return reply.status(404).send(error(FileErrorCode.FILE_NOT_FOUND, message))
        }
        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )

  // 重命名文件或文件夹
  fastify.patch(
    '/files/:id/rename',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const params = request.params as { id: string }
        const fileId = Number(params.id)
        if (!fileId) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件ID无效'))
        }

        const body = request.body as RenameRequest
        const { name } = body
        if (!name) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '新名称不能为空'))
        }

        if (!validateFilename(name)) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件名无效'))
        }

        const result = await renameFile(request.userId!, fileId, name)
        return success(result, '重命名成功')
      } catch (err) {
        const message = err instanceof Error ? err.message : '重命名失败'
        if (message === '文件不存在') {
          return reply.status(404).send(error(FileErrorCode.FILE_NOT_FOUND, message))
        }
        if (message.includes('已存在')) {
          return reply.status(400).send(error(FileErrorCode.NAME_EXISTS, message))
        }
        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )

  // 移动文件或文件夹
  fastify.post(
    '/files/:id/move',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            targetId: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const params = request.params as { id: string }
        const fileId = Number(params.id)
        if (!fileId) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件ID无效'))
        }

        const body = request.body as MoveRequest
        const { targetId } = body

        const result = await moveFile(request.userId!, fileId, targetId ?? null)
        return success(result, '移动成功')
      } catch (err) {
        const message = err instanceof Error ? err.message : '移动失败'
        if (message.includes('不存在')) {
          return reply.status(404).send(error(FileErrorCode.FILE_NOT_FOUND, message))
        }
        if (message.includes('已存在')) {
          return reply.status(400).send(error(FileErrorCode.NAME_EXISTS, message))
        }
        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )

  // 下载文件
  fastify.get(
    '/files/:id/download',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const params = request.params as { id: string }
        const fileId = Number(params.id)
        if (!fileId) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件ID无效'))
        }

        const result = await downloadFile(request.userId!, fileId)

        // 设置响应头
        reply.header('Content-Type', result.mimeType)
        reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(result.filename)}"`)

        return reply.send(result.buffer)
      } catch (err) {
        const message = err instanceof Error ? err.message : '下载失败'
        if (message.includes('不存在')) {
          return reply.status(404).send(error(FileErrorCode.FILE_NOT_FOUND, message))
        }
        if (message === '不能下载文件夹') {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, message))
        }
        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )

  // 预览文件
  fastify.get(
    '/files/:id/preview',
    {
      preHandler: authMiddleware,
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (request, reply) => {
      try {
        if (!request.userId) {
          return reply.status(401).send(error(ErrorCode.AUTH_FAILED, '请先登录'))
        }

        const params = request.params as { id: string }
        const fileId = Number(params.id)
        if (!fileId) {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, '文件ID无效'))
        }

        const result = await previewFile(request.userId!, fileId)

        // 设置响应头
        reply.header('Content-Type', result.mimeType)
        reply.header('Content-Disposition', `inline; filename="${encodeURIComponent(result.filename)}"`)

        return reply.send(result.buffer)
      } catch (err) {
        const message = err instanceof Error ? err.message : '预览失败'
        if (message.includes('不存在')) {
          return reply.status(404).send(error(FileErrorCode.FILE_NOT_FOUND, message))
        }
        if (message === '不能预览文件夹') {
          return reply.status(400).send(error(ErrorCode.PARAM_ERROR, message))
        }
        return reply.status(500).send(error(ErrorCode.PARAM_ERROR, message))
      }
    },
  )
}