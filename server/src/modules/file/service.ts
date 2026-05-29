import prisma from '../../lib/prisma'
import {
  saveUploadedFile,
  deleteFile,
  deleteDir,
  fileExists,
  readFile,
  validateFilename,
  getFileType,
  getFileStats,
} from '../../lib/upload'
import type { FileInfo, FileListQuery, CreateFolderRequest, RenameRequest, MoveRequest, PaginatedList, FileType } from './types'

// 错误码
export const FileErrorCode = {
  FILE_NOT_FOUND: 3001,
  FOLDER_NOT_FOUND: 3002,
  NAME_EXISTS: 3003,
  FILE_TYPE_NOT_SUPPORT: 3004,
  FILE_SIZE_EXCEEDED: 3005,
  UPLOAD_FAILED: 3006,
}

// 获取文件列表
export async function getFileList(userId: number, query: FileListQuery): Promise<PaginatedList<FileInfo>> {
  const { parentId = null, page = 1, pageSize = 50 } = query

  // 验证 parentId 属于当前用户
  if (parentId !== null) {
    const parent = await prisma.file.findFirst({
      where: {
        id: parentId,
        userId,
        type: 'folder',
      },
    })

    if (!parent) {
      throw new Error('文件夹不存在')
    }
  }

  // 查询文件列表
  const [files, total] = await Promise.all([
    prisma.file.findMany({
      where: {
        userId,
        parentId,
      },
      orderBy: [
        { type: 'asc' }, // 文件夹在前
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.file.count({
      where: {
        userId,
        parentId,
      },
    }),
  ])

  return {
    list: files.map(formatFileInfo),
    total,
    page,
    pageSize,
  }
}

// 获取文件详情
export async function getFileDetail(userId: number, fileId: number): Promise<FileInfo> {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) {
    throw new Error('文件不存在')
  }

  return formatFileInfo(file)
}

// 上传文件
export async function uploadFile(
  userId: number,
  filename: string,
  mimeType: string,
  buffer: Buffer,
  parentId?: number | null,
): Promise<FileInfo> {
  // 验证文件名
  if (!validateFilename(filename)) {
    throw new Error('文件名无效')
  }

  // 验证 parentId
  if (parentId !== null && parentId !== undefined) {
    const parent = await prisma.file.findFirst({
      where: {
        id: parentId,
        userId,
        type: 'folder',
      },
    })

    if (!parent) {
      throw new Error('文件夹不存在')
    }
  }

  // 检查同一目录下是否已存在同名文件
  const existingFile = await prisma.file.findFirst({
    where: {
      userId,
      parentId: parentId ?? null,
      name: filename,
    },
  })

  if (existingFile) {
    throw new Error('文件名已存在')
  }

  // 保存文件到磁盘
  const savedFile = await saveUploadedFile(userId, filename, mimeType, buffer)

  // 创建数据库记录
  const file = await prisma.file.create({
    data: {
      name: filename,
      type: savedFile.type,
      size: savedFile.size,
      path: savedFile.path,
      mimeType,
      parentId: parentId ?? null,
      userId,
    },
  })

  return formatFileInfo(file)
}

// 创建文件夹
export async function createFolder(userId: number, data: CreateFolderRequest): Promise<FileInfo> {
  const { name, parentId = null } = data

  // 验证文件夹名
  if (!validateFilename(name)) {
    throw new Error('文件夹名无效')
  }

  // 验证 parentId
  if (parentId !== null) {
    const parent = await prisma.file.findFirst({
      where: {
        id: parentId,
        userId,
        type: 'folder',
      },
    })

    if (!parent) {
      throw new Error('文件夹不存在')
    }
  }

  // 检查同一目录下是否已存在同名文件夹
  const existingFolder = await prisma.file.findFirst({
    where: {
      userId,
      parentId,
      name,
      type: 'folder',
    },
  })

  if (existingFolder) {
    throw new Error('文件夹名已存在')
  }

  // 创建文件夹记录
  const folderPath = `/uploads/${userId}/${name}`

  const folder = await prisma.file.create({
    data: {
      name,
      type: 'folder',
      size: 0,
      path: folderPath,
      parentId,
      userId,
    },
  })

  return formatFileInfo(folder)
}

// 删除文件或文件夹
export async function deleteFileOrFolder(userId: number, fileId: number): Promise<void> {
  // 查找文件
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) {
    throw new Error('文件不存在')
  }

  // 如果是文件，删除物理文件
  if (file.type !== 'folder') {
    await deleteFile(file.path)
  } else {
    // 如果是文件夹，递归删除所有子文件
    await deleteFolderRecursive(fileId)
  }

  // 删除数据库记录（会级联删除子文件）
  await prisma.file.delete({
    where: {
      id: fileId,
    },
  })
}

// 递归删除文件夹内容
async function deleteFolderRecursive(folderId: number): Promise<void> {
  // 查找所有子文件
  const children = await prisma.file.findMany({
    where: {
      parentId: folderId,
    },
  })

  for (const child of children) {
    if (child.type === 'folder') {
      await deleteFolderRecursive(child.id)
    } else {
      await deleteFile(child.path)
    }
  }
}

// 重命名文件或文件夹
export async function renameFile(userId: number, fileId: number, newName: string): Promise<FileInfo> {
  // 验证文件名
  if (!validateFilename(newName)) {
    throw new Error('文件名无效')
  }

  // 查找文件
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) {
    throw new Error('文件不存在')
  }

  // 检查同一目录下是否已存在同名文件
  const existingFile = await prisma.file.findFirst({
    where: {
      userId,
      parentId: file.parentId,
      name: newName,
      id: { not: fileId },
    },
  })

  if (existingFile) {
    throw new Error('文件名已存在')
  }

  // 更新数据库
  const updatedFile = await prisma.file.update({
    where: {
      id: fileId,
    },
    data: {
      name: newName,
    },
  })

  return formatFileInfo(updatedFile)
}

