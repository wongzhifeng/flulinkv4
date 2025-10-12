// src/client/components/ui/LoadingSpinner.tsx
// 加载动画组件 - 基于《德道经》"道法自然"哲学
// 自然的加载动画，无为而治的用户体验

import { createSignal, createEffect, onCleanup } from 'solid-js';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export default function LoadingSpinner(props: LoadingSpinnerProps) {
  const {
    size = 'medium',
    color = 'var(--primary-color)',
    text = '加载中...',
    showProgress = false,
    progress = 0,
    className = ''
  } = props;

  // 动画状态 - 对应《德道经》"道法自然"
  const [animationPhase, setAnimationPhase] = createSignal(0);
  const [isVisible, setIsVisible] = createSignal(true);

  // 动画循环
  createEffect(() => {
    if (!isVisible()) return;

    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 16); // 60fps

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  // 尺寸映射
  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  };

  const spinnerSize = sizeMap[size];

  return (
    <div class={`loading-spinner-container ${className}`}>
      <div 
        class="loading-spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
          '--spinner-color': color,
          '--animation-phase': `${animationPhase()}deg`
        }}
      >
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      
      {text && (
        <div class="loading-text">
          {text}
        </div>
      )}
      
      {showProgress && (
        <div class="loading-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div class="progress-text">
            {Math.round(progress)}%
          </div>
        </div>
      )}
    </div>
  );
}

// 骨架屏组件 - 对应《德道经》"无为而治"
interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  animated?: boolean;
}

export function Skeleton(props: SkeletonProps) {
  const {
    width = '100%',
    height = '1rem',
    borderRadius = '0.25rem',
    className = '',
    animated = true
  } = props;

  return (
    <div 
      class={`skeleton ${animated ? 'skeleton-animated' : ''} ${className}`}
      style={{
        width,
        height,
        'border-radius': borderRadius
      }}
    />
  );
}

// 骨架屏组合组件
interface SkeletonGroupProps {
  count?: number;
  className?: string;
}

export function SkeletonGroup(props: SkeletonGroupProps) {
  const { count = 3, className = '' } = props;

  return (
    <div class={`skeleton-group ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton 
          key={i}
          height={i === 0 ? '2rem' : '1rem'}
          width={i === 0 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
}

// 错误边界组件 - 对应《德道经》"德者，得也"
interface ErrorBoundaryProps {
  fallback?: (error: Error, reset: () => void) => any;
  onError?: (error: Error) => void;
  children: any;
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const [error, setError] = createSignal<Error | null>(null);

  const reset = () => {
    setError(null);
  };

  // 错误处理
  const handleError = (err: Error) => {
    console.error('错误边界捕获错误:', err);
    setError(err);
    props.onError?.(err);
  };

  if (error()) {
    return props.fallback ? 
      props.fallback(error()!, reset) : 
      <div class="error-boundary">
        <div class="error-content">
          <h3>🚫 出现错误</h3>
          <p>{error()?.message || '未知错误'}</p>
          <button class="retry-btn" onClick={reset}>
            重试
          </button>
        </div>
      </div>;
  }

  return props.children;
}

// 空状态组件 - 对应《德道经》"道法自然"
interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  action?: () => void;
  actionText?: string;
  className?: string;
}

export function EmptyState(props: EmptyStateProps) {
  const {
    icon = '📭',
    title = '暂无数据',
    description = '这里还没有内容',
    action,
    actionText = '创建内容',
    className = ''
  } = props;

  return (
    <div class={`empty-state ${className}`}>
      <div class="empty-icon">
        {icon}
      </div>
      <div class="empty-title">
        {title}
      </div>
      <div class="empty-description">
        {description}
      </div>
      {action && (
        <button class="empty-action" onClick={action}>
          {actionText}
        </button>
      )}
    </div>
  );
}

// 通知组件 - 对应《德道经》"无为而治"
interface NotificationProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export function Notification(props: NotificationProps) {
  const {
    type = 'info',
    title,
    message,
    duration = 5000,
    onClose,
    className = ''
  } = props;

  const [isVisible, setIsVisible] = createSignal(true);

  // 自动关闭
  createEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // 等待动画完成
      }, duration);

      onCleanup(() => {
        clearTimeout(timer);
      });
    }
  });

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const typeIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div 
      class={`notification notification-${type} ${isVisible() ? 'notification-visible' : 'notification-hidden'} ${className}`}
    >
      <div class="notification-content">
        <div class="notification-icon">
          {typeIcons[type]}
        </div>
        <div class="notification-body">
          {title && (
            <div class="notification-title">
              {title}
            </div>
          )}
          {message && (
            <div class="notification-message">
              {message}
            </div>
          )}
        </div>
        <button class="notification-close" onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  );
}

// 通知管理器
class NotificationManager {
  private notifications: NotificationProps[] = [];
  private maxNotifications = 5;

  show(notification: NotificationProps): void {
    // 限制通知数量
    if (this.notifications.length >= this.maxNotifications) {
      this.notifications.shift();
    }

    this.notifications.push(notification);
    this.render();
  }

  success(title: string, message?: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message?: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message?: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration });
  }

  private render(): void {
    // 这里可以实现通知的渲染逻辑
    console.log('通知管理器渲染:', this.notifications);
  }
}

// 创建全局通知管理器实例
export const notificationManager = new NotificationManager();

// 导出所有组件
export {
  Skeleton,
  SkeletonGroup,
  ErrorBoundary,
  EmptyState,
  Notification,
  notificationManager
};
