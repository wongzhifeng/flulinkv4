# 数据库集成开发计划
**文件**：feature-context/database-integration.md
**创建时间**：2025-01-12
**负责人**：Claude Code + Cursor

## 集成目标
将Turso边缘数据库集成到FluLink项目中，实现全球分布式数据存储和访问。

## 技术方案

### 1. Turso数据库配置
```typescript
// src/lib/database.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
```

### 2. 数据库Schema设计
```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  user_type TEXT NOT NULL DEFAULT 'free',
  location_lat REAL,
  location_lng REAL,
  location_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 毒株表
CREATE TABLE virus_strains (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  strain_type TEXT NOT NULL DEFAULT 'life',
  tags TEXT, -- JSON数组
  susceptible_tags TEXT, -- JSON数组
  location_lat REAL,
  location_lng REAL,
  location_address TEXT,
  is_super_flu BOOLEAN DEFAULT FALSE,
  is_dormant BOOLEAN DEFAULT FALSE,
  dormant_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 感染记录表
CREATE TABLE infection_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  strain_id TEXT NOT NULL,
  infected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  geographic_level INTEGER NOT NULL,
  source_user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (strain_id) REFERENCES virus_strains(id),
  FOREIGN KEY (source_user_id) REFERENCES users(id)
);

-- 传播统计表
CREATE TABLE propagation_stats (
  strain_id TEXT PRIMARY KEY,
  total_infected INTEGER DEFAULT 0,
  infection_rate REAL DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (strain_id) REFERENCES virus_strains(id)
);
```

### 3. Drizzle ORM Schema
```typescript
// src/shared/schema.ts
import { sqliteTable, text, real, integer, boolean } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  userType: text('user_type').notNull().default('free'),
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationAddress: text('location_address'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const virusStrains = sqliteTable('virus_strains', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  strainType: text('strain_type').notNull().default('life'),
  tags: text('tags'), // JSON数组
  susceptibleTags: text('susceptible_tags'), // JSON数组
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationAddress: text('location_address'),
  isSuperFlu: boolean('is_super_flu').default(false),
  isDormant: boolean('is_dormant').default(false),
  dormantUntil: text('dormant_until'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at').notNull(),
});

export const infectionRecords = sqliteTable('infection_records', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  strainId: text('strain_id').notNull().references(() => virusStrains.id),
  infectedAt: text('infected_at').default(sql`CURRENT_TIMESTAMP`),
  geographicLevel: integer('geographic_level').notNull(),
  sourceUserId: text('source_user_id').references(() => users.id),
});

export const propagationStats = sqliteTable('propagation_stats', {
  strainId: text('strain_id').primaryKey().references(() => virusStrains.id),
  totalInfected: integer('total_infected').default(0),
  infectionRate: real('infection_rate').default(0),
  currentLevel: integer('current_level').default(1),
  lastUpdated: text('last_updated').default(sql`CURRENT_TIMESTAMP`),
});
```

## 实现步骤

### 阶段1：环境配置
- [ ] 安装Turso依赖
- [ ] 配置环境变量
- [ ] 创建数据库连接

### 阶段2：Schema迁移
- [ ] 设计数据库表结构
- [ ] 创建Drizzle ORM Schema
- [ ] 生成迁移文件
- [ ] 执行数据库迁移

### 阶段3：服务集成
- [ ] 更新VirusStrainService使用数据库
- [ ] 更新GeographicPropagationService使用数据库
- [ ] 实现数据持久化
- [ ] 添加数据验证

### 阶段4：测试验证
- [ ] 编写数据库测试
- [ ] 测试CRUD操作
- [ ] 测试边缘同步
- [ ] 性能压力测试

## 性能要求
- 查询响应时间 <50ms
- 支持1000并发连接
- 边缘节点延迟 <100ms
- 数据同步延迟 <5s

## 当前进度
- 环境配置：0% ⏳
- Schema设计：0% ⏳
- 服务集成：0% ⏳
- 测试验证：0% ⏳
