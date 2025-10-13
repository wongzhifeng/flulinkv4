// 向量数据库操作接口

export interface VectorSearchResult {
  id: string
  distance: number
  metadata?: Record<string, any>
}

export interface VectorCollection {
  name: string
  dimension: number
  distance_metric: 'cosine' | 'euclidean' | 'dot'
}

export interface VectorSearchOptions {
  limit?: number
  minDistance?: number
  maxDistance?: number
  includeMetadata?: boolean
}

// 向量数据库客户端
export class VectorDBClient {
  private aiServiceUrl: string

  constructor(aiServiceUrl: string = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000') {
    this.aiServiceUrl = aiServiceUrl
  }

  // 用户兴趣向量操作
  async addUserInterestVector(userId: string, vector: number[]): Promise<void> {
    await fetch(`${this.aiServiceUrl}/api/vector/user-interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, vector })
    })
  }

  async updateUserInterestVector(userId: string, vector: number[]): Promise<void> {
    await fetch(`${this.aiServiceUrl}/api/vector/user-interests/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vector })
    })
  }

  async findSimilarUsers(queryVector: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    const response = await fetch(`${this.aiServiceUrl}/api/vector/user-interests/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query_vector: queryVector, 
        limit: options.limit || 10,
        min_distance: options.minDistance,
        max_distance: options.maxDistance
      })
    })
    const result = await response.json()
    return result.results
  }

  // 内容相似度向量操作
  async addContentVector(contentId: string, vector: number[]): Promise<void> {
    await fetch(`${this.aiServiceUrl}/api/vector/content-similarity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: contentId, vector })
    })
  }

  async findSimilarContent(queryVector: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    const response = await fetch(`${this.aiServiceUrl}/api/vector/content-similarity/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query_vector: queryVector, 
        limit: options.limit || 20,
        min_distance: options.minDistance,
        max_distance: options.maxDistance
      })
    })
    const result = await response.json()
    return result.results
  }

  // 星团兼容性向量操作
  async addClusterVector(clusterId: string, vector: number[]): Promise<void> {
    await fetch(`${this.aiServiceUrl}/api/vector/cluster-compatibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cluster_id: clusterId, vector })
    })
  }

  async findCompatibleClusters(userVector: number[], options: VectorSearchOptions = {}): Promise<VectorSearchResult[]> {
    const response = await fetch(`${this.aiServiceUrl}/api/vector/cluster-compatibility/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query_vector: userVector, 
        limit: options.limit || 5,
        min_distance: options.minDistance,
        max_distance: options.maxDistance
      })
    })
    const result = await response.json()
    return result.results
  }

  // 批量操作
  async batchAddVectors(collection: string, vectors: Array<{ id: string, vector: number[] }>): Promise<void> {
    await fetch(`${this.aiServiceUrl}/api/vector/${collection}/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vectors })
    })
  }

  async batchSearch(collection: string, queries: Array<{ id: string, vector: number[] }>, options: VectorSearchOptions = {}): Promise<Record<string, VectorSearchResult[]>> {
    const response = await fetch(`${this.aiServiceUrl}/api/vector/${collection}/batch-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        queries, 
        limit: options.limit || 10,
        min_distance: options.minDistance,
        max_distance: options.maxDistance
      })
    })
    const result = await response.json()
    return result.results
  }

  // 集合管理
  async createCollection(name: string, dimension: number, distanceMetric: 'cosine' | 'euclidean' | 'dot' = 'cosine'): Promise<void> {
    await fetch(`${this.aiServiceUrl}/api/vector/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        dimension, 
        distance_metric: distanceMetric 
      })
    })
  }

  async listCollections(): Promise<VectorCollection[]> {
    const response = await fetch(`${this.aiServiceUrl}/api/vector/collections`)
    const result = await response.json()
    return result.collections
  }

  async deleteCollection(name: string): Promise<void> {
    await fetch(`${this.aiServiceUrl}/api/vector/collections/${name}`, {
      method: 'DELETE'
    })
  }

  // 健康检查
  async healthCheck(): Promise<{ status: string, collections: number, total_vectors: number }> {
    const response = await fetch(`${this.aiServiceUrl}/api/vector/health`)
    return response.json()
  }
}

// 全局向量数据库客户端实例
export const vectorDB = new VectorDBClient()

// React Hook for Vector DB
export function useVectorDB() {
  return vectorDB
}

// 特定功能的 Hook
export function useUserInterestSearch() {
  return {
    findSimilarUsers: (queryVector: number[], options?: VectorSearchOptions) => 
      vectorDB.findSimilarUsers(queryVector, options),
    addUserVector: (userId: string, vector: number[]) => 
      vectorDB.addUserInterestVector(userId, vector),
    updateUserVector: (userId: string, vector: number[]) => 
      vectorDB.updateUserInterestVector(userId, vector)
  }
}

export function useContentSimilaritySearch() {
  return {
    findSimilarContent: (queryVector: number[], options?: VectorSearchOptions) => 
      vectorDB.findSimilarContent(queryVector, options),
    addContentVector: (contentId: string, vector: number[]) => 
      vectorDB.addContentVector(contentId, vector)
  }
}

export function useClusterCompatibilitySearch() {
  return {
    findCompatibleClusters: (userVector: number[], options?: VectorSearchOptions) => 
      vectorDB.findCompatibleClusters(userVector, options),
    addClusterVector: (clusterId: string, vector: number[]) => 
      vectorDB.addClusterVector(clusterId, vector)
  }
}
