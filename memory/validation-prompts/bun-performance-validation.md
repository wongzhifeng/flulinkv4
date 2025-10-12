# Bun性能优化验证提示词

## 验证模板
```
验证以下Bun代码的性能优化：

代码文件：[文件路径]

检查维度：
1. 是否利用Bun的快速启动特性
2. SQL查询是否针对Turso优化
3. 边缘计算逻辑是否正确实现
4. 内存使用是否符合轻量原则
```

## 验证规则

### 1. 快速启动特性验证
```typescript
// 正确 ✅ - 利用Bun内置API
const server = Bun.serve({
  port: 3000,
  fetch(request) {
    return new Response("Hello from Bun!");
  },
});

// 错误 ❌ - 使用Node.js API
const express = require('express');
const app = express();
```

### 2. 内存使用优化验证
```typescript
// 正确 ✅ - 轻量级对象
const config = {
  port: 3000,
  host: 'localhost'
};

// 错误 ❌ - 重型对象
const config = {
  port: 3000,
  host: 'localhost',
  heavyData: new Array(1000000).fill(0) // 占用大量内存
};
```

### 3. 异步操作优化验证
```typescript
// 正确 ✅ - 非阻塞异步
async function processData() {
  const data = await fetchData();
  return processInBackground(data);
}

// 错误 ❌ - 阻塞操作
function processData() {
  const data = fetchDataSync(); // 阻塞主线程
  return processSync(data);
}
```

### 4. 边缘计算适配验证
```typescript
// 正确 ✅ - 无状态服务
export async function handler(request: Request) {
  const data = await getDataFromTurso();
  return new Response(JSON.stringify(data));
}

// 错误 ❌ - 有状态服务
let cache = new Map(); // 违反无状态原则
export async function handler(request: Request) {
  if (cache.has(request.url)) {
    return cache.get(request.url);
  }
  // ...
}
```

## 性能基准检查

### 启动时间检查
```typescript
// 检查启动时间 <100ms
const start = performance.now();
// 应用启动代码
const end = performance.now();
console.log(`启动时间: ${end - start}ms`);
```

### 内存使用检查
```typescript
// 检查内存使用 <50MB
const usage = process.memoryUsage();
console.log(`内存使用: ${usage.heapUsed / 1024 / 1024}MB`);
```

### 响应时间检查
```typescript
// 检查API响应时间 <200ms
const start = performance.now();
const response = await fetch('/api/strains');
const end = performance.now();
console.log(`响应时间: ${end - start}ms`);
```

## 优化建议

### 1. 使用Bun内置API
- 优先使用Bun.serve而非Express
- 使用Bun.file进行文件操作
- 利用Bun的快速JSON解析

### 2. 内存管理
- 避免创建大型对象
- 及时释放不需要的引用
- 使用对象池复用

### 3. 异步优化
- 使用Promise.all并行处理
- 避免阻塞主线程
- 合理使用setTimeout

### 4. 边缘计算优化
- 设计无状态服务
- 数据就近存储
- 最小化网络请求
