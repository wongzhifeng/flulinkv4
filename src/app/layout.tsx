import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FluLink 星尘共鸣版 v4.0',
  description: '基于 AI Agent 驱动的下一代异步社交平台，通过智能传播算法实现内容的高效精准分发',
  keywords: ['AI', '社交平台', '智能传播', '向量检索', '星尘共鸣'],
  authors: [{ name: 'FluLink Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a1a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-primary-bg text-text-primary`}>
        {children}
      </body>
    </html>
  )
}
