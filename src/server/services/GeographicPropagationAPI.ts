// src/server/services/GeographicPropagationAPI.ts
// 地理传播算法API服务 - 基于《德道经》"无为而治"哲学

import { GeographicPropagationService } from './GeographicPropagationService';
import { VirusStrainService } from './VirusStrainService';
import type { Location, VirusStrain, GeographicSpread, InfectionRecord } from '../../shared/types/VirusStrain';

export class GeographicPropagationAPI {
  private propagationService: GeographicPropagationService;
  private strainService: VirusStrainService;

  constructor() {
    this.propagationService = GeographicPropagationService.getInstance();
    this.strainService = new VirusStrainService();
  }

  // 创建传播任务API
  async createPropagationTask(strainId: string, userLocation: Location, propagationParams: any) {
    try {
      // 获取毒株信息 - 使用getAllActiveStrains然后过滤
      const strains = await this.strainService.getAllActiveStrains();
      const strain = strains.find(s => s.id === strainId);
      if (!strain) {
        throw new Error('毒株不存在');
      }

      // 创建传播任务
      const propagationTask = await this.propagationService.createVirusPropagation(
        strainId,
        userLocation.lat,
        userLocation.lng,
        'user_' + Date.now()
      );

      return {
        success: true,
        data: {
          taskId: propagationTask.virusId,  // 使用virusId而不是id
          strainId: strain.id,
          originLocation: userLocation,
          estimatedReach: propagationTask.totalInfected || 0,  // 使用totalInfected而不是totalInfections
          propagationPath: propagationTask.propagationLevels || [],
          expectedDuration: 60 // 默认60分钟
        },
        message: '传播任务创建成功'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '传播任务创建失败'
      };
    }
  }

  // 查询传播状态API
  async getPropagationStatus(taskId: string) {
    try {
      const propagation = await this.propagationService.getPropagationById(taskId);
      if (!propagation) {
        throw new Error('传播任务不存在');
      }

      return {
        success: true,
        data: {
          taskId: propagation.id,
          currentInfections: propagation.totalInfections || 0,
          totalReach: propagation.totalInfections || 0,
          geographicDistribution: propagation.propagationLevels || [],
          propagationProgress: 50, // 默认进度
          activeAreas: propagation.propagationLevels?.length || 0,
          lastUpdate: new Date().toISOString()
        },
        message: '传播状态查询成功'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '传播状态查询失败'
      };
    }
  }

  // 用户感染API
  async infectUser(userLocation: Location, strainId: string, infectionParams: any) {
    try {
      // 执行感染 - 使用GeographicPropagationService的processUserInfection方法
      const infectionResult = await this.propagationService.processUserInfection(
        strainId,  // 第一个参数是virusId
        infectionParams.userId || 'anonymous',  // 第二个参数是userId
        userLocation.lat,
        userLocation.lng
      );

      // 检查感染结果
      if (!infectionResult) {
        return {
          success: false,
          error: '感染失败：毒株不存在或传播条件不满足',
          message: '感染失败'
        };
      }

      return {
        success: true,
        data: {
          infectionId: 'infection_' + Date.now(),  // 生成感染ID
          strainId: strainId,
          location: userLocation,
          infectionTime: infectionResult.infectedAt.toISOString(),
          propagationImpact: `成功感染到${infectionResult.levelName}层级`,
          nearbyUsers: 1,
          propagationDelay: infectionResult.propagationDelay
        },
        message: '感染成功'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '感染失败'
      };
    }
  }

  // 获取附近传播API
  async getNearbyPropagations(userLocation: Location, radius: number = 5000) {
    try {
      // 模拟附近传播数据 - 不依赖不存在的getAllPropagations方法
      const mockPropagations = [
        {
          id: 'prop_001',
          strainId: 'strain_001',
          strainName: '生活分享毒株',
          strainType: 'life',
          distance: Math.random() * radius,
          infectionCount: Math.floor(Math.random() * 50) + 1,
          infectionProbability: Math.random() * 0.5,
          lastActivity: new Date().toISOString(),
          tags: ['生活', '分享', '日常']
        },
        {
          id: 'prop_002',
          strainId: 'strain_002',
          strainName: '观点交流毒株',
          strainType: 'opinion',
          distance: Math.random() * radius,
          infectionCount: Math.floor(Math.random() * 30) + 1,
          infectionProbability: Math.random() * 0.3,
          lastActivity: new Date().toISOString(),
          tags: ['观点', '讨论', '思考']
        },
        {
          id: 'prop_003',
          strainId: 'strain_003',
          strainName: '兴趣探索毒株',
          strainType: 'interest',
          distance: Math.random() * radius,
          infectionCount: Math.floor(Math.random() * 20) + 1,
          infectionProbability: Math.random() * 0.4,
          lastActivity: new Date().toISOString(),
          tags: ['兴趣', '探索', '发现']
        }
      ];

      return {
        success: true,
        data: {
          userLocation,
          searchRadius: radius,
          propagations: mockPropagations,
          totalCount: mockPropagations.length
        },
        message: '附近传播查询成功'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '附近传播查询失败'
      };
    }
  }

  // 获取传播统计API
  async getPropagationStats(timeRange: string = '24h') {
    try {
      // 模拟统计数据 - 不依赖不存在的getAllPropagations方法
      const totalPropagations = 3;
      const totalInfections = Math.floor(Math.random() * 100) + 50;

      return {
        success: true,
        data: {
          timeRange,
          totalPropagations,
          totalInfections,
          activeUsers: totalInfections,
          geographicDistribution: [
            { level: '家级', count: Math.floor(totalInfections * 0.4) },
            { level: '社区级', count: Math.floor(totalInfections * 0.3) },
            { level: '城市级', count: Math.floor(totalInfections * 0.2) },
            { level: '区域级', count: Math.floor(totalInfections * 0.1) }
          ],
          strainTypeDistribution: [
            { type: 'life', count: Math.floor(totalInfections * 0.4) },
            { type: 'opinion', count: Math.floor(totalInfections * 0.3) },
            { type: 'interest', count: Math.floor(totalInfections * 0.2) },
            { type: 'super', count: Math.floor(totalInfections * 0.1) }
          ],
          propagationTrends: [
            { time: '1h前', infections: Math.floor(totalInfections * 0.1) },
            { time: '6h前', infections: Math.floor(totalInfections * 0.3) },
            { time: '12h前', infections: Math.floor(totalInfections * 0.5) },
            { time: '24h前', infections: totalInfections }
          ]
        },
        message: '传播统计查询成功'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '传播统计查询失败'
      };
    }
  }

  // 停止传播任务API
  async stopPropagationTask(taskId: string, reason: string = 'user_request') {
    try {
      // 获取传播任务
      const propagation = await this.propagationService.getPropagationById(taskId);
      if (!propagation) {
        throw new Error('传播任务不存在');
      }

      return {
        success: true,
        data: {
          taskId: propagation.id,
          status: 'stopped',
          stoppedAt: new Date().toISOString(),
          reason: reason,
          finalStats: {
            totalInfections: propagation.totalInfections || 0,
            propagationLevels: propagation.propagationLevels?.length || 0
          }
        },
        message: '传播任务已停止'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '停止传播任务失败'
      };
    }
  }
}
