import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase-server'
import { generatePill } from '@/lib/claude'
import { getKnowledgeForTopic, markKnowledgeUsed } from '@/lib/knowledge-engine'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  // Validate internal secret for cron calls, or check user auth
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  let userId: string | null = null
  let topicId: string | null = null

  if (authHeader === `Bearer ${cronSecret}`) {
    // Called by scheduler — expects body with userId and topicId
    const body = await req.json()
    userId = body.userId
    topicId = body.topicId
  } else {
    // Called by user — use auth
    const supabase = createServiceRoleClient()
    // Quick auth check via x-user-id header (set by middleware)
    userId = req.headers.get('x-user-id')
    const body = await req.json()
    topicId = body.topicId
  }

  if (!userId || !topicId) {
    return NextResponse.json({ error: 'Missing userId or topicId' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  // Get topic
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('*')
    .eq('id', topicId)
    .single()

  if (topicError || !topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  // Get recent pills to avoid repetition
  const { data: recentPillsRaw } = await supabase
    .from('pills')
    .select('*')
    .eq('user_id', userId)
    .eq('topic_id', topicId)
    .order('sent_at', { ascending: false })
    .limit(10)
  const recentPills = recentPillsRaw || []

  // Get knowledge base items
  const knowledgeFacts = await getKnowledgeForTopic(topicId, 3)

  // Generate pill
  const pillData = await generatePill(topic, recentPills, knowledgeFacts)

  // Save to database
  const { data: pill, error: pillError } = await supabase
    .from('pills')
    .insert({
      user_id: userId,
      topic_id: topicId,
      content: pillData.content,
      source_summary: pillData.source_summary,
      sent_at: new Date().toISOString(),
      saved: false,
      knowledge_base_id: knowledgeFacts[0]?.id || null,
    })
    .select()
    .single()

  if (pillError) {
    return NextResponse.json({ error: pillError.message }, { status: 500 })
  }

  // Mark knowledge as used
  if (knowledgeFacts.length > 0) {
    await markKnowledgeUsed(knowledgeFacts.map((k) => k.id))
  }

  // Update topic stats
  const newPillCount = (topic.pill_count || 0) + 1
  let newLevel = topic.level
  if (newPillCount >= 20) newLevel = 'advanced'
  else if (newPillCount >= 8) newLevel = 'intermediate'

  await supabase
    .from('topics')
    .update({ pill_count: newPillCount, level: newLevel })
    .eq('id', topicId)

  return NextResponse.json({ pill })
}
