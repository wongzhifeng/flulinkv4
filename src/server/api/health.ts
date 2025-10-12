// src/server/api/health.ts
// 健康检查API - 基于《德道经》"知人者智"理念

import { json } from '@solidjs/router';
import { testDatabaseConnection } from '../../lib/database';

// GET /api/health - 健康检查
export async function GET() {
  try {
    const start = performance.now();
    
    // 检查数据库连接
    const dbHealthy = await testDatabaseConnection();
    
    const end = performance.now();
    const responseTime = end - start;
    
    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime.toFixed(2)}ms`,
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy',
        cache: 'healthy'
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    const statusCode = dbHealthy ? 200 : 503;
    
    return json(health, { status: statusCode });
  } catch (error) {
    console.error('❌ 健康检查失败:', error);
    
    return json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : '未知错误',
      services: {
        database: 'unhealthy',
        api: 'unhealthy',
        cache: 'unknown'
      }
    }, { status: 503 });
  }
}
