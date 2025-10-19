# FluLink 星尘共鸣版 v4.0 - README

## 🌟 项目概述

FluLink 星尘共鸣版是一个基于 AI Agent 驱动的下一代异步社交平台，通过智能传播算法实现内容的高效精准分发。

## 🏗️ 技术架构

### 核心特性
- **AI 原生设计**: 业务逻辑深度集成 AI 决策
- **实时向量检索**: 毫秒级兴趣匹配
- **无服务器架构**: 按需伸缩，成本优化
- **多模态交互**: 支持文本、图像、地理位置混合处理

### 技术栈
- **前端**: Next.js 15 + React 19 + TypeScript
- **后端**: PocketBase + 自定义逻辑
- **AI 层**: ChromaDB + Sentence Transformers
- **部署**: Zeabur 云平台

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Python 3.11+
- PocketBase

### 安装依赖
```bash
# 前端依赖
npm install

# AI 服务依赖
cd ai-service
pip install -r requirements.txt
```

### 启动服务
```bash
# 启动 PocketBase
npm run pocketbase

# 启动 AI 服务
npm run ai-service

# 启动前端开发服务器
npm run dev
```

## 📁 项目结构

```
flulink-stardust-v4/
├── src/                    # Next.js 应用源码
│   ├── app/               # App Router
│   ├── components/        # React 组件
│   ├── lib/              # 工具库
│   └── types/            # TypeScript 类型
├── pocketbase/           # PocketBase 后端
│   ├── hooks/           # 自定义钩子
│   ├── apis/            # API 端点
│   └── migrations/      # 数据迁移
├── ai-service/          # AI 智能服务
├── flulink-app/         # 高保真模板（保留）
└── memory/             # 记忆库（保留）
```

## 🔧 开发指南

### 数据模型
详见 `pocketbase/schema.md`

### AI 服务
详见 `ai-service/requirements.txt`

### 部署配置
详见 `zeabur.yaml`

## 📊 核心功能

1. **星空图谱**: 基于向量相似度的内容可视化
2. **AI 星种创建**: 智能内容生成与优化
3. **星团共鸣**: 用户群体智能匹配
4. **实时传播**: 基于地理位置的精准分发

## 🔮 未来规划

- 多模态内容理解
- 预测性传播路径规划
- 自主内容创作与优化
- 情感分析与个性化交互

## 📝 更新日志

### v4.0.0 (2025-01-13)
- 🎉 全新 AI-Native 架构
- 🚀 Next.js 15 + React 19 升级
- 🤖 集成 AI Agent 智能决策
- 📊 向量数据库支持
- 🌐 Zeabur 云部署优化
- 🔄 集成 AgentRouter API 路由系统