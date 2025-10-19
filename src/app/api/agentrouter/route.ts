import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

// 初始化 AI Agent 管理器
const aiAgentManager = new AIAgentManager()

// POST 请求处理函数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    // 根据不同的 action 调用不同的 AI Agent
    switch (action) {
      case 'propagation-path':
        const propagationPath = await aiAgentManager.propagationAgent.calculatePropagationPath(
          data.seed,
          data.context
        )
        return NextResponse.json(propagationPath)

      case 'propagation-potential':
        const potential = await aiAgentManager.propagationAgent.predictPropagationPotential(data.seed)
        return NextResponse.json({ potential })

      case 'similar-users':
        const similarUsers = await aiAgentManager.matchingAgent.findSimilarUsers(
          data.seedVector,
          data.userPool,
          data.topK
        )
        return NextResponse.json({ similarUsers })

      case 'user-compatibility':
        const compatibility = await aiAgentManager.matchingAgent.calculateUserCompatibility(
          data.user1,
          data.user2
        )
        return NextResponse.json({ compatibility })

      case 'analyze-content':
        const analysis = await aiAgentManager.contentAgent.analyzeContent(data.content)
        return NextResponse.json(analysis)

      case 'content-vector':
        const vector = await aiAgentManager.contentAgent.generateContentVector(data.content)
        return NextResponse.json({ vector })

      case 'spectral-tags':
        const tags = await aiAgentManager.contentAgent.extractSpectralTags(data.content)
        return NextResponse.json({ tags })

      case 'optimize-path':
        const optimizedPath = await aiAgentManager.optimizationAgent.optimizePropagationPath(data.path)
        return NextResponse.json(optimizedPath)

      case 'optimal-timing':
        const timing = await aiAgentManager.optimizationAgent.calculateOptimalTiming(
          data.seed,
          data.users
        )
        return NextResponse.json({ timing })

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('AgentRouter API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET 请求处理函数 - 健康检查
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'agentrouter-api', 
    timestamp: new Date().toISOString() 
  })
}