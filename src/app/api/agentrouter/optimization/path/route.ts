import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path } = body

    const optimizedPath = await aiAgentManager.optimizationAgent.optimizePropagationPath(path)
    
    return NextResponse.json(optimizedPath)
  } catch (error) {
    console.error('Optimization Path API Error:', error)
    return NextResponse.json(
      { error: 'Failed to optimize propagation path' },
      { status: 500 }
    )
  }
}