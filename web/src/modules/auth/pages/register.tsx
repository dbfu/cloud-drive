// 注册页面
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Button, Input } from '../../../shared/components'

export function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const { loading, error, register, clearError } = useAuth()
  const navigate = useNavigate()

  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setUsernameError('用户名不能为空')
      return false
    }
    if (value.length < 3) {
      setUsernameError('用户名至少需要3个字符')
      return false
    }
    if (value.length > 50) {
      setUsernameError('用户名不能超过50个字符')
      return false
    }
    if (!/^[a-zA-Z0-9_一-龥]+$/.test(value)) {
      setUsernameError('用户名只能包含字母、数字、下划线和中文')
      return false
    }
    setUsernameError('')
    return true
  }

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('密码不能为空')
      return false
    }
    if (value.length < 6) {
      setPasswordError('密码至少需要6个字符')
      return false
    }
    if (value.length > 100) {
      setPasswordError('密码不能超过100个字符')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateConfirmPassword = (value: string): boolean => {
    if (!value) {
      setConfirmError('请确认密码')
      return false
    }
    if (password !== value) {
      setConfirmError('两次输入的密码不一致')
      return false
    }
    setConfirmError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const usernameValid = validateUsername(username)
    const passwordValid = validatePassword(password)
    const confirmValid = validateConfirmPassword(confirmPassword)

    if (!usernameValid || !passwordValid || !confirmValid) return

    const success = await register(username.trim(), password)
    if (success) {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-600 to-indigo-600">
      {/* Glass Card */}
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/10 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">注册</h1>
            <p className="text-gray-500 text-sm sm:text-base">创建您的云盘账户</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="用户名"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => validateUsername(username)}
              error={usernameError}
              placeholder="请输入用户名 (3-50字符)"
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="密码"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validatePassword(password)}
                error={passwordError}
                placeholder="请输入密码 (至少6字符)"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] p-1 rounded hover:bg-gray-100"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.292 4.292M3 3l18 18" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            <Input
              label="确认密码"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              error={confirmError}
              placeholder="请再次输入密码"
              autoComplete="new-password"
            />

            <Button type="submit" loading={loading} className="w-full">
              注册
            </Button>
          </form>

          {/* Toggle Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              已有账户?
              <Link to="/login" className="ml-2 text-blue-600 hover:text-blue-700 font-medium">
                登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}