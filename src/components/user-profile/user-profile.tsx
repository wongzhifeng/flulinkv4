// FluLink v4.0 用户档案组件

'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Input, Avatar, Tag, Loading } from '@/components/ui'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { User, StarSeed, StarCluster } from '@/lib/pocketbase'

interface UserProfileProps {
  currentUser: User
  onUpdateProfile: (updates: Partial<User>) => Promise<void>
  onLogout: () => void
  className?: string
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  onUpdateProfile,
  onLogout,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<User>>({})
  const [userStats, setUserStats] = useState({
    totalSeeds: 0,
    totalResonance: 0,
    totalClusters: 0,
    averageLuminosity: 0
  })
  const [recentSeeds, setRecentSeeds] = useState<StarSeed[]>([])
  const [joinedClusters, setJoinedClusters] = useState<StarCluster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // 获取用户统计数据
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true)
        // TODO: 从 PocketBase 获取用户统计数据
        const mockStats = {
          totalSeeds: 15,
          totalResonance: 1250,
          totalClusters: 3,
          averageLuminosity: 78
        }
        setUserStats(mockStats)

        // 获取最近的星种
        const mockSeeds: StarSeed[] = [
          {
            id: '1',
            creator: currentUser.id,
            content: '今天创作了一个新的星种',
            content_type: 'text',
            location: currentUser.location,
            content_vector: [],
            spectral_tags: ['创作', '生活'],
            luminosity: 85,
            resonance_count: 128,
            status: 'active',
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          }
        ]
        setRecentSeeds(mockSeeds)

        // 获取加入的星团
        const mockClusters: StarCluster[] = [
          {
            id: '1',
            members: [currentUser.id, 'user2', 'user3'],
            core_users: [currentUser.id, 'user2'],
            resonance_score: 85,
            geographic_center: currentUser.location,
            activity_level: 92,
            spectral_diversity: { topics: ['生活', '科技'], count: 2 },
            expiration_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            cluster_vector: [],
            created: new Date().toISOString(),
            updated: new Date().toISOString()
          }
        ]
        setJoinedClusters(mockClusters)

      } catch (error) {
        console.error('获取用户数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserStats()
  }, [currentUser.id])

  // 开始编辑
  const handleEdit = () => {
    setEditedProfile({
      username: currentUser.username,
      email: currentUser.email,
      privacy_settings: currentUser.privacy_settings,
      ai_preferences: currentUser.ai_preferences
    })
    setIsEditing(true)
  }

  // 取消编辑
  const handleCancel = () => {
    setEditedProfile({})
    setIsEditing(false)
  }

  // 保存编辑
  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onUpdateProfile(editedProfile)
      setIsEditing(false)
      setEditedProfile({})
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 处理隐私设置变化
  const handlePrivacyChange = (key: string, value: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      privacy_settings: {
        ...prev.privacy_settings,
        [key]: value
      }
    }))
  }

  // 处理 AI 偏好变化
  const handleAIPreferenceChange = (key: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      ai_preferences: {
        ...prev.ai_preferences,
        [key]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <Card className={cn('h-96 flex items-center justify-center', className)}>
        <Loading text="加载档案中..." />
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 用户基本信息 */}
      <Card>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar
              size="xl"
              src={currentUser.avatar}
              fallback={currentUser.username.charAt(0).toUpperCase()}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-text-primary">
                  {isEditing ? (
                    <Input
                      value={editedProfile.username || currentUser.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    currentUser.username
                  )}
                </h2>
                <Tag variant="gold" size="sm">
                  <i className="fas fa-star mr-1"></i>
                  星尘探索者
                </Tag>
              </div>
              
              <div className="text-text-secondary mb-4">
                {isEditing ? (
                  <Input
                    value={editedProfile.email || currentUser.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    type="email"
                  />
                ) : (
                  currentUser.email
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">
                  <i className="fas fa-calendar mr-1"></i>
                  加入时间: {formatDate(currentUser.created)}
                </span>
                {currentUser.location && (
                  <span className="text-sm text-text-secondary">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {currentUser.location.lat.toFixed(2)}, {currentUser.location.lng.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    loading={isSaving}
                    size="sm"
                  >
                    <i className="fas fa-save mr-1"></i>
                    保存
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    size="sm"
                  >
                    取消
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEdit}
                  variant="secondary"
                  size="sm"
                >
                  <i className="fas fa-edit mr-1"></i>
                  编辑
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 用户统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-accent-gold mb-1">
              {userStats.totalSeeds}
            </div>
            <div className="text-sm text-text-secondary">创建星种</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-accent-red mb-1">
              {formatNumber(userStats.totalResonance)}
            </div>
            <div className="text-sm text-text-secondary">总共鸣</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-accent-purple mb-1">
              {userStats.totalClusters}
            </div>
            <div className="text-sm text-text-secondary">加入星团</div>
          </div>
        </Card>
        
        <Card className="text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-accent-cyan mb-1">
              {userStats.averageLuminosity}°C
            </div>
            <div className="text-sm text-text-secondary">平均光度</div>
          </div>
        </Card>
      </div>

      {/* 隐私设置 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            <i className="fas fa-shield-alt mr-2"></i>
            隐私设置
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-primary font-medium">显示位置信息</div>
                <div className="text-sm text-text-secondary">允许其他用户看到你的大致位置</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEditing ? 
                    editedProfile.privacy_settings?.showLocation ?? currentUser.privacy_settings?.showLocation ?? true :
                    currentUser.privacy_settings?.showLocation ?? true
                  }
                  onChange={(e) => handlePrivacyChange('showLocation', e.target.checked)}
                  className="sr-only peer"
                  disabled={!isEditing}
                />
                <div className="w-11 h-6 bg-primary-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-primary font-medium">显示兴趣向量</div>
                <div className="text-sm text-text-secondary">允许 AI 使用你的兴趣数据进行匹配</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEditing ? 
                    editedProfile.privacy_settings?.showInterests ?? currentUser.privacy_settings?.showInterests ?? true :
                    currentUser.privacy_settings?.showInterests ?? true
                  }
                  onChange={(e) => handlePrivacyChange('showInterests', e.target.checked)}
                  className="sr-only peer"
                  disabled={!isEditing}
                />
                <div className="w-11 h-6 bg-primary-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-primary font-medium">允许星团邀请</div>
                <div className="text-sm text-text-secondary">其他用户可以邀请你加入星团</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEditing ? 
                    editedProfile.privacy_settings?.allowInvites ?? currentUser.privacy_settings?.allowInvites ?? true :
                    currentUser.privacy_settings?.allowInvites ?? true
                  }
                  onChange={(e) => handlePrivacyChange('allowInvites', e.target.checked)}
                  className="sr-only peer"
                  disabled={!isEditing}
                />
                <div className="w-11 h-6 bg-primary-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-gold"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* AI 偏好设置 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            <i className="fas fa-robot mr-2"></i>
            AI 偏好设置
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-text-primary font-medium mb-2">
                内容推荐强度
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary">保守</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isEditing ? 
                    editedProfile.ai_preferences?.recommendationStrength ?? currentUser.ai_preferences?.recommendationStrength ?? 50 :
                    currentUser.ai_preferences?.recommendationStrength ?? 50
                  }
                  onChange={(e) => handleAIPreferenceChange('recommendationStrength', parseInt(e.target.value))}
                  className="flex-1"
                  disabled={!isEditing}
                />
                <span className="text-sm text-text-secondary">激进</span>
                <span className="text-sm text-accent-gold min-w-[3rem] text-center">
                  {isEditing ? 
                    editedProfile.ai_preferences?.recommendationStrength ?? currentUser.ai_preferences?.recommendationStrength ?? 50 :
                    currentUser.ai_preferences?.recommendationStrength ?? 50
                  }%
                </span>
              </div>
            </div>

            <div>
              <label className="block text-text-primary font-medium mb-2">
                星团匹配精度
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-secondary">宽松</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isEditing ? 
                    editedProfile.ai_preferences?.clusterPrecision ?? currentUser.ai_preferences?.clusterPrecision ?? 70 :
                    currentUser.ai_preferences?.clusterPrecision ?? 70
                  }
                  onChange={(e) => handleAIPreferenceChange('clusterPrecision', parseInt(e.target.value))}
                  className="flex-1"
                  disabled={!isEditing}
                />
                <span className="text-sm text-text-secondary">精确</span>
                <span className="text-sm text-accent-gold min-w-[3rem] text-center">
                  {isEditing ? 
                    editedProfile.ai_preferences?.clusterPrecision ?? currentUser.ai_preferences?.clusterPrecision ?? 70 :
                    currentUser.ai_preferences?.clusterPrecision ?? 70
                  }%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 最近创建的星种 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            <i className="fas fa-star mr-2"></i>
            最近创建的星种
          </h3>
          
          <div className="space-y-3">
            {recentSeeds.map((seed) => (
              <div key={seed.id} className="flex items-center gap-3 p-3 bg-primary-secondary rounded-xl">
                <div className="w-2 h-2 rounded-full bg-accent-gold"></div>
                <div className="flex-1">
                  <div className="text-text-primary font-medium mb-1">
                    {seed.content}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>
                      <i className="fas fa-heart mr-1"></i>
                      {seed.resonance_count} 共鸣
                    </span>
                    <span>
                      <i className="fas fa-fire mr-1"></i>
                      {seed.luminosity}°C
                    </span>
                    <span>
                      <i className="fas fa-clock mr-1"></i>
                      {formatDate(seed.created)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {seed.spectral_tags?.map((tag, index) => (
                    <Tag key={index} variant="cyan" size="sm">
                      #{tag}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 加入的星团 */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            <i className="fas fa-users mr-2"></i>
            加入的星团
          </h3>
          
          <div className="space-y-3">
            {joinedClusters.map((cluster) => (
              <div key={cluster.id} className="flex items-center gap-3 p-3 bg-primary-secondary rounded-xl">
                <div className="w-3 h-3 rounded-full bg-accent-purple"></div>
                <div className="flex-1">
                  <div className="text-text-primary font-medium mb-1">
                    星团 #{cluster.id}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>
                      <i className="fas fa-users mr-1"></i>
                      {cluster.members.length} 成员
                    </span>
                    <span>
                      <i className="fas fa-heart mr-1"></i>
                      {cluster.resonance_score} 共鸣值
                    </span>
                    <span>
                      <i className="fas fa-fire mr-1"></i>
                      {cluster.activity_level}% 活跃度
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {cluster.spectral_diversity?.topics?.map((topic, index) => (
                    <Tag key={index} variant="purple" size="sm">
                      #{topic}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 危险操作 */}
      <Card className="border-accent-red/20">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-accent-red mb-4">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            危险操作
          </h3>
          
          <div className="space-y-3">
            <Button
              variant="danger"
              onClick={onLogout}
              className="w-full"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              退出登录
            </Button>
            
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('确定要删除账户吗？此操作不可撤销！')) {
                  // TODO: 实现删除账户功能
                  console.log('删除账户')
                }
              }}
              className="w-full"
            >
              <i className="fas fa-trash mr-2"></i>
              删除账户
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
