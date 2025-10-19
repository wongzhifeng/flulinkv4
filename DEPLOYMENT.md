# FluLink AI-Native 部署指南

## 🎯 项目概述

FluLink AI-Native 是一个基于《德道经》"无为而治"哲学的分布式社交应用，采用AI驱动的智能分析系统。

### 核心架构
- **PocketBase**: 后端数据存储与认证服务
- **ChromaDB**: 向量数据库，存储AI分析结果
- **AI Agent**: 基于Context7 API的智能分析服务
- **Next.js 15**: 现代化前端应用

### 核心特性
- 🧬 **毒株传播系统**: 基于地理层级的四级传播机制
- 🤖 **AI智能分析**: Context7驱动的毒性评分和传播预测
- 🎭 **德道经规则引擎**: 严格遵循《德道经》的业务逻辑
- 🌐 **一键部署**: Zeabur平台自动化部署

## 🚀 快速部署

### 1. 环境准备

#### 必需条件
- Docker 和 Docker Compose
- Zeabur 账户
- Context7 API Key (已提供: `ctx7sk-3eff1f70-bd18-43af-955d-c2a3f0f94f45`)

#### 可选条件
- DeepSeek API Key (用于备用AI分析)

### 2. 本地开发环境

```bash
# 克隆项目
git clone <repository-url>
cd flulink-ai-native

# 复制环境变量模板
cp env.template .env

# 编辑环境变量
nano .env

# 启动开发环境
docker-compose up -d

# 检查服务状态
docker-compose ps
```

### 3. Zeabur 一键部署

