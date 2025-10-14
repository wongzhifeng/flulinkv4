# PocketBase 表结构配置指南

## 📋 配置文件说明

### 文件位置
- **配置文件**: `pocketbase/schema.json`
- **用途**: 手工导入PocketBase表结构

## 🗄️ 数据表结构

### 1. **users** - 用户表
```json
{
  "id": "users",
  "name": "users", 
  "type": "auth",
  "schema": [
    "username": "用户名 (text, 3-20字符)",
    "avatar": "头像 (file, 最大5MB)",
    "location": "位置信息 (json)",
    "interest_vector": "兴趣向量 (json)",
    "interaction_history": "互动历史 (json)",
    "privacy_settings": "隐私设置 (json)",
    "ai_preferences": "AI偏好 (json)"
  ]
}
```

### 2. **star_seeds** - 星种表
```json
{
  "id": "star_seeds",
  "name": "star_seeds",
  "type": "base", 
  "schema": [
    "creator": "创建者 (relation to users)",
    "content": "内容 (text, 1-5000字符)",
    "content_type": "内容类型 (select: text/image/audio/mixed)",
    "media_files": "媒体文件 (file, 最大50MB, 最多5个)",
    "location": "位置信息 (json)",
    "content_vector": "内容向量 (json)",
    "spectral_tags": "光谱标签 (json)",
    "luminosity": "光度值 (number, 0-100)",
    "resonance_count": "共鸣次数 (number)",
    "propagation_path": "传播路径 (json)",
    "status": "状态 (select: active/dormant/archived)",
    "ai_generated_metadata": "AI生成元数据 (json)"
  ]
}
```

### 3. **star_clusters** - 星团表
```json
{
  "id": "star_clusters",
  "name": "star_clusters",
  "type": "base",
  "schema": [
    "members": "成员 (relation to users, 最多49个)",
    "core_users": "核心用户 (relation to users, 最多2个)",
    "resonance_score": "共鸣分数 (number, 0-100)",
    "geographic_center": "地理中心 (json)",
    "activity_level": "活跃度 (number, 0-100)",
    "spectral_diversity": "光谱多样性 (json)",
    "expiration_time": "过期时间 (date)",
    "cluster_vector": "星团向量 (json)"
  ]
}
```

### 4. **interactions** - 互动记录表
```json
{
  "id": "interactions", 
  "name": "interactions",
  "type": "base",
  "schema": [
    "user": "用户 (relation to users)",
    "star_seed": "星种 (relation to star_seeds)",
    "interaction_type": "互动类型 (select: view/like/comment/share/resonate)",
    "interaction_strength": "互动强度 (number, 1-10)",
    "context_data": "上下文数据 (json)",
    "ai_analyzed_sentiment": "AI分析情感 (json)"
  ]
}
```

## 🔧 导入步骤

### 方法1: PocketBase管理面板
1. 访问 `https://pocketbase-final.zeabur.app/_/`
2. 登录管理员账户
3. 进入 "Collections" 页面
4. 点击 "Import" 按钮
5. 上传 `schema.json` 文件

### 方法2: PocketBase CLI
```bash
# 进入PocketBase目录
cd pocketbase

# 导入表结构
pocketbase migrate --schema=schema.json
```

### 方法3: Zeabur AI助手
1. 在Zeabur控制台找到PocketBase服务
2. 使用AI助手功能
3. 提供以下提示词：

```
请帮我创建PocketBase数据表，基于以下JSON配置：

[粘贴schema.json内容]

要求：
1. 创建4个表：users, star_seeds, star_clusters, interactions
2. 设置适当的索引和权限规则
3. 确保字段类型和约束正确
4. 配置关系字段
```

## ⚙️ 权限规则说明

### 用户表 (users)
- **查看/列表**: 需要认证
- **创建**: 开放注册
- **更新/删除**: 仅限本人

### 星种表 (star_seeds)  
- **查看/列表**: 需要认证
- **创建**: 需要认证
- **更新/删除**: 仅限创建者

### 星团表 (star_clusters)
- **查看/列表**: 需要认证
- **创建**: 需要认证
- **更新/删除**: 需要认证

### 互动记录表 (interactions)
- **查看/列表**: 需要认证
- **创建**: 需要认证
- **更新/删除**: 仅限本人

## 🎯 下一步操作

1. **导入表结构** - 使用上述任一方法
2. **创建管理员账户** - 首次登录时设置
3. **测试API端点** - 验证表结构正确
4. **配置AI钩子** - 设置自动传播逻辑
5. **部署前端服务** - 连接PocketBase API

## 📝 注意事项

- JSON文件已包含完整的字段定义和约束
- 所有关系字段已正确配置
- 索引已优化查询性能
- 权限规则符合安全要求
- 支持AI-Native架构需求

