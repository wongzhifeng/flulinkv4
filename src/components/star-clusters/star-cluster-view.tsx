// FluLink v4.0 星团共鸣组件

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Button, Loading, Tag, Avatar } from '@/components/ui'
import { cn, formatDate, formatNumber, calculateDistance } from '@/lib/utils'
import { StarCluster, User, StarSeed } from '@/lib/pocketbase'
import { useVectorDB } from '@/lib/vector-db'

interface ClusterMember extends User {
  resonanceScore: number
  lastActive: string
  contribution: number
}

interface StarClusterViewProps {
  currentUser: User
  onClusterClick: (cluster: StarCluster) => void
  onJoinCluster: (clusterId: string) => void
  onLeaveCluster: (clusterId: string) => void
  className?: string
}

export const StarClusterView: React.FC<StarClusterViewProps> = ({
  currentUser,
  onClusterClick,
  onJoinCluster,
  onLeaveCluster,
  className
}) => {
  const [clusters, setClusters] = useState<StarCluster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCluster, setSelectedCluster] = useState<StarCluster | null>(null)
  const [viewMode, setViewMode] = useState<'nearby' | 'active' | 'compatible'>('nearby')
  const [clusterMembers, setClusterMembers] = useState<ClusterMember[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)

  const vectorDB = useVectorDB()

  // 获取星团数据
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setIsLoading(true)
        // TODO: 从 PocketBase 获取星团数据
        const mockClusters: StarCluster[] = [
          {
            id: '1',
            members: ['user1', 'user2', 'user3', 'user4', 'user5'],
            core_users: ['user1', 'user2'],
            resonance_score: 85,
            geographic_center: { lat: 39.9042, lng: 116.4074 },
            activity_level: 92,
            spectral_diversity: { topics: ['生活', '科技', '艺术'], count: 3 },
            expiration_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            cluster_vector: [0.1, 0.2, 0.3, 0.4, 0.5],
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          },
          {
            id: '2',
            members: ['user6', 'user7', 'user8', 'user9'],
            core_users: ['user6', 'user7'],
            resonance_score: 78,
            geographic_center: { lat: 39.9142, lng: 116.4174 },
            activity_level: 88,
            spectral_diversity: { topics: ['摄影', '旅行', '美食'], count: 3 },
            expiration_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            cluster_vector: [0.2, 0.3, 0.4, 0.5, 0.6],
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          }
        ]
        setClusters(mockClusters)
      } catch (error) {
        console.error('获取星团数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClusters()
  }, [])

  // 获取星团成员
  const fetchClusterMembers = useCallback(async (clusterId: string) => {
    setIsLoadingMembers(true)
    try {
      // TODO: 从 PocketBase 获取星团成员数据
      const mockMembers: ClusterMember[] = [
        {
          id: 'user1',
          username: '星空探索者',
          email: 'user1@example.com',
          avatar: '',
          location: { lat: 39.9042, lng: 116.4074, precision: 'high' },
          interest_vector: [0.1, 0.2, 0.3],
          interaction_history: {},
          privacy_settings: {},
          ai_preferences: {},
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          resonanceScore: 95,
          lastActive: new Date().toISOString(),
          contribution: 85
        },
        {
          id: 'user2',
          username: '创意达人',
          email: 'user2@example.com',
          avatar: '',
          location: { lat: 39.9142, lng: 116.4174, precision: 'high' },
          interest_vector: [0.2, 0.3, 0.4],
          interaction_history: {},
          privacy_settings: {},
          ai_preferences: {},
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          resonanceScore: 88,
          lastActive: new Date().toISOString(),
          contribution: 92
        }
      ]
      setClusterMembers(mockMembers)
    } catch (error) {
      console.error('获取星团成员失败:', error)
    } finally {
      setIsLoadingMembers(false)
    }
  }, [])

  // 处理星团点击
  const handleClusterClick = (cluster: StarCluster) => {
    setSelectedCluster(cluster)
    fetchClusterMembers(cluster.id)
    onClusterClick(cluster)
  }

  // 处理加入星团
  const handleJoinCluster = async (clusterId: string) => {
    try {
      // TODO: 调用 PocketBase API 加入星团
      await onJoinCluster(clusterId)
      
      // 更新本地状态
      setClusters(prev => prev.map(cluster => 
        cluster.id === clusterId 
          ? { ...cluster, members: [...cluster.members, currentUser.id] }
          : cluster
      ))
    } catch (error) {
      console.error('加入星团失败:', error)
    }
  }

  // 处理离开星团
  const handleLeaveCluster = async (clusterId: string) => {
    try {
      // TODO: 调用 PocketBase API 离开星团
      await onLeaveCluster(clusterId)
      
      // 更新本地状态
      setClusters(prev => prev.map(cluster => 
        cluster.id === clusterId 
          ? { ...cluster, members: cluster.members.filter(id => id !== currentUser.id) }
          : cluster
      ))
    } catch (error) {
      console.error('离开星团失败:', error)
    }
  }

  // 计算星团兼容性
  const calculateCompatibility = (cluster: StarCluster): number => {
    if (!currentUser.interest_vector || !cluster.cluster_vector) return 0
    
    // 简单的余弦相似度计算
    const dotProduct = currentUser.interest_vector.reduce((sum, val, i) => 
      sum + val * (cluster.cluster_vector?.[i] || 0), 0
    )
    const magnitude1 = Math.sqrt(currentUser.interest_vector.reduce((sum, val) => sum + val * val, 0))
    const magnitude2 = Math.sqrt(cluster.cluster_vector.reduce((sum, val) => sum + val * val, 0))
    
    return dotProduct / (magnitude1 * magnitude2)
  }

  // 计算距离
  const calculateClusterDistance = (cluster: StarCluster): number => {
    if (!currentUser.location || !cluster.geographic_center) return 0
    return calculateDistance(
      currentUser.location.lat,
      currentUser.location.lng,
      cluster.geographic_center.lat,
      cluster.geographic_center.lng
    )
  }

  // 检查用户是否在星团中
  const isUserInCluster = (cluster: StarCluster): boolean => {
    return cluster.members.includes(currentUser.id)
  }

  // 检查星团是否即将过期
  const isClusterExpiring = (cluster: StarCluster): boolean => {
    const expirationTime = new Date(cluster.expiration_time).getTime()
    const now = Date.now()
    const hoursLeft = (expirationTime - now) / (1000 * 60 * 60)
    return hoursLeft < 24
  }

  if (isLoading) {
    return (
      <Card className={cn('h-96 flex items-center justify-center', className)}>
        <Loading text="加载星团中..." />
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 视图模式切换 */}
      <div className="flex gap-2">
        {[
          { key: 'nearby', label: '附近星团', icon: 'fas fa-map-marker-alt' },
          { key: 'active', label: '活跃星团', icon: 'fas fa-fire' },
          { key: 'compatible', label: '兼容星团', icon: 'fas fa-heart' }
        ].map(({ key, label, icon }) => (
          <Button
            key={key}
            onClick={() => setViewMode(key as any)}
            variant={viewMode === key ? 'primary' : 'secondary'}
            size="sm"
          >
            <i className={cn(icon, 'mr-1')}></i>
            {label}
          </Button>
        ))}
      </div>

      {/* 星团列表 */}
      <div className="grid gap-4">
        {clusters.map((cluster) => {
          const compatibility = calculateCompatibility(cluster)
          const distance = calculateClusterDistance(cluster)
          const isMember = isUserInCluster(cluster)
          const isExpiring = isClusterExpiring(cluster)

          return (
            <Card
              key={cluster.id}
              className="cursor-pointer hover:transform hover:-translate-y-1 transition-all duration-300"
              onClick={() => handleClusterClick(cluster)}
            >
              <div className="p-4">
                {/* 星团头部 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        星团 #{cluster.id}
                      </h3>
                      {isExpiring && (
                        <Tag variant="red" size="sm">
                          <i className="fas fa-clock mr-1"></i>
                          即将过期
                        </Tag>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span>
                        <i className="fas fa-users mr-1"></i>
                        {cluster.members.length} 成员
                      </span>
                      <span>
                        <i className="fas fa-fire mr-1"></i>
                        {cluster.activity_level}% 活跃度
                      </span>
                      <span>
                        <i className="fas fa-heart mr-1"></i>
                        {cluster.resonance_score} 共鸣值
                      </span>
                      {distance > 0 && (
                        <span>
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {distance.toFixed(1)}km
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 兼容性指示器 */}
                    <div className="text-center">
                      <div className="text-sm text-text-secondary">兼容性</div>
                      <div className={cn(
                        'text-lg font-bold',
                        compatibility > 0.8 ? 'text-accent-gold' :
                        compatibility > 0.6 ? 'text-accent-cyan' :
                        'text-text-secondary'
                      )}>
                        {Math.round(compatibility * 100)}%
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    {isMember ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLeaveCluster(cluster.id)
                        }}
                      >
                        <i className="fas fa-sign-out-alt mr-1"></i>
                        离开
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinCluster(cluster.id)
                        }}
                        disabled={cluster.members.length >= 49}
                      >
                        <i className="fas fa-plus mr-1"></i>
                        加入
                      </Button>
                    )}
                  </div>
                </div>

                {/* 光谱多样性 */}
                <div className="mb-3">
                  <div className="text-sm text-text-secondary mb-1">光谱多样性</div>
                  <div className="flex gap-1 flex-wrap">
                    {cluster.spectral_diversity?.topics?.map((topic, index) => (
                      <Tag key={index} variant="cyan" size="sm">
                        #{topic}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* 核心成员 */}
                <div className="flex items-center gap-2">
                  <div className="text-sm text-text-secondary">核心成员:</div>
                  <div className="flex -space-x-2">
                    {cluster.core_users.slice(0, 3).map((userId, index) => (
                      <Avatar
                        key={index}
                        size="sm"
                        fallback={userId.charAt(0).toUpperCase()}
                        className="border-2 border-primary-card"
                      />
                    ))}
                    {cluster.core_users.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-primary-secondary border-2 border-primary-card flex items-center justify-center text-xs text-text-secondary">
                        +{cluster.core_users.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* 过期时间 */}
                <div className="mt-3 text-xs text-text-secondary">
                  <i className="fas fa-clock mr-1"></i>
                  剩余时间: {formatDate(cluster.expiration_time)}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 星团详情模态框 */}
      {selectedCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCluster(null)} />
          <div className="relative w-full max-w-2xl bg-primary-card rounded-2xl shadow-2xl">
            <div className="p-6">
              {/* 标题栏 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">
                  星团详情 #{selectedCluster.id}
                </h2>
                <button
                  onClick={() => setSelectedCluster(null)}
                  className="text-text-secondary hover:text-accent-gold transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* 星团信息 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary-secondary rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent-gold mb-1">
                    {selectedCluster.resonance_score}
                  </div>
                  <div className="text-sm text-text-secondary">共鸣值</div>
                </div>
                <div className="bg-primary-secondary rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-accent-red mb-1">
                    {selectedCluster.activity_level}%
                  </div>
                  <div className="text-sm text-text-secondary">活跃度</div>
                </div>
              </div>

              {/* 成员列表 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  星团成员 ({clusterMembers.length})
                </h3>
                {isLoadingMembers ? (
                  <Loading text="加载成员中..." />
                ) : (
                  <div className="space-y-3">
                    {clusterMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 bg-primary-secondary rounded-xl">
                        <Avatar
                          size="md"
                          fallback={member.username.charAt(0).toUpperCase()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-text-primary">
                              {member.username}
                            </span>
                            {member.id === currentUser.id && (
                              <Tag variant="gold" size="sm">你</Tag>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span>
                              <i className="fas fa-heart mr-1"></i>
                              {member.resonanceScore} 共鸣
                            </span>
                            <span>
                              <i className="fas fa-chart-line mr-1"></i>
                              {member.contribution}% 贡献
                            </span>
                            <span>
                              <i className="fas fa-clock mr-1"></i>
                              {formatDate(member.lastActive)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                {isUserInCluster(selectedCluster) ? (
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleLeaveCluster(selectedCluster.id)
                      setSelectedCluster(null)
                    }}
                    className="flex-1"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    离开星团
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleJoinCluster(selectedCluster.id)
                      setSelectedCluster(null)
                    }}
                    className="flex-1"
                    disabled={selectedCluster.members.length >= 49}
                  >
                    <i className="fas fa-plus mr-2"></i>
                    加入星团
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setSelectedCluster(null)}
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
