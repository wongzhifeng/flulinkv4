// src/lib/monitoring/performance-middleware.ts
// 基于《德道经》"知人者智，自知者明"的性能监控中间件

import { nanoid } from 'nanoid';
import { db } from '../database';
import { monitoringMetrics } from '../../shared/schema';
import { and, eq, gte, desc } from 'drizzle-orm';

export interface PerformanceMetrics {
  url: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsBuffer: PerformanceMetrics[] = [];
  private readonly bufferSize = 100;
  private readonly flushInterval = 30000; // 30秒

  private constructor() {
    // 启动定时刷新
    setInterval(() => this.flushMetrics(), this.flushInterval);
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public recordMetric(metric: PerformanceMetrics): void {
    this.metricsBuffer.push(metric);
    
    // 如果缓冲区满了，立即刷新
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flushMetrics();
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      for (const metric of metricsToFlush) {
        await db.insert(monitoringMetrics).values({
          id: nanoid(),
          type: 'performance',
          metric: `${metric.method}:${metric.url}`,
          value: metric.duration,
          timestamp: metric.timestamp,
          metadata: JSON.stringify({
            status: metric.status,
            userId: metric.userId,
            ipAddress: metric.ipAddress,
            userAgent: metric.userAgent,
          }),
        });
      }
      console.log(`✅ 性能指标已刷新: ${metricsToFlush.length} 条记录`);
    } catch (error) {
      console.error('❌ 性能指标刷新失败:', error);
      // 重新加入缓冲区
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  public async getPerformanceStats(timeRange: string = '24h'): Promise<any> {
    try {
      const now = Date.now();
      const timeRangeMs = this.parseTimeRange(timeRange);
      const startTime = now - timeRangeMs;

      const stats = await db
        .select()
        .from(monitoringMetrics)
        .where(
          and(
            eq(monitoringMetrics.type, 'performance'),
            gte(monitoringMetrics.timestamp, startTime)
          )
        );

      return this.aggregatePerformanceStats(stats);
    } catch (error) {
      console.error('❌ 获取性能统计失败:', error);
      return null;
    }
  }

  private parseTimeRange(timeRange: string): number {
    const timeRanges: { [key: string]: number } = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    return timeRanges[timeRange] || timeRanges['24h'];
  }

  private aggregatePerformanceStats(stats: any[]): any {
    const aggregated = {
      totalRequests: stats.length,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: Infinity,
      errorRate: 0,
      topEndpoints: [] as any[],
    };

    if (stats.length === 0) return aggregated;

    let totalDuration = 0;
    let errorCount = 0;
    const endpointStats: { [key: string]: { count: number; totalDuration: number; errors: number } } = {};

    for (const stat of stats) {
      const metadata = JSON.parse(stat.metadata || '{}');
      const duration = stat.value;
      
      totalDuration += duration;
      aggregated.maxResponseTime = Math.max(aggregated.maxResponseTime, duration);
      aggregated.minResponseTime = Math.min(aggregated.minResponseTime, duration);

      if (metadata.status >= 400) {
        errorCount++;
      }

      // 统计端点
      const endpoint = stat.metric;
      if (!endpointStats[endpoint]) {
        endpointStats[endpoint] = { count: 0, totalDuration: 0, errors: 0 };
      }
      endpointStats[endpoint].count++;
      endpointStats[endpoint].totalDuration += duration;
      if (metadata.status >= 400) {
        endpointStats[endpoint].errors++;
      }
    }

    aggregated.averageResponseTime = totalDuration / stats.length;
    aggregated.errorRate = (errorCount / stats.length) * 100;
    aggregated.minResponseTime = aggregated.minResponseTime === Infinity ? 0 : aggregated.minResponseTime;

    // 排序端点
    aggregated.topEndpoints = Object.entries(endpointStats)
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        averageDuration: stats.totalDuration / stats.count,
        errorRate: (stats.errors / stats.count) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return aggregated;
  }
}

// 性能监控中间件
export function performanceMiddleware(req: Request, next: () => Promise<Response>) {
  const start = Date.now();
  const url = new URL(req.url);
  const method = req.method;
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  return next().then(response => {
    const duration = Date.now() - start;
    
    const monitor = PerformanceMonitor.getInstance();
    monitor.recordMetric({
      url: url.pathname,
      method,
      duration,
      status: response.status,
      timestamp: Date.now(),
      ipAddress,
      userAgent,
    });

    return response;
  }).catch(error => {
    const duration = Date.now() - start;
    
    const monitor = PerformanceMonitor.getInstance();
    monitor.recordMetric({
      url: url.pathname,
      method,
      duration,
      status: 500,
      timestamp: Date.now(),
      ipAddress,
      userAgent,
    });

    throw error;
  });
}

// 导出性能监控器实例
export const performanceMonitor = PerformanceMonitor.getInstance();
