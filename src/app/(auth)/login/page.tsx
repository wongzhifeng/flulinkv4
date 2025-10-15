// FluLink v4.0 登录页面

'use client'

import React, { useState } from 'react'
import { Button, Input, Card, Loading } from '@/components/ui'
import { cn, isValidEmail, validatePassword } from '@/lib/utils'
import { api } from '@/lib/pocketbase'

interface LoginPageProps {
  onLoginSuccess: (user: any) => void
  onSwitchToRegister: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSwitchToRegister
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = '请输入邮箱'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsLoading(true)
      const user = await api.login(formData.email, formData.password)
      onLoginSuccess(user)
    } catch (error: any) {
      console.error('登录失败:', error)
      setErrors({ 
        general: error.message || '登录失败，请检查邮箱和密码' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text-gold mb-2">
            FluLink
          </h1>
          <p className="text-text-secondary">
            星尘共鸣版 v4.0
          </p>
        </div>

        {/* 登录表单 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
              登录账户
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 邮箱输入 */}
              <Input
                label="邮箱"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="请输入邮箱地址"
                icon={<i className="fas fa-envelope"></i>}
                disabled={isLoading}
              />

              {/* 密码输入 */}
              <Input
                label="密码"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                placeholder="请输入密码"
                icon={<i className="fas fa-lock"></i>}
                disabled={isLoading}
              />

              {/* 通用错误提示 */}
              {errors.general && (
                <div className="text-accent-red text-sm text-center">
                  {errors.general}
                </div>
              )}

              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loading size="sm" />
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    登录
                  </>
                )}
              </Button>
            </form>

            {/* 注册链接 */}
            <div className="mt-6 text-center">
              <p className="text-text-secondary text-sm">
                还没有账户？
                <button
                  onClick={onSwitchToRegister}
                  className="text-accent-gold hover:text-accent-cyan transition-colors ml-1"
                >
                  立即注册
                </button>
              </p>
            </div>
          </div>
        </Card>

        {/* 特色介绍 */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-2">
              <i className="fas fa-star text-accent-gold"></i>
            </div>
            <div className="text-sm text-text-secondary">
              星空图谱
            </div>
          </div>
          <div>
            <div className="text-2xl mb-2">
              <i className="fas fa-robot text-accent-cyan"></i>
            </div>
            <div className="text-sm text-text-secondary">
              AI 创作
            </div>
          </div>
          <div>
            <div className="text-2xl mb-2">
              <i className="fas fa-users text-accent-purple"></i>
            </div>
            <div className="text-sm text-text-secondary">
              星团共鸣
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// App Router 页面组件默认导出
export const metadata = { title: '登录 - FluLink' }

export default function Page() {
  const handleSuccess = (_user: any) => {
    // 登录成功后可在此进行路由跳转或状态更新
  }
  const handleSwitch = () => {
    // 切换到注册页的逻辑，可使用路由跳转
  }
  return <LoginPage onLoginSuccess={handleSuccess} onSwitchToRegister={handleSwitch} />
}
