// FluLink v4.0 主页面组件

'use client'

import React, { useState, useEffect } from 'react'
import { TopNav, BottomNav, Sidebar } from '@/components/navigation'
import { Card, Loading } from '@/components/ui/index'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState({ username: '用户', avatar: '' })

  useEffect(() => {
    // 模拟用户数据加载
    const timer = setTimeout(() => {
      setCurrentUser({ username: 'FluLink 用户', avatar: '' })
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleMenuClick = () => {
    setSidebarOpen(true)
  }

  const handleProfileClick = () => router.push('/profile')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* 顶部导航 */}
      <TopNav
        title="FluLink"
        user={{ name: currentUser.username, avatar: currentUser.avatar }}
        onMenuClick={handleMenuClick}
        onProfileClick={handleProfileClick}
      />

      {/* 侧边栏 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage="home"
        onPageChange={(page) => router.push(page === 'home' ? '/' : `/${page}`)}
      />

      {/* 主内容区域 */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto">
          {/* 欢迎信息 */}
          <Card className="mb-6">
            <div className="p-4">
              <h1 className="text-xl font-bold gradient-text-gold mb-2">
                欢迎回来，{currentUser.username}！
              </h1>
              <p className="text-text-secondary text-sm">
                探索星空中的新星种，发现与你共鸣的内容
              </p>
            </div>
          </Card>

          {/* 快速操作 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="cursor-pointer hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="p-4 text-center">
                <div className="text-2xl mb-2">
                  <i className="fas fa-plus-circle text-accent-gold"></i>
                </div>
                <div className="text-sm font-medium text-text-primary">
                  创建星种
                </div>
              </div>
            </Card>
            
            <Card className="cursor-pointer hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="p-4 text-center">
                <div className="text-2xl mb-2">
                  <i className="fas fa-users text-accent-purple"></i>
                </div>
                <div className="text-sm font-medium text-text-primary">
                  星团共鸣
                </div>
              </div>
            </Card>
          </div>

          {/* 今日推荐 */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                <i className="fas fa-fire mr-2 text-accent-red"></i>
                今日热门
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 bg-primary-secondary rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-accent-gold"></div>
                    <div className="flex-1">
                      <div className="text-text-primary font-medium text-sm mb-1">
                        热门星种 #{item}
                      </div>
                      <div className="text-xs text-text-secondary">
                        <i className="fas fa-heart mr-1"></i>
                        {Math.floor(Math.random() * 500) + 100} 共鸣
                      </div>
                    </div>
                    <div className="text-xs text-accent-gold font-bold">
                      {Math.floor(Math.random() * 30) + 70}°C
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* 底部导航 */}
      <BottomNav
        currentPage="home"
        onPageChange={(page) => router.push(page === 'home' ? '/' : `/${page}`)}
      />
    </div>
  )
}
