// FluLink v4.0 认证布局组件

'use client'

import React, { useState } from 'react'
import { LoginPage } from './login/page'
import { RegisterPage } from './register/page'

export default function AuthLayout() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const handleLoginSuccess = (user: any) => {
    console.log('登录成功:', user)
    // TODO: 重定向到主应用
    window.location.href = '/'
  }

  const handleRegisterSuccess = (user: any) => {
    console.log('注册成功:', user)
    // TODO: 重定向到主应用
    window.location.href = '/'
  }

  const handleSwitchToLogin = () => {
    setAuthMode('login')
  }

  const handleSwitchToRegister = () => {
    setAuthMode('register')
  }

  return (
    <div className="min-h-screen bg-primary-bg">
      {authMode === 'login' ? (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      ) : (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  )
}
