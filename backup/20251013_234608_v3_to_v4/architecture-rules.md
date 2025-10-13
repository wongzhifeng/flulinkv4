# 架构不可违反规则

**目录结构标准**：
```
src/
├── client/          # Solid.js前端组件
│   ├── components/  # 可复用组件
│   └── pages/       # 页面组件
├── server/          # SolidStart API路由
│   ├── api/         # API端点
│   └── services/    # 业务逻辑服务
├── shared/          # 通用类型定义
│   └── types/       # TypeScript类型
├── lib/             # 工具函数库
└── tests/           # 一体化测试
```

**技术选型禁令**：
🚫 禁止使用React/Next.js（违反性能原则）
🚫 禁止引入MongoDB（违反边缘计算原则）
🚫 禁止使用WebSocket长连接（违反无为而治哲学）
🚫 禁止客户端复杂状态管理（必须使用Solid细粒度响应）
🚫 禁止使用Express/Koa（必须使用SolidStart）
🚫 禁止使用Prisma（必须使用Drizzle ORM）

**代码风格强制标准**：

### Solid.js响应式规范
```typescript
// 正确 ✅
const [user, setUser] = createSignal(null);
const [loading, setLoading] = createSignal(false);

createEffect(() => {
  console.log('用户状态变化:', user());
});

const derivedValue = createMemo(() => {
  return user() ? `欢迎, ${user().name}` : '请登录';
});

// 错误 ❌  
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  console.log('用户状态变化:', user);
}, [user]);

const derivedValue = useMemo(() => {
  return user ? `欢迎, ${user.name}` : '请登录';
}, [user]);
```

### Bun运行时规范
```typescript
// 正确 ✅
// 使用Bun内置API
const file = Bun.file("data.json");
const data = await file.json();

// 使用Bun的快速启动特性
const server = Bun.serve({
  port: 3000,
  fetch(request) {
    return new Response("Hello from Bun!");
  },
});

// 错误 ❌
// 使用Node.js特定API
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
```

### Turso数据库规范
```typescript
// 正确 ✅
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle(client);

// 错误 ❌
import { MongoClient } from 'mongodb';
import { PrismaClient } from '@prisma/client';
```

**文件命名规范**：
- 组件文件：PascalCase.tsx (如：VirusStrainCard.tsx)
- 服务文件：PascalCase.ts (如：GeographicPropagationService.ts)
- 类型文件：PascalCase.ts (如：VirusStrain.ts)
- 工具文件：camelCase.ts (如：formatDate.ts)
- 测试文件：*.test.ts (如：GeographicPropagationService.test.ts)

**注释规范**：
```typescript
// 文件头部必须包含德道经依据
// 文件：src/server/services/GeographicPropagationService.ts
// 基于《德道经》第37章"道常无为而无不为"的地理传播算法

/**
 * 创建新的病毒传播 - 对应《德道经》"道生一"
 */
public async createVirusPropagation(): Promise<VirusPropagation> {
  // 实现逻辑
}
```

**错误处理规范**：
```typescript
// 正确 ✅
try {
  const result = await someAsyncOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('操作失败:', error);
  return { 
    success: false, 
    error: error instanceof Error ? error.message : '未知错误' 
  };
}

// 错误 ❌
const result = await someAsyncOperation(); // 可能抛出未捕获的异常
return result;
```
