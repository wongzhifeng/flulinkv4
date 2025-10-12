// src/shared/schema.ts
// 基于《德道经》"无为而治"哲学的数据库Schema设计

// 用户表 - 对应"民自化"思想
export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  user_type: 'free' | 'premium' | 'super';
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  created_at: string;
  updated_at: string;
}

// 毒株表 - 对应"道法自然"思想
export interface VirusStrain {
  id: string;
  content: string;
  author_id: string;
  strain_type: 'life' | 'opinion' | 'interest' | 'super';
  tags: string[]; // JSON数组
  susceptible_tags: string[]; // JSON数组
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  is_super_flu: boolean;
  is_dormant: boolean;
  dormant_until?: string;
  created_at: string;
  expires_at: string;
}

// 感染记录表 - 对应"无为而无不为"思想
export interface InfectionRecord {
  id: string;
  user_id: string;
  strain_id: string;
  infected_at: string;
  geographic_level: number; // 1-4级地理传播
  source_user_id?: string;
}

// 传播统计表 - 对应"知人者智"思想
export interface PropagationStats {
  strain_id: string;
  total_infected: number;
  infection_rate: number;
  current_level: number;
  last_updated: string;
}

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  VIRUS_STRAINS: 'virus_strains',
  INFECTION_RECORDS: 'infection_records',
  PROPAGATION_STATS: 'propagation_stats'
} as const;

// SQL创建表语句
export const CREATE_TABLES_SQL = {
  USERS: `
    CREATE TABLE IF NOT EXISTS users (
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
    )
  `,
  
  VIRUS_STRAINS: `
    CREATE TABLE IF NOT EXISTS virus_strains (
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
    )
  `,
  
  INFECTION_RECORDS: `
    CREATE TABLE IF NOT EXISTS infection_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      strain_id TEXT NOT NULL,
      infected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      geographic_level INTEGER NOT NULL,
      source_user_id TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (strain_id) REFERENCES virus_strains(id),
      FOREIGN KEY (source_user_id) REFERENCES users(id)
    )
  `,
  
  PROPAGATION_STATS: `
    CREATE TABLE IF NOT EXISTS propagation_stats (
      strain_id TEXT PRIMARY KEY,
      total_infected INTEGER DEFAULT 0,
      infection_rate REAL DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (strain_id) REFERENCES virus_strains(id)
    )
  `
} as const;

// 数据库初始化函数
export async function initializeDatabase(db: any): Promise<void> {
  try {
    console.log('开始初始化数据库表结构...');
    
    // 创建所有表
    await db.execute(CREATE_TABLES_SQL.USERS);
    await db.execute(CREATE_TABLES_SQL.VIRUS_STRAINS);
    await db.execute(CREATE_TABLES_SQL.INFECTION_RECORDS);
    await db.execute(CREATE_TABLES_SQL.PROPAGATION_STATS);
    
    console.log('✅ 数据库表结构初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

// 数据验证函数
export function validateUser(user: Partial<User>): boolean {
  return !!(user.username && user.email);
}

export function validateVirusStrain(strain: Partial<VirusStrain>): boolean {
  return !!(strain.content && strain.author_id && strain.strain_type);
}

export function validateInfectionRecord(record: Partial<InfectionRecord>): boolean {
  return !!(record.user_id && record.strain_id && record.geographic_level);
}

export default {
  TABLES,
  CREATE_TABLES_SQL,
  initializeDatabase,
  validateUser,
  validateVirusStrain,
  validateInfectionRecord
};