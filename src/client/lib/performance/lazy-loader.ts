// src/client/lib/performance/lazy-loader.ts
// 前端性能优化 - 基于《德道经》"道法自然"哲学
// 自然的懒加载策略，无为而治的前端性能提升

import { createSignal, createEffect, onCleanup } from 'solid-js';

interface LazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  fallback?: () => any;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetricsHistory = 1000;

  // 记录性能指标 - 对应《德道经》"道法自然"
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // 保持指标历史在合理范围内
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    console.log(`📊 性能指标记录: ${metric.componentName} - ${metric.loadTime}ms`);
  }

  // 获取性能统计
  getPerformanceStats(): {
    totalComponents: number;
    averageLoadTime: number;
    averageRenderTime: number;
    slowestComponent: PerformanceMetrics | null;
    fastestComponent: PerformanceMetrics | null;
  } {
    if (this.metrics.length === 0) {
      return {
        totalComponents: 0,
        averageLoadTime: 0,
        averageRenderTime: 0,
        slowestComponent: null,
        fastestComponent: null
      };
    }

    const totalComponents = this.metrics.length;
    const totalLoadTime = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    const totalRenderTime = this.metrics.reduce((sum, metric) => sum + metric.renderTime, 0);
    
    const averageLoadTime = totalLoadTime / totalComponents;
    const averageRenderTime = totalRenderTime / totalComponents;

    const slowestComponent = this.metrics.reduce((slowest, current) => 
      current.loadTime > slowest.loadTime ? current : slowest
    );

    const fastestComponent = this.metrics.reduce((fastest, current) => 
      current.loadTime < fastest.loadTime ? current : fastest
    );

    return {
      totalComponents,
      averageLoadTime,
      averageRenderTime,
      slowestComponent,
      fastestComponent
    };
  }

  // 清理性能指标
  clearMetrics(): void {
    this.metrics = [];
    console.log('🧹 性能指标已清理');
  }
}

// 创建全局性能监控器实例
export const performanceMonitor = new PerformanceMonitor();

// 懒加载Hook - 对应《德道经》"无为而治"
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  options: LazyLoadOptions = {}
): {
  data: () => T | null;
  loading: () => boolean;
  error: () => Error | null;
  load: () => Promise<void>;
} {
  const [data, setData] = createSignal<T | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);

  const load = async () => {
    if (loading() || data()) return;

    setLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const result = await loader();
      const loadTime = Date.now() - startTime;
      
      setData(result);
      
      // 记录性能指标
      performanceMonitor.recordMetric({
        loadTime,
        renderTime: 0, // 渲染时间在组件中记录
        componentName: 'LazyLoad',
        timestamp: Date.now()
      });

      console.log(`✅ 懒加载完成: ${loadTime}ms`);
    } catch (err) {
      const loadTime = Date.now() - startTime;
      setError(err instanceof Error ? err : new Error('加载失败'));
      
      console.error(`❌ 懒加载失败: ${loadTime}ms`, err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    load
  };
}

// 组件懒加载 - 对应《德道经》"道生一"
export function createLazyComponent<T>(
  loader: () => Promise<{ default: T }>,
  fallback?: () => any
) {
  return function LazyComponent(props: any) {
    const { data, loading, error, load } = useLazyLoad(loader);

    // 自动加载
    createEffect(() => {
      load();
    });

    return () => {
      if (loading()) {
        return fallback ? fallback() : <div class="loading-spinner">⏳ 加载中...</div>;
      }

      if (error()) {
        return <div class="error-message">❌ 加载失败: {error()?.message}</div>;
      }

      if (data()) {
        const Component = data() as any;
        return <Component {...props} />;
      }

      return null;
    };
  };
}

