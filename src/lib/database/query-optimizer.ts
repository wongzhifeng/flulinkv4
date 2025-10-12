// src/lib/database/query-optimizer.ts
// 数据库查询优化器 - 基于《德道经》"道法自然"哲学
// 自然的查询优化，无为而治的数据库性能提升

import { db, tursoClient } from '../database';
import { users, virusStrains, infectionRecords, propagationStats } from '../../shared/schema';
import { eq, and, or, desc, asc, sql, count, avg, max, min } from 'drizzle-orm';

interface QueryStats {
  query: string;
  executionTime: number;
  resultCount: number;
  cacheHit: boolean;
  timestamp: number;
}

interface OptimizationResult<T> {
  data: T;
  stats: QueryStats;
  optimized: boolean;
}

class DatabaseQueryOptimizer {
  private queryStats: QueryStats[] = [];
  private maxStatsHistory = 1000;

  // 优化的用户查询 - 对应《德道经》"修之于身，其德乃真"
  async getUsersOptimized(filters: {
    userType?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'username';
    orderDirection?: 'asc' | 'desc';
  } = {}): Promise<OptimizationResult<any[]>> {
    const startTime = Date.now();
    const {
      userType,
      limit = 50,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'desc'
    } = filters;

    try {
      // 构建优化的查询
      let query = db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        userType: users.userType,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      }).from(users);

      // 添加条件
      if (userType) {
        query = query.where(eq(users.userType, userType));
      }

      // 添加排序
      const orderColumn = orderBy === 'username' ? users.username : users.createdAt;
      const orderDirectionFn = orderDirection === 'asc' ? asc : desc;
      query = query.orderBy(orderDirectionFn(orderColumn));

      // 添加分页
      query = query.limit(limit).offset(offset);

      const result = await query;
      const executionTime = Date.now() - startTime;

      const stats: QueryStats = {
        query: `getUsersOptimized(${JSON.stringify(filters)})`,
        executionTime,
        resultCount: result.length,
        cacheHit: false,
        timestamp: Date.now()
      };

      this.recordQueryStats(stats);

      console.log(`✅ 优化用户查询完成: ${executionTime}ms, ${result.length} 条记录`);

