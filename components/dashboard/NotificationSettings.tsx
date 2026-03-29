'use client'

import { useState } from 'react'
import { User } from '@/types'
import { formatTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

interface Props {
  profile: User
}

export default function NotificationSettings({ profile }: Props) {
  const [start, setStart] = useState(profile.active_hours_start)
  const [end, setEnd] = useState(profile.active_hours_end)
  const [saving, setSaving] = useState(false)
  const [saved, setSavedState] = useState(false)
  const supabase = createClient()

  async function saveSettings() {
    setSaving(true)
    await supabase
      .from('users')
      .update({ active_hours_start: start, active_hours_end: end })
      .eq('id', profile.id)
    setSaving(false)
    setSavedState(true)
    setTimeout(() => setSavedState(false), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold text-[#F5F0E8] mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Active hours
        </h2>
        <p className="text-[#9A9A9A] text-sm mb-6">
          Pills will only arrive during this window.
        </p>

        <div className="pill-card space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#9A9A9A]">Start</span>
              <span className="text-amber-400 font-medium">{formatTime(start)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={23}
              value={start}
              onChange={(e) => setStart(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#9A9A9A]">End</span>
              <span className="text-amber-400 font-medium">{formatTime(end)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={23}
              value={end}
              onChange={(e) => setEnd(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <button
            onClick={saveSettings}
            disabled={saving || start >= end}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save hours'}
          </button>
        </div>
      </div>

      <div className="pill-card">
        <h3 className="text-[#F5F0E8] font-medium mb-1">Plan</h3>
        <p className="text-[#9A9A9A] text-sm mb-3 capitalize">
          {profile.plan} plan ·{' '}
          {profile.plan === 'free' ? '3 topics, ~3 pills/day' : 'Unlimited topics, up to 12 pills/day'}
        </p>
        {profile.plan === 'free' && (
          <a href="/upgrade" className="btn-primary text-sm px-4 py-2">
            Upgrade to Pro — €4.99/month
          </a>
        )}
      </div>

      <div className="pill-card">
        <h3 className="text-[#F5F0E8] font-medium mb-1">Account</h3>
        <p className="text-[#9A9A9A] text-sm mb-3">{profile.email}</p>
        <button
          onClick={handleSignOut}
          className="text-sm text-[#6B6B6B] hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
