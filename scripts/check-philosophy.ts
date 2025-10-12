// scripts/check-philosophy.ts
// 哲学一致性检查脚本 - 确保代码符合《德道经》理念

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface PhilosophyRule {
  name: string;
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning';
}

const philosophyRules: PhilosophyRule[] = [
  {
    name: '无为而治检查',
    pattern: /(useState|useEffect|useCallback|useMemo)/g,
    message: '发现React hooks，应使用Solid.js的createSignal/createEffect',
    severity: 'error'
  },
  {
    name: '中心化推送检查',
    pattern: /(WebSocket|Socket\.io|实时推送)/g,
    message: '发现中心化推送机制，违反"无为而治"原则',
    severity: 'warning'
  },
  {
    name: '德道经引用检查',
    pattern: /\/\/.*德道经|/\*.*德道经.*\*/g,
    message: '缺少德道经哲学依据注释',
    severity: 'warning'
  },
  {
    name: '边缘计算检查',
    pattern: /(MongoDB|PostgreSQL|MySQL)/g,
    message: '发现非边缘数据库，应使用Turso',
    severity: 'error'
  }
];

function checkFile(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  const issues: string[] = [];

  for (const rule of philosophyRules) {
    const matches = content.match(rule.pattern);
    if (matches) {
      issues.push(`${rule.severity.toUpperCase()}: ${rule.message} (${rule.name})`);
    }
  }

  return issues;
}

function scanDirectory(dirPath: string): void {
  const files = readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = join(dirPath, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const issues = checkFile(fullPath);
      if (issues.length > 0) {
        console.log(`\n📁 ${fullPath}:`);
        issues.forEach(issue => console.log(`  ${issue}`));
      }
    }
  }
}

console.log('🔍 开始哲学一致性检查...\n');
scanDirectory('src');
console.log('\n✅ 哲学一致性检查完成');
