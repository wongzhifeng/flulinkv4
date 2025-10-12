// src/lib/auth/jwt.ts
// JWT令牌管理服务 - 基于《德道经》"修之于身，其德乃真"哲学

import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

// JWT配置 - 对应《德道经》"道常无为而无不为"
const JWT_SECRET = process.env.JWT_SECRET || 'flulink-secret-key-2025';
const JWT_EXPIRES_IN = '15m'; // 15分钟过期
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7天过期

// 令牌载荷接口
export interface TokenPayload {
  userId: string;
  email: string;
  userType: 'free' | 'premium' | 'enterprise';
  sessionId: string;
  iat?: number;
  exp?: number;
}

// 刷新令牌载荷接口
export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// 生成访问令牌 - 对应"修之于身，其德乃真"
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  try {
    const tokenPayload: TokenPayload = {
      ...payload,
      sessionId: payload.sessionId || nanoid(),
    };
    
    return jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'flulink',
      audience: 'flulink-users',
    });
  } catch (error) {
    console.error('❌ 生成访问令牌失败:', error);
    throw new Error('令牌生成失败');
  }
}

// 生成刷新令牌 - 对应"无为而无不为"
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  try {
    const tokenPayload: RefreshTokenPayload = {
      ...payload,
      sessionId: payload.sessionId || nanoid(),
      tokenVersion: payload.tokenVersion || 1,
    };
    
    return jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'flulink',
      audience: 'flulink-refresh',
    });
  } catch (error) {
    console.error('❌ 生成刷新令牌失败:', error);
    throw new Error('刷新令牌生成失败');
  }
}

// 验证访问令牌 - 对应"知人者智"
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'flulink',
      audience: 'flulink-users',
    }) as TokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('❌ 访问令牌验证失败:', error);
    return null;
  }
}

// 验证刷新令牌 - 对应"自知者明"
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'flulink',
      audience: 'flulink-refresh',
    }) as RefreshTokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('❌ 刷新令牌验证失败:', error);
    return null;
  }
}

// 解码令牌（不验证） - 对应"无为而治"
export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('❌ 令牌解码失败:', error);
    return null;
  }
}

// 检查令牌是否即将过期 - 对应"知人者智"
export function isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
  try {
    const decoded = decodeToken(token) as TokenPayload;
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;
    const thresholdSeconds = thresholdMinutes * 60;
    
    return timeUntilExpiry <= thresholdSeconds;
  } catch (error) {
    console.error('❌ 检查令牌过期时间失败:', error);
    return true;
  }
}

// 生成令牌对 - 对应"道生一，一生二"
export function generateTokenPair(userId: string, email: string, userType: 'free' | 'premium' | 'enterprise') {
  const sessionId = nanoid();
  
  const accessToken = generateAccessToken({
    userId,
    email,
    userType,
    sessionId,
  });
  
  const refreshToken = generateRefreshToken({
    userId,
    sessionId,
    tokenVersion: 1,
  });
  
  return {
    accessToken,
    refreshToken,
    sessionId,
    expiresIn: 15 * 60, // 15分钟，单位：秒
  };
}

// 令牌黑名单管理 - 对应"无为而无不为"
const tokenBlacklist = new Set<string>();

export function addToBlacklist(token: string): void {
  tokenBlacklist.add(token);
}

export function isTokenBlacklisted(token: string): boolean {
  return tokenBlacklist.has(token);
}

export function removeFromBlacklist(token: string): void {
  tokenBlacklist.delete(token);
}

// 清理过期令牌 - 对应"无为而治"
export function cleanupExpiredTokens(): void {
  // 这里可以实现更复杂的清理逻辑
  // 目前使用简单的Set管理
  console.log('🧹 清理过期令牌，当前黑名单大小:', tokenBlacklist.size);
}
