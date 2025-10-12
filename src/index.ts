// src/index.ts
// FluLink应用主入口 - 基于《德道经》"无为而治"哲学

import { serve } from 'bun';
import { GeographicPropagationAPI } from './server/services/GeographicPropagationAPI';
import { runDatabaseMigrations } from './lib/database';

// 模拟数据存储 - 实际部署时将替换为Turso数据库
const mockStrains = [
  {
    id: 'strain_001',
    name: '生活毒株',
    type: 'life',
    location: { lat: 39.9042, lng: 116.4074 },
    tags: ['生活', '日常', '分享'],
    createdAt: '2025-01-12T01:00:00.000Z',
    infectionCount: 5
  },
  {
    id: 'strain_002',
    name: '观点毒株',
    type: 'opinion',
    location: { lat: 31.2304, lng: 121.4737 },
    tags: ['观点', '思考', '讨论'],
    createdAt: '2025-01-12T02:00:00.000Z',
    infectionCount: 3
  },
  {
    id: 'strain_003',
    name: '兴趣毒株',
    type: 'interest',
    location: { lat: 22.3193, lng: 114.1694 },
    tags: ['兴趣', '爱好', '技能'],
    createdAt: '2025-01-12T03:00:00.000Z',
    infectionCount: 8
  }
];

// 初始化地理传播算法API
const propagationAPI = new GeographicPropagationAPI();

// 自动执行数据库迁移 - 对应《德道经》"无为而无不为"
console.log('🚀 FluLink应用启动中...');
runDatabaseMigrations().then(() => {
  console.log('✅ 数据库迁移完成，应用准备就绪');
}).catch((error) => {
  console.error('❌ 数据库迁移失败:', error);
});

