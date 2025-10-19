// FluLink v4.0 性能优化与缓存服务
// 基于《德道经》"无为而治"哲学，实现智能化的性能优化

import React from 'react'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  context?: Record<string, any>
}

export interface CacheConfig {
  ttl: number // 生存时间（毫秒）
  maxSize: number // 最大缓存条目数
  strategy: 'lru' | 'fifo' | 'ttl'
}

export interface CacheEntry<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

// 默认缓存配置
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 300000, // 5分钟
  maxSize: 1000,
  strategy: 'lru'
}

// 性能目标
const PERFORMANCE_TARGETS = {
  pageLoad: 200, // 页面加载时间 < 200ms
  apiResponse: 100, // API响应时间 < 100ms
  renderTime: 50, // 渲染时间 < 50ms
  cacheHitRate: 0.8 // 缓存命中率 > 80%
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: ((metric: PerformanceMetric) => void)[] = []

  // 记录性能指标
  recordMetric(name: string, value: number, unit: string = 'ms', context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      context
    }

    this.metrics.push(metric)
    
    // 保持最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // 通知观察者
    this.observers.forEach(observer => {
      try {
        observer(metric)
      } catch (error) {
        console.error('性能指标观察者执行失败:', error)
      }
    })

    // 检查性能目标
    this.checkPerformanceTarget(metric)
  }

  // 检查性能目标
  private checkPerformanceTarget(metric: PerformanceMetric): void {
    const target = PERFORMANCE_TARGETS[metric.name as keyof typeof PERFORMANCE_TARGETS]
    if (target && metric.value > target) {
      console.warn(`⚠️ 性能警告: ${metric.name} = ${metric.value}${metric.unit} (目标: <${target}${metric.unit})`)
    }
  }

  // 获取性能指标
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name)
    }
    return [...this.metrics]
  }

  // 获取平均性能
  getAverageMetric(name: string, timeWindow?: number): number {
    let metrics = this.getMetrics(name)
    
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow
      metrics = metrics.filter(m => m.timestamp.getTime() > cutoff)
    }

    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  // 注册观察者
  onMetric(callback: (metric: PerformanceMetric) => void): void {
    this.observers.push(callback)
  }

  // 获取性能报告
  getPerformanceReport(): {
    pageLoad: { average: number; target: number; status: 'good' | 'warning' | 'poor' }
    apiResponse: { average: number; target: number; status: 'good' | 'warning' | 'poor' }
    renderTime: { average: number; target: number; status: 'good' | 'warning' | 'poor' }
    cacheHitRate: { average: number; target: number; status: 'good' | 'warning' | 'poor' }
  } {
    const pageLoadAvg = this.getAverageMetric('pageLoad')
    const apiResponseAvg = this.getAverageMetric('apiResponse')
    const renderTimeAvg = this.getAverageMetric('renderTime')
    const cacheHitRateAvg = this.getAverageMetric('cacheHitRate')

    const getStatus = (value: number, target: number): 'good' | 'warning' | 'poor' => {
      if (value <= target) return 'good'
      if (value <= target * 1.5) return 'warning'
      return 'poor'
    }

    return {
      pageLoad: {
        average: pageLoadAvg,
        target: PERFORMANCE_TARGETS.pageLoad,
        status: getStatus(pageLoadAvg, PERFORMANCE_TARGETS.pageLoad)
      },
      apiResponse: {
        average: apiResponseAvg,
        target: PERFORMANCE_TARGETS.apiResponse,
        status: getStatus(apiResponseAvg, PERFORMANCE_TARGETS.apiResponse)
      },
      renderTime: {
        average: renderTimeAvg,
        target: PERFORMANCE_TARGETS.renderTime,
        status: getStatus(renderTimeAvg, PERFORMANCE_TARGETS.renderTime)
      },
      cacheHitRate: {
        average: cacheHitRateAvg,
        target: PERFORMANCE_TARGETS.cacheHitRate,
        status: getStatus(cacheHitRateAvg, PERFORMANCE_TARGETS.cacheHitRate)
      }
    }
  }
}

export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private config: CacheConfig
  private hitCount: number = 0
  private missCount: number = 0

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config
  }

  // 获取缓存
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.missCount++
      return null
    }

    // 检查TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.missCount++
      return null
    }

    // 更新访问信息
    entry.accessCount++
    entry.lastAccessed = Date.now()
    this.hitCount++

    return entry.value
  }

  // 设置缓存
  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    }

    this.cache.set(key, entry)

    // 检查缓存大小
    if (this.cache.size > this.config.maxSize) {
      this.evictEntries()
    }
  }

  // 删除缓存
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 清空缓存
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  // 驱逐缓存条目
  private evictEntries(): void {
    const entries = Array.from(this.cache.entries())
    
    switch (this.config.strategy) {
      case 'lru':
        // 最近最少使用
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
        break
      case 'fifo':
        // 先进先出
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
        break
      case 'ttl':
        // 基于TTL
        entries.sort((a, b) => {
          const aExpiry = a[1].timestamp + a[1].ttl
          const bExpiry = b[1].timestamp + b[1].ttl
          return aExpiry - bExpiry
        })
        break
    }

    // 删除最旧的条目
    const toDelete = entries.slice(0, Math.floor(this.config.maxSize * 0.1))
    toDelete.forEach(([key]) => this.cache.delete(key))
  }

  // 获取缓存统计
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    hitCount: number
    missCount: number
  } {
    const totalRequests = this.hitCount + this.missCount
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate,
      hitCount: this.hitCount,
      missCount: this.missCount
    }
  }

  // 预热缓存
  async warmup<K extends string>(
    keys: K[],
    fetcher: (key: K) => Promise<T>
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        const value = await fetcher(key)
        this.set(key, value)
      } catch (error) {
        console.warn(`缓存预热失败: ${key}`, error)
      }
    })

    await Promise.allSettled(promises)
  }
}

