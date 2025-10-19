import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    const vector = await aiAgentManager.contentAgent.generateContentVector(content)
    
    return NextResponse.json({ vector })
  } catch (error) {
    console.error('Content Vector API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content vector' },
      { status: 500 }
    )
  }
}