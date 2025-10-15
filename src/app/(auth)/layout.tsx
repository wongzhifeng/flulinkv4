// FluLink v4.0 认证布局组件

'use client'

import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-primary-bg">
      {children}
    </div>
  )
}
