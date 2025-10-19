import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seed, users } = body

    const timing = await aiAgentManager.optimizationAgent.calculateOptimalTiming(seed, users)
    
    return NextResponse.json({ timing })
  } catch (error) {
    console.error('Optimal Timing API Error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate optimal timing' },
      { status: 500 }
    )
  }
}