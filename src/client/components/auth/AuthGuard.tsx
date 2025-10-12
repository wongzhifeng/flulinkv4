// src/client/components/auth/AuthGuard.tsx
// 认证路由守卫 - 基于《德道经》"德者，得也"哲学
// 保护需要认证的页面和功能

import { createEffect, createMemo, Show } from 'solid-js';
import { isAuthenticated, currentUser, authLoading } from '../../lib/auth-state';
import AuthPage from './AuthPage';

interface AuthGuardProps {
  children: any;
  requireAuth?: boolean;
  requirePremium?: boolean;
  requireEnterprise?: boolean;
  fallback?: any;
  onAuthRequired?: () => void;
}

export default function AuthGuard(props: AuthGuardProps) {
  // 权限检查 - 对应《德道经》"德者，得也"
  const hasRequiredAuth = createMemo(() => {
    if (!props.requireAuth) return true;
    return isAuthenticated();
  });

  const hasRequiredPremium = createMemo(() => {
    if (!props.requirePremium) return true;
    const user = currentUser();
    return user?.userType === 'premium' || user?.userType === 'enterprise';
  });

  const hasRequiredEnterprise = createMemo(() => {
    if (!props.requireEnterprise) return true;
    const user = currentUser();
    return user?.userType === 'enterprise';
  });

  const canAccess = createMemo(() => {
    return hasRequiredAuth() && hasRequiredPremium() && hasRequiredEnterprise();
  });

  // 权限不足时的处理
  const handleAuthRequired = () => {
    console.log('需要认证才能访问此页面');
    props.onAuthRequired?.();
  };

  // 权限检查副作用
  createEffect(() => {
    if (props.requireAuth && !isAuthenticated() && !authLoading()) {
      handleAuthRequired();
    }
  });

  return (
    <Show
      when={canAccess()}
      fallback={
        <Show
          when={props.fallback}
          fallback={
            <Show
              when={props.requireAuth && !isAuthenticated()}
              fallback={
                <div class="auth-guard-error">
                  <div class="error-container">
                    <h2>🚫 权限不足</h2>
                    <p>
                      {props.requireEnterprise
                        ? '此功能需要企业版权限'
                        : props.requirePremium
                        ? '此功能需要高级版权限'
                        : '您没有访问此页面的权限'}
                    </p>
                    <div class="error-actions">
                      <button 
                        class="error-btn primary"
                        onClick={() => window.location.href = '/profile'}
                      >
                        查看个人资料
                      </button>
                      <button 
                        class="error-btn secondary"
                        onClick={() => window.location.href = '/'}
                      >
                        返回首页
                      </button>
                    </div>
                  </div>
                </div>
              }
            >
              <AuthPage onAuthSuccess={handleAuthRequired} />
            </Show>
          }
        >
          {props.fallback}
        </Show>
      }
    >
      {props.children}
    </Show>
  );
}

// 高阶组件 - 用于包装需要认证的组件
export function withAuthGuard<T extends {}>(
  Component: any,
  guardProps: Omit<AuthGuardProps, 'children'> = {}
) {
  return function GuardedComponent(props: T) {
    return (
      <AuthGuard {...guardProps}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// 权限检查Hook - 对应《德道经》"道法自然"
export function useAuthGuard() {
  const checkAuth = (requireAuth: boolean = true) => {
    if (requireAuth && !isAuthenticated()) {
      throw new Error('需要认证才能访问此功能');
    }
  };

  const checkPremium = () => {
    const user = currentUser();
    if (!user || (user.userType !== 'premium' && user.userType !== 'enterprise')) {
      throw new Error('需要高级版权限才能访问此功能');
    }
  };

  const checkEnterprise = () => {
    const user = currentUser();
    if (!user || user.userType !== 'enterprise') {
      throw new Error('需要企业版权限才能访问此功能');
    }
  };

  return {
    checkAuth,
    checkPremium,
    checkEnterprise,
    isAuthenticated: isAuthenticated(),
    currentUser: currentUser(),
    authLoading: authLoading(),
  };
}
