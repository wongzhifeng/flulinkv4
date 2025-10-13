import { PocketBase } from 'pocketbase'

// PocketBase 客户端配置
export const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090')

// 类型定义
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  location?: {
    lat: number
    lng: number
    precision: string
  }
  interest_vector?: number[]
  interaction_history?: Record<string, any>
  privacy_settings?: Record<string, any>
  ai_preferences?: Record<string, any>
  created: string
  updated: string
}

export interface StarSeed {
  id: string
  creator: string
  content: string
  content_type: 'text' | 'image' | 'audio' | 'mixed'
  media_files?: string[]
  location?: {
    lat: number
    lng: number
    precision: string
  }
  content_vector?: number[]
  spectral_tags?: string[]
  luminosity: number
  resonance_count: number
  propagation_path?: Record<string, any>
  status: 'active' | 'dormant' | 'archived'
  ai_generated_metadata?: Record<string, any>
  created: string
  updated: string
}

export interface StarCluster {
  id: string
  members: string[]
  core_users: string[]
  resonance_score: number
  geographic_center?: {
    lat: number
    lng: number
  }
  activity_level: number
  spectral_diversity?: Record<string, any>
  expiration_time: string
  cluster_vector?: number[]
  created: string
  updated: string
}

export interface Interaction {
  id: string
  user: string
  star_seed: string
  interaction_type: 'view' | 'like' | 'comment' | 'share' | 'resonate'
  interaction_strength: number
  context_data?: Record<string, any>
  ai_analyzed_sentiment?: Record<string, any>
  created: string
  updated: string
}

// API 工具函数
export class PocketBaseAPI {
  // 用户相关
  async getCurrentUser(): Promise<User | null> {
    try {
      return pb.authStore.model as User
    } catch {
      return null
    }
  }

  async login(email: string, password: string): Promise<User> {
    const authData = await pb.collection('users').authWithPassword(email, password)
    return authData.record as User
  }

  async register(username: string, email: string, password: string): Promise<User> {
    const userData = await pb.collection('users').create({
      username,
      email,
      password,
      passwordConfirm: password
    })
    return userData as User
  }

  // 星种相关
  async getStarSeeds(page: number = 1, perPage: number = 20): Promise<StarSeed[]> {
    const result = await pb.collection('star_seeds').getList(page, perPage, {
      sort: '-created',
      expand: 'creator'
    })
    return result.items as StarSeed[]
  }

  async createStarSeed(data: Partial<StarSeed>): Promise<StarSeed> {
    const result = await pb.collection('star_seeds').create(data)
    return result as StarSeed
  }

  async getStarSeed(id: string): Promise<StarSeed> {
    const result = await pb.collection('star_seeds').getOne(id, {
      expand: 'creator'
    })
    return result as StarSeed
  }

  // 星团相关
  async getStarClusters(page: number = 1, perPage: number = 20): Promise<StarCluster[]> {
    const result = await pb.collection('star_clusters').getList(page, perPage, {
      sort: '-resonance_score',
      expand: 'members,core_users'
    })
    return result.items as StarCluster[]
  }

  async createStarCluster(data: Partial<StarCluster>): Promise<StarCluster> {
    const result = await pb.collection('star_clusters').create(data)
    return result as StarCluster
  }

  // 互动相关
  async createInteraction(data: Partial<Interaction>): Promise<Interaction> {
    const result = await pb.collection('interactions').create(data)
    return result as Interaction
  }

  async getInteractions(starSeedId: string): Promise<Interaction[]> {
    const result = await pb.collection('interactions').getList(1, 50, {
      filter: `star_seed = "${starSeedId}"`,
      expand: 'user'
    })
    return result.items as Interaction[]
  }

  // 实时订阅
  subscribeToStarSeeds(callback: (record: StarSeed) => void) {
    return pb.collection('star_seeds').subscribe('*', (e) => {
      callback(e.record as StarSeed)
    })
  }

  subscribeToInteractions(callback: (record: Interaction) => void) {
    return pb.collection('interactions').subscribe('*', (e) => {
      callback(e.record as Interaction)
    })
  }
}

export const api = new PocketBaseAPI()
