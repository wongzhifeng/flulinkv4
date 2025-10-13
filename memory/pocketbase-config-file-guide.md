# FluLink v4.0 PocketBase 配置文件说明

## 📁 配置文件位置

### 1. 环境变量配置文件
**位置**: `pocketbase/pb.config`
**用途**: PocketBase 环境变量配置
**内容**: 数据库、安全、日志、邮件等配置

### 2. 数据模型配置文件
**位置**: `pocketbase/schema.md`
**用途**: 数据模型定义
**内容**: 用户表、星种表、星团表、互动表结构

### 3. 自定义钩子文件
**位置**: `pocketbase/hooks/star_seeds.js`
**用途**: 星种创建后自动传播
**内容**: AI 服务集成、传播路径优化

### 4. 部署配置文件
**位置**: `zeabur.yaml`
**用途**: Zeabur 部署配置
**内容**: 服务定义、环境变量、健康检查

## 🔧 配置文件说明

### pocketbase/pb.config
```bash
# 核心配置
PB_ENCRYPTION_KEY=flulink-v4-encryption-key-32chars
PB_ADMIN_EMAIL=admin@flulink.app
PB_ADMIN_PASSWORD=Flulink2025!Admin
PUBLIC_URL=https://pocketbase-v4.zeabur.app

# 数据库配置
PB_DB_TYPE=sqlite
PB_DB_FILE=/pb_data/pb_data.db

# 安全配置
PB_SECRET_KEY=flulink-v4-secret-key-32chars
PB_JWT_SECRET=flulink-v4-jwt-secret-32chars

# CORS 配置
PB_CORS_ORIGINS=https://flulink-v4.zeabur.app
```

### zeabur.yaml
```yaml
services:
  pocketbase:
    build: .
    environment:
      - PB_ENCRYPTION_KEY=${PB_ENCRYPTION_KEY}
      - PB_ADMIN_EMAIL=${PB_ADMIN_EMAIL}
      - PB_ADMIN_PASSWORD=${PB_ADMIN_PASSWORD}
      - PB_PUBLIC_URL=${PUBLIC_URL}
```

## 🚀 如何使用配置文件

### 方案 1: 使用环境变量（推荐）
1. **在 Zeabur 设置环境变量**:
   - `PB_ADMIN_EMAIL=admin@flulink.app`
   - `PB_ADMIN_PASSWORD=Flulink2025!Admin`
   - `PB_ENCRYPTION_KEY=flulink-v4-encryption-key-32chars`

2. **重启 PocketBase 服务**

### 方案 2: 使用配置文件
1. **创建配置文件**: `pocketbase/pb.config`
2. **修改 Dockerfile**: 复制配置文件到容器
3. **重新部署**: 使用配置文件启动服务

### 方案 3: 手动配置
1. **访问管理面板**: https://pocketbase-v4.zeabur.app/_/
2. **首次设置**: 创建管理员账户
3. **配置数据库**: 设置数据模型
4. **测试功能**: 验证 API 端点

## 📋 配置文件内容

### 1. 核心配置
- **加密密钥**: 32字符长度的加密密钥
- **管理员账户**: 邮箱和密码
- **公共URL**: 服务访问地址

### 2. 数据库配置
- **数据库类型**: SQLite
- **数据库文件**: `/pb_data/pb_data.db`
- **日志文件**: `/pb_data/logs/pb.log`

### 3. 安全配置
- **密钥**: JWT 和加密密钥
- **CORS**: 跨域访问配置
- **文件存储**: 文件上传配置

### 4. 邮件配置
- **SMTP 设置**: 邮件服务器配置
- **发送者**: 邮件发送者信息
- **模板**: 邮件模板配置

## 🎯 推荐操作

### 立即执行（方案 1）
1. **登录 Zeabur**: https://zeabur.com/dashboard
2. **找到项目**: flulinkv4
3. **选择服务**: PocketBase
4. **环境变量**: 添加以下配置

```bash
PB_ADMIN_EMAIL=admin@flulink.app
PB_ADMIN_PASSWORD=Flulink2025!Admin
PB_ENCRYPTION_KEY=flulink-v4-encryption-key-32chars
PUBLIC_URL=https://pocketbase-v4.zeabur.app
```

5. **重启服务**: 保存环境变量后重启 PocketBase

### 验证配置
1. **访问管理面板**: https://pocketbase-v4.zeabur.app/_/
2. **测试登录**: 使用配置的邮箱密码
3. **检查数据模型**: 验证表结构
4. **测试 API**: 验证端点功能

## 💡 重要提示

1. **配置文件位置**: `pocketbase/pb.config`
2. **环境变量优先**: 环境变量会覆盖配置文件
3. **安全考虑**: 不要在代码中硬编码密码
4. **重启服务**: 配置修改后必须重启服务

## 🎉 总结

**配置文件位置**: `pocketbase/pb.config`  
**推荐方案**: 在 Zeabur 设置环境变量  
**预期结果**: PocketBase 自动创建管理员账户，可以正常登录

**立即执行**: 在 Zeabur 设置环境变量！ 🚀
