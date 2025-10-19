// FluLink v4.0 导航组件

import React from 'react'
import { cn } from '@/lib/utils'

// 顶部导航栏
export interface TopNavProps {
  title?: string
  user?: {
    name: string
    avatar?: string
  }
  onMenuClick?: () => void
  onProfileClick?: () => void
}

export const TopNav: React.FC<TopNavProps> = ({
  title = 'FluLink',
  user,
  onMenuClick,
  onProfileClick
}) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-effect border-b border-white/10">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧菜单按钮 */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-text-secondary hover:text-accent-gold hover:bg-primary-card transition-all duration-300"
          >
            <i className="fas fa-bars text-xl"></i>
          </button>

          {/* 标题 */}
          <h1 className="text-xl font-bold gradient-text-gold text-shadow">
            {title}
          </h1>

          {/* 右侧用户头像 */}
          <button
            onClick={onProfileClick}
            className="p-2 rounded-xl text-text-secondary hover:text-accent-gold hover:bg-primary-card transition-all duration-300"
          >
            {user ? (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-gold">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ) : (
              <i className="fas fa-user text-xl"></i>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

// 底部导航栏
export interface BottomNavProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  onPageChange
}) => {
  const navItems = [
    {
      id: 'home',
      label: '星空图谱',
      icon: 'fas fa-star',
      page: 'home'
    },
    {
      id: 'create',
      label: '星种创建',
      icon: 'fas fa-plus-circle',
      page: 'create'
    },
    {
      id: 'clusters',
      label: '星团共鸣',
      icon: 'fas fa-users',
      page: 'clusters'
    },
    {
      id: 'profile',
      label: '个人档案',
      icon: 'fas fa-user-circle',
      page: 'profile'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-white/10">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.page)}
              className={cn(
                'nav-item flex-col gap-1 min-w-0 flex-1',
                currentPage === item.page ? 'active' : ''
              )}
            >
              <i className={cn(
                'text-lg transition-all duration-300',
                currentPage === item.page ? 'text-accent-gold' : 'text-text-secondary'
              )}>
                {item.icon}
              </i>
              <span className={cn(
                'text-xs font-medium transition-all duration-300',
                currentPage === item.page ? 'text-accent-gold' : 'text-text-secondary'
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

// 侧边栏导航
export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPage: string
  onPageChange: (page: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentPage,
  onPageChange
}) => {
  const menuItems = [
    {
      id: 'home',
      label: '星空图谱',
      icon: 'fas fa-star',
      page: 'home'
    },
    {
      id: 'create',
      label: '星种创建',
      icon: 'fas fa-plus-circle',
      page: 'create'
    },
    {
      id: 'clusters',
      label: '星团共鸣',
      icon: 'fas fa-users',
      page: 'clusters'
    },
    {
      id: 'profile',
      label: '个人档案',
      icon: 'fas fa-user-circle',
      page: 'profile'
    },
    {
      id: 'settings',
      label: '设置',
      icon: 'fas fa-cog',
      page: 'settings'
    },
    {
      id: 'help',
      label: '帮助',
      icon: 'fas fa-question-circle',
      page: 'help'
    }
  ]

  return (
    <>
      {/* 背景遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-primary-card transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold gradient-text-gold">FluLink</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-accent-gold transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* 菜单项 */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.page)
                  onClose()
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                  currentPage === item.page
                    ? 'bg-primary-secondary text-accent-gold'
                    : 'text-text-secondary hover:text-accent-gold hover:bg-primary-secondary'
                )}
              >
                <i className={item.icon}></i>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* 底部信息 */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-center text-text-secondary text-sm">
              <p>FluLink v4.0</p>
              <p>星尘共鸣版</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// 面包屑导航
export interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
    onClick?: () => void
  }>
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <i className="fas fa-chevron-right text-text-secondary text-xs"></i>
          )}
          {item.href || item.onClick ? (
            <button
              onClick={item.onClick}
              className="text-text-secondary hover:text-accent-gold transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-text-primary font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// 标签导航
export interface TabNavProps {
  tabs: Array<{
    id: string
    label: string
    icon?: string
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
}

export const TabNav: React.FC<TabNavProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="flex space-x-1 bg-primary-secondary p-1 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300',
            activeTab === tab.id
              ? 'bg-primary-card text-accent-gold shadow-lg'
              : 'text-text-secondary hover:text-accent-gold hover:bg-primary-card'
          )}
        >
          {tab.icon && <i className={tab.icon}></i>}
          <span className="font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
