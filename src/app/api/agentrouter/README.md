# AgentRouter API

AgentRouter 是一个用于管理和路由 AI Agent 请求的 API 系统。它提供了一个统一的接口来访问项目中的各种 AI Agent 功能。

## API 端点

### 基础端点
- `POST /api/agentrouter` - 通用 Agent 路由器
- `GET /api/agentrouter` - 健康检查

### 专用端点
- `POST /api/agentrouter/propagation/path` - 计算传播路径
- `POST /api/agentrouter/propagation/potential` - 预测传播潜力
- `POST /api/agentrouter/matching/similar-users` - 查找相似用户
- `POST /api/agentrouter/matching/compatibility` - 计算用户兼容性
- `POST /api/agentrouter/content/analyze` - 分析内容
- `POST /api/agentrouter/content/vector` - 生成内容向量
- `POST /api/agentrouter/content/tags` - 提取光谱标签
- `POST /api/agentrouter/optimization/path` - 优化传播路径
- `POST /api/agentrouter/optimization/timing` - 计算最佳时机

## 使用示例

### 计算传播路径
```javascript
fetch('/api/agentrouter/propagation/path', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    seed: {
      id: 'seed-1',
      content: '这是一个示例内容',
    },
    context: {
      timeOfDay: 14,
      userActivityLevel: 0.8,
      geographicContext: {
        lat: 39.9042,
        lng: 116.4074,
        radius: 10,
      },
      socialContext: {
        activeUsers: 100,
        trendingTopics: ['科技', '生活'],
      },
    },
  }),
})
```

### 查找相似用户
```javascript
fetch('/api/agentrouter/matching/similar-users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    seedVector: [0.1, 0.2, 0.3, 0.4, 0.5],
    userPool: [
      { id: 'user-1', interest_vector: [0.2, 0.3, 0.4, 0.5, 0.6] },
      { id: 'user-2', interest_vector: [0.3, 0.4, 0.5, 0.6, 0.7] },
    ],
    topK: 10,
  }),
})
```

## 配置

AgentRouter 的配置可以在 `src/lib/agent-router-config.ts` 中找到，包括路由映射、默认设置和超时配置等。

## 错误处理

所有 API 端点都返回标准的 HTTP 状态码：
- 200: 成功
- 400: 请求错误
- 500: 服务器内部错误

错误响应格式：
```json
{
  "error": "错误描述"
}
```