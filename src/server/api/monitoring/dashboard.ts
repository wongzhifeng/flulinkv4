// src/server/api/monitoring/dashboard.ts
// 基于《德道经》"无为而无不为"的监控仪表板API

import { Request, Response } from 'express';
import { performanceMonitor } from '../../../lib/monitoring/performance-middleware';
import { errorMonitor } from '../../../lib/monitoring/error-monitoring';
import { db } from '../../../lib/database';
import { users, virusStrains, infectionRecords } from '../../../shared/schema';
import { gte } from 'drizzle-orm';

export async function getDashboardData(req: Request, res: Response) {
  try {
    const { timeRange = '24h' } = req.query;
    
    // 并行获取各种监控数据
    const [
      performanceStats,
      errorStats,
      userStats,
      strainStats,
      infectionStats
    ] = await Promise.all([
      performanceMonitor.getPerformanceStats(timeRange as string),
      errorMonitor.getErrorStats(timeRange as string),
      getUserStats(timeRange as string),
      getStrainStats(timeRange as string),
      getInfectionStats(timeRange as string)
    ]);

    const dashboardData = {
      overview: {
        performance: performanceStats,
        errors: errorStats,
        users: userStats,
        strains: strainStats,
        infections: infectionStats,
      },
      health: {
        overall: calculateOverallHealth(performanceStats, errorStats),
        performance: performanceStats?.averageResponseTime < 500,
        errors: errorStats?.errorLevels?.error < 10,
        database: true, // 假设数据库健康
      },
      alerts: generateAlerts(performanceStats, errorStats),
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 监控仪表板API错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function getSystemHealth(req: Request, res: Response) {
  try {
    const [
      performanceHealth,
      errorHealth,
      databaseHealth
    ] = await Promise.all([
      getPerformanceHealth(),
      getErrorHealth(),
      getDatabaseHealth()
    ]);

    const overallHealth = 
      performanceHealth && 
      errorHealth && 
      databaseHealth;

    res.json({
      success: true,
      data: {
        overall: overallHealth,
        performance: performanceHealth,
        errors: errorHealth,
        database: databaseHealth,
        status: overallHealth ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ 系统健康检查API错误:', error);
    res.status(500).json({
      success: false,
      message: '系统健康检查失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    });
  }
}

// 辅助函数
async function getUserStats(timeRange: string): Promise<any> {
  try {
    const now = new Date();
    const timeRangeMs = parseTimeRange(timeRange);
    const startTime = new Date(now.getTime() - timeRangeMs);

    const totalUsers = await db.select().from(users);
    const newUsers = await db
      .select()
      .from(users)
      .where(gte(users.createdAt, startTime.toISOString()));

    return {
      total: totalUsers.length,
      new: newUsers.length,
      growth: newUsers.length / Math.max(totalUsers.length, 1) * 100,
    };
  } catch (error) {
    console.error('❌ 获取用户统计失败:', error);
    return { total: 0, new: 0, growth: 0 };
  }
}

async function getStrainStats(timeRange: string): Promise<any> {
  try {
    const now = new Date();
    const timeRangeMs = parseTimeRange(timeRange);
    const startTime = new Date(now.getTime() - timeRangeMs);

    const totalStrains = await db.select().from(virusStrains);
    const newStrains = await db
      .select()
      .from(virusStrains)
      .where(gte(virusStrains.createdAt, startTime.toISOString()));

    return {
      total: totalStrains.length,
      new: newStrains.length,
      active: totalStrains.filter(s => !s.isDormant).length,
    };
  } catch (error) {
    console.error('❌ 获取毒株统计失败:', error);
    return { total: 0, new: 0, active: 0 };
  }
}

async function getInfectionStats(timeRange: string): Promise<any> {
  try {
    const now = new Date();
    const timeRangeMs = parseTimeRange(timeRange);
    const startTime = new Date(now.getTime() - timeRangeMs);

    const totalInfections = await db.select().from(infectionRecords);
    const newInfections = await db
      .select()
      .from(infectionRecords)
      .where(gte(infectionRecords.infectedAt, startTime.toISOString()));

    return {
      total: totalInfections.length,
      new: newInfections.length,
      active: totalInfections.filter(i => i.status === 'active').length,
    };
  } catch (error) {
    console.error('❌ 获取感染统计失败:', error);
    return { total: 0, new: 0, active: 0 };
  }
}

async function getPerformanceHealth(): Promise<boolean> {
  try {
    const stats = await performanceMonitor.getPerformanceStats('1h');
    return stats && stats.averageResponseTime < 500 && stats.errorRate < 5;
  } catch (error) {
    return false;
  }
}

async function getErrorHealth(): Promise<boolean> {
  try {
    const stats = await errorMonitor.getErrorStats('1h');
    return stats && stats.errorLevels?.error < 10;
  } catch (error) {
    return false;
  }
}

async function getDatabaseHealth(): Promise<boolean> {
  try {
    await db.select().from(users).limit(1);
    return true;
  } catch (error) {
    return false;
  }
}

function calculateOverallHealth(performanceStats: any, errorStats: any): boolean {
  if (!performanceStats || !errorStats) return false;
  
  return (
    performanceStats.averageResponseTime < 500 &&
    performanceStats.errorRate < 5 &&
    errorStats.errorLevels?.error < 10
  );
}

function generateAlerts(performanceStats: any, errorStats: any): any[] {
  const alerts: any[] = [];

  if (performanceStats) {
    if (performanceStats.averageResponseTime > 1000) {
      alerts.push({
        type: 'warning',
        message: 'API响应时间过长',
        value: performanceStats.averageResponseTime,
        threshold: 1000,
      });
    }

    if (performanceStats.errorRate > 10) {
      alerts.push({
        type: 'error',
        message: 'API错误率过高',
        value: performanceStats.errorRate,
        threshold: 10,
      });
    }
  }

  if (errorStats && errorStats.errorLevels?.error > 20) {
    alerts.push({
      type: 'error',
      message: '系统错误过多',
      value: errorStats.errorLevels.error,
      threshold: 20,
    });
  }

  return alerts;
}

function parseTimeRange(timeRange: string): number {
  const timeRanges: { [key: string]: number } = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };
  return timeRanges[timeRange] || timeRanges['24h'];
}