const server = serve({
  port: process.env.PORT || 8080,
  hostname: '0.0.0.0',  // 监听所有网络接口
  async fetch(request) {
    const url = new URL(request.url);
    
    // API路由
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'FluLink API is running'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 数据库测试API - 对应《德道经》"知人者智"
    if (url.pathname === '/api/database-test') {
      try {
        const { testDatabaseConnection, syncDatabase } = await import('./lib/database');
        
        if (request.method === 'GET') {
          const isConnected = await testDatabaseConnection();
          
          return new Response(JSON.stringify({
            success: true,
            message: '数据库连接测试完成',
            connected: isConnected,
            database: process.env.TURSO_DATABASE_URL ? 'Turso' : 'Mock',
            timestamp: new Date().toISOString(),
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (request.method === 'POST') {
          await syncDatabase();
          
          return new Response(JSON.stringify({
            success: true,
            message: '数据库同步测试完成',
            timestamp: new Date().toISOString(),
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('数据库测试失败:', error);
        return new Response(JSON.stringify({
          success: false,
          message: '数据库测试失败',
          error: error instanceof Error ? error.message : '未知错误',
          timestamp: new Date().toISOString(),
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 数据库迁移API - 对应《德道经》"无为而无不为"
    if (url.pathname === '/api/database-migrate') {
      try {
        const { handleDatabaseMigrate } = await import('./server/api/database-migrate');
        return await handleDatabaseMigrate(request);
      } catch (error) {
        console.error('数据库迁移API加载失败:', error);
        return new Response(JSON.stringify({
          success: false,
          message: '数据库迁移API加载失败',
          error: error instanceof Error ? error.message : '未知错误',
          timestamp: new Date().toISOString(),
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 认证API路由 - 对应《德道经》"修之于身，其德乃真"
    if (url.pathname.startsWith('/api/auth/')) {
      try {
        const { 
          handleRegister, 
          handleLogin, 
          handleLogout, 
          handleGetProfile, 
          handleUpdateProfile,
          handleRefreshToken,
          handleAuthHealth
        } = await import('./server/api/auth');
        
        // 用户注册
        if (url.pathname === '/api/auth/register' && request.method === 'POST') {
          return await handleRegister(request);
        }
        
        // 用户登录
        if (url.pathname === '/api/auth/login' && request.method === 'POST') {
          return await handleLogin(request);
        }
        
        // 用户登出
        if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
          return await handleLogout(request);
        }
        
        // 获取用户信息
        if (url.pathname === '/api/auth/profile' && request.method === 'GET') {
          return await handleGetProfile(request);
        }
        
        // 更新用户信息
        if (url.pathname === '/api/auth/profile' && request.method === 'PUT') {
          return await handleUpdateProfile(request);
        }
        
        // 令牌刷新
        if (url.pathname === '/api/auth/refresh' && request.method === 'POST') {
          return await handleRefreshToken(request);
        }
        
        // 认证服务健康检查
        if (url.pathname === '/api/auth/health' && request.method === 'GET') {
          return await handleAuthHealth(request);
        }
        
        // 未找到的认证端点
        return new Response(JSON.stringify({
          success: false,
          message: '认证API端点不存在',
          timestamp: new Date().toISOString(),
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('认证API加载失败:', error);
        return new Response(JSON.stringify({
          success: false,
          message: '认证API加载失败',
          error: error instanceof Error ? error.message : '未知错误',
          timestamp: new Date().toISOString(),
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 数据库表检查API - 调试用
    if (url.pathname === '/api/debug/tables') {
      try {
        const { tursoClient } = await import('./lib/database');
        if (tursoClient) {
          const result = await tursoClient.execute(`
            SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
          `);
          
          return new Response(JSON.stringify({
            success: true,
            message: '数据库表列表',
            tables: result.rows.map(row => row.name),
            timestamp: new Date().toISOString(),
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            message: 'Turso客户端未初始化',
            timestamp: new Date().toISOString(),
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: '检查数据库表失败',
          error: error instanceof Error ? error.message : '未知错误',
          timestamp: new Date().toISOString(),
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 简单表创建测试API - 调试用
    if (url.pathname === '/api/debug/create-test-table') {
      try {
        const { tursoClient } = await import('./lib/database');
        if (tursoClient) {
          // 创建简单的测试表
          await tursoClient.execute(`
            CREATE TABLE IF NOT EXISTS test_table (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          return new Response(JSON.stringify({
            success: true,
            message: '测试表创建成功',
            timestamp: new Date().toISOString(),
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            message: 'Turso客户端未初始化',
            timestamp: new Date().toISOString(),
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: '创建测试表失败',
          error: error instanceof Error ? error.message : '未知错误',
          timestamp: new Date().toISOString(),
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 临时测试API - 验证代码更新
    if (url.pathname === '/api/test-update') {
      return new Response(JSON.stringify({
        success: true,
        message: '代码更新成功，API路由正常工作',
        timestamp: new Date().toISOString(),
        version: '2025-01-12-v3'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 毒株API - 实现完整的CRUD操作
    if (url.pathname === '/api/strains') {
      if (request.method === 'GET') {
        // 获取所有毒株
        return new Response(JSON.stringify({
          success: true,
          data: mockStrains,
          message: '获取毒株列表成功',
          count: mockStrains.length
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (request.method === 'POST') {
        // 创建新毒株
        try {
          const body = await request.json();
          const newStrain = {
            id: `strain_${Date.now()}`,
            name: body.name || '未命名毒株',
            type: body.type || 'life',
            location: body.location || { lat: 0, lng: 0 },
            tags: body.tags || [],
            createdAt: new Date().toISOString(),
            infectionCount: 0
          };
          
          mockStrains.push(newStrain);
          
          return new Response(JSON.stringify({
            success: true,
            data: newStrain,
            message: '毒株创建成功'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: '请求数据格式错误',
            message: '创建毒株失败'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // 毒株感染API
    if (url.pathname.startsWith('/api/strains/') && url.pathname.endsWith('/infect')) {
      if (request.method === 'POST') {
        const strainId = url.pathname.split('/')[3];
        const strain = mockStrains.find(s => s.id === strainId);
        
        if (!strain) {
          return new Response(JSON.stringify({
            success: false,
            error: '毒株不存在',
            message: '感染失败'
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        strain.infectionCount += 1;
        
        return new Response(JSON.stringify({
          success: true,
          data: strain,
          message: '毒株感染成功'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
        // 地理传播算法API
        if (url.pathname === '/api/propagation/create') {
          if (request.method === 'POST') {
            try {
              const body = await request.json();
              const result = await propagationAPI.createPropagationTask(
                body.strainId,
                body.userLocation,
                body.propagationParams || {}
              );
              return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' }
              });
            } catch (error) {
              return new Response(JSON.stringify({
                success: false,
                error: '请求数据格式错误',
                message: '创建传播任务失败'
              }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        }

        // 传播状态查询API
        if (url.pathname.startsWith('/api/propagation/status/')) {
          if (request.method === 'GET') {
            const taskId = url.pathname.split('/')[4];
            const result = await propagationAPI.getPropagationStatus(taskId);
            return new Response(JSON.stringify(result), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // 用户感染API
        if (url.pathname === '/api/propagation/infect') {
          if (request.method === 'POST') {
            try {
              const body = await request.json();
              const result = await propagationAPI.infectUser(
                body.userLocation,
                body.strainId,
                body.infectionParams || {}
              );
              return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' }
              });
            } catch (error) {
              return new Response(JSON.stringify({
                success: false,
                error: '请求数据格式错误',
                message: '感染失败'
              }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        }

        // 附近传播查询API
        if (url.pathname === '/api/propagation/nearby') {
          if (request.method === 'POST') {
            try {
              const body = await request.json();
              const { location, radius } = body;

              if (!location || !location.lat || !location.lng) {
                return new Response(JSON.stringify({
                  success: false,
                  error: '缺少用户位置信息',
                  message: '查询失败'
                }), {
                  status: 400,
                  headers: { 'Content-Type': 'application/json' }
                });
              }

              const result = await propagationAPI.getNearbyPropagations(
                location,
                radius || 5000
              );
              return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' }
              });
            } catch (error) {
              return new Response(JSON.stringify({
                success: false,
                error: '请求解析失败',
                message: '查询失败'
              }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          } else if (request.method === 'GET') {
            const userLat = url.searchParams.get('lat');
            const userLng = url.searchParams.get('lng');
            const radius = url.searchParams.get('radius') || '5000';

            if (!userLat || !userLng) {
              return new Response(JSON.stringify({
                success: false,
                error: '缺少用户位置参数',
                message: '查询失败'
              }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              });
            }

            const result = await propagationAPI.getNearbyPropagations(
              { lat: parseFloat(userLat), lng: parseFloat(userLng) },
              parseInt(radius)
            );
            return new Response(JSON.stringify(result), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // 传播统计API
        if (url.pathname === '/api/propagation/stats') {
          if (request.method === 'GET') {
            const timeRange = url.searchParams.get('timeRange') || '24h';
            const result = await propagationAPI.getPropagationStats(timeRange);
            return new Response(JSON.stringify(result), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }

        // 停止传播任务API
        if (url.pathname.startsWith('/api/propagation/stop/')) {
          if (request.method === 'POST') {
            const taskId = url.pathname.split('/')[4];
            try {
              const body = await request.json();
              const result = await propagationAPI.stopPropagationTask(
                taskId,
                body.reason || 'user_request'
              );
              return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' }
              });
            } catch (error) {
              return new Response(JSON.stringify({
                success: false,
                error: '请求数据格式错误',
                message: '停止传播任务失败'
              }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
        }

        // 个人资料API
        if (url.pathname === '/api/profile') {
      if (request.method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          data: {
            name: 'FluLink用户',
            tier: 'free',
            joinDate: '2025-01-12T00:00:00.000Z',
            totalInfections: 16,
            totalStrains: 3,
            achievements: ['首次感染', '毒株创建者', '活跃用户']
          },
          message: '获取个人资料成功'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (request.method === 'PUT') {
        try {
          const body = await request.json();
          return new Response(JSON.stringify({
            success: true,
            data: {
              name: body.name || 'FluLink用户',
              tier: 'free',
              joinDate: '2025-01-12T00:00:00.000Z',
              totalInfections: 16,
              totalStrains: 3,
              achievements: ['首次感染', '毒株创建者', '活跃用户']
            },
            message: '个人资料更新成功'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: '请求数据格式错误',
            message: '更新个人资料失败'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // 首页路由 - 集成Solid.js组件
    if (url.pathname === '/') {
      return new Response(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FluLink - 如流感般扩散，连接你在意的每个角落</title>
          <style>
            /* 内联CSS样式，避免外部文件加载问题 */
            :root {
              --primary-color: #059669;
              --secondary-color: #10b981;
              --accent-color: #34d399;
              --text-color: #1f2937;
              --text-light: #6b7280;
              --bg-color: #f9fafb;
              --card-bg: #ffffff;
              --border-color: #e5e7eb;
              --error-color: #ef4444;
              --success-color: #10b981;
              --warning-color: #f59e0b;
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: var(--bg-color);
              color: var(--text-color);
              line-height: 1.6;
            }

            .app {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }

            .app-header {
              background: var(--card-bg);
              border-bottom: 1px solid var(--border-color);
              padding: 1rem 2rem;
              text-align: center;
            }

            .app-header h1 {
              color: var(--primary-color);
              font-size: 2.5rem;
              margin-bottom: 0.5rem;
            }

            .app-header p {
              color: var(--text-light);
              font-size: 1.1rem;
              margin-bottom: 1rem;
            }

            .app-nav {
              display: flex;
              justify-content: center;
              gap: 1rem;
            }

            .app-nav button {
              padding: 0.5rem 1rem;
              border: 1px solid var(--border-color);
              background: var(--card-bg);
              color: var(--text-color);
              border-radius: 0.25rem;
              cursor: pointer;
              transition: all 0.2s;
            }

            .app-nav button:hover {
              background: var(--bg-color);
            }

            .app-nav button.active {
              background: var(--primary-color);
              color: white;
              border-color: var(--primary-color);
            }

            .app-main {
              flex: 1;
              padding: 2rem;
              max-width: 1200px;
              margin: 0 auto;
              width: 100%;
            }

            .app-footer {
              background: var(--card-bg);
              border-top: 1px solid var(--border-color);
              padding: 1rem 2rem;
              text-align: center;
              color: var(--text-light);
            }

            .loading {
              text-align: center;
              padding: 2rem;
              color: var(--text-light);
              font-size: 1.2rem;
            }

            .home-page, .strains-page, .profile-page {
              display: grid;
              gap: 2rem;
            }

            .location-section, .action-section, .info-section, .propagation-section {
              background: var(--card-bg);
              padding: 1.5rem;
              border-radius: 0.5rem;
              border: 1px solid var(--border-color);
            }

            .location-section h2, .action-section h2, .info-section h2, .propagation-section h2 {
              color: var(--primary-color);
              margin-bottom: 1rem;
            }

            .propagation-item {
              background: var(--bg-color);
              padding: 1rem;
              border-radius: 0.25rem;
              margin: 0.5rem 0;
              border-left: 3px solid var(--primary-color);
            }

            .propagation-item h4 {
              color: var(--primary-color);
              margin-bottom: 0.5rem;
            }

            .propagation-item p {
              margin: 0.25rem 0;
              color: var(--text-light);
              font-size: 0.9rem;
            }

            .propagation-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 0.5rem;
            }

            .propagation-info {
              margin: 0.5rem 0;
            }

            .propagation-tags {
              display: flex;
              gap: 0.25rem;
              flex-wrap: wrap;
              margin-top: 0.5rem;
            }

            .error-state {
              text-align: center;
              padding: 1rem;
              color: var(--error-color);
              background: #fef2f2;
              border-radius: 0.25rem;
              border: 1px solid #fecaca;
            }

            .error-state button {
              background: var(--error-color);
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.25rem;
              cursor: pointer;
              margin-top: 0.5rem;
            }

            .error-state button:hover {
              background: #dc2626;
            }

            .location-text {
              font-family: monospace;
              background: var(--bg-color);
              padding: 0.5rem;
              border-radius: 0.25rem;
              margin: 1rem 0;
            }

            .location-btn, .create-btn {
              background: var(--primary-color);
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.25rem;
              cursor: pointer;
              font-size: 1rem;
              transition: background 0.2s;
            }

            .location-btn:hover, .create-btn:hover {
              background: var(--secondary-color);
            }

            .strains-stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 1rem;
            }

            .stat-card {
              background: var(--card-bg);
              padding: 1rem;
              border-radius: 0.5rem;
              border: 1px solid var(--border-color);
              text-align: center;
            }

            .stat-card h3 {
              color: var(--text-light);
              font-size: 0.9rem;
              margin-bottom: 0.5rem;
            }

            .stat-number {
              font-size: 2rem;
              font-weight: bold;
              color: var(--primary-color);
            }

            .strains-list {
              display: grid;
              gap: 1rem;
            }

            .strain-card {
              background: var(--card-bg);
              padding: 1.5rem;
              border-radius: 0.5rem;
              border: 1px solid var(--border-color);
            }

            .strain-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 1rem;
            }

            .strain-type {
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.8rem;
              font-weight: bold;
            }

            .strain-type.life { background: #dbeafe; color: #1e40af; }
            .strain-type.opinion { background: #fef3c7; color: #92400e; }
            .strain-type.interest { background: #d1fae5; color: #065f46; }
            .strain-type.super { background: #fce7f3; color: #be185d; }

            .strain-info p {
              margin-bottom: 0.5rem;
              color: var(--text-light);
            }

            .strain-tags {
              display: flex;
              gap: 0.5rem;
              flex-wrap: wrap;
              margin: 1rem 0;
            }

            .tag {
              background: var(--bg-color);
              color: var(--text-color);
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.8rem;
            }

            .infect-btn {
              background: var(--secondary-color);
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.25rem;
              cursor: pointer;
              transition: background 0.2s;
            }

            .infect-btn:hover {
              background: var(--accent-color);
            }

            .propagate-btn {
              background: var(--warning-color);
              color: white;
              border: none;
              padding: 0.5rem 1rem;
              border-radius: 0.25rem;
              cursor: pointer;
              transition: background 0.2s;
              margin-left: 0.5rem;
            }

            .propagate-btn:hover {
              background: #d97706;
            }

            .empty-state {
              text-align: center;
              padding: 2rem;
              color: var(--text-light);
            }

            .profile-card {
              background: var(--card-bg);
              padding: 2rem;
              border-radius: 0.5rem;
              border: 1px solid var(--border-color);
              text-align: center;
              max-width: 400px;
              margin: 0 auto;
            }

            .avatar-circle {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: var(--primary-color);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2rem;
              font-weight: bold;
              margin: 0 auto 1rem;
            }

            .profile-details h3 {
              color: var(--primary-color);
              margin-bottom: 0.5rem;
            }

            .user-tier {
              color: var(--text-light);
              margin-bottom: 0.5rem;
            }

            @media (max-width: 768px) {
              .app-header {
                padding: 1rem;
              }
              
              .app-header h1 {
                font-size: 2rem;
              }
              
              .app-main {
                padding: 1rem;
              }
              
              .app-nav {
                flex-direction: column;
                gap: 0.5rem;
              }
              
              .strains-stats {
                grid-template-columns: repeat(2, 1fr);
              }
            }
          </style>
        </head>
        <body>
          <div id="app">
            <div class="loading">🦠 FluLink 正在加载...</div>
          </div>
          <script>
            // 简单的客户端路由和组件渲染
            // 使用原生JavaScript实现，避免CDN依赖问题
            
            // 应用状态管理
            let currentPage = 'home';
            let userLocation = null;
            let virusStrains = [];
            
            // 状态更新函数
            function setCurrentPage(page) {
              currentPage = page;
              renderPageContent();
            }
            
            function setUserLocation(location) {
              userLocation = location;
              renderPageContent();
            }
            
            function setVirusStrains(strains) {
              virusStrains = strains;
              renderPageContent();
            }
            
            // 渲染应用
            function renderApp() {
              const app = document.getElementById('app');
              const homeActive = currentPage === 'home' ? 'class="active"' : '';
              const strainsActive = currentPage === 'strains' ? 'class="active"' : '';
              const profileActive = currentPage === 'profile' ? 'class="active"' : '';
              
              app.innerHTML = 
                '<div class="app">' +
                  '<header class="app-header">' +
                    '<h1>🦠 FluLink</h1>' +
                    '<p>如流感般扩散，连接你在意的每个角落</p>' +
                    '<nav class="app-nav">' +
                      '<button ' + homeActive + ' onclick="setCurrentPage(\\'home\\')">首页</button>' +
                      '<button ' + strainsActive + ' onclick="setCurrentPage(\\'strains\\')">毒株</button>' +
                      '<button ' + profileActive + ' onclick="setCurrentPage(\\'profile\\')">个人</button>' +
                    '</nav>' +
                  '</header>' +
                  '<main class="app-main">' +
                    '<div id="page-content"></div>' +
                  '</main>' +
                  '<footer class="app-footer">' +
                    '<p>基于《德道经》"无为而治"哲学的分布式流感式社交网络</p>' +
                  '</footer>' +
                '</div>';
            }
            
            // 渲染页面内容
            function renderPageContent() {
              const content = document.getElementById('page-content');
              const page = currentPage;
              
              if (page === 'home') {
                const locationText = userLocation ? userLocation.lat + ', ' + userLocation.lng : '未获取位置';
                content.innerHTML = 
                  '<div class="home-page">' +
                    '<div class="location-section">' +
                      '<h2>📍 当前位置</h2>' +
                      '<p class="location-text">' + locationText + '</p>' +
                      '<button class="location-btn" onclick="getCurrentLocation()">获取位置</button>' +
                    '</div>' +
                    '<div class="action-section">' +
                      '<h2>🦠 创建毒株</h2>' +
                      '<p>基于当前位置创建新的病毒株，让它如流感般扩散</p>' +
                      '<button class="create-btn" onclick="createVirusStrain()">创建毒株</button>' +
                    '</div>' +
                    '<div class="propagation-section">' +
                      '<h2>🌍 附近传播</h2>' +
                      '<p>查看附近的活跃传播，了解地理传播情况</p>' +
                      '<button class="location-btn" onclick="loadNearbyPropagations()">查询附近传播</button>' +
                      '<div id="nearby-propagations"></div>' +
                    '</div>' +
                    '<div class="info-section">' +
                      '<h2>ℹ️ 关于FluLink</h2>' +
                      '<p>FluLink是一个基于地理位置的社交网络，让内容如流感般自然扩散。通过创建和传播"毒株"，连接你在意的每个角落。</p>' +
                    '</div>' +
                  '</div>';
              } else if (page === 'strains') {
                const totalStrains = virusStrains.length;
                const lifeStrains = virusStrains.filter(s => s.type === 'life').length;
                const opinionStrains = virusStrains.filter(s => s.type === 'opinion').length;
                const interestStrains = virusStrains.filter(s => s.type === 'interest').length;
                const superStrains = virusStrains.filter(s => s.type === 'super').length;
                const totalInfections = virusStrains.reduce((sum, s) => sum + s.infectionCount, 0);
                
                let strainsListHtml = '';
                if (virusStrains.length === 0) {
                  strainsListHtml = '<div class="empty-state"><p>暂无毒株数据</p><button onclick="loadStrains()">加载毒株</button></div>';
                } else {
                  strainsListHtml = virusStrains.map(strain => {
                    const typeText = strain.type === 'life' ? '生活' : 
                                    strain.type === 'opinion' ? '观点' :
                                    strain.type === 'interest' ? '兴趣' : '超级';
                    const tagsHtml = strain.tags.map(tag => '<span class="tag">' + tag + '</span>').join('');
                    return '<div class="strain-card" data-strain-id="' + strain.id + '">' +
                      '<div class="strain-header">' +
                        '<h3>' + strain.name + '</h3>' +
                        '<span class="strain-type ' + strain.type + '">' + typeText + '</span>' +
                      '</div>' +
                      '<div class="strain-info">' +
                        '<p><strong>位置:</strong> ' + strain.location.lat.toFixed(4) + ', ' + strain.location.lng.toFixed(4) + '</p>' +
                        '<p><strong>感染数:</strong> ' + strain.infectionCount + '</p>' +
                        '<p><strong>创建时间:</strong> ' + new Date(strain.createdAt).toLocaleString() + '</p>' +
                      '</div>' +
                      '<div class="strain-tags">' + tagsHtml + '</div>' +
                                '<div class="strain-actions">' +
                                  '<button class="infect-btn" onclick="infectStrain(\\'' + strain.id + '\\')">感染此毒株</button>' +
                                  '<button class="propagate-btn" onclick="createPropagationTask(\\'' + strain.id + '\\')">创建传播任务</button>' +
                                '</div>' +
                    '</div>';
                  }).join('');
                }
                
                content.innerHTML = 
                  '<div class="strains-page">' +
                    '<header class="strains-header">' +
                      '<h2>🦠 毒株管理</h2>' +
                      '<p>管理你的病毒株，让它们如流感般扩散</p>' +
                    '</header>' +
                    '<div class="strains-stats">' +
                      '<div class="stat-card"><h3>总毒株</h3><p class="stat-number">' + totalStrains + '</p></div>' +
                      '<div class="stat-card"><h3>生活毒株</h3><p class="stat-number">' + lifeStrains + '</p></div>' +
                      '<div class="stat-card"><h3>观点毒株</h3><p class="stat-number">' + opinionStrains + '</p></div>' +
                      '<div class="stat-card"><h3>兴趣毒株</h3><p class="stat-number">' + interestStrains + '</p></div>' +
                      '<div class="stat-card"><h3>超级毒株</h3><p class="stat-number">' + superStrains + '</p></div>' +
                      '<div class="stat-card"><h3>总感染数</h3><p class="stat-number">' + totalInfections + '</p></div>' +
                    '</div>' +
                    '<div class="strains-list" id="strains-list">' + strainsListHtml + '</div>' +
                  '</div>';
              } else if (page === 'profile') {
                content.innerHTML = 
                  '<div class="profile-page">' +
                    '<header class="profile-header">' +
                      '<h2>👤 个人中心</h2>' +
                      '<p>管理你的FluLink账户信息</p>' +
                    '</header>' +
                    '<div class="profile-info">' +
                      '<div class="profile-card">' +
                        '<div class="profile-avatar"><div class="avatar-circle">F</div></div>' +
                        '<div class="profile-details">' +
                          '<h3>FluLink用户</h3>' +
                          '<p class="user-tier">免费用户</p>' +
                        '</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>';
              }
            }
            
            // 获取当前位置
            async function getCurrentLocation() {
              try {
                // 检查浏览器是否支持地理位置API
                if (!navigator.geolocation) {
                  throw new Error('您的浏览器不支持地理位置功能');
                }

                // 显示获取位置提示
                const locationBtn = document.querySelector('.location-btn');
                if (locationBtn) {
                  locationBtn.textContent = '正在获取位置...';
                  locationBtn.disabled = true;
                }

                const position = await new Promise((resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(
                    resolve, 
                    reject,
                    {
                      enableHighAccuracy: true,
                      timeout: 10000,
                      maximumAge: 300000 // 5分钟缓存
                    }
                  );
                });

                const location = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };

                setUserLocation(location);
                console.log('位置获取成功:', location);

                // 恢复按钮状态
                if (locationBtn) {
                  locationBtn.textContent = '获取位置';
                  locationBtn.disabled = false;
                }

                // 显示成功消息
                alert('位置获取成功！\\n' +
                      '纬度: ' + location.lat.toFixed(6) + '\\n' +
                      '经度: ' + location.lng.toFixed(6));

                // 自动加载附近传播
                await loadNearbyPropagations();

              } catch (error) {
                console.error('位置获取失败:', error);
                
                // 恢复按钮状态
                const locationBtn = document.querySelector('.location-btn');
                if (locationBtn) {
                  locationBtn.textContent = '获取位置';
                  locationBtn.disabled = false;
                }

                // 根据错误类型显示不同消息
                let errorMessage = '获取位置失败: ';
                if (error.code === 1) {
                  errorMessage += '用户拒绝了位置权限请求';
                } else if (error.code === 2) {
                  errorMessage += '位置信息不可用';
                } else if (error.code === 3) {
                  errorMessage += '获取位置超时';
                } else {
                  errorMessage += error.message;
                }

                alert(errorMessage);
                
                // 提供手动输入位置的选项
                const manualLocation = prompt('请手动输入位置信息（格式：纬度,经度）\\n例如：39.9042,116.4074');
                if (manualLocation) {
                  try {
                    const [lat, lng] = manualLocation.split(',').map(coord => parseFloat(coord.trim()));
                    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                      const location = { lat, lng };
                      setUserLocation(location);
                      alert('手动位置设置成功！');
                      await loadNearbyPropagations();
                    } else {
                      alert('位置格式不正确，请使用：纬度,经度');
                    }
                  } catch (e) {
                    alert('位置格式解析失败');
                  }
                }
              }
            }
            
            // 创建毒株
            async function createVirusStrain() {
              try {
                if (!userLocation) {
                  alert('请先获取位置信息');
                  return;
                }

                // 显示创建毒株的输入对话框
                const strainName = prompt('请输入毒株名称:', '新毒株_' + Date.now());
                if (!strainName) {
                  return; // 用户取消
                }

                const strainType = prompt('请选择毒株类型 (life/opinion/interest/super):', 'life');
                if (!strainType) {
                  return; // 用户取消
                }

                const strainTags = prompt('请输入标签 (用逗号分隔):', '测试,新创建');
                if (strainTags === null) {
                  return; // 用户取消
                }

                // 显示创建中状态
                const createBtn = document.querySelector('.create-btn');
                if (createBtn) {
                  createBtn.textContent = '创建中...';
                  createBtn.disabled = true;
                }

                const response = await fetch('/api/strains', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    name: strainName,
                    type: strainType,
                    location: userLocation,
                    tags: strainTags.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })
                });

                if (!response.ok) {
                  throw new Error('创建毒株失败');
                }

                const result = await response.json();
                console.log('毒株创建成功:', result);

                // 恢复按钮状态
                if (createBtn) {
                  createBtn.textContent = '创建毒株';
                  createBtn.disabled = false;
                }

                if (result.success) {
                  // 显示成功消息
                  alert('毒株创建成功！\\n' +
                        '毒株ID: ' + result.data.id + '\\n' +
                        '毒株名称: ' + result.data.name + '\\n' +
                        '位置: ' + result.data.location.lat.toFixed(4) + ', ' + result.data.location.lng.toFixed(4));
                  
                  // 自动切换到毒株页面
                  setCurrentPage('strains');
                  
                  // 重新加载毒株列表
                  await loadStrains();
                  
                  // 显示创建成功的毒株
                  setTimeout(() => {
                    const strainId = result.data.id;
                    const strainCard = document.querySelector('[data-strain-id="' + strainId + '"]');
                    if (strainCard) {
                      strainCard.scrollIntoView({ behavior: 'smooth' });
                      strainCard.style.border = '2px solid var(--success-color)';
                      setTimeout(() => {
                        strainCard.style.border = '';
                      }, 3000);
                    }
                  }, 500);
                } else {
                  alert('创建毒株失败: ' + result.message);
                }

              } catch (error) {
                console.error('毒株创建失败:', error);
                
                // 恢复按钮状态
                const createBtn = document.querySelector('.create-btn');
                if (createBtn) {
                  createBtn.textContent = '创建毒株';
                  createBtn.disabled = false;
                }
                
                alert('毒株创建失败: ' + error.message);
              }
            }
            
            // 加载毒株
            async function loadStrains() {
              try {
                const response = await fetch('/api/strains');
                const result = await response.json();
                
                if (result.success) {
                  setVirusStrains(result.data || []);
                }
                
              } catch (error) {
                console.error('加载毒株失败:', error);
                alert('加载毒株失败: ' + error.message);
              }
            }
            
            // 感染毒株功能
            async function infectStrain(strainId) {
              try {
                // 使用新的地理传播算法API
                const response = await fetch('/api/propagation/infect', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userLocation: userLocation,
                    strainId: strainId,
                    infectionParams: {
                      userId: 'user_' + Date.now(),
                      source: 'direct',
                      userTier: 'free'
                    }
                  })
                });

                if (!response.ok) {
                  throw new Error('感染毒株失败');
                }

                const result = await response.json();
                console.log('毒株感染成功:', result);

                if (result.success) {
                  // 重新加载毒株数据
                  await loadStrains();
                  
                  // 显示感染结果
                  alert('毒株感染成功！\\n' +
                        '感染ID: ' + result.data.infectionId + '\\n' +
                        '传播影响: ' + result.data.propagationImpact + '\\n' +
                        '附近用户: ' + result.data.nearbyUsers);
                } else {
                  alert('感染失败: ' + result.message);
                }

              } catch (error) {
                console.error('感染毒株失败:', error);
                alert('感染毒株失败: ' + error.message);
              }
            }

            // 创建传播任务功能
            async function createPropagationTask(strainId) {
              try {
                if (!userLocation) {
                  alert('请先获取位置信息');
                  return;
                }

                const response = await fetch('/api/propagation/create', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    strainId: strainId,
                    userLocation: userLocation,
                    propagationParams: {
                      radius: 1000, // 1km传播半径
                      speed: 'normal',
                      maxInfections: 50
                    }
                  })
                });

                if (!response.ok) {
                  throw new Error('创建传播任务失败');
                }

                const result = await response.json();
                console.log('传播任务创建成功:', result);

                if (result.success) {
                  alert('传播任务创建成功！\\n' +
                        '任务ID: ' + result.data.taskId + '\\n' +
                        '预计覆盖: ' + result.data.estimatedReach + '人\\n' +
                        '预计时长: ' + result.data.expectedDuration + '分钟');
                } else {
                  alert('创建传播任务失败: ' + result.message);
                }

              } catch (error) {
                console.error('创建传播任务失败:', error);
                alert('创建传播任务失败: ' + error.message);
              }
            }

            // 查询附近传播功能
            async function loadNearbyPropagations() {
              try {
                if (!userLocation) {
                  // 如果没有位置信息，先尝试获取
                  const shouldGetLocation = confirm('需要位置信息才能查询附近传播，是否现在获取位置？');
                  if (shouldGetLocation) {
                    await getCurrentLocation();
                    return; // 获取位置后会自动调用此函数
                  } else {
                    // 提供手动输入位置的选项
                    const manualLocation = prompt('请手动输入位置信息（格式：纬度,经度）\\n例如：39.9042,116.4074');
                    if (manualLocation) {
                      try {
                        const [lat, lng] = manualLocation.split(',').map(coord => parseFloat(coord.trim()));
                        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                          const location = { lat, lng };
                          setUserLocation(location);
                          // 递归调用，使用新位置
                          await loadNearbyPropagations();
                          return;
                        } else {
                          alert('位置格式不正确，请使用：纬度,经度');
                          return;
                        }
                      } catch (e) {
                        alert('位置格式解析失败');
                        return;
                      }
                    } else {
                      return;
                    }
                  }
                }

                // 显示加载状态
                const nearbyInfo = document.getElementById('nearby-propagations');
                if (nearbyInfo) {
                  nearbyInfo.innerHTML = '<div class="loading">正在查询附近传播...</div>';
                }

                const response = await fetch('/api/propagation/nearby', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    location: userLocation,
                    radius: 5000 // 5km radius
                  })
                });

                if (!response.ok) {
                  throw new Error('查询附近传播失败');
                }

                const result = await response.json();
                console.log('附近传播查询成功:', result);

                if (result.success) {
                  // 更新页面显示附近传播信息
                  if (nearbyInfo) {
                    if (result.data.totalCount === 0) {
                      nearbyInfo.innerHTML = 
                        '<h3>附近活跃传播 (0个)</h3>' +
                        '<div class="empty-state">' +
                          '<p>附近暂无活跃传播</p>' +
                          '<p>您可以创建新的毒株来开始传播</p>' +
                        '</div>';
                    } else {
                      nearbyInfo.innerHTML = 
                        '<h3>附近活跃传播 (' + result.data.totalCount + '个)</h3>' +
                        '<div class="propagations-list">' +
                          result.data.propagations.map(prop => 
                            '<div class="propagation-item">' +
                              '<div class="propagation-header">' +
                                '<h4>' + prop.strainName + '</h4>' +
                                '<span class="strain-type ' + prop.strainType + '">' +
                                  (prop.strainType === 'life' ? '生活' : 
                                   prop.strainType === 'opinion' ? '观点' :
                                   prop.strainType === 'interest' ? '兴趣' : '超级') +
                                '</span>' +
                              '</div>' +
                              '<div class="propagation-info">' +
                                '<p><strong>距离:</strong> ' + prop.distance.toFixed(0) + '米</p>' +
                                '<p><strong>感染数:</strong> ' + prop.infectionCount + '</p>' +
                                '<p><strong>感染概率:</strong> ' + (prop.infectionProbability * 100).toFixed(1) + '%</p>' +
                                '<p><strong>最后活动:</strong> ' + new Date(prop.lastActivity).toLocaleString() + '</p>' +
                              '</div>' +
                              '<div class="propagation-tags">' +
                                prop.tags.map(tag => '<span class="tag">' + tag + '</span>').join('') +
                              '</div>' +
                            '</div>'
                          ).join('') +
                        '</div>';
                    }
                  }
                } else {
                  if (nearbyInfo) {
                    nearbyInfo.innerHTML = 
                      '<h3>附近活跃传播</h3>' +
                      '<div class="error-state">' +
                        '<p>查询失败: ' + result.message + '</p>' +
                      '</div>';
                  }
                }

              } catch (error) {
                console.error('查询附近传播失败:', error);
                
                const nearbyInfo = document.getElementById('nearby-propagations');
                if (nearbyInfo) {
                  nearbyInfo.innerHTML = 
                    '<h3>附近活跃传播</h3>' +
                    '<div class="error-state">' +
                      '<p>查询失败: ' + error.message + '</p>' +
                      '<button onclick="loadNearbyPropagations()">重试</button>' +
                    '</div>';
                }
              }
            }
            
            // 将函数绑定到全局作用域，确保onclick事件可以访问
            window.setCurrentPage = setCurrentPage;
            window.getCurrentLocation = getCurrentLocation;
            window.createVirusStrain = createVirusStrain;
            window.loadStrains = loadStrains;
            window.infectStrain = infectStrain;
            window.createPropagationTask = createPropagationTask;
            window.loadNearbyPropagations = loadNearbyPropagations;
            
            // 初始化应用
            renderApp();
            renderPageContent();
          </script>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // 静态文件服务
    if (url.pathname.startsWith('/styles/')) {
      const filePath = url.pathname.substring(1); // 移除开头的 '/'
      try {
        const file = Bun.file(filePath);
        const content = await file.text();
        return new Response(content, {
          headers: { 'Content-Type': 'text/css' }
        });
      } catch (error) {
        return new Response('File not found', { status: 404 });
      }
    }
    
    // 404处理
    return new Response('Not Found', { status: 404 });
  },
});

const port = process.env.PORT || 8080;
console.log(`🦠 FluLink server running at http://0.0.0.0:${port}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${port}`);