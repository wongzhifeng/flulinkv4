# 强制 Zeabur 重新部署指南

## 当前问题
Zeabur 缓存了旧的配置，仍然使用根目录的 Dockerfile 构建 PocketBase 服务，导致 `npm ci` 失败。

## 已执行的修复

### 1. 重命名 Dockerfile
- 根目录 `Dockerfile` → `Dockerfile.frontend`
- 强制 Zeabur 使用明确的文件名

### 2. 更新 Zeabur 配置
- PocketBase: `context: ./pocketbase`, `dockerfile: Dockerfile`
- 前端: `context: .`, `dockerfile: Dockerfile.frontend`
- AI 服务: `context: ./ai-service`, `dockerfile: Dockerfile`

### 3. 创建备用配置
- `docker-compose.zeabur.yml` - Docker Compose 格式配置

## 强制重新部署步骤

### 方法 1: Git 提交触发
```bash
git add .
git commit -m "强制修复 Zeabur 部署配置：重命名 Dockerfile，明确构建路径"
git push origin main
```

### 方法 2: Zeabur 控制台操作
1. **登录 Zeabur 控制台**
   - 访问 https://zeabur.com
   - 进入 FluLink 项目

2. **清除构建缓存**
   - 在项目设置中找到 "清除构建缓存"
   - 确认清除所有缓存

3. **手动重新部署**
   - 在服务列表中找到所有服务
   - 逐个点击 "重新部署"
   - 或者使用 "重新部署所有服务"

4. **验证构建日志**
   - 查看 PocketBase 服务的构建日志
   - 确认使用的是 `pocketbase/Dockerfile`
   - 确认没有 `npm ci` 错误

### 方法 3: 联系 Zeabur 支持
如果上述方法无效：
- 通过 Zeabur 支持渠道联系
- 说明缓存问题
- 请求强制清除项目缓存

## 验证部署成功

### 构建阶段验证
- [ ] PocketBase 服务构建成功（没有 `npm ci` 错误）
- [ ] 前端服务构建成功
- [ ] AI 服务构建成功

### 运行阶段验证
```bash
# PocketBase 健康检查
curl https://pocketbase-final.zeabur.app/api/health

# 前端健康检查
curl https://flulink-v4.zeabur.app/api/health

# AI 服务健康检查
curl https://ai-service-final.zeabur.app/health
```

### 功能验证
- [ ] PocketBase 管理界面可访问
- [ ] 前端页面可访问
- [ ] AI 服务 API 可调用

## 故障排除

### 如果仍然失败
1. **检查 Zeabur 构建日志**
   - 确认使用的是正确的 Dockerfile
   - 检查是否有其他缓存问题

2. **临时解决方案**
   - 在根目录创建一个空的 `package-lock.json`
   - 但这只是临时方案，不推荐

3. **回滚方案**
   - 恢复到之前的 Git 提交
   - 重新部署确认工作状态

## 预防措施

### 1. 配置管理
- 所有服务使用明确的构建路径
- 避免使用默认的 `Dockerfile` 名称
- 使用不同的文件名区分服务

### 2. 部署流程
- 重要更改前先在测试环境验证
- 使用 Git 分支进行部署测试
- 保持部署配置的版本控制

### 3. 监控告警
- 设置部署失败告警
- 监控服务健康状态
- 定期检查构建日志

## 紧急联系方式
- **Zeabur 技术支持**: support@zeabur.com
- **项目维护团队**: 通过项目文档联系

---

**最后更新**: 2025-10-14
**状态**: 等待强制重新部署验证