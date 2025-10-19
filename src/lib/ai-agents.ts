// AI Agent 系统接口定义 - 优化版
// 基于《德道经》"无为而治"哲学，支持智能降级和超时处理

import React from 'react'

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

// AI Agent 实现类 - 优化版
export class AIAgentManager implements AIAgentSystem {
  private aiServiceUrl: string
  private requestTimeout: number = 10000 // 10秒超时
  private retryAttempts: number = 2
  private fallbackEnabled: boolean = true

  constructor(aiServiceUrl: string = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000') {
    this.aiServiceUrl = aiServiceUrl
  }

  // 带超时和重试的请求方法
  private async makeRequestWithRetry(
    url: string, 
    options: RequestInit, 
    retries: number = this.retryAttempts
  ): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout)
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          return response
        }
        
        // 如果是最后一次尝试，抛出错误
        if (attempt === retries) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        
      } catch (error) {
        if (attempt === retries) {
          throw error
        }
        console.warn(`请求失败 (尝试 ${attempt + 1}/${retries + 1}):`, error)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
    
    throw new Error('所有重试尝试都失败了')
  }

  // 降级向量生成器
  private generateFallbackVector(text: string, dimension: number = 384): number[] {
    const vector = new Array(dimension).fill(0)
    
    // 基于文本长度的特征
    const textLength = Math.min(text.length / 1000, 1)
    vector[0] = textLength
    
    // 基于字符频率的简单特征
    const charFreq: Record<string, number> = {}
    for (const char of text.toLowerCase()) {
      charFreq[char] = (charFreq[char] || 0) + 1
    }
    
    // 填充前几个维度
    let index = 1
    for (const [char, freq] of Object.entries(charFreq).slice(0, 10)) {
      if (index < dimension) {
        vector[index] = Math.min(freq / text.length, 1)
        index++
      }
    }
    
    // 基于关键词的特征
    const keywords = ['好', '棒', '喜欢', '爱', '开心', '快乐', '美丽', '优秀']
    for (let i = 0; i < keywords.length && index < dimension; i++) {
      if (text.includes(keywords[i])) {
        vector[index] = 1
      }
      index++
    }
    
    // 归一化
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] = vector[i] / norm
      }
    }
    
    return vector
  }

  // 传播决策 Agent
  propagationAgent: PropagationDecisionAgent = {
    async calculatePropagationPath(seed: StarSeed, context: Context): Promise<PropagationPath> {
      try {
        const response = await this.makeRequestWithRetry(`${this.aiServiceUrl}/api/ai/optimize-propagation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ star_seed: seed, context })
        })
        const result = await response.json()
        return result.optimal_path
      } catch (error) {
        console.warn('传播路径计算失败，使用降级策略:', error)
        // 降级策略：简单的传播路径
        return {
          seedId: seed.id,
          firstTargets: [],
          propagationSequence: [],
          estimatedReach: 0,
          confidence: 0.1
        }
      }
    },

    async predictPropagationPotential(seed: StarSeed): Promise<number> {
      try {
        const response = await this.makeRequestWithRetry(`${this.aiServiceUrl}/api/ai/predict-potential`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ star_seed: seed })
        })
        const result = await response.json()
        return result.potential_score
      } catch (error) {
        console.warn('传播潜力预测失败，使用降级策略:', error)
        // 降级策略：基于内容长度的简单预测
        return Math.min(100, Math.max(0, seed.content?.length || 0 * 2))
      }
    }
  }

  // 用户匹配 Agent
  matchingAgent: UserMatchingAgent = {
    async findSimilarUsers(seedVector: number[], userPool: User[], topK: number = 10): Promise<User[]> {
      try {
        const response = await this.makeRequestWithRetry(`${this.aiServiceUrl}/api/ai/find-similar-users`, {
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
      } catch (error) {
        console.warn('相似用户查找失败，使用降级策略:', error)
        // 降级策略：随机返回用户
        return userPool.slice(0, topK)
      }
    },

    async calculateUserCompatibility(user1: User, user2: User): Promise<number> {
      try {
        const response = await this.makeRequestWithRetry(`${this.aiServiceUrl}/api/ai/calculate-compatibility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user1, user2 })
        })
        const result = await response.json()
        return result.compatibility_score
      } catch (error) {
        console.warn('用户兼容性计算失败，使用降级策略:', error)
        // 降级策略：基于兴趣向量的简单计算
        if (user1.interest_vector && user2.interest_vector) {
          const dotProduct = user1.interest_vector.reduce((sum, val, i) => 
            sum + val * (user2.interest_vector?.[i] || 0), 0
          )
          const magnitude1 = Math.sqrt(user1.interest_vector.reduce((sum, val) => sum + val * val, 0))
          const magnitude2 = Math.sqrt(user2.interest_vector.reduce((sum, val) => sum + val * val, 0))
          return magnitude1 * magnitude2 > 0 ? dotProduct / (magnitude1 * magnitude2) : 0
        }
        return Math.random() * 0.5 + 0.3 // 随机兼容性
      }
    }
  }

  // 内容分析 Agent
  contentAgent: ContentAnalysisAgent = {
    async analyzeContent(content: string): Promise<ContentAnalysis> {
      try {
        const response = await this.makeRequestWithRetry(`${this.aiServiceUrl}/api/ai/analyze-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        })
        return await response.json()
      } catch (error) {
        console.warn('内容分析失败，使用降级策略:', error)
        return this.fallbackContentAnalysis(content)
      }
    },

    async generateContentVector(content: string): Promise<number[]> {
      try {
        const response = await this.makeRequestWithRetry(`${this.aiServiceUrl}/api/ai/embed-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content })
        })
        const result = await response.json()
        return result.vector
      } catch (error) {
        console.warn('内容向量生成失败，使用降级策略:', error)
        return this.generateFallbackVector(content)
      }
    },

    async extractSpectralTags(content: string): Promise<string[]> {
      try {
        const response = await this.makeRequestWithRetry(`${this.aiServiceUrl}/api/ai/extract-tags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        })
        const result = await response.json()
        return result.tags
      } catch (error) {
        console.warn('光谱标签提取失败，使用降级策略:', error)
        return this.fallbackTagExtraction(content)
      }
    }
  }

  // 降级内容分析
  private fallbackContentAnalysis(content: string): ContentAnalysis {
    const positiveWords = ['好', '棒', '喜欢', '爱', '开心', '快乐', '美丽', '优秀']
    const negativeWords = ['坏', '差', '讨厌', '恨', '难过', '痛苦', '丑陋', '糟糕']
    
    const positiveCount = positiveWords.filter(word => content.includes(word)).length
    const negativeCount = negativeWords.filter(word => content.includes(word)).length
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (positiveCount > negativeCount) sentiment = 'positive'
    else if (negativeCount > positiveCount) sentiment = 'negative'
    
    const topics: string[] = []
    const topicKeywords = {
      '生活': ['生活', '日常', '今天', '昨天', '明天'],
      '科技': ['科技', '技术', 'AI', '人工智能', '编程'],
      '艺术': ['艺术', '音乐', '绘画', '创作', '设计'],
      '旅行': ['旅行', '旅游', '风景', '景点', '度假'],
      '美食': ['美食', '食物', '餐厅', '烹饪', '味道']
    }
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        topics.push(topic)
      }
    }
    
    const keywords = content.split(/\s+/).filter(word => word.length > 1).slice(0, 5)
    const readability = Math.min(100, Math.max(0, 100 - content.length * 0.1))
    const engagement_potential = Math.min(100, Math.max(0,
      readability * 0.5 + positiveCount * 10 + topics.length * 15
    ))
    
    return { sentiment, topics, keywords, readability, engagement_potential }
  }

  // 降级标签提取
  private fallbackTagExtraction(content: string): string[] {
    const analysis = this.fallbackContentAnalysis(content)
    return [...analysis.topics, ...analysis.keywords.slice(0, 3)].slice(0, 5)
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
