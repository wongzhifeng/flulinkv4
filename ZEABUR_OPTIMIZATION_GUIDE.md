# FluLink v4.0 Zeabur 部署优化方案
# 基于 Zeabur 官方文档和最佳实践

## 🎯 优化目标

基于 [Zeabur 官方文档](https://zeabur.com/docs/zh-CN) 的最佳实践，实现：
- ✅ 一键部署
- ✅ 按量计费优化
- ✅ 一站式整合
- ✅ 开箱即用的 CI/CD
- ✅ 自动识别项目类型
- ✅ 快速生成域名

## 📊 当前架构分析

### 技术栈
- **前端**: Next.js 14 + React 18 + TypeScript
- **后端**: PocketBase v0.22.0 (SQLite + 实时API)
- **AI服务**: FastAPI + Python 3.11
- **向量数据库**: ChromaDB
- **部署平台**: Zeabur

### 服务配置
```yaml
services:
  pocketbase:    # 后端数据存储与认证
  ai-service:    # AI智能分析服务
  frontend:      # Next.js前端应用
```

## 🚀 Zeabur 最佳实践优化

### 1. 环境变量管理优化

#### 当前配置
```yaml
environment:
  - PB_ENCRYPTION_KEY=${PB_ENCRYPTION_KEY}
  - PB_ADMIN_EMAIL=${PB_ADMIN_EMAIL}
  - PB_ADMIN_PASSWORD=${PB_ADMIN_PASSWORD}
```

#### 优化建议
```yaml
# 使用 Zeabur 环境变量模板
environment:
  - PB_ENCRYPTION_KEY=${PB_ENCRYPTION_KEY}
  - PB_ADMIN_EMAIL=${PB_ADMIN_EMAIL}
  - PB_ADMIN_PASSWORD=${PB_ADMIN_PASSWORD}
  - PB_PUBLIC_URL=${PUBLIC_URL}
  - PB_HOOKS_DIR=/app/pocketbase/hooks
  - AI_AGENT_URL=${AI_AGENT_URL}
  - CHROMA_URL=${CHROMA_URL}
```

### 2. 持久存储空间配置

#### PocketBase 数据持久化
```yaml
volumes:
  pb_data:
    driver: local
    # Zeabur 自动管理持久存储
```

#### ChromaDB 向量数据持久化
```yaml
volumes:
  chroma_data:
    driver: local
    # 向量数据持久化存储
```

### 3. 公网存取配置优化

#### 端口映射优化
```yaml
ports:
  - 8090:8090  # PocketBase
  - 8000:8000  # AI Service
  - 3000:3000  # Frontend
```

#### 域名配置
- ✅ 自动生成子域名
- ✅ 支持自定义域名
- ✅ HTTPS 自动配置

### 4. 健康检查优化

#### 基于 Zeabur 推荐的健康检查
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8090/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🔧 Next.js 部署优化

### 基于 Context7 最佳实践

#### 1. Dockerfile 优化
```dockerfile
# 使用 Next.js 官方推荐的多阶段构建
FROM node:22-alpine AS base
LABEL "language"="nodejs"
LABEL "framework"="next.js"

# 只安装生产依赖
RUN npm install --omit=dev --silent

# 构建优化
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 生产运行
EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. 环境变量配置
```javascript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_POCKETBASE_URL: process.env.NEXT_PUBLIC_POCKETBASE_URL,
    NEXT_PUBLIC_AI_AGENT_URL: process.env.NEXT_PUBLIC_AI_AGENT_URL,
    NEXT_PUBLIC_CHROMA_URL: process.env.NEXT_PUBLIC_CHROMA_URL,
  }
}
```

## 🤖 PocketBase 部署优化

### 基于官方最佳实践

#### 1. 使用预构建二进制
```dockerfile
# 直接下载官方预构建文件，避免源码编译
RUN wget -O /tmp/pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
```

#### 2. 配置优化
```bash
# 启动命令优化
CMD ["/usr/local/bin/pocketbase", "serve", "--http=0.0.0.0:8090"]
```

## 📈 性能优化建议

### 1. 按量计费优化
- ✅ 使用 Zeabur 的按量计费模式
- ✅ 优化资源使用，避免不必要的资源消耗
- ✅ 使用缓存减少API调用

### 2. 构建优化
- ✅ 多阶段Docker构建
- ✅ 只安装生产依赖
- ✅ 禁用开发工具和遥测

### 3. 网络优化
- ✅ 服务间内网通信
- ✅ 公网访问优化
- ✅ CDN加速（如需要）

## 🔍 监控和日志

### 1. 健康监控
```yaml
# 每个服务都配置健康检查
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:PORT/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 2. 日志管理
- ✅ Zeabur 自动日志收集
- ✅ 结构化日志输出
- ✅ 错误追踪和告警

## 🚀 部署流程优化

### 1. 一键部署
```bash
# 使用 Zeabur CLI
zeabur deploy

# 或通过 GitHub 集成
# 推送代码自动触发部署
```

### 2. 环境管理
- ✅ 开发环境
- ✅ 测试环境  
- ✅ 生产环境

### 3. 回滚策略
- ✅ 版本管理
- ✅ 快速回滚
- ✅ 蓝绿部署

## 📋 部署检查清单

### 部署前检查
- [ ] 环境变量配置完整
- [ ] Dockerfile 优化完成
- [ ] 健康检查端点配置
- [ ] 持久存储配置
- [ ] 网络配置正确

### 部署后验证
- [ ] 所有服务健康状态正常
- [ ] 前端页面正常访问
- [ ] API接口正常响应
- [ ] 数据库连接正常
- [ ] AI服务正常响应

## 🎯 下一步行动

1. **应用优化配置** - 更新 zeabur.yaml 配置
2. **测试部署** - 在测试环境验证配置
3. **性能监控** - 部署后监控性能指标
4. **持续优化** - 根据监控数据持续优化

## 📚 参考文档

- [Zeabur 官方文档](https://zeabur.com/docs/zh-CN)
- [Next.js 部署最佳实践](https://nextjs.org/docs/deployment)
- [PocketBase 部署指南](https://pocketbase.io/docs/)
- [Docker 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
