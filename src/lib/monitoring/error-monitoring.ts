// src/lib/monitoring/error-monitoring.ts
// 基于《德道经》"知足者富"的错误监控系统

import { nanoid } from 'nanoid';
import { db } from '../database';
import { errorLogs } from '../../shared/schema';
import { and, eq, gte, desc } from 'drizzle-orm';

export interface ErrorInfo {
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  metadata?: any;
}

export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errorBuffer: ErrorInfo[] = [];
  private readonly bufferSize = 50;
  private readonly flushInterval = 15000; // 15秒

  private constructor() {
    // 启动定时刷新
    setInterval(() => this.flushErrors(), this.flushInterval);
  }

  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }

  public recordError(error: ErrorInfo): void {
    this.errorBuffer.push(error);
    
    // 如果是严重错误，立即刷新
    if (error.level === 'error') {
      this.flushErrors();
    }
    
    // 如果缓冲区满了，立即刷新
    if (this.errorBuffer.length >= this.bufferSize) {
      this.flushErrors();
    }
  }

  private async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    const errorsToFlush = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      for (const error of errorsToFlush) {
        await db.insert(errorLogs).values({
          id: nanoid(),
          level: error.level,
          message: error.message,
          stack: error.stack,
          url: error.url,
          userId: error.userId,
          metadata: error.metadata ? JSON.stringify(error.metadata) : null,
          resolved: 0,
        });
      }
      console.log(`✅ 错误日志已刷新: ${errorsToFlush.length} 条记录`);
    } catch (error) {
      console.error('❌ 错误日志刷新失败:', error);
      // 重新加入缓冲区
      this.errorBuffer.unshift(...errorsToFlush);
    }
  }

  public async getErrorStats(timeRange: string = '24h'): Promise<any> {
    try {
      const now = Date.now();
      const timeRangeMs = this.parseTimeRange(timeRange);
      const startTime = now - timeRangeMs;

      const errors = await db
        .select()
        .from(errorLogs)
        .where(
          and(
            gte(errorLogs.createdAt, new Date(startTime).toISOString()),
            eq(errorLogs.resolved, 0)
          )
        );

      return this.aggregateErrorStats(errors);
    } catch (error) {
      console.error('❌ 获取错误统计失败:', error);
      return null;
    }
  }

  public async getUnresolvedErrors(): Promise<any[]> {
    try {
      const errors = await db
        .select()
        .from(errorLogs)
        .where(eq(errorLogs.resolved, 0))
        .orderBy(desc(errorLogs.createdAt))
        .limit(50);

      return errors.map(error => ({
        id: error.id,
        level: error.level,
        message: error.message,
        url: error.url,
        userId: error.userId,
        metadata: error.metadata ? JSON.parse(error.metadata) : null,
        createdAt: error.createdAt,
      }));
    } catch (error) {
      console.error('❌ 获取未解决错误失败:', error);
      return [];
    }
  }

  public async markErrorResolved(errorId: string): Promise<boolean> {
    try {
      await db
        .update(errorLogs)
        .set({
          resolved: 1,
          resolvedAt: new Date().toISOString(),
        })
        .where(eq(errorLogs.id, errorId));

      console.log(`✅ 错误已标记为已解决: ${errorId}`);
      return true;
    } catch (error) {
      console.error('❌ 标记错误解决失败:', error);
      return false;
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

  private aggregateErrorStats(errors: any[]): any {
    const aggregated = {
      totalErrors: errors.length,
      errorLevels: {
        error: 0,
        warning: 0,
        info: 0,
      },
      topErrors: [] as any[],
      errorTrend: [] as any[],
    };

    if (errors.length === 0) return aggregated;

    const errorCounts: { [key: string]: number } = {};
    const hourlyCounts: { [key: string]: number } = {};

    for (const error of errors) {
      // 统计错误级别
      aggregated.errorLevels[error.level as keyof typeof aggregated.errorLevels]++;

      // 统计错误消息
      const message = error.message.substring(0, 100); // 截取前100个字符
      errorCounts[message] = (errorCounts[message] || 0) + 1;

      // 统计小时趋势
      const hour = new Date(error.createdAt).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    }

    // 排序错误消息
    aggregated.topErrors = Object.entries(errorCounts)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 生成小时趋势
    aggregated.errorTrend = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyCounts[hour] || 0,
    }));

    return aggregated;
  }
}

// 错误监控中间件
export function errorMonitoringMiddleware(error: Error, req: Request, userId?: string) {
  const monitor = ErrorMonitor.getInstance();
  
  monitor.recordError({
    level: 'error',
    message: error.message,
    stack: error.stack,
    url: req.url,
    userId,
    metadata: {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      timestamp: new Date().toISOString(),
    },
  });
}

// 全局错误处理器
export function setupGlobalErrorHandling() {
  // 捕获未处理的Promise拒绝
  process.on('unhandledRejection', (reason, promise) => {
    const monitor = ErrorMonitor.getInstance();
    monitor.recordError({
      level: 'error',
      message: `Unhandled Promise Rejection: ${reason}`,
      metadata: {
        promise: promise.toString(),
        timestamp: new Date().toISOString(),
      },
    });
  });

  // 捕获未处理的异常
  process.on('uncaughtException', (error) => {
    const monitor = ErrorMonitor.getInstance();
    monitor.recordError({
      level: 'error',
      message: `Uncaught Exception: ${error.message}`,
      stack: error.stack,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  });
}

// 导出错误监控器实例
export const errorMonitor = ErrorMonitor.getInstance();
