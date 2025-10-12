// src/server/services/VirusStrainService.ts
// 基于《德道经》第37章"道常无为而无不为"的毒株管理机制

import { VirusStrain, UserProfile, InfectionRecord, StrainType } from '../../shared/types/VirusStrain';
import { User, VirusStrain as NewVirusStrain, InfectionRecord as NewInfectionRecord } from '../../shared/schema';
import { GeographicPropagationService } from './GeographicPropagationService';
import { DatabaseService } from './DatabaseService';

export class VirusStrainService {
  private static instance: VirusStrainService;
  private geographicPropagationService: GeographicPropagationService;
  private databaseService: DatabaseService;
  private strainCache: Map<string, VirusStrain> = new Map();
  private infectionRecords: Map<string, InfectionRecord[]> = new Map();

  private constructor() {
    this.geographicPropagationService = GeographicPropagationService.getInstance();
    this.databaseService = DatabaseService.getInstance();
  }

  public static getInstance(): VirusStrainService {
    if (!VirusStrainService.instance) {
      VirusStrainService.instance = new VirusStrainService();
    }
    return VirusStrainService.instance;
  }

  /**
   * 创建新的毒株 - 对应《德道经》"道生一"
   */
  public async createVirusStrain(
    content: string,
    author: UserProfile,
    tags: string[],
    susceptibleTags: string[],
    type: StrainType = 'life',
    isSuperFlu: boolean = false
  ): Promise<VirusStrain> {
    const strainId = this.generateStrainId();
    const now = new Date();
    
    // 计算过期时间 - 对应《德道经》的"知足者富"
    const expiresAt = this.calculateExpirationTime(type, isSuperFlu);
    
    // 获取作者的真实位置信息
    const authorLocation = author.location;
    if (!authorLocation) {
      throw new Error('无法获取位置信息，请检查位置权限');
    }

    // 创建真实的地理传播
    const propagation = await this.geographicPropagationService.createVirusPropagation(
      strainId,
      authorLocation.latitude,
      authorLocation.longitude,
      author.id
    );

    // 初始化地理传播状态
    const geographicSpread = propagation.propagationLevels.map(level => ({
      level: level.level,
      levelName: level.levelName,
      infectedCount: level.infectedCount,
      infectionRate: level.infectionRate,
      unlockedAt: level.unlockedAt,
      isUnlocked: level.isUnlocked,
    }));

    const strain: VirusStrain = {
      id: strainId,
      content,
      author: author.username,
      authorId: author.id,
      location: authorLocation,
      type,
      tags,
      susceptibleTags,
      createdAt: now,
      expiresAt,
      infectionStats: {
        totalInfected: propagation.totalInfected,
        infectionRate: propagation.infectionRate,
        geographicSpread,
      },
      isSuperFlu,
      isDormant: false,
    };

    // 保存到数据库
    await this.databaseService.saveVirusStrain(strain);
    
    // 保存到缓存
    this.strainCache.set(strainId, strain);
    
    return strain;
  }

  /**
   * 感染用户（传播毒株）- 对应《德道经》"民自化"
   */
  public async infectUser(
    strainId: string,
    userId: string,
    userLatitude: number,
    userLongitude: number,
    sourceUserId?: string
  ): Promise<InfectionRecord | null> {
    try {
      const strain = this.strainCache.get(strainId);
      if (!strain || strain.isDormant) {
        return null;
      }

      // 检查毒株是否过期
      if (new Date() > strain.expiresAt) {
        return null;
      }

      // 处理地理传播
      const propagationEvent = await this.geographicPropagationService.processUserInfection(
        strainId,
        userId,
        userLatitude,
        userLongitude
      );

      if (!propagationEvent) {
        return null;
      }

      // 创建感染记录
      const infectionRecord: InfectionRecord = {
        userId,
        strainId,
        infectedAt: propagationEvent.infectedAt,
        geographicLevel: propagationEvent.level,
        sourceUserId
      };

      // 保存感染记录到数据库
      await this.databaseService.saveInfectionRecord(infectionRecord);
      
      // 保存到缓存
      const userInfections = this.infectionRecords.get(userId) || [];
      userInfections.push(infectionRecord);
      this.infectionRecords.set(userId, userInfections);

      // 更新毒株统计
      this.updateStrainStats(strain, propagationEvent);

      return infectionRecord;
    } catch (error) {
      console.error('感染用户失败:', error);
      return null;
    }
  }

  /**
   * 更新毒株统计信息
   */
  private updateStrainStats(strain: VirusStrain, propagationEvent: any): void {
    strain.infectionStats.totalInfected++;
    
    // 更新地理传播统计
    const geographicSpread = strain.infectionStats.geographicSpread.find(
      spread => spread.level === propagationEvent.level
    );
    
    if (geographicSpread) {
      geographicSpread.infectedCount++;
      // 重新计算感染率
      const estimatedUserCount = this.estimateUserCount(propagationEvent.level);
      geographicSpread.infectionRate = Math.min(
        (geographicSpread.infectedCount / estimatedUserCount) * 100, 
        100
      );
    }

    // 更新整体感染率
    const totalEstimatedUsers = this.estimateTotalUsers();
    strain.infectionStats.infectionRate = Math.min(
      (strain.infectionStats.totalInfected / totalEstimatedUsers) * 100,
      100
    );
  }

