// FluLink v4.0 主应用组件

'use client'

import React, { useState, useEffect } from 'react'
import { HomePage } from './page'
import { CreatePage } from './create/page'
import { ClustersPage } from './clusters/page'
import { ProfilePage } from './profile/page'
import { Loading } from '@/components/ui'
import { User, StarSeed, StarCluster } from '@/lib/pocketbase'
import { api } from '@/lib/pocketbase'

interface MainAppProps {
  currentUser: User
}

export const MainApp: React.FC<MainAppProps> = ({ currentUser }) => {
  const [currentPage, setCurrentPage] = useState('home')
  const [isLoading, setIsLoading] = useState(false)

  // 处理页面切换
  const handlePageChange = (page: string) => {
    setCurrentPage(page)
  }

  // 处理星种创建
  const handleSeedCreated = async (seed: StarSeed) => {
    try {
      setIsLoading(true)
      // TODO: 调用 PocketBase API 创建星种
      console.log('星种创建成功:', seed)
    } catch (error) {
      console.error('星种创建失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理星团点击
  const handleClusterClick = (cluster: StarCluster) => {
    console.log('星团点击:', cluster)
  }

  // 处理加入星团
  const handleJoinCluster = async (clusterId: string) => {
    try {
      setIsLoading(true)
      // TODO: 调用 PocketBase API 加入星团
      console.log('加入星团:', clusterId)
    } catch (error) {
      console.error('加入星团失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理离开星团
  const handleLeaveCluster = async (clusterId: string) => {
    try {
      setIsLoading(true)
      // TODO: 调用 PocketBase API 离开星团
      console.log('离开星团:', clusterId)
    } catch (error) {
      console.error('离开星团失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理用户档案更新
  const handleUpdateProfile = async (updates: Partial<User>) => {
    try {
      setIsLoading(true)
      // TODO: 调用 PocketBase API 更新用户档案
      console.log('更新用户档案:', updates)
    } catch (error) {
      console.error('更新用户档案失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理用户登出
  const handleLogout = async () => {
    try {
      setIsLoading(true)
      // TODO: 调用 PocketBase API 登出
      console.log('用户登出')
      // 重定向到登录页面
      window.location.href = '/login'
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 渲染当前页面
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            currentUser={currentUser}
            onPageChange={handlePageChange}
          />
        )
      case 'create':
        return (
          <CreatePage
            currentUser={currentUser}
            onPageChange={handlePageChange}
            onSeedCreated={handleSeedCreated}
          />
        )
      case 'clusters':
        return (
          <ClustersPage
            currentUser={currentUser}
            onPageChange={handlePageChange}
            onClusterClick={handleClusterClick}
            onJoinCluster={handleJoinCluster}
            onLeaveCluster={handleLeaveCluster}
          />
        )
      case 'profile':
        return (
          <ProfilePage
            currentUser={currentUser}
            onPageChange={handlePageChange}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        )
      default:
        return (
          <HomePage
            currentUser={currentUser}
            onPageChange={handlePageChange}
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <Loading text="加载中..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      {renderCurrentPage()}
    </div>
  )
}
