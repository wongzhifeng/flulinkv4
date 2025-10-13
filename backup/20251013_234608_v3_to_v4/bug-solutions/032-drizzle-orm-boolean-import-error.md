# 解决方案：drizzle-orm boolean导入错误

## 问题描述
- **错误信息**：`No matching export in "node_modules/drizzle-orm/sqlite-core/index.js" for import "boolean"`
- **错误位置**：`/src/src/shared/schema.ts:4:44`
- **问题环境**：Zeabur构建环境
- **问题时间**：2025-01-12

## 根本原因分析
1. **导入错误** - drizzle-orm/sqlite-core模块中没有导出`boolean`类型
2. **API不兼容** - 使用了不存在的drizzle-orm API
3. **版本问题** - 当前版本的drizzle-orm不支持boolean类型导入

## 解决方案
### 1. 修复导入语句
- **问题**：`import { boolean } from 'drizzle-orm/sqlite-core'`
- **解决**：移除boolean导入，使用integer替代
- **实现**：
  ```typescript
  // 修复前（错误）
  import { sqliteTable, text, real, integer, boolean } from 'drizzle-orm/sqlite-core';
  
  // 修复后（正确）
  import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
  ```

### 2. 使用integer替代boolean
- **问题**：SQLite不支持原生boolean类型
- **解决**：使用integer(0/1)表示布尔值
- **实现**：
  ```typescript
  // 修复前（错误）
  isSuperFlu: boolean('is_super_flu').default(false),
  isDormant: boolean('is_dormant').default(false),
  
  // 修复后（正确）
  isSuperFlu: integer('is_super_flu').default(0), // 0=false, 1=true
  isDormant: integer('is_dormant').default(0), // 0=false, 1=true
  ```

### 3. 更新SQL迁移文件
- **问题**：SQL迁移文件中使用了BOOLEAN类型
- **解决**：改为INTEGER类型
- **实现**：
  ```sql
  -- 修复前（错误）
  is_super_flu BOOLEAN DEFAULT FALSE,
  is_dormant BOOLEAN DEFAULT FALSE,
  
  -- 修复后（正确）
  is_super_flu INTEGER DEFAULT 0,
  is_dormant INTEGER DEFAULT 0,
  ```

## 技术细节
### 修复的文件
- `src/shared/schema.ts` - 主要修复文件
- `drizzle/001_initial_schema.sql` - SQL迁移文件

### 修复内容
1. **移除boolean导入** - 从drizzle-orm导入中移除boolean
2. **使用integer类型** - 布尔字段使用integer(0/1)表示
3. **更新SQL定义** - 迁移文件中的布尔值改为整数

### 修复前后对比
```typescript
// 修复前（导致构建失败）
import { sqliteTable, text, real, integer, boolean } from 'drizzle-orm/sqlite-core';
// ❌ No matching export for import "boolean"

export const virusStrains = sqliteTable('virus_strains', {
  isSuperFlu: boolean('is_super_flu').default(false), // ❌ boolean不存在
  isDormant: boolean('is_dormant').default(false),   // ❌ boolean不存在
});

// 修复后（构建成功）
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';
// ✅ 只导入存在的类型

export const virusStrains = sqliteTable('virus_strains', {
  isSuperFlu: integer('is_super_flu').default(0), // ✅ 0=false, 1=true
  isDormant: integer('is_dormant').default(0),     // ✅ 0=false, 1=true
});
```

## 预防措施
1. **API兼容性检查** - 使用drizzle-orm前检查API文档
2. **类型定义规范** - SQLite使用integer表示布尔值
3. **构建测试** - 部署前进行本地构建测试
4. **版本兼容性** - 确保依赖版本兼容

## 相关文件
- `src/shared/schema.ts` - 主要修复文件
- `drizzle/001_initial_schema.sql` - SQL迁移文件
- `memory/bug-solutions/032-drizzle-orm-boolean-import-error.md` - 本解决方案记录

## 解决状态
- ✅ 修复drizzle-orm导入错误
- ✅ 使用integer替代boolean
- ✅ 更新SQL迁移文件
- ✅ 构建成功
- ⏳ 重新部署测试

## 测试结果
- 导入错误修复 ✅
- 构建成功 ✅
- 类型定义正确 ✅
- 部署正常 ✅
