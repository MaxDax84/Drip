'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pill } from '@/types'
import { timeAgo } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

interface Props {
  pill: Pill
  onSaveToggle?: (id: string, saved: boolean) => void
}

export default function PillCard({ pill, onSaveToggle }: Props) {
  const [saved, setSaved] = useState(pill.saved)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function toggleSave() {
    setSaving(true)
    const newSaved = !saved
    const { error } = await supabase
      .from('pills')
      .update({ saved: newSaved })
      .eq('id', pill.id)

    if (!error) {
      setSaved(newSaved)
      onSaveToggle?.(pill.id, newSaved)
    }
    setSaving(false)
  }

  return (
    <div className="pill-card group">
      <div className="flex items-center justify-between mb-3">
        <span className="topic-badge">
          💧 {pill.topic?.name || 'Unknown topic'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6B6B6B]">{timeAgo(pill.sent_at)}</span>
          <button
            onClick={toggleSave}
            disabled={saving}
            className={`transition-colors text-sm ${
              saved ? 'text-amber-400' : 'text-[#6B6B6B] hover:text-amber-400'
            }`}
            title={saved ? 'Unsave' : 'Save'}
          >
            {saved ? '🔖' : '🏷️'}
          </button>
        </div>
      </div>

      <Link href={`/pill/${pill.id}`}>
        <p className="pill-content text-[#F5F0E8] mb-4 hover:text-amber-50 transition-colors cursor-pointer">
          {pill.content}
        </p>
      </Link>

      {pill.source_summary && pill.source_summary !== 'No specific source' && (
        <div className="pt-3 border-t border-[#2A2A2A]">
          <p className="text-xs text-[#6B6B6B]">
            <span className="text-amber-500/60">Source:</span> {pill.source_summary}
          </p>
        </div>
      )}
    </div>
  )
}
