// src/client/components/ProfilePage.tsx
// FluLink个人页面组件 - 基于《德道经》"自知者明"理念

import { createSignal, createEffect, createMemo } from 'solid-js';

export default function ProfilePage() {
  // 响应式状态
  const [userProfile, setUserProfile] = createSignal({
    name: 'FluLink用户',
    tier: 'free' as 'free' | 'premium',
    joinDate: new Date().toISOString(),
    totalInfections: 0,
    totalStrains: 0,
    achievements: [] as string[]
  });
  
  const [isEditing, setIsEditing] = createSignal(false);
  const [editName, setEditName] = createSignal('');

  // 派生状态
  const userTierText = createMemo(() => {
    return userProfile().tier === 'free' ? '免费用户' : '高级用户';
  });
  
  const joinDateText = createMemo(() => {
    return new Date(userProfile().joinDate).toLocaleDateString('zh-CN');
  });

  // 保存用户信息
  const saveProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName()
        })
      });
      
      if (!response.ok) {
        throw new Error('保存失败');
      }
      
      setUserProfile(prev => ({
        ...prev,
        name: editName()
      }));
      
      setIsEditing(false);
      console.log('用户信息保存成功');
      
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditName(userProfile().name);
    setIsEditing(false);
  };

  // 开始编辑
  const startEdit = () => {
    setEditName(userProfile().name);
    setIsEditing(true);
  };

  return (
    <div class="profile-page">
      <header class="profile-header">
        <h2>👤 个人中心</h2>
        <p>管理你的FluLink账户信息</p>
      </header>
      
      <div class="profile-info">
        <div class="profile-card">
          <div class="profile-avatar">
            <div class="avatar-circle">
              {userProfile().name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div class="profile-details">
            <Show when={!isEditing()}>
              <h3>{userProfile().name}</h3>
              <button class="edit-btn" onClick={startEdit}>
                编辑
              </button>
            </Show>
            
            <Show when={isEditing()}>
              <div class="edit-form">
                <input 
                  type="text" 
                  value={editName()}
                  onInput={(e) => setEditName(e.currentTarget.value)}
                  placeholder="输入用户名"
                />
                <div class="edit-actions">
                  <button class="save-btn" onClick={saveProfile}>
                    保存
                  </button>
                  <button class="cancel-btn" onClick={cancelEdit}>
                    取消
                  </button>
                </div>
              </div>
            </Show>
            
            <p class="user-tier">{userTierText()}</p>
            <p class="join-date">加入时间: {joinDateText()}</p>
          </div>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="stat-card">
          <h3>总感染数</h3>
          <p class="stat-number">{userProfile().totalInfections}</p>
        </div>
        <div class="stat-card">
          <h3>创建毒株</h3>
          <p class="stat-number">{userProfile().totalStrains}</p>
        </div>
        <div class="stat-card">
          <h3>成就数量</h3>
          <p class="stat-number">{userProfile().achievements.length}</p>
        </div>
      </div>
      
      <div class="profile-achievements">
        <h3>🏆 成就系统</h3>
        <Show when={userProfile().achievements.length === 0}>
          <div class="empty-achievements">
            <p>暂无成就，继续使用FluLink解锁更多成就！</p>
          </div>
        </Show>
        
        <Show when={userProfile().achievements.length > 0}>
          <div class="achievements-list">
            <For each={userProfile().achievements}>
              {(achievement) => (
                <div class="achievement-item">
                  <span class="achievement-icon">🏆</span>
                  <span class="achievement-text">{achievement}</span>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
      
      <div class="profile-philosophy">
        <h3>📖 个人哲学</h3>
        <blockquote>
          "自知者明，自胜者强"<br/>
          ——《德道经》第33章
        </blockquote>
        <p>
          在FluLink中，每个用户都是独立的个体，通过自主的选择和行动，
          创造属于自己的社交网络。了解自己，超越自己，这就是"明"和"强"的体现。
        </p>
      </div>
    </div>
  );
}

// 条件渲染组件
function Show(props: { when: boolean; children: any }) {
  return props.when ? props.children : null;
}

// 列表渲染组件
function For<T>(props: { each: T[]; children: (item: T) => any }) {
  return props.each.map(props.children);
}
