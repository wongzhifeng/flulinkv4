// src/server/services/GeographicPropagationService.ts
// 基于《德道经》第37章"道常无为而无不为"的地理传播算法

import { 
  PropagationLevel, 
  VirusPropagation, 
  PropagationEvent, 
  GeographicLevel,
  Location 
} from '../../shared/types/Propagation';
import { VirusStrain } from '../../shared/types/VirusStrain';

export class GeographicPropagationService {
  private static instance: GeographicPropagationService;
  private propagationCache: Map<string, VirusPropagation> = new Map();
  private propagationEvents: PropagationEvent[] = [];

  private constructor() {}

  public static getInstance(): GeographicPropagationService {
    if (!GeographicPropagationService.instance) {
      GeographicPropagationService.instance = new GeographicPropagationService();
    }
    return GeographicPropagationService.instance;
  }

  /**
   * 创建新的病毒传播 - 对应《德道经》"道生一"
   */
  public async createVirusPropagation(
    virusId: string,
    originLatitude: number,
    originLongitude: number,
    authorId: string
  ): Promise<VirusPropagation> {
    try {
      // 获取原始位置信息
      const originLocation = await this.getLocationInfo(originLatitude, originLongitude);
      if (!originLocation) {
        throw new Error('无法获取位置信息');
      }

      // 创建地理层级信息 - 对应"一生二，二生三，三生万物"
      const geographicLevels = await this.getGeographicLevels(
        originLatitude,
        originLongitude
      );

      // 创建传播层级
      const propagationLevels: PropagationLevel[] = geographicLevels.map((geoLevel, index) => ({
        level: geoLevel.level,
        levelName: geoLevel.levelName,
        infectedCount: index === 0 ? 1 : 0, // 初始感染在Level 1
        infectionRate: index === 0 ? 100 : 0,
        unlockedAt: index === 0 ? new Date() : new Date(0),
        isUnlocked: index === 0,
        geographicInfo: geoLevel
      }));

      const propagation: VirusPropagation = {
        virusId,
        originLocation,
        currentLevel: 1,
        propagationLevels,
        totalInfected: 1,
        infectionRate: 100,
        isActive: true,
        createdAt: new Date(),
        lastUpdated: new Date()
      };

      this.propagationCache.set(virusId, propagation);

      // 记录初始感染事件
      this.recordPropagationEvent(virusId, authorId, originLocation, 1, '本小区', 0);

      return propagation;
    } catch (error) {
      console.error('创建病毒传播失败:', error);
      throw error;
    }
  }

  /**
   * 处理用户感染病毒 - 对应《德道经》"民自化"
   */
  public async processUserInfection(
    virusId: string,
    userId: string,
    userLatitude: number,
    userLongitude: number
  ): Promise<PropagationEvent | null> {
    try {
      const propagation = this.propagationCache.get(virusId);
      if (!propagation || !propagation.isActive) {
        return null;
      }

      // 获取用户位置信息
      const userLocation = await this.getLocationInfo(userLatitude, userLongitude);
      if (!userLocation) {
        return null;
      }

      // 检查用户是否在已解锁的层级内
      const targetLevel = this.findTargetLevel(userLocation, propagation);
      if (!targetLevel || !targetLevel.isUnlocked) {
        return null;
      }

      // 计算传播延迟 - 对应"无为而治"的自然延迟
      const propagationDelay = this.calculatePropagationDelay(targetLevel.level);

      // 检查是否满足传播条件
      if (!this.checkPropagationConditions(propagation, targetLevel)) {
        return null;
      }

      // 记录感染事件
      const event = this.recordPropagationEvent(
        virusId,
        userId,
        userLocation,
        targetLevel.level,
        targetLevel.levelName,
        propagationDelay
      );

      // 更新传播统计
      this.updatePropagationStats(propagation, targetLevel);

      // 检查是否可以解锁下一层级
      this.checkAndUnlockNextLevel(propagation);

      return event;
    } catch (error) {
      console.error('处理用户感染失败:', error);
      return null;
    }
  }

  /**
   * 查找目标传播层级 - 对应《德道经》的"知人者智"
   */
  private findTargetLevel(
    userLocation: Location,
    propagation: VirusPropagation
  ): PropagationLevel | null {
    for (const level of propagation.propagationLevels) {
      if (this.isPointInLevel(
        userLocation.latitude,
        userLocation.longitude,
        level.geographicInfo
      )) {
        return level;
      }
    }
    return null;
  }

  /**
   * 计算传播延迟 - 对应《德道经》的"道法自然"
   */
  private calculatePropagationDelay(level: number): number {
    const delayParams = {
      1: 0,    // 本小区：无延迟
      2: 15,   // 临近小区：15分钟
      3: 60,   // 街道：60分钟
      4: 240   // 行政区：4小时
    };

    return delayParams[level as keyof typeof delayParams] || 0;
  }

  /**
   * 检查传播条件 - 对应《德道经》的"知足者富"
   */
  private checkPropagationConditions(
    propagation: VirusPropagation,
    targetLevel: PropagationLevel
  ): boolean {
    // Level 1 总是可以感染
    if (targetLevel.level === 1) {
      return true;
    }

    // 检查前一层级是否满足条件
    const prevLevel = propagation.propagationLevels.find(l => l.level === targetLevel.level - 1);
    if (!prevLevel) return false;

    // 传播条件：感染人数≥20人或感染率≥30%
    return prevLevel.infectedCount >= 20 && prevLevel.infectionRate >= 30;
  }

