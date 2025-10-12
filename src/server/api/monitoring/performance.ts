// src/server/api/monitoring/performance.ts
// 基于《德道经》"知人者智，自知者明"的性能监控API

import { Request, Response } from 'express';
import { performanceMonitor } from '../../../lib/monitoring/performance-middleware';

export async function getPerformanceStats(req: Request, res: Response) {
  try {
    const { timeRange = '24h' } = req.query;
    
    const stats = await performanceMonitor.getPerformanceStats(timeRange as string);
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        message: '获取性能统计失败',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 性能监控API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getPerformanceHealth(req: Request, res: Response) {
  try {
    const stats = await performanceMonitor.getPerformanceStats('1h');
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        message: '性能监控服务不可用',
        timestamp: new Date().toISOString(),
      });
    }

    // 健康检查逻辑
    const isHealthy = 
      stats.averageResponseTime < 500 && // 平均响应时间小于500ms
      stats.errorRate < 5 && // 错误率小于5%
      stats.totalRequests > 0; // 有请求记录

    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        averageResponseTime: stats.averageResponseTime,
        errorRate: stats.errorRate,
        totalRequests: stats.totalRequests,
        status: isHealthy ? 'healthy' : 'degraded',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 性能健康检查API错误:', error);
    res.status(500).json({
      success: false,
      message: '性能监控服务不可用',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    });
  }
}
