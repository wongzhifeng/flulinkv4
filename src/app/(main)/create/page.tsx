// FluLink v4.0 星种创建页面

'use client'

import React from 'react'
import { TopNav, BottomNav } from '@/components/navigation'
import { AISeedCreator } from '@/components/seed-creator/ai-seed-creator'
import { User, StarSeed } from '@/lib/pocketbase'

interface CreatePageProps {
  currentUser: User
  onPageChange: (page: string) => void
  onSeedCreated: (seed: StarSeed) => void
}

export const CreatePage: React.FC<CreatePageProps> = ({
  currentUser,
  onPageChange,
  onSeedCreated
}) => {
  const handleSeedCreated = (seed: StarSeed) => {
    onSeedCreated(seed)
    // 创建成功后跳转到首页
    onPageChange('home')
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* 顶部导航 */}
      <TopNav
        title="创建星种"
        user={currentUser}
        onMenuClick={() => onPageChange('home')}
        onProfileClick={() => onPageChange('profile')}
      />

      {/* 主内容区域 */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto h-[calc(100vh-8rem)]">
          <AISeedCreator
            currentUser={currentUser}
            onSeedCreated={handleSeedCreated}
            className="h-full"
          />
        </div>
      </main>

      {/* 底部导航 */}
      <BottomNav
        currentPage="create"
        onPageChange={onPageChange}
      />
    </div>
  )
}
