import { NextRequest, NextResponse } from 'next/server'
import { runKnowledgeEngine } from '@/lib/knowledge-engine'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for research

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runKnowledgeEngine()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