  /**
   * 估算用户数量
   */
  private estimateUserCount(level: number): number {
    const baseCounts = {
      1: 50,   // 小区
      2: 200,  // 临近小区
      3: 1000, // 街道
      4: 5000  // 行政区
    };

    return baseCounts[level as keyof typeof baseCounts] || 100;
  }

  /**
   * 估算总用户数
   */
  private estimateTotalUsers(): number {
    return 10000; // 简化实现
  }

  /**
   * 生成毒株ID
   */
  private generateStrainId(): string {
    return `strain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 计算过期时间 - 对应《德道经》的"知足者富"
   */
  private calculateExpirationTime(type: StrainType, isSuperFlu: boolean): Date {
    const now = new Date();
    let hours = 24; // 默认24小时

    switch (type) {
      case 'life':
        hours = 12; // 生活毒株12小时
        break;
      case 'opinion':
        hours = 48; // 观点毒株48小时
        break;
      case 'interest':
        hours = 72; // 兴趣毒株72小时
        break;
      case 'super':
        hours = 168; // 超级毒株7天
        break;
    }

    if (isSuperFlu) {
      hours *= 2; // 超级流感时间翻倍
    }

    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }

  /**
   * 获取毒株信息
   */
  public getVirusStrain(strainId: string): VirusStrain | undefined {
    return this.strainCache.get(strainId);
  }

  /**
   * 获取所有活跃毒株 - 对应《德道经》"知者不博"
   */
  public async getAllActiveStrains(): Promise<VirusStrain[]> {
    try {
      // 优先从数据库获取
      const dbStrains = await this.databaseService.getActiveVirusStrains();
      
      // 更新缓存
      for (const strain of dbStrains) {
        this.strainCache.set(strain.id, strain);
      }
      
      return dbStrains;
    } catch (error) {
      console.error('❌ 获取活跃毒株失败，使用缓存:', error);
      // 降级到缓存
      const now = new Date();
      return Array.from(this.strainCache.values()).filter(
        strain => !strain.isDormant && strain.expiresAt > now
      );
    }
  }

  /**
   * 获取用户的感染历史 - 对应《德道经》"修之于身，其德乃真"
   */
  public async getUserInfectionHistory(userId: string): Promise<InfectionRecord[]> {
    try {
      // 优先从数据库获取
      const dbRecords = await this.databaseService.getUserInfectionHistory(userId);
      
      // 更新缓存
      this.infectionRecords.set(userId, dbRecords);
      
      return dbRecords;
    } catch (error) {
      console.error('❌ 获取用户感染历史失败，使用缓存:', error);
      // 降级到缓存
      return this.infectionRecords.get(userId) || [];
    }
  }

  /**
   * 获取毒株的感染记录
   */
  public getStrainInfectionRecords(strainId: string): InfectionRecord[] {
    const allRecords: InfectionRecord[] = [];
    for (const records of this.infectionRecords.values()) {
      allRecords.push(...records.filter(record => record.strainId === strainId));
    }
    return allRecords;
  }

  /**
   * 使毒株休眠 - 对应《德道经》的"知足者富"
   */
  public dormancyStrain(strainId: string, dormantUntil?: Date): boolean {
    const strain = this.strainCache.get(strainId);
    if (strain) {
      strain.isDormant = true;
      if (dormantUntil) {
        strain.dormantUntil = dormantUntil;
      }
      return true;
    }
    return false;
  }

  /**
   * 唤醒毒株
   */
  public awakenStrain(strainId: string): boolean {
    const strain = this.strainCache.get(strainId);
    if (strain && strain.isDormant) {
      strain.isDormant = false;
      strain.dormantUntil = undefined;
      return true;
    }
    return false;
  }

  /**
   * 清理过期毒株 - 对应《德道经》"知足者富"
   */
  public async cleanupExpiredStrains(): Promise<void> {
    try {
      // 清理数据库
      await this.databaseService.cleanupExpiredStrains();
      
      // 清理缓存
      const now = new Date();
      for (const [strainId, strain] of this.strainCache) {
        if (strain.expiresAt < now) {
          this.strainCache.delete(strainId);
        }
      }
      
      console.log('✅ 过期毒株清理完成');
    } catch (error) {
      console.error('❌ 清理过期毒株失败:', error);
    }
  }

  /**
   * 获取毒株统计信息
   */
  public getStrainStats(): any {
    const activeStrains = this.getAllActiveStrains();
    const totalInfections = Array.from(this.infectionRecords.values())
      .flat()
      .length;

    return {
      activeStrainCount: activeStrains.length,
      totalInfections,
      averageInfectionRate: activeStrains.reduce(
        (sum, strain) => sum + strain.infectionStats.infectionRate, 
        0
      ) / activeStrains.length,
      topStrain: activeStrains.reduce(
        (max, strain) => 
          strain.infectionStats.totalInfected > max.infectionStats.totalInfected ? strain : max,
        { infectionStats: { totalInfected: 0 } }
      )
    };
  }
}
