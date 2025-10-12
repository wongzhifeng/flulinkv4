// src/client/components/auth/AuthPage.tsx
// 认证页面组件 - 基于《德道经》"无为而治"哲学
// 统一管理登录和注册界面

import { createSignal, createEffect } from 'solid-js';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { isAuthenticated, currentUser } from '../../lib/auth-state';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export default function AuthPage(props: AuthPageProps) {
  // 页面状态 - 使用Solid.js细粒度响应式
  const [authMode, setAuthMode] = createSignal<'login' | 'register'>('login');

  // 切换认证模式
  const switchToLogin = () => setAuthMode('login');
  const switchToRegister = () => setAuthMode('register');

  // 认证成功回调
  const handleAuthSuccess = () => {
    console.log('认证成功，用户:', currentUser());
    props.onAuthSuccess?.();
  };

  // 如果已经认证，显示用户信息
  createEffect(() => {
    if (isAuthenticated()) {
      console.log('用户已认证:', currentUser());
    }
  });

  return (
    <div class="auth-page">
      <div class="auth-container">
        {/* 页面标题和描述 */}
        <div class="auth-page-header">
          <h1>🦠 FluLink</h1>
          <p class="auth-subtitle">
            如流感般扩散，连接你在意的每个角落
          </p>
          <p class="auth-description">
            基于《德道经》"无为而治"哲学的分布式流感式社交网络
          </p>
        </div>

        {/* 认证模式切换 */}
        <div class="auth-mode-switcher">
          <button
            class={`mode-btn ${authMode() === 'login' ? 'active' : ''}`}
            onClick={switchToLogin}
          >
            登录
          </button>
          <button
            class={`mode-btn ${authMode() === 'register' ? 'active' : ''}`}
            onClick={switchToRegister}
          >
            注册
          </button>
        </div>

        {/* 认证表单 */}
        <div class="auth-form-wrapper">
          {authMode() === 'login' ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={switchToRegister}
            />
          ) : (
            <RegisterForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={switchToLogin}
            />
          )}
        </div>

        {/* 页面底部信息 */}
        <div class="auth-page-footer">
          <div class="philosophy-section">
            <h3>《德道经》哲学基础</h3>
            <div class="philosophy-quotes">
              <blockquote>
                "道生一，一生二，二生三，三生万物。"
                <footer>— 道法自然</footer>
              </blockquote>
              <blockquote>
                "修之于身，其德乃真；修之于家，其德乃余。"
                <footer>— 个人修养</footer>
              </blockquote>
              <blockquote>
                "无为而治，道法自然。"
                <footer>— 系统设计</footer>
              </blockquote>
            </div>
          </div>

          <div class="features-section">
            <h3>核心特性</h3>
            <div class="features-list">
              <div class="feature-item">
                <span class="feature-icon">🌍</span>
                <span class="feature-text">边缘计算</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🔒</span>
                <span class="feature-text">安全认证</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">⚡</span>
                <span class="feature-text">高性能</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎯</span>
                <span class="feature-text">精准传播</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
