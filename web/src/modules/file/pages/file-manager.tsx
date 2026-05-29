// 文件管理页面
import { useState, useEffect, useRef } from 'react'
import { Layout, Button, Modal, Input, LoadingSkeleton } from '../../../shared/components'
import { useFile } from '../hooks/use-file'
import { FileItem } from '../components/file-item'
import { Breadcrumb } from '../components/breadcrumb'
import { FilePreviewModal } from '../components/file-preview-modal'
import type { FileItem as FileItemType } from '../../../shared/types'

export function FileManagerPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery] = useState('')
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileItemType | null>(null)
  const [previewFile, setPreviewFile] = useState<FileItemType | null>(null)
  const [folderName, setFolderName] = useState('')
  const [newName, setNewName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    files,
    breadcrumb,
    loading,
    error,
    fetchFiles,
    uploadFile,
    createFolder,
    deleteFile,
    renameFile,
    enterFolder,
    navigateToBreadcrumb,
  } = useFile()

  // 初始加载文件列表
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  // 创建文件夹
  const handleCreateFolder = async () => {
    if (!folderName.trim()) return
    const success = await createFolder({ name: folderName.trim(), parentId: breadcrumb[breadcrumb.length - 1]?.id || null })
    if (success) {
      setShowCreateFolderModal(false)
      setFolderName('')
    }
  }

  // 上传文件
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    for (const file of Array.from(fileList)) {
      await uploadFile(file, breadcrumb[breadcrumb.length - 1]?.id || null)
    }
    setShowUploadZone(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 处理拖拽上传
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setShowUploadZone(false)
    const droppedFiles = e.dataTransfer.files
    if (!droppedFiles || droppedFiles.length === 0) return

    for (const file of Array.from(droppedFiles)) {
      await uploadFile(file, breadcrumb[breadcrumb.length - 1]?.id || null)
    }
  }

  // 处理文件点击
  const handleFileClick = (file: FileItemType) => {
    if (file.type === 'folder') {
      enterFolder(file)
    } else {
      setPreviewFile(file)
    }
  }

  // 打开重命名模态框
  const handleOpenRename = (file: FileItemType) => {
    setSelectedFile(file)
    setNewName(file.name)
    setShowRenameModal(true)
  }

  // 执行重命名
  const handleRename = async () => {
    if (!selectedFile || !newName.trim()) return
    const success = await renameFile(selectedFile.id, { name: newName.trim() })
    if (success) {
      setShowRenameModal(false)
      setSelectedFile(null)
      setNewName('')
    }
  }

  // 打开删除模态框
  const handleOpenDelete = (file: FileItemType) => {
    setSelectedFile(file)
    setShowDeleteModal(true)
  }

  // 执行删除
  const handleDelete = async () => {
    if (!selectedFile) return
    const success = await deleteFile(selectedFile.id)
    if (success) {
      setShowDeleteModal(false)
      setSelectedFile(null)
    }
  }

  // 过滤文件
  const filteredFiles = searchQuery
    ? files.filter((f: FileItemType) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files

  return (
    <Layout>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb items={breadcrumb} onNavigate={navigateToBreadcrumb} />

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600/10 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
              aria-label="网格视图"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600/10 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
              aria-label="列表视图"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Upload Button */}
          <Button onClick={() => setShowUploadZone(!showUploadZone)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="hidden sm:inline">上传</span>
          </Button>

          {/* Create Folder Button */}
          <Button variant="secondary" onClick={() => setShowCreateFolderModal(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">新建文件夹</span>
          </Button>
        </div>
      </div>

      {/* Upload Zone */}
      {showUploadZone && (
        <div
          className="mb-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-600 hover:bg-blue-600/5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-semibold text-gray-900 mb-2">拖拽文件到这里上传</p>
          <p className="text-sm text-gray-500">或点击选择文件</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={handleUpload}
          />
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredFiles.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-24 h-24 mx-auto mb-6 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无文件</h3>
          <p className="text-gray-500 mb-6">点击上传按钮或拖拽文件到这里开始上传</p>
          <Button onClick={() => setShowUploadZone(true)}>上传文件</Button>
        </div>
      )}

      {/* File Grid/List View */}
      {!loading && filteredFiles.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFiles.map((file: FileItemType) => (
                <FileItem
                  key={file.id}
                  file={file}
                  onClick={() => handleFileClick(file)}
                  onRename={() => handleOpenRename(file)}
                  onDelete={() => handleOpenDelete(file)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xl rounded-lg border border-white/30 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">名称</th>
                    <th className="px-4 py-3 hidden sm:table-cell">大小</th>
                    <th className="px-4 py-3 hidden md:table-cell">修改日期</th>
                    <th className="px-4 py-3 w-24">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFiles.map((file: FileItemType) => (
                    <tr
                      key={file.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleFileClick(file)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileItem file={file} showActions={false} />
                          <span className="font-medium text-gray-900">{file.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-500">
                        {file.type === 'folder' ? '文件夹' : formatFileSize(file.size)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                        {formatDate(file.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              handleOpenRename(file)
                            }}
                            className="p-2 rounded hover:bg-gray-100"
                            aria-label="重命名"
                          >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation()
                              handleOpenDelete(file)
                            }}
                            className="p-2 rounded hover:bg-red-50"
                            aria-label="删除"
                          >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create Folder Modal */}
      <Modal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        title="新建文件夹"
      >
        <Input
          label="文件夹名称"
          value={folderName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFolderName(e.target.value)}
          placeholder="请输入文件夹名称"
        />
        <div className="flex items-center gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => setShowCreateFolderModal(false)}>
            取消
          </Button>
          <Button onClick={handleCreateFolder} loading={loading}>
            创建
          </Button>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="重命名"
      >
        <Input
          label="新名称"
          value={newName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)}
          placeholder="请输入新名称"
        />
        <div className="flex items-center gap-3 justify-end mt-6">
          <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
            取消
          </Button>
          <Button onClick={handleRename} loading={loading}>
            确定
          </Button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900">确认删除</p>
            <p className="text-sm text-gray-500">此操作无法撤销</p>
          </div>
        </div>
        <p className="text-gray-500 mb-6">
          确定要删除 "{selectedFile?.name}" 吗？
        </p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            删除
          </Button>
        </div>
      </Modal>

      {/* Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </Layout>
  )
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN')
}