  /**
   * 记录传播事件
   */
  private recordPropagationEvent(
    virusId: string,
    userId: string,
    userLocation: Location,
    level: number,
    levelName: string,
    propagationDelay: number
  ): PropagationEvent {
    const event: PropagationEvent = {
      virusId,
      userId,
      userLocation,
      level,
      levelName,
      infectedAt: new Date(),
      propagationDelay
    };

    this.propagationEvents.push(event);
    return event;
  }

  /**
   * 更新传播统计 - 对应《德道经》的"知者不博"
   */
  private updatePropagationStats(
    propagation: VirusPropagation,
    targetLevel: PropagationLevel
  ): void {
    targetLevel.infectedCount++;
    
    // 重新计算感染率
    const estimatedUserCount = this.estimateUserCount(targetLevel.geographicInfo);
    targetLevel.infectionRate = Math.min((targetLevel.infectedCount / estimatedUserCount) * 100, 100);

    propagation.totalInfected++;
    propagation.lastUpdated = new Date();

    // 更新当前层级
    if (targetLevel.level > propagation.currentLevel) {
      propagation.currentLevel = targetLevel.level;
    }
  }

  /**
   * 估算用户数量 - 对应《德道经》的"知人者智"
   */
  private estimateUserCount(geographicInfo: GeographicLevel): number {
    const baseCounts = {
      1: 50,   // 小区
      2: 200,  // 临近小区
      3: 1000, // 街道
      4: 5000  // 行政区
    };

    return baseCounts[geographicInfo.level as keyof typeof baseCounts] || 100;
  }

  /**
   * 检查并解锁下一层级 - 对应《德道经》的"无为而无不为"
   */
  private checkAndUnlockNextLevel(propagation: VirusPropagation): void {
    const currentLevel = propagation.currentLevel;
    const nextLevel = propagation.propagationLevels.find(l => l.level === currentLevel + 1);
    
    if (!nextLevel || nextLevel.isUnlocked) return;

    const currentLevelData = propagation.propagationLevels.find(l => l.level === currentLevel);
    if (!currentLevelData) return;

    // 解锁条件：感染人数≥20人且感染率≥30%
    if (currentLevelData.infectedCount >= 20 && currentLevelData.infectionRate >= 30) {
      nextLevel.isUnlocked = true;
      nextLevel.unlockedAt = new Date();
      
      console.log(`病毒 ${propagation.virusId} 解锁了 ${nextLevel.levelName} 层级`);
    }
  }

  /**
   * 获取位置信息 - 简化实现
   */
  private async getLocationInfo(latitude: number, longitude: number): Promise<Location | null> {
    // 这里应该调用真实的地理编码服务
    return {
      latitude,
      longitude,
      address: `位置 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      district: '示例区域',
      city: '示例城市',
      country: '中国'
    };
  }

  /**
   * 获取地理层级信息 - 简化实现
   */
  private async getGeographicLevels(latitude: number, longitude: number): Promise<GeographicLevel[]> {
    return [
      {
        level: 1,
        levelName: '本小区',
        coverage: [],
        unlockCondition: { minInfected: 0, minInfectionRate: 0 },
        delay: { min: 0, max: 0 }
      },
      {
        level: 2,
        levelName: '临近小区',
        coverage: [],
        unlockCondition: { minInfected: 20, minInfectionRate: 30 },
        delay: { min: 5, max: 15 }
      },
      {
        level: 3,
        levelName: '所属街道',
        coverage: [],
        unlockCondition: { minInfected: 15, minInfectionRate: 30 },
        delay: { min: 30, max: 60 }
      },
      {
        level: 4,
        levelName: '行政区',
        coverage: [],
        unlockCondition: { minInfected: 10, minInfectionRate: 40 },
        delay: { min: 120, max: 240 }
      }
    ];
  }

  /**
   * 检查点是否在层级内 - 简化实现
   */
  private isPointInLevel(latitude: number, longitude: number, level: GeographicLevel): boolean {
    // 简化实现：基于距离判断
    return true;
  }

  /**
   * 获取病毒传播状态
   */
  public getVirusPropagation(virusId: string): VirusPropagation | undefined {
    return this.propagationCache.get(virusId);
  }

  /**
   * 获取所有活跃的传播
   */
  public getAllActivePropagations(): VirusPropagation[] {
    return Array.from(this.propagationCache.values()).filter(p => p.isActive);
  }

  /**
   * 获取传播事件历史
   */
  public getPropagationEvents(virusId?: string): PropagationEvent[] {
    if (virusId) {
      return this.propagationEvents.filter(e => e.virusId === virusId);
    }
    return [...this.propagationEvents];
  }

  /**
   * 停止病毒传播
   */
  public stopVirusPropagation(virusId: string): boolean {
    const propagation = this.propagationCache.get(virusId);
    if (propagation) {
      propagation.isActive = false;
      propagation.lastUpdated = new Date();
      return true;
    }
    return false;
  }

  /**
   * 清理过期的传播数据 - 对应《德道经》的"知足者富"
   */
  public cleanupExpiredPropagations(): void {
    const now = new Date();
    const expireTime = 7 * 24 * 60 * 60 * 1000; // 7天

    for (const [virusId, propagation] of this.propagationCache) {
      if (now.getTime() - propagation.lastUpdated.getTime() > expireTime) {
        propagation.isActive = false;
      }
    }
  }
}
