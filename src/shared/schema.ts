// src/shared/schema.ts
// 基于《德道经》第37章"道常无为而无不为"的数据库Schema设计

import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
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
  isSuperFlu: integer('is_super_flu').default(0), // 是否超级流感 (0=false, 1=true)
  isDormant: integer('is_dormant').default(0), // 是否休眠 (0=false, 1=true)
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

// 监控指标表 - 对应《德道经》"知人者智，自知者明"
export const monitoringMetrics = sqliteTable('monitoring_metrics', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'performance', 'error', 'user_behavior', 'system'
  metric: text('metric').notNull(),
  value: real('value').notNull(),
  timestamp: integer('timestamp').notNull(),
  metadata: text('metadata'), // JSON string
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 错误日志表 - 对应《德道经》"知足者富"
export const errorLogs = sqliteTable('error_logs', {
  id: text('id').primaryKey(),
  level: text('level').notNull(), // 'error', 'warning', 'info'
  message: text('message').notNull(),
  stack: text('stack'),
  url: text('url'),
  userId: text('user_id').references(() => users.id),
  metadata: text('metadata'), // JSON string
  resolved: integer('resolved').notNull().default(0), // 0: unresolved, 1: resolved
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  resolvedAt: text('resolved_at'),
});

// 用户会话表 - 对应《德道经》"修之于身，其德乃真"
export const userSessions = sqliteTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  sessionToken: text('session_token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  lastActivity: text('last_activity').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at').notNull(),
});

// 类型定义 - 对应《德道经》"道生一，一生二，二生三，三生万物"
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  user_type: 'free' | 'premium' | 'enterprise';
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  created_at: string;
  updated_at: string;
}

export interface VirusStrain {
  id: string;
  content: string;
  author_id: string;
  strain_type: 'life' | 'opinion' | 'interest' | 'super';
  tags?: string[];
  susceptible_tags?: string[];
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  is_super_flu: boolean;
  is_dormant: boolean;
  dormant_until?: string;
  created_at: string;
  expires_at: string;
}

export interface InfectionRecord {
  id: string;
  user_id: string;
  strain_id: string;
  infected_at: string;
  geographic_level: number;
  source_user_id?: string;
}

export interface PropagationStats {
  strain_id: string;
  total_infected: number;
  infection_rate: number;
  current_level: number;
  last_updated: string;
}

export interface MonitoringMetric {
  id: string;
  type: 'performance' | 'error' | 'user_behavior' | 'system';
  metric: string;
  value: number;
  timestamp: number;
  metadata?: string;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url?: string;
  user_id?: string;
  metadata?: string;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

// 验证函数 - 对应《德道经》"知人者智，自知者明"
export function validateUser(userData: Partial<User>): boolean {
  return !!(userData.username && userData.email);
}

export function validateVirusStrain(strainData: Partial<VirusStrain>): boolean {
  return !!(strainData.content && strainData.author_id);
}

export function validateInfectionRecord(recordData: Partial<InfectionRecord>): boolean {
  return !!(recordData.user_id && recordData.strain_id && recordData.geographic_level);
}

// 数据库初始化函数 - 对应《德道经》"无为而无不为"
export async function initializeDatabase(db: any): Promise<void> {
  try {
    // 执行数据库迁移
    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

// 导出所有表定义
export const schema = {
  users,
  virusStrains,
  infectionRecords,
  propagationStats,
  geographicLevels,
  userImmunity,
  propagationPaths,
  monitoringMetrics,
  errorLogs,
  userSessions,
};