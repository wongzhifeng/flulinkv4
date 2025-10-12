// src/lib/auth/middleware.ts
// 认证中间件 - 基于《德道经》"修之于身，其德乃真"哲学

import { verifyAccessToken, isTokenBlacklisted } from './jwt';
import { validateUserToken } from './auth-service';

// 认证中间件接口 - 对应《德道经》"道生一"
export interface AuthContext {
  userId: string;
  email: string;
  userType: 'free' | 'premium' | 'enterprise';
  sessionId: string;
  isAuthenticated: boolean;
}

// 请求扩展接口 - 对应"一生二"
export interface AuthenticatedRequest extends Request {
  auth?: AuthContext;
}

// 认证中间件 - 对应"修之于身，其德乃真"
export function authMiddleware(request: AuthenticatedRequest): AuthContext | null {
  try {
    // 从请求头获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
    
    // 检查令牌是否在黑名单中
    if (isTokenBlacklisted(token)) {
      console.log('❌ 令牌已被加入黑名单');
      return null;
    }
    
    // 验证令牌
    const userInfo = validateUserToken(token);
    if (!userInfo) {
      return null;
    }
    
    // 返回认证上下文
    const authContext: AuthContext = {
      userId: userInfo.userId,
      email: userInfo.email,
      userType: userInfo.userType,
      sessionId: userInfo.sessionId,
      isAuthenticated: true,
    };
    
    // 将认证信息附加到请求对象
    request.auth = authContext;
    
    return authContext;
  } catch (error) {
    console.error('❌ 认证中间件错误:', error);
    return null;
  }
}

// 权限检查中间件 - 对应"知人者智"
export function requireAuth(request: AuthenticatedRequest): AuthContext {
  const authContext = authMiddleware(request);
  if (!authContext) {
    throw new Error('未授权访问');
  }
  return authContext;
}

// 角色权限检查 - 对应"自知者明"
export function requireRole(allowedRoles: ('free' | 'premium' | 'enterprise')[]) {
  return function(request: AuthenticatedRequest): AuthContext {
    const authContext = requireAuth(request);
    
    if (!allowedRoles.includes(authContext.userType)) {
      throw new Error('权限不足');
    }
    
    return authContext;
  };
}

// 高级权限检查 - 对应"无为而治"
export function requirePremium(request: AuthenticatedRequest): AuthContext {
  return requireRole(['premium', 'enterprise'])(request);
}

export function requireEnterprise(request: AuthenticatedRequest): AuthContext {
  return requireRole(['enterprise'])(request);
}

// 可选认证中间件 - 对应"无为而无不为"
export function optionalAuth(request: AuthenticatedRequest): AuthContext | null {
  try {
    return authMiddleware(request);
  } catch (error) {
    // 可选认证失败时不抛出错误
    return null;
  }
}

// API响应包装器 - 对应"道生一，一生二"
export function createAuthResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 错误响应包装器 - 对应"知人者智"
export function createErrorResponse(message: string, status: number = 400, error?: any) {
  return new Response(JSON.stringify({
    success: false,
    message,
    error: error?.message || error,
    timestamp: new Date().toISOString(),
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 成功响应包装器 - 对应"自知者明"
export function createSuccessResponse(data: any, message: string = '操作成功') {
  return new Response(JSON.stringify({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// CORS预检请求处理 - 对应"无为而治"
export function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  return null;
}

// 请求日志中间件 - 对应"无为而无不为"
export function logRequest(request: Request, authContext?: AuthContext) {
  const method = request.method;
  const url = request.url;
  const userAgent = request.headers.get('User-Agent') || 'Unknown';
  const ip = request.headers.get('X-Forwarded-For') || 'Unknown';
  
  const logData = {
    method,
    url,
    userAgent,
    ip,
    userId: authContext?.userId || 'Anonymous',
    userType: authContext?.userType || 'guest',
    timestamp: new Date().toISOString(),
  };
  
  console.log('📝 API请求:', JSON.stringify(logData, null, 2));
}

// 速率限制中间件 - 对应"知人者智"
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimitMiddleware(
  request: Request,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15分钟
): boolean {
  const ip = request.headers.get('X-Forwarded-For') || 'unknown';
  const now = Date.now();
  
  const rateLimitData = rateLimitMap.get(ip);
  
  if (!rateLimitData || now > rateLimitData.resetTime) {
    // 重置或初始化
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (rateLimitData.count >= maxRequests) {
    console.log(`⚠️ 速率限制触发: ${ip}`);
    return false;
  }
  
  rateLimitData.count++;
  return true;
}
