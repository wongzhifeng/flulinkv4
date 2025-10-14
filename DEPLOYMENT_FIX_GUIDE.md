# Zeabur PocketBase 部署修复指南

## 问题描述
Zeabur 服务器上 PocketBase 服务部署失败，错误显示 `npm ci` 失败，表明 Zeabur 仍然在使用根目录的 Dockerfile 构建 PocketBase 服务。

## 根本原因
- Zeabur 缓存了旧的配置
- PocketBase 服务错误地使用了前端 Dockerfile
- 缺少明确的构建上下文配置

## 修复方案

### 1. 更新 Zeabur 配置
已更新 `zeabur.yaml` 文件，为每个服务指定明确的构建上下文：

```yaml
services:
  pocketbase:
    build:
      context: ./pocketbase
      dockerfile: Dockerfile
    # ... 其他配置
```

### 2. 强制 Zeabur 重新构建
由于 Zeabur 可能缓存了旧的配置，需要强制重新构建：

#### 方法 1: 重新部署
1. 在 Zeabur 控制台中找到 FluLink 项目
2. 点击 "重新部署" 按钮
3. 等待构建完成

#### 方法 2: 清除缓存（如果需要）
1. 在 Zeabur 项目设置中
2. 找到 "清除构建缓存" 选项
3. 清除缓存后重新部署

#### 方法 3: 通过 Git 触发
1. 提交所有更改到 Git
2. 推送到远程仓库
3. Zeabur 会自动重新部署

### 3. 验证部署
部署完成后，检查以下内容：

#### 检查 PocketBase 服务
```bash
# 检查服务状态
curl https://pocketbase-final.zeabur.app/api/health

# 预期响应
{"code":200,"message":"API is healthy.","data":{}}
```

#### 检查前端服务
```bash
# 检查前端服务
curl https://flulink-v4.zeabur.app/api/health
```

#### 检查 AI 服务
```bash
# 检查 AI 服务
curl https://ai-service-final.zeabur.app/health
```

## 部署验证清单

### ✅ 构建验证
- [ ] PocketBase 服务使用正确的 Dockerfile
- [ ] 前端服务构建成功
- [ ] AI 服务构建成功

### ✅ 服务验证
- [ ] PocketBase 健康检查通过
- [ ] 前端服务健康检查通过
- [ ] AI 服务健康检查通过

### ✅ 功能验证
- [ ] PocketBase API 可访问
- [ ] 前端页面可访问
- [ ] AI 服务 API 可访问

## 故障排除

### 如果仍然失败
1. **检查 Zeabur 日志**
   - 在 Zeabur 控制台查看详细的构建日志
   - 确认使用的是正确的 Dockerfile

2. **验证环境变量**
   - 确保所有必要的环境变量已设置
   - 检查环境变量名称和值是否正确

3. **检查文件权限**
   - 确保启动脚本有执行权限
   - 验证数据目录权限

### 紧急回滚
如果新配置导致问题，可以：
1. 恢复到之前的 Git 提交
2. 重新部署
3. 或者手动在 Zeabur 中回滚到之前的版本

## 预防措施

### 1. 配置验证
- 每次修改 zeabur.yaml 后，验证语法正确性
- 确保所有服务都有明确的构建上下文

### 2. 部署测试
- 在重要更改前，先在小规模测试
- 使用 Git 分支进行测试部署

### 3. 监控和告警
- 设置服务健康监控
- 配置部署失败告警

## 联系支持
如果问题持续存在，请联系：
- Zeabur 技术支持
- 项目维护团队

---

**最后更新**: 2025-10-14
**状态**: 已修复配置，等待重新部署验证