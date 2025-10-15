// FluLink v4.0 根页面组件

'use client'

import React, { useState, useEffect } from 'react'
import { Loading } from '@/components/ui/index'
import { pb, type User } from '@/lib/pocketbase'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 检查用户是否已登录
        const user = pb.authStore.model as User | null
        if (user) {
          setCurrentUser(user)
        } else {
          // 重定向到登录页面
          router.push('/login')
        }
      } catch (error) {
        console.error('认证检查失败:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

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

  if (!currentUser) {
    return null
  }

  // 重定向到主页面
  router.push('/')
  return null
}
