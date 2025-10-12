// src/shared/types/VirusStrain.ts
// 基于《德道经》第37章"道常无为而无不为"的毒株传播机制

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  city: string;
  country: string;
}

export interface GeographicLevel {
  level: 1 | 2 | 3 | 4 | 5; // 1:小区 2:临近小区 3:街道 4:行政区 5:跨国
  name: string;
  coverage: Location[];
  unlockCondition: {
    minInfected: number;
    minInfectionRate: number;
    requiredLevels?: number[];
  };
  delay: {
    min: number; // 分钟
    max: number; // 分钟
  };
}

// 毒株类型 - 对应《德道经》的"道"的不同表现形式
export type StrainType = 'life' | 'opinion' | 'interest' | 'super';

export interface VirusStrain {
  id: string;
  content: string;
  author: string;
  authorId: string;
  location: Location;
  type: StrainType; // 生活/观点/兴趣/超级毒株
  tags: string[];
  susceptibleTags: string[]; // 易感标签
  createdAt: Date;
  expiresAt: Date;
  infectionStats: {
    totalInfected: number;
    infectionRate: number;
    geographicSpread: GeographicSpread[];
  };
  isSuperFlu: boolean;
  isDormant: boolean;
  dormantUntil?: Date;
}

export interface GeographicSpread {
  level: number;
  levelName: string;
  infectedCount: number;
  infectionRate: number;
  unlockedAt: Date;
  isUnlocked: boolean;
}

export interface InfectionRecord {
  userId: string;
  strainId: string;
  infectedAt: Date;
  geographicLevel: number;
  sourceUserId?: string; // 感染来源用户
}

// 用户类型 - 对应《德道经》的"修身齐家治国"层次
export type UserType = 'free' | 'basic' | 'super' | 'enterprise';

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  location: Location;
  userType: UserType;
  attractionTags: {
    tag: string;
    strength: 'weak' | 'medium' | 'strong';
  }[];
  immuneTags: string[]; // 免疫标签
  infectionHistory: InfectionRecord[];
  spreadHistory: {
    strainId: string;
    totalInfected: number;
    geographicReach: number[];
  }[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'regional' | 'global' | 'special';
  unlockedAt: Date;
  icon: string;
}

// 传播任务 - 对应《德道经》的"无为而治"理念
export interface PropagationTask {
  id: string;
  title: string;
  description: string;
  targetGeographicLevel: number;
  targetInfectedCount: number;
  timeLimit: number; // 小时
  reward: {
    points: number;
    coupons?: string[];
  };
  creatorId: string;
  participants: string[];
  status: 'active' | 'completed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}
