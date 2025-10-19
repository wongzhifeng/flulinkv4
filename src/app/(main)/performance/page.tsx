// FluLink v4.0 性能监控仪表板
// 基于《德道经》"知足者富"哲学，提供透明的性能监控

'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button, Tag, Loading } from '@/components/ui/index'
import { usePerformanceMonitoring, useCache, OptimizedAPIClient } from '@/lib/performance'
import { cn, formatDate } from '@/lib/utils'

export default function PerformanceDashboard() {
  const { metrics, report, recordMetric } = usePerformanceMonitoring()
  const cache = useCache()
  const [apiClient] = useState(() => new OptimizedAPIClient())
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const getStatusColor = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return 'text-accent-cyan'
      case 'warning': return 'text-accent-gold'
      case 'poor': return 'text-accent-red'
      default: return 'text-text-secondary'
    }
  }

  const getStatusIcon = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good': return 'fas fa-check-circle'
      case 'warning': return 'fas fa-exclamation-triangle'
      case 'poor': return 'fas fa-times-circle'
      default: return 'fas fa-question-circle'
    }
  }

  const runPerformanceTest = async () => {
    setIsTesting(true)
    const results: any[] = []

    try {
      // 测试API响应时间
      const apiStart = Date.now()
      try {
        await apiClient.get('/api/health')
        results.push({
          name: 'API健康检查',
          duration: Date.now() - apiStart,
          status: 'success'
        })
      } catch (error) {
        results.push({
          name: 'API健康检查',
          duration: Date.now() - apiStart,
          status: 'error',
          error: error.message
        })
      }

      // 测试缓存性能
      const cacheStart = Date.now()
      const testKey = 'perf-test-' + Date.now()
      const testValue = { data: 'test', timestamp: Date.now() }
      
      cache.set(testKey, testValue)
      const cached = cache.get(testKey)
      
      results.push({
        name: '缓存读写',
        duration: Date.now() - cacheStart,
        status: cached ? 'success' : 'error'
      })

      // 测试批量请求
      const batchStart = Date.now()
      try {
        await apiClient.batch([
          { url: '/api/health', cacheKey: 'health-1' },
          { url: '/api/health', cacheKey: 'health-2' },
          { url: '/api/health', cacheKey: 'health-3' }
        ])
        results.push({
          name: '批量请求',
          duration: Date.now() - batchStart,
          status: 'success'
        })
      } catch (error) {
        results.push({
          name: '批量请求',
          duration: Date.now() - batchStart,
          status: 'error',
          error: error.message
        })
      }

      setTestResults(results)
    } finally {
      setIsTesting(false)
    }
  }

  const cacheStats = cache.stats()

  return (
    <div className="min-h-screen bg-primary-bg p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text-gold mb-2">
            性能监控仪表板
          </h1>
          <p className="text-text-secondary">
            FluLink v4.0 性能优化与缓存监控
          </p>
        </div>

        {/* 性能概览 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              性能概览
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 页面加载时间 */}
              <div className="bg-primary-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-text-secondary">页面加载</div>
                  <i className={cn(getStatusIcon(report.pageLoad.status), getStatusColor(report.pageLoad.status))}></i>
                </div>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {report.pageLoad.average.toFixed(0)}ms
                </div>
                <div className="text-xs text-text-secondary">
                  目标: &lt;{report.pageLoad.target}ms
                </div>
              </div>

              {/* API响应时间 */}
              <div className="bg-primary-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-text-secondary">API响应</div>
                  <i className={cn(getStatusIcon(report.apiResponse.status), getStatusColor(report.apiResponse.status))}></i>
                </div>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {report.apiResponse.average.toFixed(0)}ms
                </div>
                <div className="text-xs text-text-secondary">
                  目标: &lt;{report.apiResponse.target}ms
                </div>
              </div>

              {/* 渲染时间 */}
              <div className="bg-primary-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-text-secondary">渲染时间</div>
                  <i className={cn(getStatusIcon(report.renderTime.status), getStatusColor(report.renderTime.status))}></i>
                </div>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {report.renderTime.average.toFixed(0)}ms
                </div>
                <div className="text-xs text-text-secondary">
                  目标: &lt;{report.renderTime.target}ms
                </div>
              </div>

              {/* 缓存命中率 */}
              <div className="bg-primary-secondary rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-text-secondary">缓存命中率</div>
                  <i className={cn(getStatusIcon(report.cacheHitRate.status), getStatusColor(report.cacheHitRate.status))}></i>
                </div>
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {(report.cacheHitRate.average * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-text-secondary">
                  目标: &gt;{(report.cacheHitRate.target * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 缓存统计 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                缓存统计
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => cache.clear()}
                  variant="secondary"
                  size="sm"
                >
                  <i className="fas fa-trash mr-1"></i>
                  清空缓存
                </Button>
                <Button
                  onClick={runPerformanceTest}
                  loading={isTesting}
                  size="sm"
                >
                  <i className="fas fa-play mr-1"></i>
                  性能测试
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {cacheStats.size}
                </div>
                <div className="text-sm text-text-secondary">缓存条目</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-text-primary mb-1">
                  {cacheStats.maxSize}
                </div>
                <div className="text-sm text-text-secondary">最大容量</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-cyan mb-1">
                  {(cacheStats.hitRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-text-secondary">命中率</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-gold mb-1">
                  {cacheStats.hitCount}
                </div>
                <div className="text-sm text-text-secondary">命中次数</div>
              </div>
              <div className="bg-primary-secondary rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-accent-red mb-1">
                  {cacheStats.missCount}
                </div>
                <div className="text-sm text-text-secondary">未命中</div>
              </div>
            </div>
          </div>
        </Card>

        {/* 性能测试结果 */}
        {testResults.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">
                性能测试结果
              </h2>

              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl',
                      result.status === 'success' ? 'bg-accent-cyan/10' : 'bg-accent-red/10'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <i className={cn(
                        'fas text-xl',
                        result.status === 'success' ? 'fa-check-circle text-accent-cyan' : 'fa-times-circle text-accent-red'
                      )}></i>
                      <span className="font-semibold text-text-primary">
                        {result.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-text-primary">
                        {result.duration}ms
                      </div>
                      {result.error && (
                        <div className="text-xs text-accent-red">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 性能指标历史 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              性能指标历史
            </h2>

            <div className="space-y-3">
              {metrics.slice(-10).reverse().map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-primary-secondary rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-gold"></div>
                    <span className="font-medium text-text-primary">
                      {metric.name}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {formatDate(metric.timestamp)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-text-primary">
                      {metric.value.toFixed(2)}{metric.unit}
                    </div>
                    {metric.context && (
                      <div className="text-xs text-text-secondary">
                        {Object.entries(metric.context).map(([key, value]) => 
                          `${key}: ${value}`
                        ).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 性能优化建议 */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              性能优化建议
            </h2>

            <div className="space-y-3">
              {report.pageLoad.status === 'poor' && (
                <div className="p-3 bg-accent-red/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-exclamation-triangle text-accent-red"></i>
                    <span className="font-semibold text-accent-red">页面加载优化</span>
                  </div>
                  <p className="text-sm text-text-primary">
                    页面加载时间过长，建议启用代码分割、图片优化和CDN加速
                  </p>
                </div>
              )}

              {report.apiResponse.status === 'poor' && (
                <div className="p-3 bg-accent-red/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-exclamation-triangle text-accent-red"></i>
                    <span className="font-semibold text-accent-red">API响应优化</span>
                  </div>
                  <p className="text-sm text-text-primary">
                    API响应时间过长，建议增加缓存、优化数据库查询和启用压缩
                  </p>
                </div>
              )}

              {report.cacheHitRate.status === 'poor' && (
                <div className="p-3 bg-accent-red/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-exclamation-triangle text-accent-red"></i>
                    <span className="font-semibold text-accent-red">缓存优化</span>
                  </div>
                  <p className="text-sm text-text-primary">
                    缓存命中率过低，建议调整缓存策略和TTL设置
                  </p>
                </div>
              )}

              {report.pageLoad.status === 'good' && report.apiResponse.status === 'good' && report.cacheHitRate.status === 'good' && (
                <div className="p-3 bg-accent-cyan/10 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-check-circle text-accent-cyan"></i>
                    <span className="font-semibold text-accent-cyan">性能优秀</span>
                  </div>
                  <p className="text-sm text-text-primary">
                    所有性能指标都达到目标，系统运行良好
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
