// FluLink v4.0 星团共鸣页面

'use client'

import React from 'react'
import { TopNav, BottomNav } from '@/components/navigation'
import { StarClusterView } from '@/components/star-clusters/star-cluster-view'
import { pb, type User, type StarCluster } from '@/lib/pocketbase'
import { useRouter } from 'next/navigation'

export default function ClustersPage() {
  const router = useRouter()
  const currentUser = (pb.authStore.model || {}) as unknown as User
  const onClusterClick = (_cluster: StarCluster) => {}
  const onJoinCluster = (_clusterId: string) => {}
  const onLeaveCluster = (_clusterId: string) => {}
  return (
    <div className="min-h-screen bg-primary-bg">
      {/* 顶部导航 */}
      <TopNav
        title="星团共鸣"
        user={currentUser}
        onMenuClick={() => router.push('/')}
        onProfileClick={() => router.push('/profile')}
      />

      {/* 主内容区域 */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <StarClusterView
            currentUser={currentUser}
            onClusterClick={onClusterClick}
            onJoinCluster={onJoinCluster}
            onLeaveCluster={onLeaveCluster}
          />
        </div>
      </main>

      {/* 底部导航 */}
      <BottomNav currentPage="clusters" onPageChange={(page) => router.push(page === 'home' ? '/' : `/${page}`)} />
    </div>
  )
}
