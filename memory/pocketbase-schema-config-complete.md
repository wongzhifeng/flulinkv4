# PocketBase 表结构配置完成

## 📋 已创建文件

### 1. **pocketbase/schema.json** - 完整表结构配置
- ✅ **users** - 用户表 (认证表)
- ✅ **star_seeds** - 星种表 (核心内容表)  
- ✅ **star_clusters** - 星团表 (群组表)
- ✅ **interactions** - 互动记录表 (行为表)

### 2. **pocketbase/README.md** - 详细配置指南
- 📖 表结构说明
- 🔧 导入方法 (3种方式)
- ⚙️ 权限规则说明
- 🎯 下一步操作指南

## 🗄️ 表结构特点

### **AI-Native 设计**
- **向量字段**: `interest_vector`, `content_vector`, `cluster_vector`
- **JSON元数据**: 支持复杂数据结构
- **AI分析字段**: `ai_generated_metadata`, `ai_analyzed_sentiment`

### **关系设计**
- **用户-星种**: 一对多关系
- **用户-星团**: 多对多关系 (最多49个成员)
- **用户-互动**: 一对多关系
- **星种-互动**: 一对多关系

### **性能优化**
- **索引配置**: 关键字段已建立索引
- **文件存储**: 支持头像和媒体文件
- **约束设置**: 数据完整性和一致性

## 🚀 推荐导入方式

### **方式1: Zeabur AI助手 (推荐)**
```
提示词: 请帮我创建PocketBase数据表，基于以下JSON配置创建4个表：users, star_seeds, star_clusters, interactions，设置适当的索引和权限规则。
```

### **方式2: PocketBase管理面板**
1. 访问 `https://pocketbase-final.zeabur.app/_/`
2. 登录后进入 Collections
3. 使用 Import 功能上传 `schema.json`

### **方式3: CLI命令**
```bash
cd pocketbase
pocketbase migrate --schema=schema.json
```

## 📊 数据模型概览

```
用户系统 (users)
├── 基础信息: username, avatar, location
├── AI数据: interest_vector, ai_preferences  
└── 隐私设置: privacy_settings

内容系统 (star_seeds)
├── 内容: content, content_type, media_files
├── AI分析: content_vector, spectral_tags, ai_generated_metadata
├── 传播: propagation_path, luminosity, resonance_count
└── 状态: status (active/dormant/archived)

群组系统 (star_clusters)  
├── 成员: members (最多49个), core_users (最多2个)
├── 特征: resonance_score, activity_level, spectral_diversity
├── 地理: geographic_center
└── 生命周期: expiration_time (7天过期)

互动系统 (interactions)
├── 关系: user, star_seed
├── 行为: interaction_type, interaction_strength
└── AI分析: context_data, ai_analyzed_sentiment
```

## 🎯 下一步操作

1. **导入表结构** - 选择上述任一方式
2. **验证表创建** - 检查字段和关系
3. **测试API** - 验证CRUD操作
4. **配置钩子** - 设置AI自动传播
5. **部署前端** - 连接PocketBase API

配置文件已准备就绪，可以开始导入表结构了！

