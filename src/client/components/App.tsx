// src/client/components/App.tsx
// FluLink主应用组件 - 基于《德道经》"道生一"理念

import { createSignal, createEffect, createMemo, Show } from 'solid-js';
import { isAuthenticated, currentUser, authActions } from '../lib/auth-state';
import AuthPage from './auth/AuthPage';
import AuthGuard from './auth/AuthGuard';

export default function App() {
  // 响应式状态管理 - 遵循Solid.js细粒度响应式原则
  const [currentPage, setCurrentPage] = createSignal('home');
  const [userLocation, setUserLocation] = createSignal<{lat: number, lng: number} | null>(null);
  const [virusStrains, setVirusStrains] = createSignal<any[]>([]);
  
  // 派生状态 - 使用createMemo实现细粒度响应
  const isLocationAvailable = createMemo(() => userLocation() !== null);
  const strainCount = createMemo(() => virusStrains().length);
  
  // 用户信息派生状态 - 对应《德道经》"修之于身，其德乃真"
  const userDisplayName = createMemo(() => {
    const user = currentUser();
    return user ? user.username : '游客';
  });

  const userTypeDisplay = createMemo(() => {
    const user = currentUser();
    if (!user) return '';
    
    const typeMap = {
      free: '免费用户',
      premium: '高级用户',
      enterprise: '企业用户'
    };
    return typeMap[user.userType] || '未知';
  });
  
  // 副作用 - 使用createEffect处理副作用
  createEffect(() => {
    console.log('当前页面:', currentPage());
  });
  
  createEffect(() => {
    if (isLocationAvailable()) {
      console.log('用户位置已获取:', userLocation());
    }
  });

  createEffect(() => {
    if (isAuthenticated()) {
      console.log('用户已认证:', currentUser());
    }
  });

  // 处理登出
  const handleLogout = async () => {
    try {
      await authActions.logout();
      console.log('用户已登出');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 认证成功回调
  const handleAuthSuccess = () => {
    console.log('认证成功，切换到首页');
    setCurrentPage('home');
  };

  // 如果未认证，显示认证页面
  if (!isAuthenticated()) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div class="app">
      <header class="app-header">
        <div class="header-content">
          <div class="header-left">
            <h1>🦠 FluLink</h1>
            <p>如流感般扩散，连接你在意的每个角落</p>
          </div>
          <div class="header-right">
            <div class="user-info">
              <span class="user-name">{userDisplayName()}</span>
              <span class="user-type">{userTypeDisplay()}</span>
            </div>
            <button class="logout-btn" onClick={handleLogout}>
              登出
            </button>
          </div>
        </div>
        
        <nav class="app-nav">
          <button 
            class={currentPage() === 'home' ? 'active' : ''}
            onClick={() => setCurrentPage('home')}
          >
            首页
          </button>
          <button 
            class={currentPage() === 'strains' ? 'active' : ''}
            onClick={() => setCurrentPage('strains')}
          >
            毒株 ({strainCount()})
          </button>
          <button 
            class={currentPage() === 'profile' ? 'active' : ''}
            onClick={() => setCurrentPage('profile')}
          >
            个人
          </button>
        </nav>
      </header>
      
      <main class="app-main">
        <Show when={currentPage() === 'home'}>
          <AuthGuard requireAuth={true}>
            <HomePage 
              location={userLocation()} 
              onLocationChange={setUserLocation}
            />
          </AuthGuard>
        </Show>
        
        <Show when={currentPage() === 'strains'}>
          <AuthGuard requireAuth={true}>
            <StrainsPage 
              strains={virusStrains()} 
              onStrainsChange={setVirusStrains}
            />
          </AuthGuard>
        </Show>
        
        <Show when={currentPage() === 'profile'}>
          <AuthGuard requireAuth={true}>
            <ProfilePage />
          </AuthGuard>
        </Show>
      </main>
      
      <footer class="app-footer">
        <p>基于《德道经》"无为而治"哲学的分布式流感式社交网络</p>
        <p>用户: {userDisplayName()} | 类型: {userTypeDisplay()}</p>
      </footer>
    </div>
  );
}

// 条件渲染组件
function Show(props: { when: boolean; children: any }) {
  return props.when ? props.children : null;
}