# 043 - Zeabur 缓存问题最终修复

日期: 2025-10-14

## 问题总结

### 问题描述
Zeabur 服务器上 PocketBase 服务部署失败，错误显示 `npm ci` 失败，表明 Zeabur 仍然在使用根目录的 Dockerfile 构建 PocketBase 服务。

### 根本原因
- **Zeabur 配置缓存**: Zeabur 缓存了旧的配置，忽略了我们更新的构建路径
- **默认 Dockerfile 名称**: Zeabur 默认寻找根目录的 `Dockerfile`
- **构建路径混淆**: 多个服务共享相同的默认配置

## 解决方案

### 已执行的修复

#### 1. **重命名 Dockerfile**
- 根目录 `Dockerfile` → `Dockerfile.frontend`
- 强制 Zeabur 使用明确的文件名

#### 2. **更新 Zeabur 配置**
```yaml
services:
  pocketbase:
    build:
      context: ./pocketbase
      dockerfile: Dockerfile
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
```

#### 3. **创建备用配置**
- `docker-compose.zeabur.yml` - Docker Compose 格式配置
- `FORCE_DEPLOYMENT.md` - 强制部署指南

#### 4. **Git 提交触发**
- 提交所有更改到 Git
- 触发 Zeabur 自动重新部署

## 技术细节

### PocketBase Dockerfile 内容
```dockerfile
FROM alpine:latest
RUN apk add --no-cache ca-certificates curl sqlite
RUN curl -L -o pocketbase.tar.gz https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.tar.gz \
    && tar -xzf pocketbase.tar.gz \
    && rm pocketbase.tar.gz \
    && chmod +x /app/pocketbase
CMD ["/app/start.sh"]
```

### 启动脚本验证
```bash
#!/bin/sh
# 检查环境变量
if [ -z "$PB_ENCRYPTION_KEY" ]; then
    echo "错误: PB_ENCRYPTION_KEY 环境变量未设置"
    exit 1
fi
# 启动服务
exec /app/pocketbase serve --http 0.0.0.0:8090 --dir /pb_data
```

## 验证步骤

### 构建阶段验证
- [ ] PocketBase 服务构建成功（没有 `npm ci` 错误）
- [ ] 使用正确的 `pocketbase/Dockerfile`
- [ ] 下载 PocketBase 二进制文件成功

### 运行阶段验证
```bash
# PocketBase 健康检查
curl https://pocketbase-final.zeabur.app/api/health

# 预期响应
{"code":200,"message":"API is healthy.","data":{}}
```

## 预防措施

### 1. 配置管理最佳实践
- 所有服务使用明确的构建路径
- 避免使用默认的 `Dockerfile` 名称
- 使用不同的文件名区分服务

### 2. 部署流程优化
- 重要更改前先在测试环境验证
- 使用 Git 分支进行部署测试
- 保持部署配置的版本控制

### 3. 监控和告警
- 设置部署失败告警
- 监控服务健康状态
- 定期检查构建日志

## 经验教训

### 1. Zeabur 缓存行为
- Zeabur 会缓存构建配置
- 需要明确的文件名来避免混淆
- 重大更改需要强制重新部署

### 2. 多服务配置
- 每个服务应该有独立的构建上下文
- 避免服务间的配置冲突
- 使用明确的路径和文件名

### 3. 故障排除流程
- 首先检查构建日志
- 确认使用的 Dockerfile
- 验证环境变量配置

## 后续工作

### 1. 部署验证
- [ ] 确认 Zeabur 重新部署成功
- [ ] 验证所有服务健康状态
- [ ] 测试功能完整性

### 2. 表结构导入
- [ ] 使用 `pocketbase/schema.json` 导入表结构
- [ ] 验证表创建和权限设置
- [ ] 测试 CRUD 操作

### 3. 监控设置
- [ ] 配置服务监控
- [ ] 设置健康检查告警
- [ ] 建立部署验证流程

## 状态
- **修复完成**: ✅
- **部署触发**: ✅ (Git 提交)
- **等待验证**: 🔄

---

**最后更新**: 2025-10-14
**预计解决时间**: 部署完成后 10-15 分钟