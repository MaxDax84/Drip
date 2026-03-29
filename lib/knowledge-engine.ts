import { createClient } from '@supabase/supabase-js'
import { researchTopic } from './claude'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function runKnowledgeEngine(): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = []
  let processed = 0

  // Get all unique topics across all users
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, name')

  if (topicsError) {
    return { processed: 0, errors: [topicsError.message] }
  }

  if (!topics || topics.length === 0) {
    return { processed: 0, errors: [] }
  }

  // Deduplicate by name (same topic may exist for multiple users)
  const uniqueTopics = Array.from(
    new Map(topics.map((t) => [t.name.toLowerCase(), t])).values()
  )

  for (const topic of uniqueTopics) {
    try {
      // Check how many unused knowledge base items exist
      const { count } = await supabase
        .from('knowledge_base')
        .select('id', { count: 'exact', head: true })
        .eq('topic_id', topic.id)
        .eq('used', false)

      // Only fetch new knowledge if we have fewer than 5 unused items
      if ((count ?? 0) >= 5) continue

      console.log(`[KnowledgeEngine] Researching: ${topic.name}`)
      const results = await researchTopic(topic.name)

      for (const result of results) {
        await supabase.from('knowledge_base').insert({
          topic_id: topic.id,
          source_url: result.source_url,
          summary: result.summary,
          key_facts: result.key_facts,
          used: false,
        })
      }

      processed++
    } catch (err) {
      errors.push(`Topic ${topic.name}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { processed, errors }
}

export async function getKnowledgeForTopic(topicId: string, limit = 3): Promise<{
  id: string
  source_url: string
  summary: string
  key_facts: string[]
}[]> {
  const { data } = await supabase
    .from('knowledge_base')
    .select('id, source_url, summary, key_facts')
    .eq('topic_id', topicId)
    .eq('used', false)
    .order('fetched_at', { ascending: false })
    .limit(limit)

  return data || []
}

export async function markKnowledgeUsed(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  await supabase
    .from('knowledge_base')
    .update({ used: true })
    .in('id', ids)
}
