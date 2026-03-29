import { createClient } from '@supabase/supabase-js'
import { generatePill } from './claude'
import { getKnowledgeForTopic, markKnowledgeUsed } from './knowledge-engine'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FREE_PILLS_PER_DAY = 3
const PRO_PILLS_PER_DAY = 10

function isWithinActiveHours(start: number, end: number, currentHour: number): boolean {
  if (start <= end) {
    return currentHour >= start && currentHour < end
  }
  // Overnight window
  return currentHour >= start || currentHour < end
}

function getTodayStart(): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

export async function runScheduler(): Promise<{ sent: number; skipped: number; errors: string[] }> {
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  const currentHour = new Date().getHours()

  // Get all users with their topics and push subscriptions
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, plan, active_hours_start, active_hours_end')

  if (usersError) return { sent: 0, skipped: 0, errors: [usersError.message] }
  if (!users || users.length === 0) return { sent: 0, skipped: 0, errors: [] }

  for (const user of users) {
    try {
      // Check active hours
      if (!isWithinActiveHours(user.active_hours_start, user.active_hours_end, currentHour)) {
        skipped++
        continue
      }

      // Check daily pill limit
      const dailyLimit = user.plan === 'pro' ? PRO_PILLS_PER_DAY : FREE_PILLS_PER_DAY
      const { count: todayCount } = await supabase
        .from('pills')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('sent_at', getTodayStart())

      if ((todayCount ?? 0) >= dailyLimit) {
        skipped++
        continue
      }

      // Random chance to skip this run (makes timing organic, ~50% chance)
      // With 30-min runs and ~50% skip, average spacing is ~1 hour
      if (Math.random() < 0.5) {
        continue
      }

      // Get user's topics
      const { data: topics } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', user.id)

      if (!topics || topics.length === 0) {
        skipped++
        continue
      }

      // Pick a random topic
      const topic = topics[Math.floor(Math.random() * topics.length)]

      // Get recent pills for this user/topic (to avoid repetition)
      const { data: recentPillsRaw } = await supabase
        .from('pills')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', topic.id)
        .order('sent_at', { ascending: false })
        .limit(10)
      const recentPills = recentPillsRaw || []

      // Get unused knowledge base items
      const knowledgeFacts = await getKnowledgeForTopic(topic.id, 3)

      // Generate the pill
      const pillData = await generatePill(
        topic,
        recentPills,
        knowledgeFacts
      )

      // Save to database
      const { data: pill, error: pillError } = await supabase
        .from('pills')
        .insert({
          user_id: user.id,
          topic_id: topic.id,
          content: pillData.content,
          source_summary: pillData.source_summary,
          sent_at: new Date().toISOString(),
          saved: false,
          knowledge_base_id: knowledgeFacts[0]?.id || null,
        })
        .select()
        .single()

      if (pillError) {
        errors.push(`User ${user.id}: ${pillError.message}`)
        continue
      }

      // Mark knowledge as used
      if (knowledgeFacts.length > 0) {
        await markKnowledgeUsed(knowledgeFacts.map((k) => k.id))
      }

      // Update topic level and pill count
      const newPillCount = (topic.pill_count || 0) + 1
      let newLevel = topic.level
      if (newPillCount >= 20) newLevel = 'advanced'
      else if (newPillCount >= 8) newLevel = 'intermediate'

      await supabase
        .from('topics')
        .update({ pill_count: newPillCount, level: newLevel })
        .eq('id', topic.id)

      // Send push notification
      await sendPushNotification(user.id, topic.name, pillData.content, pill.id)

      sent++
    } catch (err) {
      errors.push(`User ${user.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { sent, skipped, errors }
}

async function sendPushNotification(
  userId: string,
  topicName: string,
  content: string,
  pillId: string
): Promise<void> {
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('subscription_json')
    .eq('user_id', userId)

  if (!subscriptions || subscriptions.length === 0) return

  const oneSignalAppId = process.env.ONESIGNAL_APP_ID
  const oneSignalApiKey = process.env.ONESIGNAL_API_KEY

  if (!oneSignalAppId || !oneSignalApiKey) return

  // Truncate content for notification preview
  const preview = content.length > 120 ? content.substring(0, 117) + '...' : content

  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${oneSignalApiKey}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        filters: [{ field: 'tag', key: 'user_id', relation: '=', value: userId }],
        headings: { en: `💧 ${topicName}` },
        contents: { en: preview },
        url: `${process.env.NEXT_PUBLIC_APP_URL}/pill/${pillId}`,
        web_push_topic: 'drip-pill',
      }),
    })
  } catch (err) {
    console.error('Push notification error:', err)
  }
}
