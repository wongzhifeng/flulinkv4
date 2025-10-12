// src/client/components/auth/LoginForm.tsx
// 登录表单组件 - 基于《德道经》"修之于身，其德乃真"哲学
// 使用Solid.js响应式设计

import { createSignal, createEffect } from 'solid-js';
import { authAPI, type LoginRequest } from '../../lib/auth-api';
import { authLoading, authError } from '../../lib/auth-state';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm(props: LoginFormProps) {
  // 表单状态 - 使用Solid.js细粒度响应式
  const [formData, setFormData] = createSignal<LoginRequest>({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = createSignal<Record<string, string>>({});
  const [showPassword, setShowPassword] = createSignal(false);

  // 表单验证 - 对应《德道经》"道法自然"
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const data = formData();

    // 邮箱验证
    if (!data.email) {
      errors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!data.password) {
      errors.password = '请输入密码';
    } else if (data.password.length < 6) {
      errors.password = '密码至少需要6位字符';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 处理表单提交 - 对应《德道经》"无为而治"
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await authAPI.login(formData());
      props.onSuccess?.();
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof LoginRequest) => (e: Event) => {
    const target = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [field]: target.value }));
    
    // 清除对应字段的验证错误
    if (validationErrors()[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 切换密码显示
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div class="auth-form-container">
      <div class="auth-form">
        <div class="auth-header">
          <h2>🦠 登录 FluLink</h2>
          <p>如流感般扩散，连接你在意的每个角落</p>
        </div>

        <form onSubmit={handleSubmit} class="auth-form-content">
          {/* 邮箱输入 */}
          <div class="form-group">
            <label for="email" class="form-label">
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              value={formData().email}
              onInput={handleInputChange('email')}
              class={`form-input ${validationErrors().email ? 'error' : ''}`}
              placeholder="请输入您的邮箱地址"
              disabled={authLoading()}
            />
            {validationErrors().email && (
              <div class="form-error">{validationErrors().email}</div>
            )}
          </div>

          {/* 密码输入 */}
          <div class="form-group">
            <label for="password" class="form-label">
              密码
            </label>
            <div class="password-input-container">
              <input
                id="password"
                type={showPassword() ? 'text' : 'password'}
                value={formData().password}
                onInput={handleInputChange('password')}
                class={`form-input ${validationErrors().password ? 'error' : ''}`}
                placeholder="请输入您的密码"
                disabled={authLoading()}
              />
              <button
                type="button"
                class="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={authLoading()}
              >
                {showPassword() ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors().password && (
              <div class="form-error">{validationErrors().password}</div>
            )}
          </div>

          {/* 错误信息显示 */}
          {authError() && (
            <div class="auth-error">
              <span class="error-icon">⚠️</span>
              {authError()}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            class="auth-submit-btn"
            disabled={authLoading()}
          >
            {authLoading() ? (
              <>
                <span class="loading-spinner">⏳</span>
                登录中...
              </>
            ) : (
              '登录'
            )}
          </button>
        </form>

        {/* 底部链接 */}
        <div class="auth-footer">
          <p>
            还没有账号？{' '}
            <button
              type="button"
              class="auth-link"
              onClick={props.onSwitchToRegister}
              disabled={authLoading()}
            >
              立即注册
            </button>
          </p>
        </div>

        {/* 哲学引用 - 对应《德道经》"修之于身，其德乃真" */}
        <div class="auth-philosophy">
          <blockquote>
            "修之于身，其德乃真；修之于家，其德乃余；修之于乡，其德乃长。"
            <footer>— 《德道经》</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
