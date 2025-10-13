# AI代码审查提示词

## 审查维度

### 1. 德道经哲学一致性检查
- 检查代码是否对应《德道经》具体章节
- 验证是否符合"无为而治"原则
- 确认边缘计算优先设计
- 检查用户自主性体现

### 2. Solid.js响应式正确性
- 验证createSignal使用正确性
- 检查createEffect依赖关系
- 确认createMemo优化使用
- 避免不必要的组件重渲染

### 3. Bun运行时兼容性
- 检查Bun内置API使用
- 验证快速启动特性利用
- 确认内存使用优化
- 检查异步操作处理

### 4. Turso数据库查询优化
- 验证边缘查询设计
- 检查数据同步机制
- 确认连接池配置
- 检查查询性能优化

### 5. 边缘计算友好性
- 检查无状态服务设计
- 验证数据就近存储
- 确认全球分布式支持
- 检查延迟优化

## 审查命令

```bash
# 哲学一致性检查
bun run check:philosophy

# 性能基准检查
bun run check:performance

# 边缘计算适配检查
bun run check:edge

# 综合代码质量检查
bun run check:all
```

## 自动修复规则

### React → Solid.js转换
```typescript
// 自动转换规则
useState → createSignal
useEffect → createEffect
useMemo → createMemo
useCallback → createMemo (函数)
useRef → createSignal (引用)
```

### 状态管理优化
```typescript
// 复杂状态拆分
const [user, setUser] = useState({ name: '', email: '', avatar: '' });
// ↓ 转换为
const [name, setName] = createSignal('');
const [email, setEmail] = createSignal('');
const [avatar, setAvatar] = createSignal('');
```

### 异步操作优化
```typescript
// 阻塞操作转换
const result = await heavyComputation();
// ↓ 转换为
const result = await new Promise(resolve => {
  setTimeout(() => resolve(heavyComputation()), 0);
});
```

## 审查检查清单

### 文件级别检查
- [ ] 文件头部包含德道经依据注释
- [ ] 导入语句符合技术栈要求
- [ ] 类/函数命名符合规范
- [ ] 错误处理完整

### 代码级别检查
- [ ] 使用Solid.js响应式API
- [ ] 避免React特定API
- [ ] 异步操作正确处理
- [ ] 类型定义完整

### 性能级别检查
- [ ] 避免不必要的计算
- [ ] 使用createMemo优化
- [ ] 内存泄漏检查
- [ ] 边缘计算优化

### 哲学级别检查
- [ ] 符合"无为而治"原则
- [ ] 体现用户自主性
- [ ] 边缘计算优先
- [ ] 无状态服务设计

## 审查报告模板

```markdown
# 代码审查报告

**文件路径**: src/server/services/GeographicPropagationService.ts
**审查时间**: 2025-01-12
**审查者**: AI Code Reviewer

## 审查结果

### ✅ 通过项目
- 德道经依据明确
- Solid.js响应式正确
- Bun运行时兼容
- Turso数据库优化

### ⚠️ 警告项目
- 第45行：建议使用createMemo优化计算
- 第78行：错误处理可以更详细

### ❌ 错误项目
- 第23行：使用了useState，应改为createSignal
- 第156行：缺少德道经章节引用

## 修复建议
1. 将useState替换为createSignal
2. 添加createMemo优化性能
3. 完善错误处理机制
4. 补充德道经依据注释

## 总体评分: 85/100
```
