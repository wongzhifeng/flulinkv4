// src/client/components/App.tsx
// FluLink主应用组件 - 基于《德道经》"道生一"理念

import { createSignal, createEffect, createMemo } from 'solid-js';

export default function App() {
  // 响应式状态管理 - 遵循Solid.js细粒度响应式原则
  const [currentPage, setCurrentPage] = createSignal('home');
  const [userLocation, setUserLocation] = createSignal<{lat: number, lng: number} | null>(null);
  const [virusStrains, setVirusStrains] = createSignal<any[]>([]);
  
  // 派生状态 - 使用createMemo实现细粒度响应
  const isLocationAvailable = createMemo(() => userLocation() !== null);
  const strainCount = createMemo(() => virusStrains().length);
  
  // 副作用 - 使用createEffect处理副作用
  createEffect(() => {
    console.log('当前页面:', currentPage());
  });
  
  createEffect(() => {
    if (isLocationAvailable()) {
      console.log('用户位置已获取:', userLocation());
    }
  });

  return (
    <div class="app">
      <header class="app-header">
        <h1>🦠 FluLink</h1>
        <p>如流感般扩散，连接你在意的每个角落</p>
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
          <HomePage 
            location={userLocation()} 
            onLocationChange={setUserLocation}
          />
        </Show>
        
        <Show when={currentPage() === 'strains'}>
          <StrainsPage 
            strains={virusStrains()} 
            onStrainsChange={setVirusStrains}
          />
        </Show>
        
        <Show when={currentPage() === 'profile'}>
          <ProfilePage />
        </Show>
      </main>
      
      <footer class="app-footer">
        <p>基于《德道经》"无为而治"哲学的分布式流感式社交网络</p>
      </footer>
    </div>
  );
}

// 条件渲染组件
function Show(props: { when: boolean; children: any }) {
  return props.when ? props.children : null;
}
