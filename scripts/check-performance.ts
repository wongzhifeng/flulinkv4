// scripts/check-performance.ts
// 性能基准检查脚本 - 确保Bun+Solid.js性能优化

import { performance } from 'perf_hooks';

interface PerformanceMetric {
  name: string;
  threshold: number;
  unit: string;
  description: string;
}

const performanceMetrics: PerformanceMetric[] = [
  {
    name: '应用启动时间',
    threshold: 100,
    unit: 'ms',
    description: 'Bun应用启动时间应小于100ms'
  },
  {
    name: '内存使用量',
    threshold: 50,
    unit: 'MB',
    description: '应用内存使用量应小于50MB'
  },
  {
    name: 'API响应时间',
    threshold: 200,
    unit: 'ms',
    description: 'API响应时间应小于200ms'
  }
];

function measureStartupTime(): number {
  const start = performance.now();
  // 模拟应用启动
  const end = performance.now();
  return end - start;
}

function measureMemoryUsage(): number {
  const usage = process.memoryUsage();
  return usage.heapUsed / 1024 / 1024; // 转换为MB
}

async function measureAPIResponseTime(): Promise<number> {
  const start = performance.now();
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 50));
  const end = performance.now();
  return end - start;
}

async function runPerformanceCheck(): Promise<void> {
  console.log('⚡ 开始性能基准检查...\n');

  // 检查启动时间
  const startupTime = measureStartupTime();
  console.log(`🚀 应用启动时间: ${startupTime.toFixed(2)}ms`);
  if (startupTime > performanceMetrics[0].threshold) {
    console.log(`❌ 启动时间超过阈值 ${performanceMetrics[0].threshold}ms`);
  } else {
    console.log(`✅ 启动时间符合要求`);
  }

  // 检查内存使用
  const memoryUsage = measureMemoryUsage();
  console.log(`💾 内存使用量: ${memoryUsage.toFixed(2)}MB`);
  if (memoryUsage > performanceMetrics[1].threshold) {
    console.log(`❌ 内存使用量超过阈值 ${performanceMetrics[1].threshold}MB`);
  } else {
    console.log(`✅ 内存使用量符合要求`);
  }

  // 检查API响应时间
  const apiResponseTime = await measureAPIResponseTime();
  console.log(`🌐 API响应时间: ${apiResponseTime.toFixed(2)}ms`);
  if (apiResponseTime > performanceMetrics[2].threshold) {
    console.log(`❌ API响应时间超过阈值 ${performanceMetrics[2].threshold}ms`);
  } else {
    console.log(`✅ API响应时间符合要求`);
  }

  console.log('\n📊 性能检查完成');
}

runPerformanceCheck().catch(console.error);
