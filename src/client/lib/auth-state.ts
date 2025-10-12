// src/client/lib/auth-state.ts
// 用户认证状态管理 - 基于《德道经》"修之于身，其德乃真"哲学
// 使用Solid.js细粒度响应式状态管理

import { createSignal, createMemo, createEffect } from 'solid-js';

// 用户信息接口
export interface User {
  id: string;
  username: string;
  email: string;
  userType: 'free' | 'premium' | 'enterprise';
  createdAt: string;
  avatarUrl?: string;
}

// 认证令牌接口
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresIn: number;
}

// 认证状态接口
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

// 全局认证状态 - 对应《德道经》"道生一"理念
const [authState, setAuthState] = createSignal<AuthState>({
  isAuthenticated: false,
  user: null,
  tokens: null,
  isLoading: false,
  error: null
});

// 派生状态 - 使用createMemo实现细粒度响应
export const isAuthenticated = createMemo(() => authState().isAuthenticated);
export const currentUser = createMemo(() => authState().user);
export const authTokens = createMemo(() => authState().tokens);
export const authLoading = createMemo(() => authState().isLoading);
export const authError = createMemo(() => authState().error);

// 用户类型检查 - 对应《德道经》"德者，得也"
export const isPremiumUser = createMemo(() => 
  currentUser()?.userType === 'premium' || currentUser()?.userType === 'enterprise'
);

export const isEnterpriseUser = createMemo(() => 
  currentUser()?.userType === 'enterprise'
);

// 认证状态管理函数
export const authActions = {
  // 设置加载状态
  setLoading: (loading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading: loading }));
  },

  // 设置错误信息
  setError: (error: string | null) => {
    setAuthState(prev => ({ ...prev, error }));
  },

  // 登录成功 - 对应《德道经》"修之于身，其德乃真"
  loginSuccess: (user: User, tokens: AuthTokens) => {
    setAuthState({
      isAuthenticated: true,
      user,
      tokens,
      isLoading: false,
      error: null
    });
    
    // 保存到本地存储
    localStorage.setItem('flulink_user', JSON.stringify(user));
    localStorage.setItem('flulink_tokens', JSON.stringify(tokens));
  },

  // 登出 - 对应《德道经》"无为而治"
  logout: () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      tokens: null,
      isLoading: false,
      error: null
    });
    
    // 清除本地存储
    localStorage.removeItem('flulink_user');
    localStorage.removeItem('flulink_tokens');
  },

  // 更新用户信息
  updateUser: (user: User) => {
    setAuthState(prev => ({ 
      ...prev, 
      user: { ...prev.user, ...user }
    }));
    
    // 更新本地存储
    localStorage.setItem('flulink_user', JSON.stringify(user));
  },

  // 刷新令牌
  refreshTokens: (tokens: AuthTokens) => {
    setAuthState(prev => ({ 
      ...prev, 
      tokens: { ...prev.tokens, ...tokens }
    }));
    
    // 更新本地存储
    localStorage.setItem('flulink_tokens', JSON.stringify(tokens));
  },

  // 从本地存储恢复状态
  restoreFromStorage: () => {
    try {
      const storedUser = localStorage.getItem('flulink_user');
      const storedTokens = localStorage.getItem('flulink_tokens');
      
      if (storedUser && storedTokens) {
        const user = JSON.parse(storedUser);
        const tokens = JSON.parse(storedTokens);
        
        // 检查令牌是否过期
        const now = Date.now();
        const tokenExpiry = tokens.expiresIn * 1000; // expiresIn是秒数
        
        if (now < tokenExpiry) {
          setAuthState({
            isAuthenticated: true,
            user,
            tokens,
            isLoading: false,
            error: null
          });
        } else {
          // 令牌过期，清除存储
          localStorage.removeItem('flulink_user');
          localStorage.removeItem('flulink_tokens');
        }
      }
    } catch (error) {
      console.error('恢复认证状态失败:', error);
      localStorage.removeItem('flulink_user');
      localStorage.removeItem('flulink_tokens');
    }
  }
};

// 副作用 - 应用启动时恢复认证状态
createEffect(() => {
  authActions.restoreFromStorage();
});

// 导出认证状态和操作
export { authState, authActions };
