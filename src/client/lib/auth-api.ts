// src/client/lib/auth-api.ts
// 认证API客户端 - 基于《德道经》"道法自然"哲学
// 处理与后端认证API的通信

import { authActions, type User, type AuthTokens } from './auth-state';

// API基础URL
const API_BASE_URL = 'https://flulink-v2.zeabur.app/api';

// 通用API请求函数
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API请求失败 ${endpoint}:`, error);
    throw error;
  }
}

// 带认证的API请求
async function authenticatedRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const tokens = authActions.authTokens();
  
  if (!tokens?.accessToken) {
    throw new Error('未找到认证令牌');
  }

  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${tokens.accessToken}`,
    },
  });
}

// 注册请求接口
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 登录请求接口
export interface LoginRequest {
  email: string;
  password: string;
}

// 认证响应接口
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

// 用户信息响应接口
export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

// 认证API客户端
export const authAPI = {
  // 用户注册 - 对应《德道经》"修之于身，其德乃真"
  async register(data: RegisterRequest): Promise<AuthResponse> {
    authActions.setLoading(true);
    authActions.setError(null);

    try {
      const response = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // 注册成功，自动登录
      authActions.loginSuccess(response.data.user, response.data.tokens);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败';
      authActions.setError(errorMessage);
      throw error;
    } finally {
      authActions.setLoading(false);
    }
  },

  // 用户登录 - 对应《德道经》"道法自然"
  async login(data: LoginRequest): Promise<AuthResponse> {
    authActions.setLoading(true);
    authActions.setError(null);

    try {
      const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // 登录成功
      authActions.loginSuccess(response.data.user, response.data.tokens);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      authActions.setError(errorMessage);
      throw error;
    } finally {
      authActions.setLoading(false);
    }
  },

  // 用户登出 - 对应《德道经》"无为而治"
  async logout(): Promise<void> {
    authActions.setLoading(true);

    try {
      await authenticatedRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('登出API调用失败:', error);
      // 即使API调用失败，也要清除本地状态
    } finally {
      authActions.logout();
      authActions.setLoading(false);
    }
  },

  // 获取用户信息
  async getProfile(): Promise<UserProfileResponse> {
    authActions.setLoading(true);
    authActions.setError(null);

    try {
      const response = await authenticatedRequest<UserProfileResponse>('/auth/profile', {
        method: 'GET',
      });

      // 更新用户信息
      authActions.updateUser(response.data.user);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取用户信息失败';
      authActions.setError(errorMessage);
      throw error;
    } finally {
      authActions.setLoading(false);
    }
  },

  // 更新用户信息
  async updateProfile(data: Partial<User>): Promise<UserProfileResponse> {
    authActions.setLoading(true);
    authActions.setError(null);

    try {
      const response = await authenticatedRequest<UserProfileResponse>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      // 更新用户信息
      authActions.updateUser(response.data.user);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新用户信息失败';
      authActions.setError(errorMessage);
      throw error;
    } finally {
      authActions.setLoading(false);
    }
  },

  // 刷新令牌
  async refreshToken(): Promise<AuthResponse> {
    const tokens = authActions.authTokens();
    
    if (!tokens?.refreshToken) {
      throw new Error('未找到刷新令牌');
    }

    try {
      const response = await apiRequest<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: tokens.refreshToken,
        }),
      });

      // 更新令牌
      authActions.refreshTokens(response.data.tokens);
      
      return response;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      // 刷新失败，清除认证状态
      authActions.logout();
      throw error;
    }
  },

  // 检查认证服务健康状态
  async checkHealth(): Promise<{ success: boolean; message: string }> {
    try {
      return await apiRequest('/auth/health', {
        method: 'GET',
      });
    } catch (error) {
      console.error('认证服务健康检查失败:', error);
      throw error;
    }
  }
};

// 导出API客户端
export default authAPI;
