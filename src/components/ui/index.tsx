// FluLink v4.0 基础组件库

import React from 'react'
import { cn } from '@/lib/utils'

// 按钮组件
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'text-text-primary hover:text-accent-gold hover:bg-primary-card px-4 py-2 rounded-xl'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="loading-spinner w-4 h-4" />
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// 输入框组件
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'input-field w-full',
            icon ? 'pl-10' : '',
            error ? 'ring-2 ring-accent-red' : '',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-accent-red">{error}</p>
      )}
    </div>
  )
}

// 文本域组件
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'input-field w-full min-h-[100px] resize-vertical',
          error ? 'ring-2 ring-accent-red' : '',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-red">{error}</p>
      )}
    </div>
  )
}

// 卡片组件
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = true,
  glass = false
}) => {
  return (
    <div
      className={cn(
        'neumorphism-card',
        glass ? 'glass-effect' : '',
        hover ? 'hover:transform hover:-translate-y-1 hover:shadow-neumorphism-hover' : '',
        className
      )}
    >
      {children}
    </div>
  )
}

// 模态框组件
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className={cn(
        'relative w-full bg-primary-card rounded-2xl shadow-2xl',
        sizeClasses[size]
      )}>
        {/* 标题栏 */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-accent-gold transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        )}
        
        {/* 内容区域 */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// 加载组件
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text = '加载中...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={cn('loading-spinner', sizeClasses[size])} />
      {text && (
        <p className="text-text-secondary text-sm">{text}</p>
      )}
    </div>
  )
}

// 标签组件
interface TagProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'red' | 'purple' | 'cyan'
  size?: 'sm' | 'md'
  className?: string
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className
}) => {
  const variantClasses = {
    default: 'bg-primary-card text-text-primary',
    gold: 'bg-gradient-gold text-black',
    red: 'bg-accent-red text-white',
    purple: 'bg-accent-purple text-white',
    cyan: 'bg-accent-cyan text-white'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}

// 头像组件
interface AvatarProps {
  src?: string
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '头像',
  size = 'md',
  fallback,
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className={cn(
      'rounded-full overflow-hidden bg-gradient-gold flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-black font-semibold">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

// 工具函数
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
