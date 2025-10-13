// FluLink v4.0 根页面组件

'use client'

import React, { useState, useEffect } from 'react'
import { MainApp } from './(main)/layout'
import { Loading } from '@/components/ui'
import { User } from '@/lib/pocketbase'
import { api } from '@/lib/pocketbase'

export default function RootPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 检查用户是否已登录
        const user = await api.getCurrentUser()
        if (user) {
          setCurrentUser(user)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('认证检查失败:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" />
          <p className="text-text-secondary mt-4">FluLink 正在启动...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    // 重定向到登录页面
    window.location.href = '/login'
    return null
  }

  return <MainApp currentUser={currentUser} />
}
