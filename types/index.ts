export interface User {
  id: string
  email: string
  created_at: string
  active_hours_start: number
  active_hours_end: number
  plan: 'free' | 'pro'
}

export interface Topic {
  id: string
  user_id: string
  name: string
  slug: string
  created_at: string
  level: 'beginner' | 'intermediate' | 'advanced'
  pill_count: number
}

export interface KnowledgeBase {
  id: string
  topic_id: string
  source_url: string
  summary: string
  key_facts: string[]
  fetched_at: string
  used: boolean
}

export interface Pill {
  id: string
  user_id: string
  topic_id: string
  content: string
  source_summary: string
  sent_at: string
  saved: boolean
  knowledge_base_id: string | null
  topic?: Topic
}

export interface PushSubscription {
  id: string
  user_id: string
  subscription_json: object
}
