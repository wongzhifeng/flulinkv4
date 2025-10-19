// FluLink v4.0 统一健康检查服务
// 基于《德道经》"知足者富"哲学，实现服务状态的透明监控

import React from 'react'

export interface ServiceConfig {
  name: string
  url: string
  healthPath: string
  timeout: number
  retryAttempts: number
  critical: boolean
}

export interface HealthStatus {
  service: string
  url: string
  status: 'healthy' | 'unhealthy' | 'unknown' | 'degraded'
  responseTime?: number
  lastChecked: Date
  error?: string
  details?: Record<string, any>
  uptime?: number
}

export interface AlertRule {
  id: string
  service: string
  condition: 'response_time' | 'status' | 'uptime'
  threshold: number
  operator: 'gt' | 'lt' | 'eq' | 'ne'
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
}

export interface Alert {
  id: string
  ruleId: string
  service: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

// 默认服务配置
const DEFAULT_SERVICES: ServiceConfig[] = [
  {
    name: 'Frontend',
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    healthPath: '/api/health',
    timeout: 5000,
    retryAttempts: 2,
    critical: true
  },
  {
    name: 'PocketBase',
    url: process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090',
    healthPath: '/api/health',
    timeout: 5000,
    retryAttempts: 2,
    critical: true
  },
  {
    name: 'AI Service',
    url: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000',
    healthPath: '/health',
    timeout: 10000,
    retryAttempts: 1,
    critical: false
  }
]

// 默认告警规则
const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'response_time_high',
    service: '*',
    condition: 'response_time',
    threshold: 2000,
    operator: 'gt',
    severity: 'medium',
    enabled: true
  },
  {
    id: 'service_down',
    service: '*',
    condition: 'status',
    threshold: 0,
    operator: 'eq',
    severity: 'critical',
    enabled: true
  },
  {
    id: 'ai_service_degraded',
    service: 'AI Service',
    condition: 'response_time',
    threshold: 5000,
    operator: 'gt',
    severity: 'low',
    enabled: true
  }
]

export class HealthCheckService {
  private services: ServiceConfig[]
  private alertRules: AlertRule[]
  private alerts: Alert[] = []
  private healthStatuses: Map<string, HealthStatus> = new Map()
  private checkInterval: NodeJS.Timeout | null = null
  private alertCallbacks: ((alert: Alert) => void)[] = []

  constructor(
    services: ServiceConfig[] = DEFAULT_SERVICES,
    alertRules: AlertRule[] = DEFAULT_ALERT_RULES
  ) {
    this.services = services
    this.alertRules = alertRules
  }

  // 启动健康检查
  start(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    // 立即执行一次检查
    this.performHealthChecks()

    // 设置定期检查
    this.checkInterval = setInterval(() => {
      this.performHealthChecks()
    }, intervalMs)

    console.log('🏥 FluLink 健康检查服务已启动')
  }

