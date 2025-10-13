# FluLink v4.0 PocketBase 自定义钩子

// 星种创建后自动传播钩子
pb.collection('star_seeds').onAfterCreate((e) => {
  const newSeed = e.record
  
  // 异步触发AI传播分析
  setTimeout(async () => {
    try {
      // 1. 内容向量化
      const response = await fetch(`${process.env.AI_SERVICE_URL}/api/ai/embed-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newSeed.content })
      })
      const { vector } = await response.json()
      
      // 2. 寻找相似用户
      const similarResponse = await fetch(`${process.env.AI_SERVICE_URL}/api/ai/find-similar-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seed_vector: vector, 
          limit: 100, 
          min_similarity: 0.6 
        })
      })
      const { similar_users } = await similarResponse.json()
      
      // 3. AI优化传播路径
      const propagationResponse = await fetch(`${process.env.AI_SERVICE_URL}/api/ai/optimize-propagation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          star_seed: newSeed, 
          target_users: similar_users 
        })
      })
      const { optimal_path } = await propagationResponse.json()
      
      // 4. 更新星种传播路径
      await pb.collection('star_seeds').update(newSeed.id, {
        propagation_path: optimal_path,
        content_vector: vector
      })
      
      // 5. 触发初始传播
      await triggerInitialPropagation(newSeed.id, optimal_path.firstTargets)
      
    } catch (error) {
      console.error('自动传播失败:', error)
    }
  }, 0)
})

// 实时共鸣值计算钩子
pb.collection('interactions').onAfterCreate((e) => {
  const interaction = e.record
  
  // 实时更新星种光度
  updateSeedLuminosity(interaction.star_seed)
  
  // 检查是否触发星团生成
  checkClusterCreationCriteria(interaction)
})

async function updateSeedLuminosity(seedId) {
  const interactions = await pb.collection('interactions').getList(1, 50, {
    filter: `star_seed = "${seedId}"`
  })
  
  // AI加权光度计算
  const luminosity = await calculateLuminosity(interactions.items)
  
  await pb.collection('star_seeds').update(seedId, {
    luminosity: luminosity,
    resonance_count: interactions.totalItems
  })
}

async function calculateLuminosity(interactions) {
  // 基于互动类型和强度计算光度
  let totalLuminosity = 0
  const weights = {
    'view': 1,
    'like': 3,
    'comment': 5,
    'share': 8,
    'resonate': 10
  }
  
  interactions.forEach(interaction => {
    const weight = weights[interaction.interaction_type] || 1
    totalLuminosity += weight * interaction.interaction_strength
  })
  
  // 归一化到 0-100 范围
  return Math.min(100, Math.max(0, totalLuminosity / interactions.length * 10))
}

async function checkClusterCreationCriteria(interaction) {
  const seedId = interaction.star_seed
  
  // 获取该星种的所有互动
  const interactions = await pb.collection('interactions').getList(1, 100, {
    filter: `star_seed = "${seedId}"`
  })
  
  // 检查是否满足星团创建条件
  if (interactions.totalItems >= 10) {
    const users = [...new Set(interactions.items.map(i => i.user))]
    
    if (users.length >= 3) {
      // 创建星团
      await createStarCluster(seedId, users)
    }
  }
}

async function createStarCluster(seedId, users) {
  try {
    // 获取星种信息
    const seed = await pb.collection('star_seeds').getOne(seedId)
    
    // 计算星团特征
    const clusterVector = await calculateClusterVector(users)
    const resonanceScore = await calculateClusterResonance(users)
    const activityLevel = await calculateClusterActivity(users)
    
    // 创建星团
    const cluster = await pb.collection('star_clusters').create({
      members: users,
      core_users: users.slice(0, 2), // 前两个用户作为核心
      resonance_score: resonanceScore,
      geographic_center: seed.location,
      activity_level: activityLevel,
      spectral_diversity: {
        topics: seed.spectral_tags || [],
        count: (seed.spectral_tags || []).length
      },
      expiration_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      cluster_vector: clusterVector
    })
    
    console.log('星团创建成功:', cluster.id)
  } catch (error) {
    console.error('星团创建失败:', error)
  }
}

async function calculateClusterVector(users) {
  // 计算星团特征向量
  const userVectors = []
  
  for (const userId of users) {
    const user = await pb.collection('users').getOne(userId)
    if (user.interest_vector) {
      userVectors.push(user.interest_vector)
    }
  }
  
  if (userVectors.length === 0) {
    return []
  }
  
  // 计算平均向量
  const dimensions = userVectors[0].length
  const averageVector = new Array(dimensions).fill(0)
  
  userVectors.forEach(vector => {
    vector.forEach((value, index) => {
      averageVector[index] += value
    })
  })
  
  return averageVector.map(value => value / userVectors.length)
}

async function calculateClusterResonance(users) {
  // 计算星团共鸣值
  let totalResonance = 0
  
  for (const userId of users) {
    const interactions = await pb.collection('interactions').getList(1, 50, {
      filter: `user = "${userId}"`
    })
    totalResonance += interactions.totalItems
  }
  
  return Math.min(100, totalResonance / users.length)
}

async function calculateClusterActivity(users) {
  // 计算星团活跃度
  const now = Date.now()
  const oneDayAgo = now - 24 * 60 * 60 * 1000
  
  let activeUsers = 0
  
  for (const userId of users) {
    const interactions = await pb.collection('interactions').getList(1, 10, {
      filter: `user = "${userId}" && created > "${new Date(oneDayAgo).toISOString()}"`
    })
    
    if (interactions.totalItems > 0) {
      activeUsers++
    }
  }
  
  return Math.round((activeUsers / users.length) * 100)
}

async function triggerInitialPropagation(seedId, targetUsers) {
  // 触发初始传播
  for (const user of targetUsers.slice(0, 5)) {
    try {
      await pb.collection('interactions').create({
        user: user.id,
        star_seed: seedId,
        interaction_type: 'view',
        interaction_strength: 1,
        context_data: {
          source: 'ai_propagation',
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('初始传播失败:', error)
    }
  }
}
