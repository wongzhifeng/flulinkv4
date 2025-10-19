import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    const analysis = await aiAgentManager.contentAgent.analyzeContent(content)
    
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Content Analysis API Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}