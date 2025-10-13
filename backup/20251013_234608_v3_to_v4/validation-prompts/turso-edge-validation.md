# Turso边缘数据库验证提示词

## 验证模板
```
验证以下Turso数据库代码的边缘计算适配：

代码文件：[文件路径]

检查维度：
1. 连接配置是否正确
2. 查询是否针对边缘优化
3. 数据同步机制是否实现
4. 错误处理是否完整
```

## 验证规则

### 1. 连接配置验证
```typescript
// 正确 ✅ - 边缘连接配置
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncUrl: process.env.TURSO_SYNC_URL,
});

// 错误 ❌ - 传统数据库连接
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGODB_URI!);
```

### 2. 查询优化验证
```typescript
// 正确 ✅ - 边缘优化查询
async function getNearbyStrains(lat: number, lng: number, radius: number) {
  return await client.execute({
    sql: `
      SELECT * FROM virus_strains 
      WHERE location_lat BETWEEN ? AND ? 
      AND location_lng BETWEEN ? AND ?
      AND created_at > datetime('now', '-7 days')
    `,
    args: [lat - radius, lat + radius, lng - radius, lng + radius]
  });
}

// 错误 ❌ - 非优化查询
async function getAllStrains() {
  return await client.execute('SELECT * FROM virus_strains');
}
```

### 3. 数据同步验证
```typescript
// 正确 ✅ - 边缘同步
async function syncData() {
  try {
    await client.sync();
    console.log('数据同步完成');
  } catch (error) {
    console.error('同步失败:', error);
  }
}

// 错误 ❌ - 无同步机制
async function getData() {
  return await client.execute('SELECT * FROM data');
}
```

### 4. 错误处理验证
```typescript
// 正确 ✅ - 完整错误处理
async function createStrain(strain: VirusStrain) {
  try {
    const result = await client.execute({
      sql: 'INSERT INTO virus_strains (...) VALUES (...)',
      args: [strain.id, strain.content, ...]
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('创建毒株失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}

// 错误 ❌ - 无错误处理
async function createStrain(strain: VirusStrain) {
  return await client.execute({
    sql: 'INSERT INTO virus_strains (...) VALUES (...)',
    args: [strain.id, strain.content, ...]
  });
}
```

## 性能要求验证

### 1. 查询响应时间 <50ms
```typescript
async function measureQueryTime() {
  const start = performance.now();
  const result = await client.execute('SELECT * FROM virus_strains LIMIT 10');
  const end = performance.now();
  
  if (end - start > 50) {
    console.warn(`查询时间过长: ${end - start}ms`);
  }
  
  return result;
}
```

### 2. 并发连接支持
```typescript
// 测试并发连接
async function testConcurrency() {
  const promises = Array.from({ length: 100 }, () => 
    client.execute('SELECT COUNT(*) FROM virus_strains')
  );
  
  const results = await Promise.all(promises);
  console.log(`并发查询完成: ${results.length}个`);
}
```

### 3. 边缘节点延迟 <100ms
```typescript
async function measureEdgeLatency() {
  const start = performance.now();
  await client.sync();
  const end = performance.now();
  
  if (end - start > 100) {
    console.warn(`边缘同步延迟过高: ${end - start}ms`);
  }
}
```

## 优化建议

### 1. 查询优化
- 使用索引优化查询
- 限制查询结果数量
- 使用预编译语句
- 避免全表扫描

### 2. 连接优化
- 使用连接池
- 合理设置超时时间
- 监控连接状态
- 及时释放连接

### 3. 同步优化
- 定期同步数据
- 增量同步优先
- 处理同步冲突
- 监控同步状态

### 4. 错误处理
- 实现重试机制
- 记录详细日志
- 优雅降级处理
- 用户友好提示
