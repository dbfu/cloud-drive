import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'

// 上传根目录
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads')

// 文件类型配置
const FILE_CONFIG = {
  image: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  video: {
    extensions: ['mp4', 'webm', 'mov'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  document: {
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
}

// 最大文件大小
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

// 文件类型枚举
export type FileType = 'folder' | 'image' | 'video' | 'document' | 'other'

// 获取文件类型
export function getFileType(mimeType: string, filename: string): FileType {
  const ext = path.extname(filename).toLowerCase().slice(1)

  // 检查图片
  if (FILE_CONFIG.image.mimeTypes.includes(mimeType) || FILE_CONFIG.image.extensions.includes(ext)) {
    return 'image'
  }

  // 检查视频
  if (FILE_CONFIG.video.mimeTypes.includes(mimeType) || FILE_CONFIG.video.extensions.includes(ext)) {
    return 'video'
  }

  // 检查文档
  if (FILE_CONFIG.document.mimeTypes.includes(mimeType) || FILE_CONFIG.document.extensions.includes(ext)) {
    return 'document'
  }

  return 'other'
}

// 获取文件存储目录
export function getStorageDir(userId: number, fileType: FileType): string {
  const subDir = fileType === 'folder' ? '' : fileType
  const dir = subDir ? path.join(UPLOAD_DIR, String(userId), subDir) : path.join(UPLOAD_DIR, String(userId))
  return dir
}

// 确保目录存在
export async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw err
    }
  }
}

// 保存上传文件
export async function saveUploadedFile(
  userId: number,
  filename: string,
  mimeType: string,
  buffer: Buffer,
): Promise<{ path: string; type: FileType; size: number }> {
  // 检查文件大小
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('文件大小超过限制（最大100MB）')
  }

  // 获取文件类型
  const fileType = getFileType(mimeType, filename)

  // 获取存储目录
  const storageDir = getStorageDir(userId, fileType)

  // 确保目录存在
  await ensureDir(storageDir)

  // 生成唯一文件名（添加时间戳防止重名）
  const ext = path.extname(filename)
  const basename = path.basename(filename, ext)
  const timestamp = Date.now()
  const uniqueFilename = `${basename}_${timestamp}${ext}`

  // 文件路径
  const filePath = path.join(storageDir, uniqueFilename)

  // 保存文件
  await fs.writeFile(filePath, buffer)

  // 返回相对路径
  const relativePath = `/uploads/${userId}/${fileType}/${uniqueFilename}`

  return {
    path: relativePath,
    type: fileType,
    size: buffer.length,
  }
}

// 删除文件
export async function deleteFile(filePath: string): Promise<void> {
  const absolutePath = path.join(process.cwd(), filePath.replace(/^\/uploads/, 'uploads'))

  try {
    await fs.unlink(absolutePath)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err
    }
  }
}

// 删除文件夹及其内容
export async function deleteDir(dirPath: string): Promise<void> {
  const absolutePath = path.join(process.cwd(), dirPath.replace(/^\/uploads/, 'uploads'))

  try {
    await fs.rm(absolutePath, { recursive: true, force: true })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err
    }
  }
}

// 检查文件是否存在
export async function fileExists(filePath: string): Promise<boolean> {
  const absolutePath = path.join(process.cwd(), filePath.replace(/^\/uploads/, 'uploads'))

  try {
    const stats = await fs.stat(absolutePath)
    return stats.isFile()
  } catch {
    return false
  }
}

// 读取文件
export async function readFile(filePath: string): Promise<Buffer> {
  const absolutePath = path.join(process.cwd(), filePath.replace(/^\/uploads/, 'uploads'))

  return await fs.readFile(absolutePath)
}

// 创建文件流
export function createReadStream(filePath: string): fsSync.ReadStream {
  const absolutePath = path.join(process.cwd(), filePath.replace(/^\/uploads/, 'uploads'))

  return fsSync.createReadStream(absolutePath)
}

// 获取文件统计信息
export async function getFileStats(filePath: string): Promise<{ size: number; mtime: Date }> {
  const absolutePath = path.join(process.cwd(), filePath.replace(/^\/uploads/, 'uploads'))

  const stats = await fs.stat(absolutePath)
  return {
    size: stats.size,
    mtime: stats.mtime,
  }
}

// 验证文件名
export function validateFilename(name: string): boolean {
  // 不能为空
  if (!name || name.trim() === '') {
    return false
  }

  // 不能包含特殊字符
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
  if (invalidChars.test(name)) {
    return false
  }

  // 长度限制
  if (name.length > 255) {
    return false
  }

  return true
}

// 重命名物理文件
export async function renameFile(oldPath: string, newFilename: string, userId: number): Promise<string> {
  const absoluteOldPath = path.join(process.cwd(), oldPath.replace(/^\/uploads/, 'uploads'))

  // 获取文件类型和扩展名
  const ext = path.extname(oldPath)
  const fileType = path.basename(path.dirname(absoluteOldPath))

  // 生成新文件名
  const timestamp = Date.now()
  const uniqueFilename = `${newFilename}${ext}`

  // 新路径
  const storageDir = path.join(UPLOAD_DIR, String(userId), fileType)
  const absoluteNewPath = path.join(storageDir, uniqueFilename)

  // 重命名
  await fs.rename(absoluteOldPath, absoluteNewPath)

  // 返回新的相对路径
  return `/uploads/${userId}/${fileType}/${uniqueFilename}`
}