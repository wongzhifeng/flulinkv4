// src/lib/cache/api-cache-middleware.ts
// API缓存中间件 - 基于《德道经》"道法自然"哲学
// 自然的缓存策略，无为而治的API优化

import { cacheManager, generateCacheKey } from './cache-manager';

interface CacheOptions {
  ttl?: number; // 缓存时间（毫秒）
  key?: string; // 自定义缓存键
  skipCache?: boolean; // 跳过缓存
  tags?: string[]; // 缓存标签，用于批量清理
}

interface CachedResponse<T> {
  data: T;
  cached: boolean;
  timestamp: number;
  ttl: number;
}

// API缓存中间件 - 对应《德道经》"道法自然"
export function withCache<T>(
  handler: (...args: any[]) => Promise<T>,
  options: CacheOptions = {}
) {
  return async (...args: any[]): Promise<CachedResponse<T>> => {
    const {
      ttl = 5 * 60 * 1000, // 默认5分钟
      key,
      skipCache = false,
      tags = []
    } = options;

    // 生成缓存键
    const cacheKey = key || generateCacheKey(
      handler.name || 'api',
      ...args,
      ...tags
    );

    // 如果跳过缓存，直接执行
    if (skipCache) {
      console.log(`🚫 跳过缓存: ${cacheKey}`);
      const data = await handler(...args);
      return {
        data,
        cached: false,
        timestamp: Date.now(),
        ttl: 0
      };
    }

    // 尝试从缓存获取
    const cachedResult = cacheManager.get<CachedResponse<T>>(cacheKey);
    if (cachedResult) {
      return {
        ...cachedResult,
        cached: true
      };
    }

    // 执行API处理函数
    console.log(`🔄 执行API: ${cacheKey}`);
    const startTime = Date.now();
    
    try {
      const data = await handler(...args);
      const executionTime = Date.now() - startTime;
      
      console.log(`✅ API执行完成: ${cacheKey} (${executionTime}ms)`);

      // 缓存结果
      const response: CachedResponse<T> = {
        data,
        cached: false,
        timestamp: Date.now(),
        ttl
      };

      cacheManager.set(cacheKey, response, ttl);

      return response;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ API执行失败: ${cacheKey} (${executionTime}ms)`, error);
      throw error;
    }
  };
}

// 用户相关API缓存 - 对应《德道经》"修之于身，其德乃真"
export const userCache = {
  // 用户信息缓存（1分钟）
  profile: (userId: string) => withCache(
    async () => {
      // 这里会调用实际的用户信息获取API
      const response = await fetch(`/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${userId}`
        }
      });
      return response.json();
    },
    {
      ttl: 60 * 1000, // 1分钟
      key: `user:profile:${userId}`,
      tags: ['user', 'profile']
    }
  ),

  // 用户列表缓存（5分钟）
  list: (filters: any) => withCache(
    async () => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      return response.json();
    },
    {
      ttl: 5 * 60 * 1000, // 5分钟
      key: `user:list:${JSON.stringify(filters)}`,
      tags: ['user', 'list']
    }
  )
};

// 毒株相关API缓存 - 对应《德道经》"道生一"
export const strainCache = {
  // 毒株列表缓存（2分钟）
  list: (filters: any) => withCache(
    async () => {
      const response = await fetch('/api/strains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      return response.json();
    },
    {
      ttl: 2 * 60 * 1000, // 2分钟
      key: `strain:list:${JSON.stringify(filters)}`,
      tags: ['strain', 'list']
    }
  ),

  // 毒株详情缓存（10分钟）
  detail: (strainId: string) => withCache(
    async () => {
      const response = await fetch(`/api/strains/${strainId}`);
      return response.json();
    },
    {
      ttl: 10 * 60 * 1000, // 10分钟
      key: `strain:detail:${strainId}`,
      tags: ['strain', 'detail']
    }
  ),

  // 附近毒株缓存（30秒）
  nearby: (location: { lat: number; lng: number }, radius: number) => withCache(
    async () => {
      const response = await fetch('/api/strains/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, radius })
      });
      return response.json();
    },
    {
      ttl: 30 * 1000, // 30秒
      key: `strain:nearby:${location.lat}:${location.lng}:${radius}`,
      tags: ['strain', 'nearby']
    }
  )
};

// 传播统计缓存 - 对应《德道经》"道法自然"
export const propagationCache = {
  // 传播统计缓存（1分钟）
  stats: (strainId: string) => withCache(
    async () => {
      const response = await fetch(`/api/propagation/stats/${strainId}`);
      return response.json();
    },
    {
      ttl: 60 * 1000, // 1分钟
      key: `propagation:stats:${strainId}`,
      tags: ['propagation', 'stats']
    }
  ),

  // 传播路径缓存（5分钟）
  paths: (strainId: string) => withCache(
    async () => {
      const response = await fetch(`/api/propagation/paths/${strainId}`);
      return response.json();
    },
    {
      ttl: 5 * 60 * 1000, // 5分钟
      key: `propagation:paths:${strainId}`,
      tags: ['propagation', 'paths']
    }
  )
};

// 缓存管理工具 - 对应《德道经》"无为而治"
export const cacheUtils = {
  // 按标签清理缓存
  clearByTags: (tags: string[]) => {
    const stats = cacheManager.getStats();
    let clearedCount = 0;

    stats.keys.forEach(key => {
      if (tags.some(tag => key.includes(tag))) {
        cacheManager.delete(key);
        clearedCount++;
      }
    });

    console.log(`🧹 按标签清理缓存: ${tags.join(', ')} (${clearedCount} 个条目)`);
    return clearedCount;
  },

  // 清理用户相关缓存
  clearUserCache: (userId: string) => {
    return cacheUtils.clearByTags(['user', userId]);
  },

  // 清理毒株相关缓存
  clearStrainCache: (strainId?: string) => {
    const tags = ['strain'];
    if (strainId) {
      tags.push(strainId);
    }
    return cacheUtils.clearByTags(tags);
  },

  // 清理传播相关缓存
  clearPropagationCache: (strainId?: string) => {
    const tags = ['propagation'];
    if (strainId) {
      tags.push(strainId);
    }
    return cacheUtils.clearByTags(tags);
  },

  // 获取缓存统计
  getStats: () => cacheManager.getStats(),

  // 预热缓存
  warmup: async (keys: string[]) => {
    console.log(`🔥 预热缓存: ${keys.length} 个键`);
    
    for (const key of keys) {
      // 这里可以实现预热逻辑
      console.log(`🔥 预热: ${key}`);
    }
  }
};

// 导出缓存中间件
export default withCache;
