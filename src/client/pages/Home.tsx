// src/client/pages/Home.tsx
// FluLink首页 - 病毒库展示，对应《德道经》"道生一"

import { createSignal, createEffect, For, Show, Suspense } from 'solid-js';
import { VirusStrain } from '../../shared/types/VirusStrain';
import { VirusStrainService } from '../../server/services/VirusStrainService';

export default function Home() {
  const [strains, setStrains] = createSignal<VirusStrain[]>([]);
  const [loading, setLoading] = createSignal(true);
  const virusStrainService = VirusStrainService.getInstance();

  createEffect(async () => {
    try {
      // 获取所有活跃毒株
      const activeStrains = await virusStrainService.getAllActiveStrains();
      setStrains(activeStrains);
      setLoading(false);
    } catch (error) {
      console.error('获取毒株失败:', error);
      setLoading(false);
    }
  });

  return (
    <div style="min-height: 100vh; background-color: #f9fafb;">
      {/* 头部 */}
      <header style="background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-bottom: 1px solid #e5e7eb;">
        <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0;">
            <div style="display: flex; align-items: center;">
              <h1 style="font-size: 1.5rem; font-weight: bold; color: #059669; margin: 0;">🦠 FluLink</h1>
              <span style="margin-left: 0.5rem; font-size: 0.875rem; color: #6b7280;">如流感般扩散，连接你在意的每个角落</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <button style="padding: 0.5rem 1rem; background: #059669; color: white; border-radius: 0.5rem; border: none; cursor: pointer;">
                发布毒株
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main style="max-width: 1280px; margin: 0 auto; padding: 2rem 1rem;">
        {/* 筛选栏 */}
        <div style="margin-bottom: 1.5rem;">
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <button style="padding: 0.25rem 0.75rem; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: 0.875rem; border: none; cursor: pointer;">
              全部
            </button>
            <button style="padding: 0.25rem 0.75rem; background: #f3f4f6; color: #374151; border-radius: 9999px; font-size: 0.875rem; border: none; cursor: pointer;">
              生活毒株
            </button>
            <button style="padding: 0.25rem 0.75rem; background: #f3f4f6; color: #374151; border-radius: 9999px; font-size: 0.875rem; border: none; cursor: pointer;">
              观点毒株
            </button>
            <button style="padding: 0.25rem 0.75rem; background: #f3f4f6; color: #374151; border-radius: 9999px; font-size: 0.875rem; border: none; cursor: pointer;">
              兴趣毒株
            </button>
            <button style="padding: 0.25rem 0.75rem; background: #f3f4f6; color: #374151; border-radius: 9999px; font-size: 0.875rem; border: none; cursor: pointer;">
              超级毒株
            </button>
          </div>
        </div>

        {/* 毒株列表 */}
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <Suspense fallback={<div style="text-align: center; padding: 2rem;">加载中...</div>}>
            <For each={strains()}>
              {(strain) => (
                <div style="background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; border: 1px solid #e5e7eb;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="width: 2.5rem; height: 2.5rem; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #059669; font-weight: 600;">
                          {strain.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 style="font-weight: 600; color: #111827; margin: 0;">{strain.author}</h3>
                        <p style="font-size: 0.875rem; color: #6b7280; margin: 0;">{strain.location.address}</p>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style={`padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; ${
                        strain.type === 'life' ? 'background: #dbeafe; color: #1e40af;' :
                        strain.type === 'opinion' ? 'background: #f3e8ff; color: #7c3aed;' :
                        strain.type === 'interest' ? 'background: #fed7aa; color: #ea580c;' :
                        'background: #fecaca; color: #dc2626;'
                      }`}>
                        {strain.type === 'life' ? '生活' :
                         strain.type === 'opinion' ? '观点' :
                         strain.type === 'interest' ? '兴趣' : '超级'}
                      </span>
                      <Show when={strain.isSuperFlu}>
                        <span style="padding: 0.25rem 0.5rem; background: #fef3c7; color: #92400e; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">
                          超级流感
                        </span>
                      </Show>
                    </div>
                  </div>

                  <div style="margin-bottom: 1rem;">
                    <p style="color: #374151; line-height: 1.6; margin: 0;">{strain.content}</p>
                  </div>

                  <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
                    <For each={strain.tags}>
                      {(tag) => (
                        <span style="padding: 0.25rem 0.5rem; background: #f3f4f6; color: #374151; border-radius: 0.25rem; font-size: 0.75rem;">
                          #{tag}
                        </span>
                      )}
                    </For>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.875rem; color: #6b7280;">
                      <span>👥 {strain.infectionStats.totalInfected} 人感染</span>
                      <span>📊 {strain.infectionStats.infectionRate.toFixed(1)}% 感染率</span>
                      <span>🌍 {strain.infectionStats.geographicSpread.length} 个层级</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <button style="padding: 0.25rem 0.75rem; background: #059669; color: white; border-radius: 0.25rem; font-size: 0.875rem; border: none; cursor: pointer;">
                        感染
                      </button>
                      <button style="padding: 0.25rem 0.75rem; background: #e5e7eb; color: #374151; border-radius: 0.25rem; font-size: 0.875rem; border: none; cursor: pointer;">
                        传播
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </Suspense>
        </div>

        {/* 空状态 */}
        <Show when={!loading() && strains().length === 0}>
          <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🦠</div>
            <h3 style="font-size: 1.125rem; font-weight: 500; color: #111827; margin-bottom: 0.5rem;">暂无活跃毒株</h3>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">成为第一个发布毒株的人，开始传播吧！</p>
            <button style="padding: 0.75rem 1.5rem; background: #059669; color: white; border-radius: 0.5rem; border: none; cursor: pointer;">
              发布第一个毒株
            </button>
          </div>
        </Show>
      </main>
    </div>
  );
}