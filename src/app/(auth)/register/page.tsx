// FluLink v4.0 注册页面

'use client'

import React, { useState } from 'react'
import { Button, Input, Card, Loading } from '@/components/ui'
import { cn, isValidEmail, validatePassword } from '@/lib/utils'
import { api } from '@/lib/pocketbase'

interface RegisterPageProps {
  onRegisterSuccess: (user: any) => void
  onSwitchToLogin: () => void
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onSwitchToLogin
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (!formData.username) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 2) {
      newErrors.username = '用户名至少2个字符'
    }

    if (!formData.email) {
      newErrors.email = '请输入邮箱'
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsLoading(true)
      const user = await api.register(formData.username, formData.email, formData.password)
      onRegisterSuccess(user)
    } catch (error: any) {
      console.error('注册失败:', error)
      setErrors({ 
        general: error.message || '注册失败，请稍后再试' 
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

        {/* 注册表单 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
              创建账户
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 用户名输入 */}
              <Input
                label="用户名"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                error={errors.username}
                placeholder="请输入用户名"
                icon={<i className="fas fa-user"></i>}
                disabled={isLoading}
              />

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

              {/* 确认密码输入 */}
              <Input
                label="确认密码"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="请再次输入密码"
                icon={<i className="fas fa-lock"></i>}
                disabled={isLoading}
              />

              {/* 通用错误提示 */}
              {errors.general && (
                <div className="text-accent-red text-sm text-center">
                  {errors.general}
                </div>
              )}

              {/* 注册按钮 */}
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
                    <i className="fas fa-user-plus mr-2"></i>
                    注册
                  </>
                )}
              </Button>
            </form>

            {/* 登录链接 */}
            <div className="mt-6 text-center">
              <p className="text-text-secondary text-sm">
                已有账户？
                <button
                  onClick={onSwitchToLogin}
                  className="text-accent-gold hover:text-accent-cyan transition-colors ml-1"
                >
                  立即登录
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