// 移动文件或文件夹
export async function moveFile(userId: number, fileId: number, targetId: number | null): Promise<FileInfo> {
  // 查找文件
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) {
    throw new Error('文件不存在')
  }

  // 验证目标文件夹
  if (targetId !== null) {
    const target = await prisma.file.findFirst({
      where: {
        id: targetId,
        userId,
        type: 'folder',
      },
    })

    if (!target) {
      throw new Error('目标文件夹不存在')
    }

    // 不能将文件夹移动到自身或其子文件夹中
    if (file.type === 'folder') {
      const isSubfolder = await checkIsSubfolder(fileId, targetId)
      if (isSubfolder) {
        throw new Error('不能将文件夹移动到自身或其子文件夹中')
      }
    }
  }

  // 检查目标目录下是否已存在同名文件
  const existingFile = await prisma.file.findFirst({
    where: {
      userId,
      parentId: targetId,
      name: file.name,
      id: { not: fileId },
    },
  })

  if (existingFile) {
    throw new Error('目标文件夹中已存在同名文件')
  }

  // 更新数据库
  const updatedFile = await prisma.file.update({
    where: {
      id: fileId,
    },
    data: {
      parentId: targetId,
    },
  })

  return formatFileInfo(updatedFile)
}

// 检查是否是子文件夹
async function checkIsSubfolder(parentId: number, childId: number): Promise<boolean> {
  if (parentId === childId) {
    return true
  }

  const child = await prisma.file.findUnique({
    where: { id: childId },
  })

  if (!child || !child.parentId) {
    return false
  }

  return checkIsSubfolder(parentId, child.parentId)
}

// 下载文件
export async function downloadFile(userId: number, fileId: number): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) {
    throw new Error('文件不存在')
  }

  if (file.type === 'folder') {
    throw new Error('不能下载文件夹')
  }

  // 检查物理文件是否存在
  if (!await fileExists(file.path)) {
    throw new Error('物理文件不存在')
  }

  // 读取文件
  const buffer = await readFile(file.path)

  return {
    buffer,
    filename: file.name,
    mimeType: file.mimeType || 'application/octet-stream',
  }
}

// 预览文件
export async function previewFile(userId: number, fileId: number): Promise<{ buffer: Buffer; filename: string; mimeType: string; type: FileType }> {
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  })

  if (!file) {
    throw new Error('文件不存在')
  }

  if (file.type === 'folder') {
    throw new Error('不能预览文件夹')
  }

  // 检查物理文件是否存在
  if (!await fileExists(file.path)) {
    throw new Error('物理文件不存在')
  }

  // 读取文件
  const buffer = await readFile(file.path)

  return {
    buffer,
    filename: file.name,
    mimeType: file.mimeType || 'application/octet-stream',
    type: file.type as FileType,
  }
}

// 格式化文件信息
function formatFileInfo(file: { id: number; name: string; type: string; size: number; path: string; mimeType: string | null; parentId: number | null; userId: number; createdAt: Date; updatedAt: Date }): FileInfo {
  return {
    id: file.id,
    name: file.name,
    type: file.type as FileType,
    size: file.size,
    parentId: file.parentId,
    mimeType: file.mimeType,
    path: file.path,
    userId: file.userId,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  }
}