// 全局实例
export const performanceMonitor = new PerformanceMonitor()
export const cacheManager = new CacheManager()

// 性能优化的API客户端
export class OptimizedAPIClient {
  private cache: CacheManager
  private performanceMonitor: PerformanceMonitor

  constructor() {
    this.cache = new CacheManager({
      ttl: 300000, // 5分钟
      maxSize: 500,
      strategy: 'lru'
    })
    this.performanceMonitor = performanceMonitor
  }

  // 优化的GET请求
  async get<T>(url: string, options?: RequestInit, cacheKey?: string): Promise<T> {
    const startTime = Date.now()
    const key = cacheKey || url

    // 尝试从缓存获取
    const cached = this.cache.get(key)
    if (cached) {
      this.performanceMonitor.recordMetric('cacheHit', 1, 'count')
      return cached
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FluLink-Client/4.0.0',
          ...options?.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime

      // 记录性能指标
      this.performanceMonitor.recordMetric('apiResponse', responseTime, 'ms', { url })

      // 缓存响应
      this.cache.set(key, data)

      return data
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.performanceMonitor.recordMetric('apiError', responseTime, 'ms', { url, error: error.message })
      throw error
    }
  }

  // 优化的POST请求
  async post<T>(url: string, data: any, options?: RequestInit): Promise<T> {
    const startTime = Date.now()

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'FluLink-Client/4.0.0',
          ...options?.headers
        },
        body: JSON.stringify(data),
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const responseTime = Date.now() - startTime

      this.performanceMonitor.recordMetric('apiResponse', responseTime, 'ms', { url, method: 'POST' })

      return result
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.performanceMonitor.recordMetric('apiError', responseTime, 'ms', { url, method: 'POST', error: error.message })
      throw error
    }
  }

  // 批量请求
  async batch<T>(requests: Array<{ url: string; options?: RequestInit; cacheKey?: string }>): Promise<T[]> {
    const startTime = Date.now()
    
    const promises = requests.map(({ url, options, cacheKey }) => 
      this.get<T>(url, options, cacheKey)
    )

    try {
      const results = await Promise.allSettled(promises)
      const responseTime = Date.now() - startTime

      this.performanceMonitor.recordMetric('batchRequest', responseTime, 'ms', { 
        count: requests.length,
        successCount: results.filter(r => r.status === 'fulfilled').length
      })

      return results.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ).filter(Boolean) as T[]
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.performanceMonitor.recordMetric('batchError', responseTime, 'ms', { 
        count: requests.length,
        error: error.message 
      })
      throw error
    }
  }

  // 获取缓存统计
  getCacheStats() {
    return this.cache.getStats()
  }

  // 清空缓存
  clearCache() {
    this.cache.clear()
  }
}

// React Hook for Performance Monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>([])
  const [report, setReport] = React.useState(performanceMonitor.getPerformanceReport())

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getMetrics())
      setReport(performanceMonitor.getPerformanceReport())
    }

    const metricCallback = () => {
      updateMetrics()
    }

    performanceMonitor.onMetric(metricCallback)

    // 定期更新
    const interval = setInterval(updateMetrics, 5000)

    // 初始更新
    updateMetrics()

    return () => {
      clearInterval(interval)
    }
  }, [])

  const recordMetric = React.useCallback((name: string, value: number, unit?: string, context?: Record<string, any>) => {
    performanceMonitor.recordMetric(name, value, unit, context)
  }, [])

  return {
    metrics,
    report,
    recordMetric
  }
}

// React Hook for Caching
export function useCache<T = any>(config?: CacheConfig) {
  const [cache] = React.useState(() => new CacheManager<T>(config))

  const get = React.useCallback((key: string) => {
    return cache.get(key)
  }, [cache])

  const set = React.useCallback((key: string, value: T, ttl?: number) => {
    cache.set(key, value, ttl)
  }, [cache])

  const remove = React.useCallback((key: string) => {
    cache.delete(key)
  }, [cache])

  const clear = React.useCallback(() => {
    cache.clear()
  }, [cache])

  const stats = React.useCallback(() => {
    return cache.getStats()
  }, [cache])

  return {
    get,
    set,
    remove,
    clear,
    stats
  }
}

// 页面加载性能监控
export function usePageLoadPerformance() {
  React.useEffect(() => {
    const startTime = Date.now()

    const handleLoad = () => {
      const loadTime = Date.now() - startTime
      performanceMonitor.recordMetric('pageLoad', loadTime, 'ms', {
        url: window.location.pathname,
        userAgent: navigator.userAgent
      })
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])
}

// 渲染性能监控
export function useRenderPerformance(componentName: string) {
  React.useEffect(() => {
    const startTime = Date.now()

    return () => {
      const renderTime = Date.now() - startTime
      performanceMonitor.recordMetric('renderTime', renderTime, 'ms', {
        component: componentName
      })
    }
  })
}

// 开发环境性能调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 暴露到全局对象用于调试
  (window as any).performanceMonitor = performanceMonitor
  (window as any).cacheManager = cacheManager
}
