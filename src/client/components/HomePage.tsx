// src/client/components/HomePage.tsx
// FluLink首页组件 - 基于《德道经》"道生一"理念

import { createSignal, createEffect, createMemo } from 'solid-js';

interface HomePageProps {
  location: {lat: number, lng: number} | null;
  onLocationChange: (location: {lat: number, lng: number} | null) => void;
}

export default function HomePage(props: HomePageProps) {
  // 响应式状态
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  
  // 派生状态
  const locationText = createMemo(() => {
    const loc = props.location;
    return loc ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : '未获取位置';
  });
  
  const canCreateStrain = createMemo(() => {
    return props.location !== null && !isLoading();
  });

  // 获取用户位置 - 体现"无为而治"的用户自主性
  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('浏览器不支持地理位置服务');
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      props.onLocationChange(location);
      console.log('位置获取成功:', location);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取位置失败';
      setError(errorMessage);
      console.error('位置获取失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建毒株 - 体现"道生一"的创造理念
  const createVirusStrain = async () => {
    if (!canCreateStrain()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/strains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '新毒株',
          type: 'life',
          location: props.location,
          tags: ['测试', '新创建']
        })
      });
      
      if (!response.ok) {
        throw new Error('创建毒株失败');
      }
      
      const result = await response.json();
      console.log('毒株创建成功:', result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建毒株失败';
      setError(errorMessage);
      console.error('毒株创建失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="home-page">
      <div class="location-section">
        <h2>📍 当前位置</h2>
        <p class="location-text">{locationText()}</p>
        
        <button 
          class="location-btn"
          onClick={getCurrentLocation}
          disabled={isLoading()}
        >
          {isLoading() ? '获取中...' : '获取位置'}
        </button>
      </div>
      
      <div class="action-section">
        <h2>🦠 创建毒株</h2>
        <p>基于当前位置创建新的病毒株，让它如流感般扩散</p>
        
        <button 
          class="create-btn"
          onClick={createVirusStrain}
          disabled={!canCreateStrain()}
        >
          {isLoading() ? '创建中...' : '创建毒株'}
        </button>
      </div>
      
      <div class="philosophy-section">
        <h2>📖 哲学理念</h2>
        <blockquote>
          "道生一，一生二，二生三，三生万物"<br/>
          ——《德道经》第42章
        </blockquote>
        <p>
          每个毒株都是一个"一"，通过用户的自主传播，生发出无数的连接，
          最终形成"万物"般的社交网络。
        </p>
      </div>
      
      <Show when={error()}>
        <div class="error-message">
          ❌ {error()}
        </div>
      </Show>
    </div>
  );
}

// 条件渲染组件
function Show(props: { when: boolean; children: any }) {
  return props.when ? props.children : null;
}
