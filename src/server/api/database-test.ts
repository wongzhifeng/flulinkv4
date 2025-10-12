// src/server/api/database-test.ts
// 基于《德道经》第37章"道常无为而无不为"的数据库测试API

import { APIHandler } from '@solidjs/router';
import { testDatabaseConnection, syncDatabase } from '../../lib/database';
import { db, mockDb } from '../../lib/database';

// 数据库连接测试 - 对应《德道经》"知人者智"
export const GET: APIHandler = async () => {
  try {
    const isConnected = await testDatabaseConnection();
    
    return new Response(JSON.stringify({
      success: true,
      message: '数据库连接测试完成',
      connected: isConnected,
      database: db ? 'Turso' : 'Mock',
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('数据库测试失败:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '数据库连接测试失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// 数据库同步测试 - 对应《德道经》"无为而无不为"
export const POST: APIHandler = async () => {
  try {
    await syncDatabase();
    
    return new Response(JSON.stringify({
      success: true,
      message: '数据库同步测试完成',
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('数据库同步失败:', error);
    return new Response(JSON.stringify({
      success: false,
      message: '数据库同步失败',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
