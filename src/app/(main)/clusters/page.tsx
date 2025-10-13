// FluLink v4.0 星团共鸣页面

'use client'

import React from 'react'
import { TopNav, BottomNav } from '@/components/navigation'
import { StarClusterView } from '@/components/star-clusters/star-cluster-view'
import { User, StarCluster } from '@/lib/pocketbase'

interface ClustersPageProps {
  currentUser: User
  onPageChange: (page: string) => void
  onClusterClick: (cluster: StarCluster) => void
  onJoinCluster: (clusterId: string) => void
  onLeaveCluster: (clusterId: string) => void
}

export const ClustersPage: React.FC<ClustersPageProps> = ({
  currentUser,
  onPageChange,
  onClusterClick,
  onJoinCluster,
  onLeaveCluster
}) => {
  return (
    <div className="min-h-screen bg-primary-bg">
      {/* 顶部导航 */}
      <TopNav
        title="星团共鸣"
        user={currentUser}
        onMenuClick={() => onPageChange('home')}
        onProfileClick={() => onPageChange('profile')}
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
      <BottomNav
        currentPage="clusters"
        onPageChange={onPageChange}
      />
    </div>
  )
}
