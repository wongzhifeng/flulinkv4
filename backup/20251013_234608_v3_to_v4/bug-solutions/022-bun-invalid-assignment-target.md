# 解决方案：Bun构建失败 - Invalid assignment target

## 问题描述
- **错误信息**：`error: Invalid assignment target` 在 `querySelector` 模板字符串中
- **错误位置**：`src/index.ts:1002:65`
- **错误代码**：`document.querySelector(\`[data-strain-id="${result.data.id}"]\`)`
- **问题环境**：Bun构建器
- **问题时间**：2025-01-12

## 根本原因分析
1. **Bun构建器限制** - 对复杂模板字符串的严格解析
2. **嵌套变量引用** - 模板字符串中包含嵌套的变量引用
3. **解析器错误** - Bun构建器无法正确解析复杂的模板字符串语法

## 解决方案
### 1. 模板字符串语法修复
- **问题**：`document.querySelector(\`[data-strain-id="${result.data.id}"]\`)` 导致构建失败
- **解决**：将模板字符串转换为字符串拼接
- **实现**：
  ```javascript
  // 错误 ❌
  const strainCard = document.querySelector(`[data-strain-id="${result.data.id}"]`);
  
  // 正确 ✅
  const strainId = result.data.id;
  const strainCard = document.querySelector('[data-strain-id="' + strainId + '"]');
  ```

### 2. 变量提取策略
- **问题**：直接在模板字符串中使用复杂表达式
- **解决**：先提取变量，再使用字符串拼接
- **实现**：
  ```javascript
  // 提取变量
  const strainId = result.data.id;
  
  // 使用字符串拼接
  const strainCard = document.querySelector('[data-strain-id="' + strainId + '"]');
  ```

## 技术细节
### 修复的文件
- `src/index.ts` - 主要修复文件

### 修复内容
1. **模板字符串转换** - 将复杂模板字符串转换为字符串拼接
2. **变量提取** - 先提取变量再使用，避免嵌套引用
3. **语法简化** - 使用Bun构建器兼容的语法

### 修复前后对比
```javascript
// 修复前（构建失败）
const strainCard = document.querySelector(`[data-strain-id="${result.data.id}"]`);

// 修复后（构建成功）
const strainId = result.data.id;
const strainCard = document.querySelector('[data-strain-id="' + strainId + '"]');
```

## 预防措施
1. **避免复杂模板字符串** - 在Bun构建环境中避免使用复杂的嵌套模板字符串
2. **使用字符串拼接** - 对于复杂的选择器，优先使用字符串拼接
3. **变量提取** - 先提取变量再使用，避免在模板字符串中进行复杂计算
4. **构建测试** - 每次修改后都要进行构建测试

## 相关文件
- `src/index.ts` - 主要修复文件
- `memory/bug-solutions/022-bun-invalid-assignment-target.md` - 本解决方案记录

## 解决状态
- ✅ 模板字符串语法修复
- ✅ 变量提取优化
- ✅ 构建错误解决
- ⏳ 重新部署测试

## 测试结果
- Bun构建成功 ✅
- 功能逻辑保持不变 ✅
- 性能无影响 ✅
- 代码可读性良好 ✅

## 经验总结
1. **Bun构建器限制** - 对复杂模板字符串有严格限制
2. **字符串拼接优势** - 在某些场景下比模板字符串更稳定
3. **变量提取策略** - 先提取变量再使用，避免嵌套引用问题
4. **构建环境适配** - 需要根据构建环境选择合适的语法
