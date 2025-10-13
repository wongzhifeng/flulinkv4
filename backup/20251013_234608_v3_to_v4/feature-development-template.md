# 新功能开发模板

**模块名称**：[如"地理传播引擎"]
**德道经依据**：引用具体章节（如"道常无为而无不为"第37章）
**技术约束**：Bun后端、Solid前端、Turso数据库
**输入输出**：
- 输入：用户位置、毒株标签、传播半径
- 输出：传播路径、预计覆盖人数、成功概率
**性能要求**：响应时间<200ms，支持千人并发
**测试用例**：3个典型场景+1个边界场景

## 开发流程

### 1. 哲学依据确认
- [ ] 确认德道经章节引用
- [ ] 验证哲学映射关系
- [ ] 检查是否符合"无为而治"原则

### 2. 技术架构设计
- [ ] 确认Bun后端兼容性
- [ ] 设计Solid.js响应式方案
- [ ] 规划Turso数据库Schema
- [ ] 考虑边缘计算优化

### 3. 代码实现
- [ ] 实现核心业务逻辑
- [ ] 添加类型定义
- [ ] 编写API路由
- [ ] 创建前端组件

### 4. 质量检查
- [ ] 运行哲学一致性检查
- [ ] 运行性能基准测试
- [ ] 运行边缘计算适配检查
- [ ] 验证响应式正确性

### 5. 测试验证
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 测试边界场景
- [ ] 性能压力测试

## 代码模板

```typescript
// 文件：src/server/services/[ModuleName]Service.ts
// 基于《德道经》第X章"[章节名]"的[功能描述]

import { [相关类型] } from '@/shared/types/[TypeFile]';

export class [ModuleName]Service {
  private static instance: [ModuleName]Service;
  
  private constructor() {}
  
  public static getInstance(): [ModuleName]Service {
    if (![ModuleName]Service.instance) {
      [ModuleName]Service.instance = new [ModuleName]Service();
    }
    return [ModuleName]Service.instance;
  }
  
  /**
   * [功能描述] - 对应《德道经》"[章节引用]"
   */
  public async [methodName](): Promise<[ReturnType]> {
    // 实现逻辑
  }
}
```

## 审查清单

- [ ] 哲学依据明确
- [ ] 技术约束遵循
- [ ] 性能要求满足
- [ ] 测试用例完整
- [ ] 代码风格一致
- [ ] 文档注释完整
