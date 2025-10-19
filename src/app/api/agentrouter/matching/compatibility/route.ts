import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user1, user2 } = body

    const compatibility = await aiAgentManager.matchingAgent.calculateUserCompatibility(user1, user2)
    
    return NextResponse.json({ compatibility })
  } catch (error) {
    console.error('User Compatibility API Error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate user compatibility' },
      { status: 500 }
    )
  }
}