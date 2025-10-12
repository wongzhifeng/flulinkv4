// src/lib/cache/cache-manager.ts
// API缓存管理器 - 基于《德道经》"道法自然"哲学
// 自然的缓存策略，无为而治的缓存管理

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live in milliseconds
  key: string;
}

interface CacheConfig {
  defaultTTL: number; // 默认缓存时间（毫秒）
  maxSize: number; // 最大缓存条目数
  cleanupInterval: number; // 清理间隔（毫秒）
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5分钟
    maxSize: 1000,
    cleanupInterval: 60 * 1000 // 1分钟
  }) {
    this.config = config;
    this.startCleanupTimer();
  }

  // 设置缓存 - 对应《德道经》"道生一"
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const cacheTTL = ttl || this.config.defaultTTL;

    // 如果缓存已满，清理最旧的条目
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: cacheTTL,
      key
    });

    console.log(`📦 缓存设置: ${key} (TTL: ${cacheTTL}ms)`);
  }

  // 获取缓存 - 对应《德道经》"一生二"
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`❌ 缓存未命中: ${key}`);
      return null;
    }

    const now = Date.now();
    const isExpired = (now - item.timestamp) > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      console.log(`⏰ 缓存过期: ${key}`);
      return null;
    }

    console.log(`✅ 缓存命中: ${key}`);
    return item.data;
  }

  // 删除缓存 - 对应《德道经》"二生三"
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ 缓存删除: ${key}`);
    }
    return deleted;
  }

  // 清空所有缓存 - 对应《德道经》"三生万物"
  clear(): void {
    this.cache.clear();
    console.log(`🧹 缓存清空`);
  }

  // 检查缓存是否存在
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    const isExpired = (now - item.timestamp) > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // 获取缓存统计信息
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      keys: Array.from(this.cache.keys())
    };
  }

  // 清理过期缓存 - 对应《德道经》"无为而治"
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if ((now - item.timestamp) > item.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 清理过期缓存: ${cleanedCount} 个条目`);
    }
  }

  // 驱逐最旧的缓存条目
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🔄 驱逐最旧缓存: ${oldestKey}`);
    }
  }

  // 启动清理定时器
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // 停止清理定时器
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // 计算缓存命中率（简化版本）
  private calculateHitRate(): number {
    // 这里可以实现更复杂的命中率计算
    return this.cache.size / this.config.maxSize;
  }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5分钟默认缓存
  maxSize: 1000, // 最大1000个缓存条目
  cleanupInterval: 60 * 1000 // 每分钟清理一次
});

// 缓存键生成器 - 对应《德道经》"道法自然"
export function generateCacheKey(prefix: string, ...params: any[]): string {
  const paramString = params.map(p => 
    typeof p === 'object' ? JSON.stringify(p) : String(p)
  ).join(':');
  
  return `${prefix}:${paramString}`;
}

// 缓存装饰器 - 对应《德道经》"无为而治"
export function cached(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = generateCacheKey(`${target.constructor.name}:${propertyName}`, ...args);
      
      // 尝试从缓存获取
      const cachedResult = cacheManager.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 执行原方法
      const result = await method.apply(this, args);
      
      // 缓存结果
      cacheManager.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

// 导出缓存管理器
export default cacheManager;
