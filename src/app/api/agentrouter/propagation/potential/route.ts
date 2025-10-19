import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seed } = body

    const potential = await aiAgentManager.propagationAgent.predictPropagationPotential(seed)
    
    return NextResponse.json({ potential })
  } catch (error) {
    console.error('Propagation Potential API Error:', error)
    return NextResponse.json(
      { error: 'Failed to predict propagation potential' },
      { status: 500 }
    )
  }
}