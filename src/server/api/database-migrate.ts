// src/server/api/database-migrate.ts
// 数据库迁移API端点 - 基于《德道经》"无为而无不为"哲学

import { runDatabaseMigrations } from '../../lib/database';

export async function handleDatabaseMigrate(request: Request): Promise<Response> {
  try {
    await runDatabaseMigrations();
    
    return new Response(JSON.stringify({
      success: true,
      message: '数据库迁移执行完成',
      database: process.env.TURSO_DATABASE_URL ? 'Turso' : 'Mock',
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('数据库迁移失败:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '数据库迁移失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
