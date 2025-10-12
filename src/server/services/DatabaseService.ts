// src/server/services/DatabaseService.ts
// 基于《德道经》第37章"道常无为而无不为"的数据库服务

import { db } from '../../lib/database';
import { 
  User, 
  VirusStrain, 
  InfectionRecord, 
  PropagationStats,
  validateUser,
  validateVirusStrain,
  validateInfectionRecord,
  initializeDatabase
} from '../../shared/schema';

export class DatabaseService {
  private static instance: DatabaseService;
  private initialized = false;

  private constructor() {
    console.log('DatabaseService初始化完成');
    this.initialize();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // 初始化数据库
  private async initialize(): Promise<void> {
    if (!this.initialized) {
      try {
        await initializeDatabase(db);
        this.initialized = true;
        console.log('✅ 数据库服务初始化完成');
      } catch (error) {
        console.error('❌ 数据库服务初始化失败:', error);
        throw error;
      }
    }
  }

  // 用户相关操作
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      if (!validateUser(userData)) {
        throw new Error('用户数据验证失败');
      }

      const userId = 'user_' + Date.now();
      const user: User = {
        id: userId,
        username: userData.username!,
        email: userData.email!,
        avatar_url: userData.avatar_url,
        user_type: userData.user_type || 'free',
        location_lat: userData.location_lat,
        location_lng: userData.location_lng,
        location_address: userData.location_address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await db.insert('users', user);
      return user;
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const users = await db.select('users', { id: userId });
      return users[0] || null;
    } catch (error) {
      console.error('查询用户失败:', error);
      throw error;
    }
  }

  // 毒株相关操作
  async createVirusStrain(strainData: Partial<VirusStrain>): Promise<VirusStrain> {
    try {
      if (!validateVirusStrain(strainData)) {
        throw new Error('毒株数据验证失败');
      }

      const strainId = 'strain_' + Date.now();
      const strain: VirusStrain = {
        id: strainId,
        content: strainData.content!,
        author_id: strainData.author_id!,
        strain_type: strainData.strain_type || 'life',
        tags: strainData.tags || [],
        susceptible_tags: strainData.susceptible_tags || [],
        location_lat: strainData.location_lat,
        location_lng: strainData.location_lng,
        location_address: strainData.location_address,
        is_super_flu: strainData.is_super_flu || false,
        is_dormant: strainData.is_dormant || false,
        dormant_until: strainData.dormant_until,
        created_at: new Date().toISOString(),
        expires_at: strainData.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      await db.insert('virus_strains', strain);
      return strain;
    } catch (error) {
      console.error('创建毒株失败:', error);
      throw error;
    }
  }

  async getVirusStrains(): Promise<VirusStrain[]> {
    try {
      return await db.select('virus_strains');
    } catch (error) {
      console.error('查询毒株失败:', error);
      throw error;
    }
  }

  async getVirusStrainById(strainId: string): Promise<VirusStrain | null> {
    try {
      const strains = await db.select('virus_strains', { id: strainId });
      return strains[0] || null;
    } catch (error) {
      console.error('查询毒株失败:', error);
      throw error;
    }
  }

  // 感染记录相关操作
  async createInfectionRecord(recordData: Partial<InfectionRecord>): Promise<InfectionRecord> {
    try {
      if (!validateInfectionRecord(recordData)) {
        throw new Error('感染记录数据验证失败');
      }

      const recordId = 'infection_' + Date.now();
      const record: InfectionRecord = {
        id: recordId,
        user_id: recordData.user_id!,
        strain_id: recordData.strain_id!,
        infected_at: new Date().toISOString(),
        geographic_level: recordData.geographic_level!,
        source_user_id: recordData.source_user_id
      };
      
      await db.insert('infection_records', record);
      return record;
    } catch (error) {
      console.error('创建感染记录失败:', error);
      throw error;
    }
  }

  async getInfectionRecords(): Promise<InfectionRecord[]> {
    try {
      return await db.select('infection_records');
    } catch (error) {
      console.error('查询感染记录失败:', error);
      throw error;
    }
  }

  async getInfectionRecordsByStrain(strainId: string): Promise<InfectionRecord[]> {
    try {
      return await db.select('infection_records', { strain_id: strainId });
    } catch (error) {
      console.error('查询毒株感染记录失败:', error);
      throw error;
    }
  }

  // 传播统计相关操作
  async updatePropagationStats(strainId: string, stats: Partial<PropagationStats>): Promise<PropagationStats> {
    try {
      const existingStats = await db.select('propagation_stats', { strain_id: strainId });
      
      const statsData: PropagationStats = {
        strain_id: strainId,
        total_infected: stats.total_infected || 0,
        infection_rate: stats.infection_rate || 0,
        current_level: stats.current_level || 1,
        last_updated: new Date().toISOString()
      };
      
      if (existingStats.length > 0) {
        await db.update('propagation_stats', statsData, { strain_id: strainId });
      } else {
        await db.insert('propagation_stats', statsData);
      }
      
      return statsData;
    } catch (error) {
      console.error('更新传播统计失败:', error);
      throw error;
    }
  }

  async getPropagationStats(strainId: string): Promise<PropagationStats | null> {
    try {
      const stats = await db.select('propagation_stats', { strain_id: strainId });
      return stats[0] || null;
    } catch (error) {
      console.error('查询传播统计失败:', error);
      throw error;
    }
  }

  async getAllPropagationStats(): Promise<PropagationStats[]> {
    try {
      return await db.select('propagation_stats');
    } catch (error) {
      console.error('查询所有传播统计失败:', error);
      throw error;
    }
  }

  // 数据库健康检查
  async healthCheck(): Promise<boolean> {
    try {
      await db.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('数据库健康检查失败:', error);
      return false;
    }
  }
}