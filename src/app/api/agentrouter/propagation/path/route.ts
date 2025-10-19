import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seed, context } = body

    const propagationPath = await aiAgentManager.propagationAgent.calculatePropagationPath(seed, context)
    
    return NextResponse.json(propagationPath)
  } catch (error) {
    console.error('Propagation Path API Error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate propagation path' },
      { status: 500 }
    )
  }
}