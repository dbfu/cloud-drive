// App 主组件
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './shared/components'
import { LoginPage, RegisterPage } from './modules/auth'
import { FileManagerPage } from './modules/file'
import { useAuthStore } from './shared/store/auth-store'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 受保护路由 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <FileManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/files/*"
        element={
          <ProtectedRoute>
            <FileManagerPage />
          </ProtectedRoute>
        }
      />

      {/* 默认重定向 */}
      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App