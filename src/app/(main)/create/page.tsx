// FluLink v4.0 星种创建页面

'use client'

import React from 'react'
import { TopNav, BottomNav } from '@/components/navigation'
import { AISeedCreator } from '@/components/seed-creator/ai-seed-creator'
import { pb, type User, type StarSeed } from '@/lib/pocketbase'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const router = useRouter()
  const currentUser = (pb.authStore.model || {}) as unknown as User
  const handleSeedCreated = (_seed: StarSeed) => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* 顶部导航 */}
      <TopNav
        title="创建星种"
        user={currentUser}
        onMenuClick={() => router.push('/')}
        onProfileClick={() => router.push('/profile')}
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
      <BottomNav currentPage="create" onPageChange={(page) => router.push(page === 'home' ? '/' : `/${page}`)} />
    </div>
  )
}
