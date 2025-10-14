# 042 - Zeabur PocketBase 重启部署失败问题

日期: 2025-10-14

## 问题描述
- Zeabur 服务器上 PocketBase 服务在配置脚本加入后，重启时部署失败
- 无法找到具体失败原因

## 根本原因分析

### 1. **错误的构建路径配置**
- **问题**: zeabur.yaml 中 PocketBase 服务指向错误的构建路径 `build: .`
- **影响**: 使用前端 Dockerfile 构建 PocketBase 服务，导致二进制文件缺失

### 2. **缺少专用 Dockerfile**
- **问题**: 没有 PocketBase 专用的 Dockerfile
- **影响**: 无法正确下载和配置 PocketBase 二进制文件

### 3. **环境变量验证缺失**
- **问题**: 启动时没有验证必要的环境变量
- **影响**: 缺少关键配置时服务无法启动

## 解决方案

### 1. **创建 PocketBase 专用 Dockerfile**
```dockerfile
FROM alpine:latest
RUN apk add --no-cache ca-certificates curl sqlite
WORKDIR /app
RUN curl -L -o pocketbase.tar.gz https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.tar.gz \
    && tar -xzf pocketbase.tar.gz \
    && rm pocketbase.tar.gz \
    && chmod +x /app/pocketbase
```

### 2. **修复 Zeabur 配置**
```yaml
services:
  pocketbase:
    build: ./pocketbase  # 修正构建路径
    ports:
      - 8090:8090
```

### 3. **创建启动脚本**
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

### 4. **添加环境变量验证**
- 在启动脚本中验证所有必要环境变量
- 提供默认值或优雅的错误处理

## 修复文件清单

### 新增文件
- `pocketbase/Dockerfile` - PocketBase 专用 Dockerfile
- `pocketbase/start.sh` - 启动脚本
- `.env.example` - 环境变量配置示例

### 修改文件
- `zeabur.yaml` - 修正构建路径

## 测试验证

### 1. **构建测试**
- [ ] 验证 PocketBase Dockerfile 构建成功
- [ ] 验证启动脚本权限正确

### 2. **环境变量测试**
- [ ] 验证必要环境变量存在
- [ ] 测试缺少环境变量的错误处理

### 3. **重启测试**
- [ ] 测试服务重启稳定性
- [ ] 验证健康检查功能

## 预防措施

### 1. **配置验证**
- 所有服务必须有专用的 Dockerfile
- 启动脚本必须验证环境变量
- 健康检查必须配置正确

### 2. **部署流程**
- 部署前验证所有配置文件
- 测试重启功能
- 监控服务启动状态

## 结果
- PocketBase 服务现在应该有稳定的重启能力
- 环境变量问题会得到明确的错误提示
- 构建路径错误已修复

## 后续工作
- 在 Zeabur 上重新部署测试
- 验证重启稳定性
- 更新部署文档