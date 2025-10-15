// FluLink v4.0 根页面组件

'use client'

import React, { useState, useEffect } from 'react'
import { Loading } from '@/components/ui/index'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 简单的重定向逻辑，避免在服务端渲染时访问浏览器 API
    const timer = setTimeout(() => {
      setIsLoading(false)
      // 重定向到主页面
      router.push('/')
    }, 1000)

    return () => clearTimeout(timer)
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

  return null
}
