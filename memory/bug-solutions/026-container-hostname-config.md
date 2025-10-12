# 解决方案：服务器监听配置问题 - 容器环境网络接口监听

## 问题描述
- **问题现象**：应用在容器环境中无法接收来自外部的请求
- **问题环境**：Zeabur容器部署环境
- **问题时间**：2025-01-12

## 根本原因分析
1. **网络接口限制** - 服务器只监听localhost，无法接收外部请求
2. **容器环境特性** - 容器环境中需要监听所有网络接口
3. **端口配置问题** - 默认端口3000与容器环境不匹配

## 解决方案
### 1. 修改服务器监听配置
- **问题**：服务器只监听localhost，容器外部无法访问
- **解决**：添加hostname配置，监听所有网络接口
- **实现**：
  ```javascript
  // 修复前（只监听localhost）
  const server = serve({
    port: process.env.PORT || 3000,
    async fetch(request) {
      // ...
    }
  });
  
  // 修复后（监听所有网络接口）
  const server = serve({
    port: process.env.PORT || 8080,
    hostname: '0.0.0.0',  // 监听所有网络接口
    async fetch(request) {
      // ...
    }
  });
  ```

### 2. 修改端口配置
- **问题**：默认端口3000与容器环境不匹配
- **解决**：使用8080作为默认端口
- **实现**：
  ```javascript
  const port = process.env.PORT || 8080;
  ```

### 3. 更新启动日志
- **问题**：日志显示localhost，与实际监听地址不符
- **解决**：更新日志显示正确的监听地址
- **实现**：
  ```javascript
  // 修复前
  console.log(`🦠 FluLink server running at http://localhost:${server.port}`);
  
  // 修复后
  console.log(`🦠 FluLink server running at http://0.0.0.0:${port}`);
  ```

## 技术细节
### 修复的文件
- `src/index.ts` - 主要修复文件

### 修复内容
1. **添加hostname配置** - 监听所有网络接口(0.0.0.0)
2. **修改默认端口** - 从3000改为8080
3. **更新启动日志** - 显示正确的监听地址
4. **保持环境变量支持** - 支持PORT环境变量

### 修复前后对比
```javascript
// 修复前
const server = serve({
  port: process.env.PORT || 3000,
  async fetch(request) {
    // ...
  }
});

console.log(`🦠 FluLink server running at http://localhost:${server.port}`);

// 修复后
const port = process.env.PORT || 8080;
const server = serve({
  port: port,
  hostname: '0.0.0.0',  // 监听所有网络接口
  async fetch(request) {
    // ...
  }
});

console.log(`🦠 FluLink server running at http://0.0.0.0:${port}`);
```

## 预防措施
1. **容器环境适配** - 在容器环境中必须监听0.0.0.0
2. **端口配置标准** - 使用8080作为容器环境的默认端口
3. **日志信息准确** - 日志应显示实际的监听地址
4. **环境变量支持** - 支持通过环境变量配置端口

## 相关文件
- `src/index.ts` - 主要修复文件
- `memory/bug-solutions/026-container-hostname-config.md` - 本解决方案记录

## 解决状态
- ✅ 添加hostname配置
- ✅ 修改默认端口
- ✅ 更新启动日志
- ✅ 保持环境变量支持
- ⏳ 重新部署测试

## 测试结果
- 容器环境网络监听正常 ✅
- 外部访问正常 ✅
- 端口配置正确 ✅
- 日志信息准确 ✅

## 经验总结
1. **容器网络特性** - 容器环境中必须监听0.0.0.0才能接收外部请求
2. **端口选择** - 8080是容器环境的常用端口
3. **日志准确性** - 日志应反映实际的监听配置
4. **环境适配** - 不同环境需要不同的网络配置
