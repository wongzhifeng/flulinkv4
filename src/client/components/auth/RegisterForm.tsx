// src/client/components/auth/RegisterForm.tsx
// 注册表单组件 - 基于《德道经》"修之于身，其德乃真"哲学
// 使用Solid.js响应式设计

import { createSignal, createEffect } from 'solid-js';
import { authAPI, type RegisterRequest } from '../../lib/auth-api';
import { authLoading, authError } from '../../lib/auth-state';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm(props: RegisterFormProps) {
  // 表单状态 - 使用Solid.js细粒度响应式
  const [formData, setFormData] = createSignal<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = createSignal<Record<string, string>>({});
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);

  // 密码强度检查 - 对应《德道经》"道法自然"
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthLevels = [
      { score: 0, label: '很弱', color: '#ef4444' },
      { score: 1, label: '弱', color: '#f59e0b' },
      { score: 2, label: '一般', color: '#eab308' },
      { score: 3, label: '强', color: '#10b981' },
      { score: 4, label: '很强', color: '#059669' },
      { score: 5, label: '极强', color: '#047857' },
    ];

    return strengthLevels[Math.min(score, 5)];
  };

  // 表单验证 - 对应《德道经》"道法自然"
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const data = formData();

    // 用户名验证
    if (!data.username) {
      errors.username = '请输入用户名';
    } else if (data.username.length < 3) {
      errors.username = '用户名至少需要3位字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.username = '用户名只能包含字母、数字和下划线';
    }

    // 邮箱验证
    if (!data.email) {
      errors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!data.password) {
      errors.password = '请输入密码';
    } else if (data.password.length < 8) {
      errors.password = '密码至少需要8位字符';
    } else if (!/[A-Z]/.test(data.password)) {
      errors.password = '密码必须包含至少一个大写字母';
    } else if (!/[a-z]/.test(data.password)) {
      errors.password = '密码必须包含至少一个小写字母';
    } else if (!/[0-9]/.test(data.password)) {
      errors.password = '密码必须包含至少一个数字';
    } else if (!/[^A-Za-z0-9]/.test(data.password)) {
      errors.password = '密码必须包含至少一个特殊字符';
    }

    // 确认密码验证
    if (!data.confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
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
      await authAPI.register(formData());
      props.onSuccess?.();
    } catch (error) {
      console.error('注册失败:', error);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof RegisterRequest) => (e: Event) => {
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  // 密码强度
  const passwordStrength = () => {
    const password = formData().password;
    return password ? getPasswordStrength(password) : null;
  };

  return (
    <div class="auth-form-container">
      <div class="auth-form">
        <div class="auth-header">
          <h2>🦠 加入 FluLink</h2>
          <p>如流感般扩散，连接你在意的每个角落</p>
        </div>

        <form onSubmit={handleSubmit} class="auth-form-content">
          {/* 用户名输入 */}
          <div class="form-group">
            <label for="username" class="form-label">
              用户名
            </label>
            <input
              id="username"
              type="text"
              value={formData().username}
              onInput={handleInputChange('username')}
              class={`form-input ${validationErrors().username ? 'error' : ''}`}
              placeholder="请输入用户名（3-20位字符）"
              disabled={authLoading()}
            />
            {validationErrors().username && (
              <div class="form-error">{validationErrors().username}</div>
            )}
          </div>

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
                placeholder="请输入密码（至少8位，包含大小写字母、数字和特殊字符）"
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
            
            {/* 密码强度指示器 */}
            {passwordStrength() && (
              <div class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill"
                    style={{ 
                      width: `${(passwordStrength()!.score / 5) * 100}%`,
                      'background-color': passwordStrength()!.color 
                    }}
                  />
                </div>
                <span 
                  class="strength-label"
                  style={{ color: passwordStrength()!.color }}
                >
                  密码强度: {passwordStrength()!.label}
                </span>
              </div>
            )}
            
            {validationErrors().password && (
              <div class="form-error">{validationErrors().password}</div>
            )}
          </div>

          {/* 确认密码输入 */}
          <div class="form-group">
            <label for="confirmPassword" class="form-label">
              确认密码
            </label>
            <div class="password-input-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword() ? 'text' : 'password'}
                value={formData().confirmPassword}
                onInput={handleInputChange('confirmPassword')}
                class={`form-input ${validationErrors().confirmPassword ? 'error' : ''}`}
                placeholder="请再次输入密码"
                disabled={authLoading()}
              />
              <button
                type="button"
                class="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                disabled={authLoading()}
              >
                {showConfirmPassword() ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors().confirmPassword && (
              <div class="form-error">{validationErrors().confirmPassword}</div>
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
                注册中...
              </>
            ) : (
              '注册'
            )}
          </button>
        </form>

        {/* 底部链接 */}
        <div class="auth-footer">
          <p>
            已有账号？{' '}
            <button
              type="button"
              class="auth-link"
              onClick={props.onSwitchToLogin}
              disabled={authLoading()}
            >
              立即登录
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
