// 文件管理 Hook
import { useState, useCallback } from 'react'
import { useFileStore } from '../../../shared/store/file-store'
import { fileApi } from '../../../shared/services/api'
import type { FileItem, FileListParams, CreateFolderParams, RenameParams, MoveParams } from '../../../shared/types'

export function useFile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    files,
    currentFolderId,
    breadcrumb,
    setFiles,
    setCurrentFolder,
    addFile,
    removeFile,
    updateFile,
    pushBreadcrumb,
    popBreadcrumb,
    resetBreadcrumb,
  } = useFileStore()

  // 获取文件列表
  const fetchFiles = useCallback(async (params?: FileListParams) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fileApi.list(params)
      if (response.code === 0) {
        setFiles(response.data.list)
        setCurrentFolder(params?.parentId || null)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError('获取文件列表失败')
    } finally {
      setLoading(false)
    }
  }, [setFiles, setCurrentFolder])

  // 上传文件
  const uploadFile = useCallback(async (file: File, parentId?: number | null) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fileApi.upload(file, parentId)
      if (response.code === 0) {
        addFile(response.data)
        return true
      } else {
        setError(response.message)
        return false
      }
    } catch (err) {
      setError('上传失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [addFile])

  // 创建文件夹
  const createFolder = useCallback(async (params: CreateFolderParams) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fileApi.createFolder(params)
      if (response.code === 0) {
        addFile(response.data)
        return true
      } else {
        setError(response.message)
        return false
      }
    } catch (err) {
      setError('创建文件夹失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [addFile])

  // 删除文件
  const deleteFile = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fileApi.delete(id)
      if (response.code === 0) {
        removeFile(id)
        return true
      } else {
        setError(response.message)
        return false
      }
    } catch (err) {
      setError('删除失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [removeFile])

  // 重命名
  const renameFile = useCallback(async (id: number, params: RenameParams) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fileApi.rename(id, params)
      if (response.code === 0) {
        updateFile(id, { name: params.name })
        return true
      } else {
        setError(response.message)
        return false
      }
    } catch (err) {
      setError('重命名失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [updateFile])

  // 移动文件
  const moveFile = useCallback(async (id: number, params: MoveParams) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fileApi.move(id, params)
      if (response.code === 0) {
        removeFile(id)
        return true
      } else {
        setError(response.message)
        return false
      }
    } catch (err) {
      setError('移动失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [removeFile])

  // 进入文件夹
  const enterFolder = useCallback((folder: FileItem) => {
    pushBreadcrumb({ id: folder.id, name: folder.name })
    fetchFiles({ parentId: folder.id })
  }, [pushBreadcrumb, fetchFiles])

  // 返回上级目录
  const goBack = useCallback(() => {
    popBreadcrumb()
    const newBreadcrumb = useFileStore.getState().breadcrumb
    const parentFolder = newBreadcrumb[newBreadcrumb.length - 1]
    fetchFiles({ parentId: parentFolder.id })
  }, [popBreadcrumb, fetchFiles])

  // 导航到面包屑位置
  const navigateToBreadcrumb = useCallback((index: number) => {
    const target = breadcrumb[index]
    const newBreadcrumb = breadcrumb.slice(0, index + 1)
    useFileStore.setState({ breadcrumb: newBreadcrumb })
    fetchFiles({ parentId: target.id })
  }, [breadcrumb, fetchFiles])

  return {
    files,
    currentFolderId,
    breadcrumb,
    loading,
    error,
    fetchFiles,
    uploadFile,
    createFolder,
    deleteFile,
    renameFile,
    moveFile,
    enterFolder,
    goBack,
    navigateToBreadcrumb,
    resetBreadcrumb,
    clearError: () => setError(null),
  }
}