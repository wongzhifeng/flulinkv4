// src/server/api/monitoring/errors.ts
// 基于《德道经》"知足者富"的错误监控API

import { Request, Response } from 'express';
import { errorMonitor } from '../../../lib/monitoring/error-monitoring';

export async function getErrorStats(req: Request, res: Response) {
  try {
    const { timeRange = '24h' } = req.query;
    
    const stats = await errorMonitor.getErrorStats(timeRange as string);
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        message: '获取错误统计失败',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 错误监控API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getUnresolvedErrors(req: Request, res: Response) {
  try {
    const errors = await errorMonitor.getUnresolvedErrors();
    
    res.json({
      success: true,
      data: errors,
      count: errors.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 获取未解决错误API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function markErrorResolved(req: Request, res: Response) {
  try {
    const { errorId } = req.params;
    
    if (!errorId) {
      return res.status(400).json({
        success: false,
        message: '错误ID不能为空',
        timestamp: new Date().toISOString(),
      });
    }

    const success = await errorMonitor.markErrorResolved(errorId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: '标记错误解决失败',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: '错误已标记为已解决',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 标记错误解决API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getErrorHealth(req: Request, res: Response) {
  try {
    const stats = await errorMonitor.getErrorStats('1h');
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        message: '错误监控服务不可用',
        timestamp: new Date().toISOString(),
      });
    }

    // 健康检查逻辑
    const isHealthy = 
      stats.errorLevels.error < 10 && // 1小时内错误少于10个
      stats.totalErrors < 50; // 总错误少于50个

    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        totalErrors: stats.totalErrors,
        errorLevels: stats.errorLevels,
        status: isHealthy ? 'healthy' : 'degraded',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 错误健康检查API错误:', error);
    res.status(500).json({
      success: false,
      message: '错误监控服务不可用',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    });
  }
}
