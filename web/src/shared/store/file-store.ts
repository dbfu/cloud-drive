// 文件状态管理
import { create } from 'zustand'
import type { FileItem } from '../types'

interface FileState {
  files: FileItem[]
  currentFolderId: number | null
  isLoading: boolean
  breadcrumb: { id: number | null; name: string }[]
  setFiles: (files: FileItem[]) => void
  setCurrentFolder: (folderId: number | null, folderName?: string) => void
  setLoading: (loading: boolean) => void
  addFile: (file: FileItem) => void
  removeFile: (id: number) => void
  updateFile: (id: number, updates: Partial<FileItem>) => void
  pushBreadcrumb: (folder: { id: number | null; name: string }) => void
  popBreadcrumb: () => void
  resetBreadcrumb: () => void
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  currentFolderId: null,
  isLoading: false,
  breadcrumb: [{ id: null, name: '根目录' }],
  setFiles: (files) => set({ files }),
  setCurrentFolder: (folderId, _folderName = '根目录') =>
    set({ currentFolderId: folderId }),
  setLoading: (loading) => set({ isLoading: loading }),
  addFile: (file) =>
    set((state) => ({ files: [...state.files, file] })),
  removeFile: (id) =>
    set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  pushBreadcrumb: (folder) =>
    set((state) => ({ breadcrumb: [...state.breadcrumb, folder] })),
  popBreadcrumb: () =>
    set((state) => ({
      breadcrumb: state.breadcrumb.slice(0, -1),
    })),
  resetBreadcrumb: () =>
    set({ breadcrumb: [{ id: null, name: '根目录' }] }),
}))