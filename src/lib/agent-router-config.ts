// AgentRouter 配置文件

export interface AgentRouteConfig {
  name: string
  path: string
  methods: string[]
  description: string
  agent: string
  action: string
}

export const agentRoutes: AgentRouteConfig[] = [
  {
    name: 'calculate-propagation-path',
    path: '/api/agentrouter/propagation/path',
    methods: ['POST'],
    description: '计算传播路径',
    agent: 'propagationAgent',
    action: 'calculatePropagationPath'
  },
  {
    name: 'predict-propagation-potential',
    path: '/api/agentrouter/propagation/potential',
    methods: ['POST'],
    description: '预测传播潜力',
    agent: 'propagationAgent',
    action: 'predictPropagationPotential'
  },
  {
    name: 'find-similar-users',
    path: '/api/agentrouter/matching/similar-users',
    methods: ['POST'],
    description: '查找相似用户',
    agent: 'matchingAgent',
    action: 'findSimilarUsers'
  },
  {
    name: 'calculate-user-compatibility',
    path: '/api/agentrouter/matching/compatibility',
    methods: ['POST'],
    description: '计算用户兼容性',
    agent: 'matchingAgent',
    action: 'calculateUserCompatibility'
  },
  {
    name: 'analyze-content',
    path: '/api/agentrouter/content/analyze',
    methods: ['POST'],
    description: '分析内容',
    agent: 'contentAgent',
    action: 'analyzeContent'
  },
  {
    name: 'generate-content-vector',
    path: '/api/agentrouter/content/vector',
    methods: ['POST'],
    description: '生成内容向量',
    agent: 'contentAgent',
    action: 'generateContentVector'
  },
  {
    name: 'extract-spectral-tags',
    path: '/api/agentrouter/content/tags',
    methods: ['POST'],
    description: '提取光谱标签',
    agent: 'contentAgent',
    action: 'extractSpectralTags'
  },
  {
    name: 'optimize-propagation-path',
    path: '/api/agentrouter/optimization/path',
    methods: ['POST'],
    description: '优化传播路径',
    agent: 'optimizationAgent',
    action: 'optimizePropagationPath'
  },
  {
    name: 'calculate-optimal-timing',
    path: '/api/agentrouter/optimization/timing',
    methods: ['POST'],
    description: '计算最佳时机',
    agent: 'optimizationAgent',
    action: 'calculateOptimalTiming'
  }
]

// AgentRouter 中间件配置
export const agentRouterConfig = {
  basePath: '/api/agentrouter',
  routes: agentRoutes,
  defaultAgent: 'propagationAgent',
  timeout: 30000, // 30秒超时
  retries: 3, // 重试次数
  logLevel: 'info' // 日志级别
}