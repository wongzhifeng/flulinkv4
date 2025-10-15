// FluLink v4.0 用户档案页面

'use client'

import React from 'react'
import { TopNav, BottomNav } from '@/components/navigation'
import { UserProfile } from '@/components/user-profile/user-profile'
import { User } from '@/lib/pocketbase'

interface ProfilePageProps {
  currentUser: User
  onPageChange: (page: string) => void
  onUpdateProfile: (updates: Partial<User>) => Promise<void>
  onLogout: () => void
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onPageChange,
  onUpdateProfile,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-primary-bg">
      {/* 顶部导航 */}
      <TopNav
        title="个人档案"
        user={currentUser}
        onMenuClick={() => onPageChange('home')}
        onProfileClick={() => onPageChange('profile')}
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
        onPageChange={onPageChange}
      />
    </div>
  )
}

export default function PageWrapper(props: ProfilePageProps) {
  return <ProfilePage {...props} />
}
