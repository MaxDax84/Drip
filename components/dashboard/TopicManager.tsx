'use client'

import { useState } from 'react'
import { Topic } from '@/types'
import { createClient } from '@/lib/supabase'

interface Props {
  initialTopics: Topic[]
  plan: 'free' | 'pro'
}

const MAX_FREE = 3

export default function TopicManager({ initialTopics, plan }: Props) {
  const [topics, setTopics] = useState(initialTopics)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const maxTopics = plan === 'pro' ? Infinity : MAX_FREE
  const canAdd = topics.length < maxTopics

  async function addTopic() {
    const name = input.trim()
    if (!name || !canAdd) return

    setLoading(true)
    setError('')

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const { data, error: err } = await supabase
      .from('topics')
      .insert({
        user_id: user.user.id,
        name,
        slug,
        level: 'beginner',
        pill_count: 0,
      })
      .select()
      .single()

    if (err) {
      setError(err.message)
    } else {
      setTopics((prev) => [...prev, data])
      setInput('')
    }

    setLoading(false)
  }

  async function deleteTopic(id: string) {
    const { error: err } = await supabase.from('topics').delete().eq('id', id)
    if (!err) {
      setTopics((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const levelColors = {
    beginner: 'text-green-400',
    intermediate: 'text-amber-400',
    advanced: 'text-orange-400',
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-xl font-bold text-[#F5F0E8]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your topics
        </h2>
        <span className="text-sm text-[#6B6B6B]">
          {topics.length}/{plan === 'pro' ? '∞' : MAX_FREE} topics
        </span>
      </div>

      {/* Topic list */}
      <div className="space-y-3 mb-6">
        {topics.map((t) => (
          <div key={t.id} className="pill-card flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#F5F0E8] font-medium">💧 {t.name}</span>
                <span className={`text-xs capitalize ${levelColors[t.level]}`}>{t.level}</span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">{t.pill_count} pills received</p>
            </div>
            <button
              onClick={() => deleteTopic(t.id)}
              className="text-[#6B6B6B] hover:text-red-400 transition-colors text-sm"
              title="Remove topic"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add new topic */}
      {canAdd ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTopic()}
              placeholder="Add a new topic..."
              className="input-field"
            />
            <button
              onClick={addTopic}
              disabled={!input.trim() || loading}
              className="btn-primary px-4 whitespace-nowrap disabled:opacity-50"
            >
              {loading ? '...' : 'Add'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      ) : (
        <div className="pill-card border-amber-500/20 text-center py-6">
          <p className="text-[#9A9A9A] text-sm mb-3">
            You&apos;ve reached the limit of {MAX_FREE} topics on the free plan.
          </p>
          <a href="/upgrade" className="btn-primary text-sm px-4 py-2">
            Upgrade to Pro
          </a>
        </div>
      )}
    </div>
  )
}
