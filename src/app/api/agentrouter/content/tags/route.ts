import { NextRequest, NextResponse } from 'next/server'
import { AIAgentManager } from '@/lib/ai-agents'

const aiAgentManager = new AIAgentManager()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body

    const tags = await aiAgentManager.contentAgent.extractSpectralTags(content)
    
    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Spectral Tags API Error:', error)
    return NextResponse.json(
      { error: 'Failed to extract spectral tags' },
      { status: 500 }
    )
  }
}