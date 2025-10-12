// src/shared/schema.ts
// 基于《德道经》第37章"道常无为而无不为"的数据库Schema设计

import { sqliteTable, text, real, integer, boolean } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 用户表 - 对应《德道经》"修之于身，其德乃真"
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').unique().notNull(),
  avatarUrl: text('avatar_url'),
  userType: text('user_type').notNull().default('free'), // free, premium, enterprise
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationAddress: text('location_address'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 毒株表 - 对应《德道经》"道生一，一生二，二生三，三生万物"
export const virusStrains = sqliteTable('virus_strains', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  strainType: text('strain_type').notNull().default('life'), // life, opinion, interest, super
  tags: text('tags'), // JSON数组 - 毒株标签
  susceptibleTags: text('susceptible_tags'), // JSON数组 - 易感人群标签
  locationLat: real('location_lat'),
  locationLng: real('location_lng'),
  locationAddress: text('location_address'),
  isSuperFlu: boolean('is_super_flu').default(false), // 是否超级流感
  isDormant: boolean('is_dormant').default(false), // 是否休眠
  dormantUntil: text('dormant_until'), // 休眠到期时间
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at').notNull(), // 7天自动解散
});

// 感染记录表 - 对应《德道经》"知人者智，自知者明"
export const infectionRecords = sqliteTable('infection_records', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  strainId: text('strain_id').notNull().references(() => virusStrains.id),
  infectedAt: text('infected_at').default(sql`CURRENT_TIMESTAMP`),
  geographicLevel: integer('geographic_level').notNull(), // 1-4级传播层级
  sourceUserId: text('source_user_id').references(() => users.id), // 感染来源用户
});

// 传播统计表 - 对应《德道经》"无为而无不为"
export const propagationStats = sqliteTable('propagation_stats', {
  strainId: text('strain_id').primaryKey().references(() => virusStrains.id),
  totalInfected: integer('total_infected').default(0), // 总感染人数
  infectionRate: real('infection_rate').default(0), // 感染率
  currentLevel: integer('current_level').default(1), // 当前传播层级
  lastUpdated: text('last_updated').default(sql`CURRENT_TIMESTAMP`),
});

// 地理传播层级表 - 对应《德道经》"修之于家，其德乃余；修之于国，其德乃丰"
export const geographicLevels = sqliteTable('geographic_levels', {
  id: integer('id').primaryKey(),
  level: integer('level').notNull(), // 1-4级
  name: text('name').notNull(), // 本小区、临近小区、街道、行政区
  radiusKm: real('radius_km').notNull(), // 传播半径（公里）
  delayMinutes: integer('delay_minutes').notNull(), // 传播延迟（分钟）
  requiredInfected: integer('required_infected').notNull(), // 解锁所需感染人数
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 用户免疫系统表 - 对应《德道经》"知足者富"
export const userImmunity = sqliteTable('user_immunity', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  strainType: text('strain_type').notNull(), // 免疫的毒株类型
  immunityLevel: integer('immunity_level').notNull().default(1), // 免疫等级 1-5
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at'), // 免疫到期时间
});

// 传播路径表 - 对应《德道经》"道法自然"
export const propagationPaths = sqliteTable('propagation_paths', {
  id: text('id').primaryKey(),
  strainId: text('strain_id').notNull().references(() => virusStrains.id),
  fromUserId: text('from_user_id').notNull().references(() => users.id),
  toUserId: text('to_user_id').notNull().references(() => users.id),
  geographicLevel: integer('geographic_level').notNull(),
  propagationTime: text('propagation_time').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 导出所有表定义
export const schema = {
  users,
  virusStrains,
  infectionRecords,
  propagationStats,
  geographicLevels,
  userImmunity,
  propagationPaths,
};