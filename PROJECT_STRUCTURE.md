# FluLink AI-Native 项目结构
# 基于《德道经》"无为而治"哲学，实现AI驱动的分布式社交生态

flulink-ai-native/
├── README.md                    # 项目总览和部署指南
├── docker-compose.yml           # 本地开发环境 (PocketBase, Chroma, AI Agent)
├── Dockerfile                   # 生产环境镜像
├── zeabur.yml                   # Zeabur 一键部署配置
├── .env.example                 # 环境变量模板
├── .gitignore                   # Git忽略文件
│
├── pocketbase/                  # PocketBase 后端服务
│   ├── Dockerfile               # PocketBase 容器配置
│   ├── pb_schema.json           # 数据模型定义
│   ├── pb_hooks/                # 实时钩子
│   │   ├── onStrainCreate.js    # 毒株创建时触发AI分析
│   │   ├── onInfectionCreate.js # 感染记录时更新传播状态
│   │   └── onUserUpdate.js      # 用户更新时同步向量
│   └── pb_migrations/           # 数据库迁移
│       └── 001_initial.sql      # 初始数据模型
│
├── chroma/                      # Chroma 向量数据库
│   ├── Dockerfile               # Chroma 容器配置
│   ├── chroma_config.py         # Chroma 配置
│   └── collections/              # 向量集合定义
│       ├── user_interests.json  # 用户兴趣向量
│       ├── strain_embeddings.json # 毒株内容向量
│       └── spread_patterns.json # 传播模式向量
│
├── ai-agent/                    # AI 智能层服务
│   ├── Dockerfile               # AI Agent 容器配置
│   ├── requirements.txt          # Python 依赖
│   ├── main.py                  # FastAPI 主服务
│   ├── services/                # AI 服务模块
│   │   ├── toxicity_analyzer.py # 毒性评分服务
│   │   ├── embedding_service.py # 向量化服务
│   │   ├── spread_predictor.py  # 传播预测服务
│   │   └── daoism_rules.py      # 德道经规则引擎
│   ├── models/                  # AI 模型定义
│   │   ├── toxicity_model.py   # 毒性评分模型
│   │   └── spread_model.py     # 传播预测模型
│   └── config/                  # 配置文件
│       ├── context7_config.py   # Context7 API 配置
│       └── daoism_rules.json    # 德道经规则配置
│
├── nextjs-frontend/             # Next.js 15 前端项目
│   ├── package.json             # 前端依赖
│   ├── next.config.js           # Next.js 配置
│   ├── tailwind.config.js       # Tailwind CSS 配置
│   ├── tsconfig.json            # TypeScript 配置
│   ├── app/                     # App Router 结构
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页
│   │   ├── globals.css          # 全局样式
│   │   ├── (tabs)/              # 标签页路由组
│   │   │   ├── virus-library/   # 病毒库页面
│   │   │   │   └── page.tsx
│   │   │   ├── spread-map/      # 传播图谱页面
│   │   │   │   └── page.tsx
│   │   │   ├── create-strain/   # 创建毒株页面
│   │   │   │   └── page.tsx
│   │   │   ├── profile/         # 用户档案页面
│   │   │   │   └── page.tsx
│   │   │   └── storyboard/      # 故事板页面
│   │   │       └── page.tsx
│   │   ├── api/                 # API 路由
│   │   │   ├── health/          # 健康检查
│   │   │   └── webhook/         # Webhook 端点
│   │   └── components/          # 组件库
│   │       ├── ui/              # 基础UI组件
│   │       ├── strain/          # 毒株相关组件
│   │       ├── map/             # 地图组件
│   │       └── ai-chat/         # AI聊天组件
│   ├── lib/                     # 工具库
│   │   ├── pocketbase.ts        # PocketBase 客户端
│   │   ├── chroma.ts            # Chroma 客户端
│   │   ├── ai-agent.ts          # AI Agent 客户端
│   │   └── utils.ts             # 工具函数
│   ├── hooks/                   # React Hooks
│   │   ├── useStrains.ts        # 毒株数据Hook
│   │   ├── useCurrentUser.ts    # 当前用户Hook
│   │   ├── useSpreadMap.ts      # 传播地图Hook
│   │   └── useAIChat.ts         # AI聊天Hook
│   └── public/                  # 静态资源
│       ├── icons/               # 图标资源
│       └── manifest.json         # PWA 配置
│
├── scripts/                     # 自动化脚本
│   ├── setup-dev.sh             # 开发环境设置
│   ├── deploy-zeabur.sh         # Zeabur 部署脚本
│   ├── init-db.sh               # 数据库初始化
│   └── test-ai-agent.sh         # AI Agent 测试
│
├── docs/                        # 项目文档
│   ├── DEPLOYMENT.md            # 部署指南
│   ├── API.md                   # API 文档
│   ├── AI_AGENT.md              # AI Agent 文档
│   └── DAOISM_RULES.md          # 德道经规则说明
│
└── tests/                       # 测试文件
    ├── e2e/                     # 端到端测试
    ├── unit/                    # 单元测试
    └── integration/             # 集成测试
