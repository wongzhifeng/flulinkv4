// FluLink v4.0 环境配置页面
// 基于《德道经》"知足者富"哲学，提供配置透明度和调试能力

'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Tag, Loading } from '@/components/ui/index'
import { envValidator, type ServiceHealth } from '@/lib/env-validator'
import { cn, formatDate } from '@/lib/utils'

export default function EnvironmentConfigPage() {
  const [healthChecks, setHealthChecks] = useState<ServiceHealth[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const validation = envValidator.validateEnvironment()
  const config = envValidator.getConfigSummary()

  const checkHealth = async () => {
    setIsLoading(true)
    try {
      const health = await envValidator.checkServiceHealth()
      setHealthChecks(health)
      setLastChecked(new Date())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-accent-cyan'
      case 'unhealthy': return 'text-accent-red'
      default: return 'text-text-secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return 'fas fa-check-circle'
      case 'unhealthy': return 'fas fa-times-circle'
      default: return 'fas fa-question-circle'
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text-gold mb-2">
            环境配置
          </h1>
          <p className="text-text-secondary">
            FluLink v4.0 环境变量和服务状态监控
          </p>
        </div>

        {/* 配置状态概览 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                配置状态概览
              </h2>
              <div className="flex items-center gap-2">
                <Tag 
                  variant={validation.isValid ? 'gold' : 'red'} 
                  size="sm"
                >
                  {validation.isValid ? '配置正常' : '配置异常'}
                </Tag>
                <Button
                  onClick={checkHealth}
                  loading={isLoading}
                  size="sm"
                  variant="secondary"
                >
                  <i className="fas fa-refresh mr-1"></i>
                  刷新检查
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 环境信息 */}
              <div className="bg-primary-secondary rounded-xl p-4">
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  <i className="fas fa-cog mr-2"></i>
                  环境信息
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">运行环境:</span>
                    <span className="text-text-primary font-medium">
                      {config.environment}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">最后检查:</span>
                    <span className="text-text-primary font-medium">
                      {lastChecked ? formatDate(lastChecked) : '未检查'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 服务状态 */}
              <div className="bg-primary-secondary rounded-xl p-4">
                <h3 className="text-lg font-semibold text-text-primary mb-3">
                  <i className="fas fa-server mr-2"></i>
                  服务状态
                </h3>
                <div className="space-y-2">
                  {healthChecks.map((health) => (
                    <div key={health.service} className="flex items-center justify-between">
                      <span className="text-text-secondary">{health.service}:</span>
                      <div className="flex items-center gap-2">
                        <i className={cn(getStatusIcon(health.status), getStatusColor(health.status))}></i>
                        <span className={cn('text-sm font-medium', getStatusColor(health.status))}>
                          {health.status === 'healthy' ? '正常' : 
                           health.status === 'unhealthy' ? '异常' : '未知'}
                        </span>
                        {health.responseTime && (
                          <span className="text-xs text-text-secondary">
                            ({health.responseTime}ms)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 服务配置详情 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                服务配置详情
              </h2>
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="ghost"
                size="sm"
              >
                <i className={cn('fas', showDetails ? 'fa-chevron-up' : 'fa-chevron-down', 'mr-1')}></i>
                {showDetails ? '收起' : '展开'}
              </Button>
            </div>

            <div className="space-y-4">
              {/* PocketBase 配置 */}
              <div className="bg-primary-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    <i className="fas fa-database mr-2 text-accent-gold"></i>
                    PocketBase 服务
                  </h3>
                  <Tag variant="cyan" size="sm">后端数据库</Tag>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">服务地址:</span>
                    <span className="text-text-primary font-mono text-sm">
                      {config.services.pocketbase}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">健康检查:</span>
                    <span className={cn('font-medium', getStatusColor(
                      healthChecks.find(h => h.service === 'PocketBase')?.status || 'unknown'
                    ))}>
                      {healthChecks.find(h => h.service === 'PocketBase')?.status === 'healthy' ? '正常' : '异常'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI 服务配置 */}
              <div className="bg-primary-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    <i className="fas fa-robot mr-2 text-accent-purple"></i>
                    AI 智能服务
                  </h3>
                  <Tag variant="purple" size="sm">AI 分析</Tag>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">服务地址:</span>
                    <span className="text-text-primary font-mono text-sm">
                      {config.services.aiService}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">健康检查:</span>
                    <span className={cn('font-medium', getStatusColor(
                      healthChecks.find(h => h.service === 'AI Service')?.status || 'unknown'
                    ))}>
                      {healthChecks.find(h => h.service === 'AI Service')?.status === 'healthy' ? '正常' : '异常'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 详细状态信息 */}
              {showDetails && (
                <div className="space-y-4">
                  {healthChecks.map((health) => (
                    <div key={health.service} className="bg-primary-secondary rounded-xl p-4">
                      <h4 className="text-md font-semibold text-text-primary mb-3">
                        {health.service} 详细状态
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-text-secondary">状态:</span>
                          <span className={cn('ml-2 font-medium', getStatusColor(health.status))}>
                            {health.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary">响应时间:</span>
                          <span className="ml-2 font-medium text-text-primary">
                            {health.responseTime ? `${health.responseTime}ms` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary">最后检查:</span>
                          <span className="ml-2 font-medium text-text-primary">
                            {formatDate(health.lastChecked)}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary">服务地址:</span>
                          <span className="ml-2 font-mono text-xs text-text-primary">
                            {health.url}
                          </span>
                        </div>
                      </div>
                      {health.error && (
                        <div className="mt-3 p-3 bg-accent-red/10 rounded-lg">
                          <span className="text-accent-red text-sm">
                            <i className="fas fa-exclamation-triangle mr-1"></i>
                            错误: {health.error}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 配置错误和警告 */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                配置问题
              </h2>

              {/* 错误信息 */}
              {validation.errors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-accent-red mb-2">
                    <i className="fas fa-times-circle mr-1"></i>
                    错误 ({validation.errors.length})
                  </h3>
                  <div className="space-y-2">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-accent-red/10 rounded-lg">
                        <span className="text-accent-red text-sm">{error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 警告信息 */}
              {validation.warnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-accent-gold mb-2">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    警告 ({validation.warnings.length})
                  </h3>
                  <div className="space-y-2">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="p-3 bg-accent-gold/10 rounded-lg">
                        <span className="text-accent-gold text-sm">{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 操作建议 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              <i className="fas fa-lightbulb mr-2"></i>
              操作建议
            </h2>
            <div className="space-y-3">
              {!validation.isValid && (
                <div className="p-3 bg-accent-red/10 rounded-lg">
                  <span className="text-accent-red text-sm">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    请先修复环境变量配置错误，然后重新检查服务状态
                  </span>
                </div>
              )}
              
              {healthChecks.some(h => h.status === 'unhealthy') && (
                <div className="p-3 bg-accent-red/10 rounded-lg">
                  <span className="text-accent-red text-sm">
                    <i className="fas fa-server mr-1"></i>
                    部分服务不可用，请检查服务部署状态和网络连接
                  </span>
                </div>
              )}

              {healthChecks.some(h => h.responseTime && h.responseTime > 2000) && (
                <div className="p-3 bg-accent-gold/10 rounded-lg">
                  <span className="text-accent-gold text-sm">
                    <i className="fas fa-clock mr-1"></i>
                    部分服务响应时间过长，建议优化服务性能
                  </span>
                </div>
              )}

              {validation.isValid && healthChecks.every(h => h.status === 'healthy') && (
                <div className="p-3 bg-accent-cyan/10 rounded-lg">
                  <span className="text-accent-cyan text-sm">
                    <i className="fas fa-check-circle mr-1"></i>
                    所有服务运行正常，环境配置完整
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
