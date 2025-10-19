// FluLink v4.0 根页面组件 - 修复预渲染问题

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  
  useEffect(() => {
    // 客户端重定向到主页面，避免预渲染问题
    router.push('/(main)')
  }, [router])
  
  // 返回简单的加载状态
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold mx-auto mb-4"></div>
        <p className="text-text-secondary">正在加载...</p>
      </div>
    </div>
  )
}
