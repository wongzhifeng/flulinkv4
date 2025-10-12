// src/server/api/auth.ts
// 认证API端点 - 基于《德道经》"修之于身，其德乃真"哲学

import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile 
} from '../../lib/auth/auth-service';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleCORS,
  requireAuth,
  optionalAuth,
  logRequest,
  rateLimitMiddleware
} from '../../lib/auth/middleware';

// 用户注册API - 对应《德道经》"道生一"
export async function handleRegister(request: Request): Promise<Response> {
  // 处理CORS预检请求
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;
  
  // 速率限制检查
  if (!rateLimitMiddleware(request, 10, 15 * 60 * 1000)) { // 15分钟内最多10次注册
    return createErrorResponse('注册请求过于频繁，请稍后再试', 429);
  }
  
  try {
    const body = await request.json();
    const result = await registerUser(body);
    
    logRequest(request);
    console.log('✅ 用户注册成功:', result.user.id);
    
    return createSuccessResponse({
      user: result.user,
      tokens: result.tokens,
    }, '注册成功');
  } catch (error) {
    console.error('❌ 用户注册失败:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : '注册失败',
      400,
      error
    );
  }
}

// 用户登录API - 对应"一生二"
export async function handleLogin(request: Request): Promise<Response> {
  // 处理CORS预检请求
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;
  
  // 速率限制检查
  if (!rateLimitMiddleware(request, 20, 15 * 60 * 1000)) { // 15分钟内最多20次登录
    return createErrorResponse('登录请求过于频繁，请稍后再试', 429);
  }
  
  try {
    const body = await request.json();
    const result = await loginUser(body);
    
    logRequest(request);
    console.log('✅ 用户登录成功:', result.user.id);
    
    return createSuccessResponse({
      user: result.user,
      tokens: result.tokens,
    }, '登录成功');
  } catch (error) {
    console.error('❌ 用户登录失败:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : '登录失败',
      401,
      error
    );
  }
}

// 用户登出API - 对应"二生三"
export async function handleLogout(request: Request): Promise<Response> {
  // 处理CORS预检请求
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;
  
  try {
    // 获取令牌
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('未提供有效的认证令牌', 401);
    }
    
    const token = authHeader.substring(7);
    const result = await logoutUser(token);
    
    logRequest(request);
    console.log('✅ 用户登出成功');
    
    return createSuccessResponse(result, '登出成功');
  } catch (error) {
    console.error('❌ 用户登出失败:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : '登出失败',
      400,
      error
    );
  }
}

// 获取用户信息API - 对应"知人者智"
export async function handleGetProfile(request: Request): Promise<Response> {
  // 处理CORS预检请求
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;
  
  try {
    // 验证认证
    const authContext = requireAuth(request as any);
    
    const result = await getUserProfile(authContext.userId);
    
    logRequest(request, authContext);
    console.log('✅ 获取用户信息成功:', authContext.userId);
    
    return createSuccessResponse(result.user, '获取用户信息成功');
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : '获取用户信息失败',
      401,
      error
    );
  }
}

// 更新用户信息API - 对应"自知者明"
export async function handleUpdateProfile(request: Request): Promise<Response> {
  // 处理CORS预检请求
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;
  
  try {
    // 验证认证
    const authContext = requireAuth(request as any);
    
    const body = await request.json();
    const result = await updateUserProfile(authContext.userId, body);
    
    logRequest(request, authContext);
    console.log('✅ 更新用户信息成功:', authContext.userId);
    
    return createSuccessResponse(result, '用户信息更新成功');
  } catch (error) {
    console.error('❌ 更新用户信息失败:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : '更新用户信息失败',
      400,
      error
    );
  }
}

// 令牌刷新API - 对应"无为而无不为"
export async function handleRefreshToken(request: Request): Promise<Response> {
  // 处理CORS预检请求
  const corsResponse = handleCORS(request);
  if (corsResponse) return corsResponse;
  
  try {
    const body = await request.json();
    const { refreshToken } = body;
    
    if (!refreshToken) {
      return createErrorResponse('未提供刷新令牌', 400);
    }
    
    // 这里应该实现刷新令牌的逻辑
    // 暂时返回错误，提示需要实现
    return createErrorResponse('令牌刷新功能暂未实现', 501);
  } catch (error) {
    console.error('❌ 令牌刷新失败:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : '令牌刷新失败',
      400,
      error
    );
  }
}

// 健康检查API - 对应"无为而治"
export async function handleAuthHealth(request: Request): Promise<Response> {
  return createSuccessResponse({
    status: 'healthy',
    service: 'auth',
    timestamp: new Date().toISOString(),
  }, '认证服务正常');
}
