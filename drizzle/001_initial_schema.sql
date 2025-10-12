-- Migration: 001_initial_schema.sql
-- 基于《德道经》第37章"道常无为而无不为"的初始数据库Schema
-- 创建时间: 2025-01-12

-- 用户表 - 对应《德道经》"修之于身，其德乃真"
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
);

-- 毒株表 - 对应《德道经》"道生一，一生二，二生三，三生万物"
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
);

-- 感染记录表 - 对应《德道经》"知人者智，自知者明"
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
);

-- 传播统计表 - 对应《德道经》"无为而无不为"
CREATE TABLE IF NOT EXISTS propagation_stats (
  strain_id TEXT PRIMARY KEY,
  total_infected INTEGER DEFAULT 0,
  infection_rate REAL DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (strain_id) REFERENCES virus_strains(id)
);

-- 地理传播层级表 - 对应《德道经》"修之于家，其德乃余；修之于国，其德乃丰"
CREATE TABLE IF NOT EXISTS geographic_levels (
  id INTEGER PRIMARY KEY,
  level INTEGER NOT NULL,
  name TEXT NOT NULL,
  radius_km REAL NOT NULL,
  delay_minutes INTEGER NOT NULL,
  required_infected INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户免疫系统表 - 对应《德道经》"知足者富"
CREATE TABLE IF NOT EXISTS user_immunity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  strain_type TEXT NOT NULL,
  immunity_level INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 传播路径表 - 对应《德道经》"道法自然"
CREATE TABLE IF NOT EXISTS propagation_paths (
  id TEXT PRIMARY KEY,
  strain_id TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  geographic_level INTEGER NOT NULL,
  propagation_time TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (strain_id) REFERENCES virus_strains(id),
  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id)
);

-- 插入初始地理传播层级数据
INSERT OR IGNORE INTO geographic_levels (level, name, radius_km, delay_minutes, required_infected) VALUES
(1, '本小区', 0.5, 0, 1),
(2, '临近小区', 1.5, 10, 20),
(3, '所属街道', 3.0, 45, 50),
(4, '行政区/城市', 10.0, 180, 100);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_virus_strains_location ON virus_strains(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_virus_strains_type ON virus_strains(strain_type);
CREATE INDEX IF NOT EXISTS idx_infection_records_user ON infection_records(user_id);
CREATE INDEX IF NOT EXISTS idx_infection_records_strain ON infection_records(strain_id);
CREATE INDEX IF NOT EXISTS idx_propagation_paths_strain ON propagation_paths(strain_id);
