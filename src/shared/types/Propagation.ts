// src/shared/types/Propagation.ts
// 基于《德道经》第54章"修之于身，其德乃真"的传播层级机制

export interface PropagationLevel {
  level: number;
  levelName: string;
  infectedCount: number;
  infectionRate: number;
  unlockedAt: Date;
  isUnlocked: boolean;
  geographicInfo: GeographicLevel;
}

export interface VirusPropagation {
  virusId: string;
  originLocation: Location;
  currentLevel: number;
  propagationLevels: PropagationLevel[];
  totalInfected: number;
  infectionRate: number;
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export interface PropagationEvent {
  virusId: string;
  userId: string;
  userLocation: Location;
  level: number;
  levelName: string;
  infectedAt: Date;
  propagationDelay: number; // 分钟
}

// 地理层级信息
export interface GeographicLevel {
  level: number;
  levelName: string;
  coverage: Location[];
  unlockCondition: {
    minInfected: number;
    minInfectionRate: number;
    requiredLevels?: number[];
  };
  delay: {
    min: number;
    max: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  district: string;
  city: string;
  country: string;
}
