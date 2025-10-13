# FluLink v4.0 PocketBase 登录问题解决方案

## 🚨 问题分析

### 问题描述
PocketBase 无法登录，可能的原因：
1. **环境变量未设置**: Zeabur 没有配置 `PB_ADMIN_EMAIL` 和 `PB_ADMIN_PASSWORD`
2. **默认账户**: PocketBase 首次启动需要手动创建管理员账户
3. **配置问题**: 环境变量配置不正确

### 当前配置状态
- **env.example**: 包含示例配置 `admin@flulink.app` / `your-secure-admin-password`
- **zeabur.yaml**: 引用了环境变量 `${PB_ADMIN_EMAIL}` 和 `${PB_ADMIN_PASSWORD}`
- **实际部署**: 可能没有设置这些环境变量

## 🔧 解决方案

### 方案 1: 在 Zeabur 设置环境变量（推荐）

**步骤**:
1. 登录 Zeabur 控制台
2. 找到 PocketBase 服务
3. 进入环境变量设置
4. 添加以下环境变量：

```bash
PB_ADMIN_EMAIL=admin@flulink.app
PB_ADMIN_PASSWORD=Flulink2025!Admin
PB_ENCRYPTION_KEY=flulink-v4-encryption-key-32chars
PUBLIC_URL=https://pocketbase-v4.zeabur.app
```

5. 重启 PocketBase 服务

### 方案 2: 手动创建管理员账户

**步骤**:
1. 访问 https://pocketbase-v4.zeabur.app/_/
2. 如果是首次访问，会显示设置页面
3. 创建管理员账户：
   - **邮箱**: admin@flulink.app
   - **密码**: Flulink2025!Admin
4. 完成设置

### 方案 3: 重置 PocketBase 配置

**步骤**:
1. 在 Zeabur 中删除 PocketBase 服务
2. 重新部署 PocketBase 服务
3. 设置正确的环境变量
4. 访问管理面板创建账户

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
6. **测试登录**: 访问管理面板测试登录

### 环境变量说明

```bash
# 管理员账户
PB_ADMIN_EMAIL=admin@flulink.app
PB_ADMIN_PASSWORD=Flulink2025!Admin

# 加密密钥（32字符）
PB_ENCRYPTION_KEY=flulink-v4-encryption-key-32chars

# 公共 URL
PUBLIC_URL=https://pocketbase-v4.zeabur.app

# 钩子目录
PB_HOOKS_DIR=/app/pocketbase/hooks
```

## 🔍 验证步骤

### 1. 环境变量设置后
- [ ] 重启 PocketBase 服务
- [ ] 等待服务启动完成
- [ ] 访问管理面板

### 2. 登录测试
- [ ] 访问 https://pocketbase-v4.zeabur.app/_/
- [ ] 使用邮箱: admin@flulink.app
- [ ] 使用密码: Flulink2025!Admin
- [ ] 验证登录成功

### 3. 功能验证
- [ ] 检查数据模型是否正确
- [ ] 验证自定义钩子是否加载
- [ ] 测试 API 端点功能

## 📊 预期结果

### 设置环境变量后
- ✅ PocketBase 自动创建管理员账户
- ✅ 管理面板可以正常登录
- ✅ 数据模型和钩子正确加载
- ✅ API 端点功能正常

### 登录成功后
- ✅ 可以访问管理面板
- ✅ 可以查看数据模型
- ✅ 可以测试 API 端点
- ✅ 可以管理用户和数据

## 🚀 下一步操作

### 环境变量设置完成后
1. **验证登录**: 测试管理员账户登录
2. **检查数据模型**: 确认表结构正确
3. **测试钩子**: 验证自定义钩子加载
4. **部署前端**: 继续部署 Next.js 应用
5. **部署 AI 服务**: 部署 FastAPI 服务

## 💡 重要提示

1. **密码安全**: 使用强密码，包含大小写字母、数字和特殊字符
2. **加密密钥**: 确保 PB_ENCRYPTION_KEY 是 32 字符长度
3. **URL 配置**: PUBLIC_URL 必须与实际部署地址一致
4. **服务重启**: 环境变量修改后必须重启服务

## 🎉 总结

**问题原因**: Zeabur 没有设置 PocketBase 的环境变量  
**解决方案**: 在 Zeabur 控制台设置环境变量并重启服务  
**预期结果**: PocketBase 自动创建管理员账户，可以正常登录

**立即执行**: 在 Zeabur 设置环境变量！
