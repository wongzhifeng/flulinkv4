// FluLink v4.0 用户档案页面

'use client'

import React from 'react'
import { TopNav, BottomNav } from '@/components/navigation'
import { UserProfile } from '@/components/user-profile/user-profile'
import { pb, type User } from '@/lib/pocketbase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const currentUser = (pb.authStore.model || {}) as unknown as User
  
  const onUpdateProfile = async (updates: Partial<User>) => {
    // TODO: 实现用户资料更新
    console.log('更新用户资料:', updates)
  }
  
  const onLogout = () => {
    pb.authStore.clear()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* 顶部导航 */}
      <TopNav
        title="个人档案"
        user={currentUser}
        onMenuClick={() => router.push('/')}
        onProfileClick={() => router.push('/profile')}
      />

      {/* 主内容区域 */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <UserProfile
            currentUser={currentUser}
            onUpdateProfile={onUpdateProfile}
            onLogout={onLogout}
          />
        </div>
      </main>

      {/* 底部导航 */}
      <BottomNav
        currentPage="profile"
        onPageChange={(page) => router.push(page === 'home' ? '/' : `/${page}`)}
      />
    </div>
  )
}
