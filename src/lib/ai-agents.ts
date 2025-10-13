// AI Agent 系统接口定义

export interface AIAgentSystem {
  propagationAgent: PropagationDecisionAgent
  matchingAgent: UserMatchingAgent
  contentAgent: ContentAnalysisAgent
  optimizationAgent: SystemOptimizationAgent
}

export interface PropagationDecisionAgent {
  calculatePropagationPath(seed: StarSeed, context: Context): Promise<PropagationPath>
  predictPropagationPotential(seed: StarSeed): Promise<number>
}

export interface UserMatchingAgent {
  findSimilarUsers(seedVector: number[], userPool: User[], topK?: number): Promise<User[]>
  calculateUserCompatibility(user1: User, user2: User): Promise<number>
}

export interface ContentAnalysisAgent {
  analyzeContent(content: string): Promise<ContentAnalysis>
  generateContentVector(content: string): Promise<number[]>
  extractSpectralTags(content: string): Promise<string[]>
}

export interface SystemOptimizationAgent {
  optimizePropagationPath(path: PropagationPath): Promise<PropagationPath>
  calculateOptimalTiming(seed: StarSeed, users: User[]): Promise<Date[]>
}

// 数据结构定义
export interface PropagationPath {
  seedId: string
  firstTargets: string[] // 用户ID列表
  propagationSequence: PropagationStep[]
  estimatedReach: number
  confidence: number
}

export interface PropagationStep {
  userId: string
  timestamp: Date
  expectedResonance: number
  geographicWeight: number
  semanticWeight: number
}

export interface ContentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  topics: string[]
  keywords: string[]
  readability: number
  engagement_potential: number
}

export interface Context {
  timeOfDay: number
  userActivityLevel: number
  geographicContext: {
    lat: number
    lng: number
    radius: number
  }
  socialContext: {
    activeUsers: number
    trendingTopics: string[]
  }
}

// AI Agent 实现类
export class AIAgentManager implements AIAgentSystem {
  private aiServiceUrl: string

  constructor(aiServiceUrl: string = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000') {
    this.aiServiceUrl = aiServiceUrl
  }

  // 传播决策 Agent
  propagationAgent: PropagationDecisionAgent = {
    async calculatePropagationPath(seed: StarSeed, context: Context): Promise<PropagationPath> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/optimize-propagation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star_seed: seed, context })
      })
      return response.json()
    },

    async predictPropagationPotential(seed: StarSeed): Promise<number> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/predict-potential`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star_seed: seed })
      })
      const result = await response.json()
      return result.potential_score
    }
  }

  // 用户匹配 Agent
  matchingAgent: UserMatchingAgent = {
    async findSimilarUsers(seedVector: number[], userPool: User[], topK: number = 10): Promise<User[]> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/find-similar-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seed_vector: seedVector, 
          user_pool: userPool.map(u => ({ id: u.id, interest_vector: u.interest_vector })),
          limit: topK 
        })
      })
      const result = await response.json()
      return result.similar_users
    },

    async calculateUserCompatibility(user1: User, user2: User): Promise<number> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/calculate-compatibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1, user2 })
      })
      const result = await response.json()
      return result.compatibility_score
    }
  }

  // 内容分析 Agent
  contentAgent: ContentAnalysisAgent = {
    async analyzeContent(content: string): Promise<ContentAnalysis> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/analyze-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      return response.json()
    },

    async generateContentVector(content: string): Promise<number[]> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/embed-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      })
      const result = await response.json()
      return result.vector
    },

    async extractSpectralTags(content: string): Promise<string[]> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/extract-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      const result = await response.json()
      return result.tags
    }
  }

  // 系统优化 Agent
  optimizationAgent: SystemOptimizationAgent = {
    async optimizePropagationPath(path: PropagationPath): Promise<PropagationPath> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/optimize-path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      })
      return response.json()
    },

    async calculateOptimalTiming(seed: StarSeed, users: User[]): Promise<Date[]> {
      const response = await fetch(`${this.aiServiceUrl}/api/ai/calculate-timing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, users })
      })
      const result = await response.json()
      return result.optimal_times.map((timestamp: string) => new Date(timestamp))
    }
  }
}

// 全局 AI Agent 实例
export const aiAgents = new AIAgentManager()

// React Hook for AI Agents
export function useAIAgents() {
  return aiAgents
}

// 特定功能的 Hook
export function usePropagationAgent() {
  return aiAgents.propagationAgent
}

export function useMatchingAgent() {
  return aiAgents.matchingAgent
}

export function useContentAgent() {
  return aiAgents.contentAgent
}

export function useOptimizationAgent() {
  return aiAgents.optimizationAgent
}
