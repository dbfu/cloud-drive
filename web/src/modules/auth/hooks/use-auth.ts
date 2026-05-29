// 认证 Hook
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../shared/store/auth-store'
import { authApi } from '../../../shared/services/api'
import type { User } from '../../../shared/types'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser, isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const login = async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.login(username, password)
      if (response.code === 0) {
        setUser(response.data.user, response.data.token)
        navigate('/')
        return true
      } else {
        setError(response.message)
        return false
      }
    } catch (err) {
      setError('登录失败，请稍后重试')
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.register(username, password)
      if (response.code === 0) {
        return true
      } else {
        setError(response.message)
        return false
      }
    } catch (err) {
      setError('注册失败，请稍后重试')
      return false
    } finally {
      setLoading(false)
    }
  }

  const checkAuth = async () => {
    if (!isAuthenticated) return false
    try {
      const response = await authApi.me()
      if (response.code === 0) {
        setUser(response.data as User, useAuthStore.getState().token || '')
        return true
      }
      return false
    } catch {
      return false
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return {
    loading,
    error,
    login,
    register,
    checkAuth,
    logout: handleLogout,
    isAuthenticated,
    user,
    clearError: () => setError(null),
  }
}