#### 步骤1: 创建Zeabur项目
1. 登录 [Zeabur Dashboard](https://dash.zeabur.com)
2. 点击 "New Project"
3. 选择 "Import from Git"
4. 连接你的Git仓库

#### 步骤2: 配置环境变量
在Zeabur项目设置中添加以下环境变量：

```bash
# 核心配置
PB_ENCRYPTION_KEY=your-32-character-encryption-key-here
PB_ADMIN_EMAIL=admin@flulink.app
PB_ADMIN_PASSWORD=Flulink2025!Admin
PUBLIC_URL=https://your-app.zeabur.app

# AI服务配置
CONTEXT7_API_KEY=ctx7sk-3eff1f70-bd18-43af-955d-c2a3f0f94f45
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# 服务URL (部署后自动生成)
POCKETBASE_URL=https://pocketbase-your-app.zeabur.app
AI_AGENT_URL=https://ai-agent-your-app.zeabur.app
CHROMA_URL=https://chroma-your-app.zeabur.app
```

#### 步骤3: 部署服务
1. 在Zeabur Dashboard中点击 "Deploy"
2. 选择 `zeabur.yml` 配置文件
3. 等待所有服务部署完成

#### 步骤4: 验证部署
```bash
# 检查服务健康状态
curl https://pocketbase-your-app.zeabur.app/api/health
curl https://ai-agent-your-app.zeabur.app/health
curl https://chroma-your-app.zeabur.app/api/v1/heartbeat
curl https://your-app.zeabur.app/api/health
```

## 🔧 服务配置

### PocketBase 配置

#### 数据模型
- `users`: 用户表，包含等级、位置、免疫档案
- `strains`: 毒株表，包含内容、毒性分数、传播状态
- `infections`: 感染记录表，记录传播历史
- `star_clusters`: 星团表，用户群体分析

#### 实时钩子
- `onStrainCreate.js`: 毒株创建时触发AI分析
- `onInfectionCreate.js`: 感染记录时更新传播状态
- `onUserUpdate.js`: 用户更新时同步向量

### AI Agent 配置

#### 核心服务
- `/api/analyze/toxicity`: 毒性分析服务
- `/api/predict/spread`: 传播预测服务
- `/api/embed`: 向量化服务
- `/health`: 健康检查

#### 德道经规则
```json
{
  "spread_hierarchy": {
    "community": {"delay_minutes": 0, "infection_threshold": 0.1},
    "neighborhood": {"delay_minutes": 30, "infection_threshold": 0.2},
    "street": {"delay_minutes": 120, "infection_threshold": 0.4},
    "city": {"delay_minutes": 480, "infection_threshold": 0.6}
  },
  "toxicity_thresholds": {
    "super_spread": 7.5,
    "high_virulence": 6.0,
    "moderate": 4.0,
    "low": 2.0
  }
}
```

### ChromaDB 配置

#### 向量集合
- `user_interests`: 用户兴趣向量
- `strain_embeddings`: 毒株内容向量
- `spread_patterns`: 传播模式向量

## 📊 监控和维护

### 健康检查
所有服务都配置了健康检查端点：
- PocketBase: `/api/health`
- AI Agent: `/health`
- ChromaDB: `/api/v1/heartbeat`
- Frontend: `/api/health`

### 日志监控
```bash
# 查看服务日志
docker-compose logs -f pocketbase
docker-compose logs -f ai-agent
docker-compose logs -f chroma
docker-compose logs -f nextjs-frontend
```

### 性能监控
- AI Agent响应时间 < 2秒
- PocketBase查询时间 < 100ms
- 前端页面加载时间 < 200ms

## 🐛 故障排除

### 常见问题

#### 1. AI Agent连接失败
```bash
# 检查Context7 API Key
curl -H "Authorization: Bearer $CONTEXT7_API_KEY" \
     https://api.context7.ai/v1/analyze

# 检查服务依赖
docker-compose logs ai-agent
```

#### 2. PocketBase认证失败
```bash
# 重置管理员密码
docker-compose exec pocketbase /app/pocketbase admin create \
  --email admin@flulink.app \
  --password Flulink2025!Admin
```

#### 3. ChromaDB连接问题
```bash
# 检查ChromaDB状态
curl http://localhost:8001/api/v1/heartbeat

# 重启ChromaDB服务
docker-compose restart chroma
```

### 性能优化

#### 1. 缓存配置
```bash
# 启用Redis缓存
docker-compose up -d redis

# 配置缓存TTL
CACHE_TTL=300
```

#### 2. 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_strains_toxicity ON strains (toxicity_score);
CREATE INDEX idx_infections_date ON infections (infected_at);
CREATE INDEX idx_users_location ON users (location_data);
```

## 🔄 更新和维护

### 版本更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建服务
docker-compose build

# 滚动更新
docker-compose up -d
```

### 数据备份
```bash
# 备份PocketBase数据
docker-compose exec pocketbase tar -czf /pb_data/backup.tar.gz /pb_data/data.db

# 备份ChromaDB数据
docker-compose exec chroma tar -czf /chroma/backup.tar.gz /chroma/chroma
```

## 📚 API文档

### PocketBase API
- 基础URL: `https://pocketbase-your-app.zeabur.app/api`
- 认证: Bearer Token
- 实时订阅: WebSocket连接

### AI Agent API
- 基础URL: `https://ai-agent-your-app.zeabur.app`
- 认证: 内部服务认证
- 格式: JSON

### ChromaDB API
- 基础URL: `https://chroma-your-app.zeabur.app/api/v1`
- 认证: 内部服务认证
- 格式: JSON

## 🎯 下一步计划

1. **性能优化**: 实现Redis缓存和CDN加速
2. **监控增强**: 集成Prometheus和Grafana
3. **安全加固**: 实现OAuth2和JWT认证
4. **功能扩展**: 添加实时聊天和群组功能

## 📞 支持

如有问题，请查看：
1. 项目文档: `/docs/`
2. API文档: `/docs/API.md`
3. 故障排除: `/docs/TROUBLESHOOTING.md`

---

**基于《德道经》"无为而治"哲学构建**  
**让信息自然流动，让用户自主选择**