      return {
        data: result,
        stats,
        optimized: true
      };
    } catch (error) {
      console.error('❌ 用户查询优化失败:', error);
      throw error;
    }
  }

  // 优化的毒株查询 - 对应《德道经》"道生一"
  async getStrainsOptimized(filters: {
    strainType?: string;
    isSuperFlu?: boolean;
    isDormant?: boolean;
    location?: { lat: number; lng: number; radius: number };
    limit?: number;
    offset?: number;
  } = {}): Promise<OptimizationResult<any[]>> {
    const startTime = Date.now();
    const {
      strainType,
      isSuperFlu,
      isDormant,
      location,
      limit = 50,
      offset = 0
    } = filters;

    try {
      // 构建优化的查询
      let query = db.select({
        id: virusStrains.id,
        content: virusStrains.content,
        authorId: virusStrains.authorId,
        strainType: virusStrains.strainType,
        tags: virusStrains.tags,
        susceptibleTags: virusStrains.susceptibleTags,
        locationLat: virusStrains.locationLat,
        locationLng: virusStrains.locationLng,
        locationAddress: virusStrains.locationAddress,
        isSuperFlu: virusStrains.isSuperFlu,
        isDormant: virusStrains.isDormant,
        dormantUntil: virusStrains.dormantUntil,
        createdAt: virusStrains.createdAt,
        expiresAt: virusStrains.expiresAt
      }).from(virusStrains);

      // 添加条件
      const conditions = [];

      if (strainType) {
        conditions.push(eq(virusStrains.strainType, strainType));
      }

      if (isSuperFlu !== undefined) {
        conditions.push(eq(virusStrains.isSuperFlu, isSuperFlu ? 1 : 0));
      }

      if (isDormant !== undefined) {
        conditions.push(eq(virusStrains.isDormant, isDormant ? 1 : 0));
      }

      // 地理位置查询优化
      if (location) {
        const { lat, lng, radius } = location;
        // 使用Haversine公式的优化版本
        const distanceCondition = sql`
          (6371 * acos(
            cos(radians(${lat})) * 
            cos(radians(location_lat)) * 
            cos(radians(location_lng) - radians(${lng})) + 
            sin(radians(${lat})) * 
            sin(radians(location_lat))
          )) <= ${radius}
        `;
        conditions.push(distanceCondition);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // 添加排序和分页
      query = query
        .orderBy(desc(virusStrains.createdAt))
        .limit(limit)
        .offset(offset);

      const result = await query;
      const executionTime = Date.now() - startTime;

      const stats: QueryStats = {
        query: `getStrainsOptimized(${JSON.stringify(filters)})`,
        executionTime,
        resultCount: result.length,
        cacheHit: false,
        timestamp: Date.now()
      };

      this.recordQueryStats(stats);

      console.log(`✅ 优化毒株查询完成: ${executionTime}ms, ${result.length} 条记录`);

      return {
        data: result,
        stats,
        optimized: true
      };
    } catch (error) {
      console.error('❌ 毒株查询优化失败:', error);
      throw error;
    }
  }

  // 优化的传播统计查询 - 对应《德道经》"道法自然"
  async getPropagationStatsOptimized(strainId: string): Promise<OptimizationResult<any>> {
    const startTime = Date.now();

    try {
      // 使用JOIN优化查询
      const result = await db
        .select({
          strainId: propagationStats.strainId,
          totalInfected: propagationStats.totalInfected,
          infectionRate: propagationStats.infectionRate,
          currentLevel: propagationStats.currentLevel,
          lastUpdated: propagationStats.lastUpdated,
          // 添加实时统计
          recentInfections: count(infectionRecords.id),
          avgGeographicLevel: avg(infectionRecords.geographicLevel),
          maxGeographicLevel: max(infectionRecords.geographicLevel)
        })
        .from(propagationStats)
        .leftJoin(infectionRecords, eq(infectionRecords.strainId, propagationStats.strainId))
        .where(eq(propagationStats.strainId, strainId))
        .groupBy(propagationStats.strainId);

      const executionTime = Date.now() - startTime;

      const stats: QueryStats = {
        query: `getPropagationStatsOptimized(${strainId})`,
        executionTime,
        resultCount: result.length,
        cacheHit: false,
        timestamp: Date.now()
      };

      this.recordQueryStats(stats);

      console.log(`✅ 优化传播统计查询完成: ${executionTime}ms`);

      return {
        data: result[0] || null,
        stats,
        optimized: true
      };
    } catch (error) {
      console.error('❌ 传播统计查询优化失败:', error);
      throw error;
    }
  }

  // 批量操作优化 - 对应《德道经》"无为而治"
  async batchInsertOptimized(table: string, data: any[]): Promise<OptimizationResult<number>> {
    const startTime = Date.now();

    try {
      if (!tursoClient) {
        throw new Error('Turso客户端未初始化');
      }

      // 批量插入优化
      const batchSize = 100;
      let totalInserted = 0;

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        // 构建批量插入SQL
        const values = batch.map(item => 
          `(${Object.values(item).map(v => 
            typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v
          ).join(', ')})`
        ).join(', ');

        const sql = `INSERT INTO ${table} VALUES ${values}`;
        
        await tursoClient.execute(sql);
        totalInserted += batch.length;
      }

      const executionTime = Date.now() - startTime;

      const stats: QueryStats = {
        query: `batchInsertOptimized(${table}, ${data.length} records)`,
        executionTime,
        resultCount: totalInserted,
        cacheHit: false,
        timestamp: Date.now()
      };

      this.recordQueryStats(stats);

      console.log(`✅ 批量插入优化完成: ${executionTime}ms, ${totalInserted} 条记录`);

      return {
        data: totalInserted,
        stats,
        optimized: true
      };
    } catch (error) {
      console.error('❌ 批量插入优化失败:', error);
      throw error;
    }
  }

  // 记录查询统计 - 对应《德道经》"道法自然"
  private recordQueryStats(stats: QueryStats): void {
    this.queryStats.push(stats);
    
    // 保持统计历史在合理范围内
    if (this.queryStats.length > this.maxStatsHistory) {
      this.queryStats = this.queryStats.slice(-this.maxStatsHistory);
    }
  }

  // 获取查询性能统计 - 对应《德道经》"德者，得也"
  getQueryPerformanceStats(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowestQuery: QueryStats | null;
    fastestQuery: QueryStats | null;
    queriesByType: Record<string, number>;
  } {
    if (this.queryStats.length === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        slowestQuery: null,
        fastestQuery: null,
        queriesByType: {}
      };
    }

    const totalQueries = this.queryStats.length;
    const totalExecutionTime = this.queryStats.reduce((sum, stat) => sum + stat.executionTime, 0);
    const averageExecutionTime = totalExecutionTime / totalQueries;

    const slowestQuery = this.queryStats.reduce((slowest, current) => 
      current.executionTime > slowest.executionTime ? current : slowest
    );

    const fastestQuery = this.queryStats.reduce((fastest, current) => 
      current.executionTime < fastest.executionTime ? current : fastest
    );

    const queriesByType = this.queryStats.reduce((acc, stat) => {
      const queryType = stat.query.split('(')[0];
      acc[queryType] = (acc[queryType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalQueries,
      averageExecutionTime,
      slowestQuery,
      fastestQuery,
      queriesByType
    };
  }

  // 清理查询统计
  clearQueryStats(): void {
    this.queryStats = [];
    console.log('🧹 查询统计已清理');
  }
}

// 创建全局查询优化器实例
export const queryOptimizer = new DatabaseQueryOptimizer();

// 导出查询优化器
export default queryOptimizer;
