// src/client/components/StrainsPage.tsx
// FluLink毒株页面组件 - 基于《德道经》"一生二，二生三"理念

import { createSignal, createEffect, createMemo, For } from 'solid-js';

interface Strain {
  id: string;
  name: string;
  type: 'life' | 'opinion' | 'interest' | 'super';
  location: {lat: number, lng: number};
  tags: string[];
  createdAt: string;
  infectionCount: number;
}

interface StrainsPageProps {
  strains: Strain[];
  onStrainsChange: (strains: Strain[]) => void;
}

export default function StrainsPage(props: StrainsPageProps) {
  // 响应式状态
  const [selectedType, setSelectedType] = createSignal<string>('all');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  
  // 派生状态 - 使用createMemo实现细粒度响应
  const filteredStrains = createMemo(() => {
    let filtered = props.strains;
    
    // 按类型过滤
    if (selectedType() !== 'all') {
      filtered = filtered.filter(strain => strain.type === selectedType());
    }
    
    // 按搜索查询过滤
    const query = searchQuery().toLowerCase();
    if (query) {
      filtered = filtered.filter(strain => 
        strain.name.toLowerCase().includes(query) ||
        strain.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  });
  
  const strainStats = createMemo(() => {
    const strains = props.strains;
    return {
      total: strains.length,
      life: strains.filter(s => s.type === 'life').length,
      opinion: strains.filter(s => s.type === 'opinion').length,
      interest: strains.filter(s => s.type === 'interest').length,
      super: strains.filter(s => s.type === 'super').length,
      totalInfections: strains.reduce((sum, s) => sum + s.infectionCount, 0)
    };
  });

  // 加载毒株数据
  const loadStrains = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/strains');
      if (!response.ok) {
        throw new Error('加载毒株失败');
      }
      
      const result = await response.json();
      if (result.success) {
        props.onStrainsChange(result.data || []);
      }
    } catch (error) {
      console.error('加载毒株失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时加载数据
  createEffect(() => {
    loadStrains();
  });

  // 感染毒株 - 体现"无为而治"的用户自主性
  const infectStrain = async (strainId: string) => {
    try {
      const response = await fetch(`/api/strains/${strainId}/infect`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('感染毒株失败');
      }
      
      const result = await response.json();
      console.log('毒株感染成功:', result);
      
      // 重新加载数据
      loadStrains();
      
    } catch (error) {
      console.error('感染毒株失败:', error);
    }
  };

  return (
    <div class="strains-page">
      <header class="strains-header">
        <h2>🦠 毒株管理</h2>
        <p>管理你的病毒株，让它们如流感般扩散</p>
      </header>
      
      <div class="strains-stats">
        <div class="stat-card">
          <h3>总毒株</h3>
          <p class="stat-number">{strainStats().total}</p>
        </div>
        <div class="stat-card">
          <h3>生活毒株</h3>
          <p class="stat-number">{strainStats().life}</p>
        </div>
        <div class="stat-card">
          <h3>观点毒株</h3>
          <p class="stat-number">{strainStats().opinion}</p>
        </div>
        <div class="stat-card">
          <h3>兴趣毒株</h3>
          <p class="stat-number">{strainStats().interest}</p>
        </div>
        <div class="stat-card">
          <h3>超级毒株</h3>
          <p class="stat-number">{strainStats().super}</p>
        </div>
        <div class="stat-card">
          <h3>总感染数</h3>
          <p class="stat-number">{strainStats().totalInfections}</p>
        </div>
      </div>
      
      <div class="strains-controls">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="搜索毒株名称或标签..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </div>
        
        <div class="filter-buttons">
          <button 
            class={selectedType() === 'all' ? 'active' : ''}
            onClick={() => setSelectedType('all')}
          >
            全部
          </button>
          <button 
            class={selectedType() === 'life' ? 'active' : ''}
            onClick={() => setSelectedType('life')}
          >
            生活
          </button>
          <button 
            class={selectedType() === 'opinion' ? 'active' : ''}
            onClick={() => setSelectedType('opinion')}
          >
            观点
          </button>
          <button 
            class={selectedType() === 'interest' ? 'active' : ''}
            onClick={() => setSelectedType('interest')}
          >
            兴趣
          </button>
          <button 
            class={selectedType() === 'super' ? 'active' : ''}
            onClick={() => setSelectedType('super')}
          >
            超级
          </button>
        </div>
      </div>
      
      <div class="strains-list">
        <Show when={isLoading()}>
          <div class="loading">加载中...</div>
        </Show>
        
        <Show when={!isLoading() && filteredStrains().length === 0}>
          <div class="empty-state">
            <p>暂无毒株数据</p>
            <button onClick={loadStrains}>重新加载</button>
          </div>
        </Show>
        
        <Show when={!isLoading() && filteredStrains().length > 0}>
          <For each={filteredStrains()}>
            {(strain) => (
              <div class="strain-card">
                <div class="strain-header">
                  <h3>{strain.name}</h3>
                  <span class={`strain-type ${strain.type}`}>
                    {strain.type === 'life' ? '生活' : 
                     strain.type === 'opinion' ? '观点' :
                     strain.type === 'interest' ? '兴趣' : '超级'}
                  </span>
                </div>
                
                <div class="strain-info">
                  <p><strong>位置:</strong> {strain.location.lat.toFixed(4)}, {strain.location.lng.toFixed(4)}</p>
                  <p><strong>感染数:</strong> {strain.infectionCount}</p>
                  <p><strong>创建时间:</strong> {new Date(strain.createdAt).toLocaleString()}</p>
                </div>
                
                <div class="strain-tags">
                  <For each={strain.tags}>
                    {(tag) => <span class="tag">{tag}</span>}
                  </For>
                </div>
                
                <div class="strain-actions">
                  <button 
                    class="infect-btn"
                    onClick={() => infectStrain(strain.id)}
                  >
                    感染此毒株
                  </button>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}

// 条件渲染组件
function Show(props: { when: boolean; children: any }) {
  return props.when ? props.children : null;
}
