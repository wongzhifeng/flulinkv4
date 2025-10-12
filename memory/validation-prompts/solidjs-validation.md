# Solid.js响应式验证提示词

## 验证模板
```
请检查以下Solid.js代码是否符合细粒度响应式原则：

代码内容：[代码片段]

验证要点：
1. 是否正确使用createSignal/createEffect
2. 派生状态是否使用createMemo  
3. 避免不必要的组件重渲染
4. 符合无为而治的轻量级设计哲学
```

## 验证规则

### 1. Signal使用验证
```typescript
// 正确 ✅
const [count, setCount] = createSignal(0);
const [user, setUser] = createSignal(null);

// 错误 ❌
const [state, setState] = useState({ count: 0, user: null });
```

### 2. Effect使用验证
```typescript
// 正确 ✅
createEffect(() => {
  console.log('Count changed:', count());
});

// 错误 ❌
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);
```

### 3. Memo使用验证
```typescript
// 正确 ✅
const doubleCount = createMemo(() => count() * 2);

// 错误 ❌
const doubleCount = useMemo(() => count * 2, [count]);
```

### 4. 组件重渲染验证
```typescript
// 正确 ✅ - 细粒度更新
function UserProfile({ user }) {
  return (
    <div>
      <h1>{user().name}</h1>
      <p>{user().email}</p>
    </div>
  );
}

// 错误 ❌ - 整个组件重渲染
function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## 自动修复建议

### React → Solid.js转换
```typescript
// 自动转换规则
useState → createSignal
useEffect → createEffect
useMemo → createMemo
useCallback → createMemo (函数)
useRef → createSignal (引用)
```

### 状态拆分优化
```typescript
// 复杂状态拆分
const [user, setUser] = useState({ name: '', email: '', avatar: '' });
// ↓ 转换为
const [name, setName] = createSignal('');
const [email, setEmail] = createSignal('');
const [avatar, setAvatar] = createSignal('');
```
