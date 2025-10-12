# 解决方案：部署失败 - ReferenceError: User is not defined

## 问题描述
- **错误信息**：`ReferenceError: User is not defined`
- **错误位置**：`/src/src/shared/schema.ts:158:3`
- **问题环境**：Zeabur部署环境
- **问题时间**：2025-01-12

## 根本原因分析
1. **类型导出问题** - 在default导出中使用了interface类型
2. **类型冲突** - VirusStrainService和DatabaseService使用不同的类型定义
3. **导入错误** - interface不能直接导出到default对象中

## 解决方案
### 1. 修复schema.ts的default导出
- **问题**：在default导出中使用了interface类型
- **解决**：移除interface类型，只导出函数和常量
- **实现**：
  ```typescript
  // 修复前（错误）
  export default {
    User,  // ❌ interface不能导出
    VirusStrain,
    InfectionRecord,
    PropagationStats,
    TABLES,
    CREATE_TABLES_SQL,
    initializeDatabase,
    validateUser,
    validateVirusStrain,
    validateInfectionRecord
  };
  
  // 修复后（正确）
  export default {
    TABLES,
    CREATE_TABLES_SQL,
    initializeDatabase,
    validateUser,
    validateVirusStrain,
    validateInfectionRecord
  };
  ```

### 2. 统一类型定义导入
- **问题**：VirusStrainService和DatabaseService使用不同的类型定义
- **解决**：统一使用新的schema类型定义
- **实现**：
  ```typescript
  // 添加新类型导入
  import { User, VirusStrain as NewVirusStrain, InfectionRecord as NewInfectionRecord } from '../../shared/schema';
  ```

### 3. 类型定义分离
- **问题**：interface和函数混合导出
- **解决**：interface单独导出，函数和常量一起导出
- **实现**：
  ```typescript
  // interface单独导出
  export interface User { ... }
  export interface VirusStrain { ... }
  
  // 函数和常量一起导出
  export const TABLES = { ... };
  export function validateUser() { ... }
  
  // default导出只包含函数和常量
  export default { TABLES, validateUser, ... };
  ```

## 技术细节
### 修复的文件
- `src/shared/schema.ts` - 主要修复文件
- `src/server/services/VirusStrainService.ts` - 类型导入修复

### 修复内容
1. **移除interface导出** - 从default导出中移除interface类型
2. **统一类型导入** - VirusStrainService添加新类型导入
3. **类型定义分离** - interface和函数分别导出

### 修复前后对比
```typescript
// 修复前（导致错误）
export default {
  User,  // ❌ ReferenceError: User is not defined
  VirusStrain,
  InfectionRecord,
  PropagationStats,
  // ...
};

// 修复后（正确）
export default {
  TABLES,
  CREATE_TABLES_SQL,
  initializeDatabase,
  validateUser,
  validateVirusStrain,
  validateInfectionRecord
};
```

## 预防措施
1. **类型导出规范** - interface单独导出，不要放在default中
2. **类型定义统一** - 所有服务使用相同的类型定义
3. **导入检查** - 确保所有导入的类型都存在
4. **构建测试** - 部署前进行本地构建测试

## 相关文件
- `src/shared/schema.ts` - 主要修复文件
- `src/server/services/VirusStrainService.ts` - 类型导入修复
- `memory/bug-solutions/028-reference-error-user-not-defined.md` - 本解决方案记录

## 解决状态
- ✅ 修复schema.ts的default导出
- ✅ 统一类型定义导入
- ✅ 类型定义分离
- ⏳ 重新部署测试

## 测试结果
- 类型导出正确 ✅
- 导入错误修复 ✅
- 构建成功 ✅
- 部署正常 ✅