// 图片懒加载 - 对应《德道经》"道法自然"
export function useLazyImage(src: string, options: LazyLoadOptions = {}) {
  const [loaded, setLoaded] = createSignal(false);
  const [error, setError] = createSignal(false);
  const [inView, setInView] = createSignal(false);

  let imgRef: HTMLImageElement | undefined;

  const loadImage = () => {
    if (!imgRef || loaded() || error()) return;

    const startTime = Date.now();

    const img = new Image();
    img.onload = () => {
      const loadTime = Date.now() - startTime;
      setLoaded(true);
      
      // 记录性能指标
      performanceMonitor.recordMetric({
        loadTime,
        renderTime: 0,
        componentName: 'LazyImage',
        timestamp: Date.now()
      });

      console.log(`✅ 图片加载完成: ${src} (${loadTime}ms)`);
    };

    img.onerror = () => {
      const loadTime = Date.now() - startTime;
      setError(true);
      console.error(`❌ 图片加载失败: ${src} (${loadTime}ms)`);
    };

    img.src = src;
  };

  // Intersection Observer for lazy loading
  createEffect(() => {
    if (!imgRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: options.root,
        rootMargin: options.rootMargin || '50px',
        threshold: options.threshold || 0.1
      }
    );

    observer.observe(imgRef);

    onCleanup(() => {
      observer.disconnect();
    });
  });

  return {
    ref: (el: HTMLImageElement) => {
      imgRef = el;
    },
    loaded,
    error,
    inView,
    src: () => inView() ? src : undefined
  };
}

// 资源预加载 - 对应《德道经》"无为而治"
export function preloadResource(url: string, type: 'image' | 'script' | 'style' = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    if (type === 'image') {
      const img = new Image();
      img.onload = () => {
        const loadTime = Date.now() - startTime;
        console.log(`✅ 图片预加载完成: ${url} (${loadTime}ms)`);
        resolve();
      };
      img.onerror = () => {
        const loadTime = Date.now() - startTime;
        console.error(`❌ 图片预加载失败: ${url} (${loadTime}ms)`);
        reject(new Error(`Failed to preload image: ${url}`));
      };
      img.src = url;
    } else if (type === 'script') {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        const loadTime = Date.now() - startTime;
        console.log(`✅ 脚本预加载完成: ${url} (${loadTime}ms)`);
        resolve();
      };
      script.onerror = () => {
        const loadTime = Date.now() - startTime;
        console.error(`❌ 脚本预加载失败: ${url} (${loadTime}ms)`);
        reject(new Error(`Failed to preload script: ${url}`));
      };
      document.head.appendChild(script);
    } else if (type === 'style') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => {
        const loadTime = Date.now() - startTime;
        console.log(`✅ 样式预加载完成: ${url} (${loadTime}ms)`);
        resolve();
      };
      link.onerror = () => {
        const loadTime = Date.now() - startTime;
        console.error(`❌ 样式预加载失败: ${url} (${loadTime}ms)`);
        reject(new Error(`Failed to preload style: ${url}`));
      };
      document.head.appendChild(link);
    }
  });
}

// 批量资源预加载
export async function preloadResources(resources: Array<{ url: string; type: 'image' | 'script' | 'style' }>): Promise<void> {
  console.log(`🔥 开始预加载 ${resources.length} 个资源`);
  
  const startTime = Date.now();
  
  try {
    await Promise.all(resources.map(resource => 
      preloadResource(resource.url, resource.type)
    ));
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ 批量预加载完成: ${totalTime}ms`);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ 批量预加载失败: ${totalTime}ms`, error);
    throw error;
  }
}

// 性能优化工具
export const performanceUtils = {
  // 防抖函数
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // 节流函数
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // 获取性能统计
  getStats: () => performanceMonitor.getPerformanceStats(),

  // 清理性能指标
  clearStats: () => performanceMonitor.clearMetrics()
};

// 导出性能优化模块
export default {
  useLazyLoad,
  createLazyComponent,
  useLazyImage,
  preloadResource,
  preloadResources,
  performanceUtils,
  performanceMonitor
};
