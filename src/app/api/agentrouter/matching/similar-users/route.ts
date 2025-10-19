import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seedVector, userPool, topK } = body

    const similarUsers = await aiAgentManager.matchingAgent.findSimilarUsers(seedVector, userPool, topK)
    
    return NextResponse.json({ similarUsers })
  } catch (error) {
    console.error('Similar Users API Error:', error)
    return NextResponse.json(
      { error: 'Failed to find similar users' },
      { status: 500 }
    )
  }
}