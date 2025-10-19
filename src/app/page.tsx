// FluLink v4.0 根页面组件 - 修复预渲染问题

import { redirect } from 'next/navigation'

export default function RootPage() {
  // 直接重定向到主页面，避免预渲染问题
  redirect('/')
}
