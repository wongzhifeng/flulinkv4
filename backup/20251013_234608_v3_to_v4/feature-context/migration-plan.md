# FluLink项目重构迁移计划
**文件**：feature-context/migration-plan.md
**创建时间**：2025-01-12
**负责人**：Claude Code + Cursor

## 迁移目标
将现有的React Native + Expo项目重构为Bun + SolidStart架构，保持核心业务逻辑不变。

## 迁移策略

### 阶段1：项目架构搭建 ✅
- [x] 创建Bun+SolidStart项目结构
- [x] 建立记忆库和提示词体系
- [x] 配置TypeScript和开发环境

### 阶段2：核心服务迁移 🔄
- [ ] 迁移地理传播算法 (GeographicPropagationService)
- [ ] 迁移毒株管理服务 (VirusStrainService)
- [ ] 迁移位置服务 (LocationService)
- [ ] 迁移用户分层服务 (UserTierService)
- [ ] 迁移标签匹配服务 (TagMatchingService)

### 阶段3：数据库重构
- [ ] 设计Turso数据库Schema
- [ ] 迁移数据模型到Drizzle ORM
- [ ] 实现边缘数据同步

### 阶段4：前端重构
- [ ] 将React组件转换为Solid.js
- [ ] 实现细粒度响应式
- [ ] 重构UI组件库

### 阶段5：API重构
- [ ] 重构后端API为SolidStart路由
- [ ] 实现边缘计算逻辑
- [ ] 优化性能

## 核心业务逻辑保持
以下核心算法必须完整迁移：
1. **地理层级传播算法** - 4级传播机制
2. **毒株分类系统** - 生活/观点/兴趣/超级毒株
3. **用户分层机制** - 免费/付费用户平衡
4. **标签匹配算法** - 精准传播机制
5. **星团解散机制** - 7天自动解散

## 技术约束
- 前端：必须使用Solid.js细粒度响应式
- 后端：Bun运行时，无状态服务
- 数据库：Turso边缘SQLite
- 部署：Zeabur一键部署
- 哲学：所有功能必须对应《德道经》依据

## 当前进度
- 项目架构：20% ✅
- 核心服务：0% ⏳
- 数据库：0% ⏳
- 前端：0% ⏳
- API：0% ⏳