  // 停止健康检查
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    console.log('🏥 FluLink 健康检查服务已停止')
  }

  // 执行健康检查
  async performHealthChecks(): Promise<void> {
    const checkPromises = this.services.map(service => this.checkService(service))
    await Promise.allSettled(checkPromises)
    
    // 检查告警规则
    this.checkAlertRules()
  }

  // 检查单个服务
  private async checkService(service: ServiceConfig): Promise<void> {
    const startTime = Date.now()
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), service.timeout)

      const response = await fetch(`${service.url}${service.healthPath}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FluLink-HealthCheck/4.0.0'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      let status: HealthStatus['status'] = 'healthy'
      let details: Record<string, any> = {}

      if (response.ok) {
        try {
          const healthData = await response.json()
          details = healthData
          
          // 根据服务类型判断健康状态
          if (service.name === 'AI Service' && healthData.model_loaded === false) {
            status = 'degraded'
          }
        } catch {
          // 如果无法解析JSON，但HTTP状态正常，仍然认为健康
        }
      } else {
        status = 'unhealthy'
      }

      const healthStatus: HealthStatus = {
        service: service.name,
        url: service.url,
        status,
        responseTime,
        lastChecked: new Date(),
        details
      }

      this.healthStatuses.set(service.name, healthStatus)

    } catch (error) {
      const responseTime = Date.now() - startTime
      const healthStatus: HealthStatus = {
        service: service.name,
        url: service.url,
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      this.healthStatuses.set(service.name, healthStatus)
    }
  }

  // 检查告警规则
  private checkAlertRules(): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue

      const services = rule.service === '*' 
        ? Array.from(this.healthStatuses.values())
        : [this.healthStatuses.get(rule.service)].filter(Boolean) as HealthStatus[]

      for (const healthStatus of services) {
        if (!healthStatus) continue

        const shouldAlert = this.evaluateAlertRule(rule, healthStatus)
        
        if (shouldAlert) {
          const existingAlert = this.alerts.find(
            alert => alert.ruleId === rule.id && 
                     alert.service === healthStatus.service && 
                     !alert.resolved
          )

          if (!existingAlert) {
            const alert: Alert = {
              id: `${rule.id}_${healthStatus.service}_${Date.now()}`,
              ruleId: rule.id,
              service: healthStatus.service,
              severity: rule.severity,
              message: this.generateAlertMessage(rule, healthStatus),
              timestamp: new Date(),
              resolved: false
            }

            this.alerts.push(alert)
            this.notifyAlert(alert)
          }
        } else {
          // 解决现有告警
          const existingAlert = this.alerts.find(
            alert => alert.ruleId === rule.id && 
                     alert.service === healthStatus.service && 
                     !alert.resolved
          )

          if (existingAlert) {
            existingAlert.resolved = true
            existingAlert.resolvedAt = new Date()
          }
        }
      }
    }
  }

  // 评估告警规则
  private evaluateAlertRule(rule: AlertRule, healthStatus: HealthStatus): boolean {
    let value: number

    switch (rule.condition) {
      case 'response_time':
        value = healthStatus.responseTime || 0
        break
      case 'status':
        value = healthStatus.status === 'healthy' ? 1 : 0
        break
      case 'uptime':
        value = healthStatus.uptime || 0
        break
      default:
        return false
    }

    switch (rule.operator) {
      case 'gt': return value > rule.threshold
      case 'lt': return value < rule.threshold
      case 'eq': return value === rule.threshold
      case 'ne': return value !== rule.threshold
      default: return false
    }
  }

  // 生成告警消息
  private generateAlertMessage(rule: AlertRule, healthStatus: HealthStatus): string {
    const serviceName = healthStatus.service
    const severity = rule.severity.toUpperCase()

    switch (rule.condition) {
      case 'response_time':
        return `[${severity}] ${serviceName} 响应时间过长: ${healthStatus.responseTime}ms`
      case 'status':
        return `[${severity}] ${serviceName} 服务不可用: ${healthStatus.status}`
      case 'uptime':
        return `[${severity}] ${serviceName} 运行时间异常: ${healthStatus.uptime}%`
      default:
        return `[${severity}] ${serviceName} 触发告警规则: ${rule.id}`
    }
  }

  // 通知告警
  private notifyAlert(alert: Alert): void {
    console.warn(`🚨 服务告警: ${alert.message}`)
    
    // 调用注册的回调函数
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('告警回调执行失败:', error)
      }
    })
  }

  // 注册告警回调
  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback)
  }

  // 获取服务状态
  getServiceStatus(serviceName: string): HealthStatus | undefined {
    return this.healthStatuses.get(serviceName)
  }

  // 获取所有服务状态
  getAllServiceStatuses(): HealthStatus[] {
    return Array.from(this.healthStatuses.values())
  }

  // 获取活跃告警
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  // 获取所有告警
  getAllAlerts(): Alert[] {
    return [...this.alerts]
  }

  // 手动检查服务
  async checkServiceManually(serviceName: string): Promise<HealthStatus | null> {
    const service = this.services.find(s => s.name === serviceName)
    if (!service) return null

    await this.checkService(service)
    return this.healthStatuses.get(serviceName) || null
  }

  // 获取服务概览
  getServiceOverview(): {
    total: number
    healthy: number
    unhealthy: number
    degraded: number
    unknown: number
    criticalIssues: number
  } {
    const statuses = this.getAllServiceStatuses()
    const activeAlerts = this.getActiveAlerts()

    return {
      total: statuses.length,
      healthy: statuses.filter(s => s.status === 'healthy').length,
      unhealthy: statuses.filter(s => s.status === 'unhealthy').length,
      degraded: statuses.filter(s => s.status === 'degraded').length,
      unknown: statuses.filter(s => s.status === 'unknown').length,
      criticalIssues: activeAlerts.filter(a => a.severity === 'critical').length
    }
  }
}

// 全局健康检查服务实例
export const healthCheckService = new HealthCheckService()

// React Hook for Health Monitoring
export function useHealthMonitoring() {
  const [serviceStatuses, setServiceStatuses] = React.useState<HealthStatus[]>([])
  const [alerts, setAlerts] = React.useState<Alert[]>([])
  const [overview, setOverview] = React.useState(healthCheckService.getServiceOverview())
  const [isMonitoring, setIsMonitoring] = React.useState(false)

  React.useEffect(() => {
    // 更新状态
    const updateStatuses = () => {
      setServiceStatuses(healthCheckService.getAllServiceStatuses())
      setAlerts(healthCheckService.getAllAlerts())
      setOverview(healthCheckService.getServiceOverview())
    }

    // 注册告警回调
    const alertCallback = (alert: Alert) => {
      setAlerts(healthCheckService.getAllAlerts())
      setOverview(healthCheckService.getServiceOverview())
    }

    healthCheckService.onAlert(alertCallback)

    // 定期更新状态
    const statusInterval = setInterval(updateStatuses, 5000)

    // 初始状态
    updateStatuses()

    return () => {
      clearInterval(statusInterval)
    }
  }, [])

  const startMonitoring = React.useCallback(() => {
    healthCheckService.start()
    setIsMonitoring(true)
  }, [])

  const stopMonitoring = React.useCallback(() => {
    healthCheckService.stop()
    setIsMonitoring(false)
  }, [])

  const checkService = React.useCallback(async (serviceName: string) => {
    return await healthCheckService.checkServiceManually(serviceName)
  }, [])

  return {
    serviceStatuses,
    alerts,
    overview,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkService
  }
}

// 开发环境自动启动
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 延迟启动，避免在开发环境中立即开始检查
  setTimeout(() => {
    healthCheckService.start(60000) // 开发环境每分钟检查一次
  }, 5000)
}
