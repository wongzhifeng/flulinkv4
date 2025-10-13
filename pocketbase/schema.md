# FluLink 星尘共鸣版 v4.0 - PocketBase 数据模型

# 用户表 (users)
collection: users
fields:
  - name: username | type: text | required: true | unique: true
  - name: email | type: email | required: true | unique: true
  - name: avatar | type: file | maxSize: 5MB
  - name: location | type: json # {lat: number, lng: number, precision: string}
  - name: interest_vector | type: json # 用户兴趣向量嵌入 [0.23, -0.45, ...]
  - name: interaction_history | type: json # 互动记录统计
  - name: privacy_settings | type: json # 隐私配置
  - name: ai_preferences | type: json # AI个性化设置
  - name: created | type: date | required: true
  - name: updated | type: date | required: true

# 星种表 (star_seeds)
collection: star_seeds
fields:
  - name: creator | type: relation | collection: users | required: true
  - name: content | type: text | required: true
  - name: content_type | type: select | options: [text, image, audio, mixed]
  - name: media_files | type: file | maxSelect: 5
  - name: location | type: json # 发布位置信息
  - name: content_vector | type: json # 内容向量嵌入 (768维)
  - name: spectral_tags | type: json # 光谱标签系统
  - name: luminosity | type: number | min: 0 | max: 100 | default: 10
  - name: resonance_count | type: number | default: 0
  - name: propagation_path | type: json # 传播路径记录
  - name: status | type: select | options: [active, dormant, archived] | default: active
  - name: ai_generated_metadata | type: json # AI生成的元数据
  - name: created | type: date | required: true
  - name: updated | type: date | required: true

# 星团表 (star_clusters)
collection: star_clusters
fields:
  - name: members | type: relation | collection: users | maxSelect: 49
  - name: core_users | type: relation | collection: users | maxSelect: 2
  - name: resonance_score | type: number # 星团整体共鸣值
  - name: geographic_center | type: json # 地理中心点
  - name: activity_level | type: number # 活跃度指数
  - name: spectral_diversity | type: json # 光谱多样性指标
  - name: expiration_time | type: date # 7天后过期
  - name: cluster_vector | type: json # 星团特征向量
  - name: created | type: date | required: true
  - name: updated | type: date | required: true

# 互动记录表 (interactions)
collection: interactions
fields:
  - name: user | type: relation | collection: users | required: true
  - name: star_seed | type: relation | collection: star_seeds | required: true
  - name: interaction_type | type: select | options: [view, like, comment, share, resonate] | required: true
  - name: interaction_strength | type: number | min: 1 | max: 10 | default: 1
  - name: context_data | type: json # 互动上下文
  - name: ai_analyzed_sentiment | type: json # AI分析的情感数据
  - name: created | type: date | required: true
  - name: updated | type: date | required: true
