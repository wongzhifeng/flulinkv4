// FluLink v4.0 健康监控仪表板
// 基于《德道经》"知足者富"哲学，提供透明的服务状态监控

'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Tag, Loading, Modal } from '@/components/ui/index'
import { useHealthMonitoring, type HealthStatus, type Alert } from '@/lib/health-monitor'
import { cn, formatDate } from '@/lib/utils'

export default function HealthDashboard() {
  const {
    serviceStatuses,
    alerts,
    overview,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkService
  } = useHealthMonitoring()

  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showAlerts, setShowAlerts] = useState(false)
  const [isChecking, setIsChecking] = useState<string | null>(null)

  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-accent-cyan'
      case 'unhealthy': return 'text-accent-red'
      case 'degraded': return 'text-accent-gold'
      default: return 'text-text-secondary'
    }
  }

  const getStatusIcon = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'fas fa-check-circle'
      case 'unhealthy': return 'fas fa-times-circle'
      case 'degraded': return 'fas fa-exclamation-triangle'
      default: return 'fas fa-question-circle'
    }
  }

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-accent-red'
      case 'high': return 'text-accent-gold'
      case 'medium': return 'text-accent-purple'
      case 'low': return 'text-accent-cyan'
      default: return 'text-text-secondary'
    }
  }

  const handleCheckService = async (serviceName: string) => {
    setIsChecking(serviceName)
    try {
      await checkService(serviceName)
    } finally {
      setIsChecking(null)
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text-gold mb-2">
            健康监控仪表板
          </h1>
          <p className="text-text-secondary">
            FluLink v4.0 服务状态实时监控
          </p>
        </div>

        {/* 监控控制 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                监控控制
              </h2>
              <div className="flex items-center gap-2">
                <Tag 
                  variant={isMonitoring ? 'gold' : 'red'} 
                  size="sm"
                >
                  {isMonitoring ? '监控中' : '已停止'}
                </Tag>
                <Button
                  onClick={isMonitoring ? stopMonitoring : startMonitoring}
                  variant={isMonitoring ? 'danger' : 'primary'}
                  size="sm"
                >
                  <i className={cn('fas mr-1', isMonitoring ? 'fa-stop' : 'fa-play')}></i>
                  {isMonitoring ? '停止监控' : '开始监控'}
                </Button>
              </div>
            </div>

            {/* 服务概览 */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {overview.total}
                </div>
                <div className="text-sm text-text-secondary">总服务</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-cyan mb-1">
                  {overview.healthy}
                </div>
                <div className="text-sm text-text-secondary">健康</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-red mb-1">
                  {overview.unhealthy}
                </div>
                <div className="text-sm text-text-secondary">异常</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-gold mb-1">
                  {overview.degraded}
                </div>
                <div className="text-sm text-text-secondary">降级</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-text-secondary mb-1">
                  {overview.unknown}
                </div>
                <div className="text-sm text-text-secondary">未知</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-red mb-1">
                  {overview.criticalIssues}
                </div>
                <div className="text-sm text-text-secondary">严重问题</div>
              </div>
            </div>
          </div>
        </Card>

        {/* 服务状态列表 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                服务状态
              </h2>
              <Button
                onClick={() => setShowAlerts(!showAlerts)}
                variant="secondary"
                size="sm"
              >
                <i className="fas fa-bell mr-1"></i>
                告警 ({alerts.filter(a => !a.resolved).length})
              </Button>
            </div>

            <div className="space-y-3">
              {serviceStatuses.map((status) => (
                <div
                  key={status.service}
                  className="flex items-center justify-between p-4 bg-primary-secondary rounded-xl hover:bg-primary-card transition-colors cursor-pointer"
                  onClick={() => setSelectedService(status.service)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <i className={cn(getStatusIcon(status.status), getStatusColor(status.status), 'text-xl')}></i>
                      <span className="font-semibold text-text-primary">
                        {status.service}
                      </span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      {status.url}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={cn('font-medium', getStatusColor(status.status))}>
                        {status.status === 'healthy' ? '正常' : 
                         status.status === 'unhealthy' ? '异常' : 
                         status.status === 'degraded' ? '降级' : '未知'}
                      </div>
                      {status.responseTime && (
                        <div className="text-xs text-text-secondary">
                          {status.responseTime}ms
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCheckService(status.service)
                      }}
                      variant="ghost"
                      size="sm"
                      disabled={isChecking === status.service}
                    >
                      {isChecking === status.service ? (
                        <Loading size="sm" />
                      ) : (
                        <i className="fas fa-refresh"></i>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 告警列表 */}
        {showAlerts && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                <i className="fas fa-bell mr-2"></i>
                告警列表
              </h2>

              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    <i className="fas fa-check-circle text-4xl mb-4 text-accent-cyan"></i>
                    <p>暂无告警</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-4 rounded-xl border-l-4',
                        alert.resolved ? 'bg-primary-secondary' : 'bg-accent-red/10',
                        alert.severity === 'critical' ? 'border-accent-red' :
                        alert.severity === 'high' ? 'border-accent-gold' :
                        alert.severity === 'medium' ? 'border-accent-purple' :
                        'border-accent-cyan'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Tag
                              variant={alert.severity === 'critical' ? 'red' :
                                     alert.severity === 'high' ? 'gold' :
                                     alert.severity === 'medium' ? 'purple' : 'cyan'}
                              size="sm"
                            >
                              {alert.severity.toUpperCase()}
                            </Tag>
                            <span className="font-semibold text-text-primary">
                              {alert.service}
                            </span>
                            {alert.resolved && (
                              <Tag variant="cyan" size="sm">
                                已解决
                              </Tag>
                            )}
                          </div>
                          <p className="text-text-primary mb-2">
                            {alert.message}
                          </p>
                          <div className="text-xs text-text-secondary">
                            <i className="fas fa-clock mr-1"></i>
                            {formatDate(alert.timestamp)}
                            {alert.resolvedAt && (
                              <>
                                <span className="mx-2">•</span>
                                <i className="fas fa-check mr-1"></i>
                                解决于 {formatDate(alert.resolvedAt)}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        )}

        {/* 服务详情模态框 */}
        <Modal
          isOpen={selectedService !== null}
          onClose={() => setSelectedService(null)}
          title={`${selectedService} 服务详情`}
          size="lg"
        >
          {selectedService && (
            <div className="space-y-4">
              {(() => {
                const status = serviceStatuses.find(s => s.service === selectedService)
                if (!status) return <div>服务状态未找到</div>

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary-secondary rounded-xl p-4">
                        <div className="text-sm text-text-secondary mb-1">服务状态</div>
                        <div className={cn('font-semibold', getStatusColor(status.status))}>
                          {status.status === 'healthy' ? '正常' : 
                           status.status === 'unhealthy' ? '异常' : 
                           status.status === 'degraded' ? '降级' : '未知'}
                        </div>
                      </div>
                      <div className="bg-primary-secondary rounded-xl p-4">
                        <div className="text-sm text-text-secondary mb-1">响应时间</div>
                        <div className="font-semibold text-text-primary">
                          {status.responseTime ? `${status.responseTime}ms` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary-secondary rounded-xl p-4">
                      <div className="text-sm text-text-secondary mb-2">服务地址</div>
                      <div className="font-mono text-sm text-text-primary">
                        {status.url}
                      </div>
                    </div>

                    <div className="bg-primary-secondary rounded-xl p-4">
                      <div className="text-sm text-text-secondary mb-2">最后检查</div>
                      <div className="text-text-primary">
                        {formatDate(status.lastChecked)}
                      </div>
                    </div>

                    {status.error && (
                      <div className="bg-accent-red/10 rounded-xl p-4">
                        <div className="text-sm text-accent-red mb-2">错误信息</div>
                        <div className="text-text-primary text-sm">
                          {status.error}
                        </div>
                      </div>
                    )}

                    {status.details && Object.keys(status.details).length > 0 && (
                      <div className="bg-primary-secondary rounded-xl p-4">
                        <div className="text-sm text-text-secondary mb-2">详细信息</div>
                        <pre className="text-xs text-text-primary overflow-auto">
                          {JSON.stringify(status.details, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleCheckService(selectedService)}
                        loading={isChecking === selectedService}
                        className="flex-1"
                      >
                        <i className="fas fa-refresh mr-2"></i>
                        重新检查
                      </Button>
                      <Button
                        onClick={() => setSelectedService(null)}
                        variant="secondary"
                      >
                        关闭
                      </Button>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
