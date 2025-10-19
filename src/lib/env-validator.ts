// FluLink v4.0 环境变量校验工具
// 基于《德道经》"知足者富"哲学，确保配置的完整性和一致性

import React from 'react'

export interface EnvironmentConfig {
  // 前端环境变量
  NEXT_PUBLIC_POCKETBASE_URL: string
  NEXT_PUBLIC_AI_SERVICE_URL: string
  
  // 服务端环境变量
  POCKETBASE_URL: string
  AI_SERVICE_URL: string
  
  // 其他配置
  NODE_ENV: 'development' | 'production'
  PORT?: string
}

export interface ServiceHealth {
  service: string
  url: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  responseTime?: number
  lastChecked: Date
  error?: string
}

export class EnvironmentValidator {
  private config: Partial<EnvironmentConfig>
  private healthChecks: Map<string, ServiceHealth> = new Map()

  constructor() {
    this.config = this.loadEnvironmentConfig()
  }

  // 加载环境配置
  private loadEnvironmentConfig(): Partial<EnvironmentConfig> {
    return {
      NEXT_PUBLIC_POCKETBASE_URL: process.env.NEXT_PUBLIC_POCKETBASE_URL || '',
      NEXT_PUBLIC_AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || '',
      POCKETBASE_URL: process.env.POCKETBASE_URL || '',
      AI_SERVICE_URL: process.env.AI_SERVICE_URL || '',
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production') || 'development',
      PORT: process.env.PORT || '3000'
    }
  }

  // 校验环境变量完整性
  validateEnvironment(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // 必需的环境变量检查
    const requiredVars = [
      'NEXT_PUBLIC_POCKETBASE_URL',
      'NEXT_PUBLIC_AI_SERVICE_URL'
    ]

    for (const varName of requiredVars) {
      if (!this.config[varName as keyof EnvironmentConfig]) {
        errors.push(`缺少必需的环境变量: ${varName}`)
      }
    }

    // URL 格式校验
    if (this.config.NEXT_PUBLIC_POCKETBASE_URL) {
      if (!this.isValidUrl(this.config.NEXT_PUBLIC_POCKETBASE_URL)) {
        errors.push('NEXT_PUBLIC_POCKETBASE_URL 格式无效')
      }
    }

    if (this.config.NEXT_PUBLIC_AI_SERVICE_URL) {
      if (!this.isValidUrl(this.config.NEXT_PUBLIC_AI_SERVICE_URL)) {
        errors.push('NEXT_PUBLIC_AI_SERVICE_URL 格式无效')
      }
    }

    // 开发环境警告
    if (this.config.NODE_ENV === 'development') {
      if (this.config.NEXT_PUBLIC_POCKETBASE_URL?.includes('zeabur.app')) {
        warnings.push('开发环境使用了生产环境的 PocketBase URL')
      }
      if (this.config.NEXT_PUBLIC_AI_SERVICE_URL?.includes('zeabur.app')) {
        warnings.push('开发环境使用了生产环境的 AI 服务 URL')
      }
    }

    // 生产环境检查
    if (this.config.NODE_ENV === 'production') {
      if (this.config.NEXT_PUBLIC_POCKETBASE_URL?.includes('localhost')) {
        errors.push('生产环境不能使用 localhost URL')
      }
      if (this.config.NEXT_PUBLIC_AI_SERVICE_URL?.includes('localhost')) {
        errors.push('生产环境不能使用 localhost URL')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // URL 格式校验
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // 服务健康检查
  async checkServiceHealth(): Promise<ServiceHealth[]> {
    const services = [
      {
        name: 'PocketBase',
        url: this.config.NEXT_PUBLIC_POCKETBASE_URL || '',
        healthPath: '/api/health'
      },
      {
        name: 'AI Service',
        url: this.config.NEXT_PUBLIC_AI_SERVICE_URL || '',
        healthPath: '/health'
      }
    ]

    const healthChecks = await Promise.allSettled(
      services.map(service => this.checkSingleService(service))
    )

    return healthChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          service: services[index].name,
          url: services[index].url,
          status: 'unknown' as const,
          lastChecked: new Date(),
          error: result.reason?.message || 'Unknown error'
        }
      }
    })
  }

  // 单个服务健康检查
  private async checkSingleService(service: { name: string; url: string; healthPath: string }): Promise<ServiceHealth> {
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${service.url}${service.healthPath}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FluLink-HealthCheck/4.0.0'
        },
        signal: AbortSignal.timeout(5000) // 5秒超时
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        const healthData = await response.json()
        return {
          service: service.name,
          url: service.url,
          status: 'healthy',
          responseTime,
          lastChecked: new Date()
        }
      } else {
        return {
          service: service.name,
          url: service.url,
          status: 'unhealthy',
          responseTime,
          lastChecked: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        service: service.name,
        url: service.url,
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 获取配置摘要
  getConfigSummary(): {
    environment: string
    services: {
      pocketbase: string
      aiService: string
    }
    validation: ReturnType<EnvironmentValidator['validateEnvironment']>
  } {
    return {
      environment: this.config.NODE_ENV || 'unknown',
      services: {
        pocketbase: this.config.NEXT_PUBLIC_POCKETBASE_URL || 'not configured',
        aiService: this.config.NEXT_PUBLIC_AI_SERVICE_URL || 'not configured'
      },
      validation: this.validateEnvironment()
    }
  }

  // 生成环境配置报告
  async generateReport(): Promise<{
    timestamp: Date
    config: ReturnType<EnvironmentValidator['getConfigSummary']>
    healthChecks: ServiceHealth[]
    recommendations: string[]
  }> {
    const config = this.getConfigSummary()
    const healthChecks = await this.checkServiceHealth()
    
    const recommendations: string[] = []

    // 基于健康检查结果生成建议
    for (const health of healthChecks) {
      if (health.status === 'unhealthy') {
        recommendations.push(`${health.service} 服务不可用，请检查服务状态`)
      }
      if (health.responseTime && health.responseTime > 2000) {
        recommendations.push(`${health.service} 响应时间过长 (${health.responseTime}ms)，建议优化`)
      }
    }

    // 基于配置生成建议
    if (config.validation.errors.length > 0) {
      recommendations.push('请修复环境变量配置错误')
    }
    if (config.validation.warnings.length > 0) {
      recommendations.push('请注意环境变量配置警告')
    }

    return {
      timestamp: new Date(),
      config,
      healthChecks,
      recommendations
    }
  }
}

// 全局环境校验器实例
export const envValidator = new EnvironmentValidator()

// React Hook for Environment Validation
export function useEnvironmentValidation() {
  const [validation, setValidation] = React.useState(envValidator.validateEnvironment())
  const [healthChecks, setHealthChecks] = React.useState<ServiceHealth[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const checkHealth = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const health = await envValidator.checkServiceHealth()
      setHealthChecks(health)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    checkHealth()
  }, [checkHealth])

  return {
    validation,
    healthChecks,
    isLoading,
    checkHealth,
    config: envValidator.getConfigSummary()
  }
}

// 开发环境调试工具
export function debugEnvironment() {
  if (process.env.NODE_ENV === 'development') {
    console.group('🌍 FluLink 环境配置调试')
    console.log('配置摘要:', envValidator.getConfigSummary())
    console.log('环境变量:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_POCKETBASE_URL: process.env.NEXT_PUBLIC_POCKETBASE_URL,
      NEXT_PUBLIC_AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL
    })
    console.groupEnd()
  }
}

// 自动调试（仅在开发环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  debugEnvironment()
}
