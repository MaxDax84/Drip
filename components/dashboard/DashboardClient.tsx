'use client'

import { useState } from 'react'
import { Pill, Topic, User } from '@/types'
import PillCard from './PillCard'
import TopicManager from './TopicManager'
import NotificationSettings from './NotificationSettings'
import DashboardNav from './DashboardNav'

interface Props {
  profile: User
  todayPills: Pill[]
  savedPills: Pill[]
  topics: Topic[]
}

type Tab = 'today' | 'saved' | 'topics' | 'settings'

export default function DashboardClient({ profile, todayPills, savedPills, topics }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [pills, setPills] = useState(todayPills)
  const [saved, setSaved] = useState(savedPills)

  function handleSaveToggle(pillId: string, newSaved: boolean) {
    setPills((prev) => prev.map((p) => p.id === pillId ? { ...p, saved: newSaved } : p))
    if (newSaved) {
      const pill = pills.find((p) => p.id === pillId)
      if (pill) setSaved((prev) => [{ ...pill, saved: true }, ...prev])
    } else {
      setSaved((prev) => prev.filter((p) => p.id !== pillId))
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <DashboardNav profile={profile} />

      <div className="max-w-2xl mx-auto px-4 pt-20 pb-24">
        {/* Header */}
        <div className="mb-8 pt-4">
          <h1
            className="text-3xl font-bold text-[#F5F0E8]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Good {getGreeting()}, learner.
          </h1>
          <p className="text-[#9A9A9A] mt-1">
            {pills.length > 0
              ? `You've received ${pills.length} pill${pills.length !== 1 ? 's' : ''} today.`
              : 'Your first pill is coming soon.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#1A1A1A] rounded-xl mb-8 border border-[#2A2A2A]">
          {([
            ['today', "Today's pills"],
            ['saved', 'Saved'],
            ['topics', 'Topics'],
            ['settings', 'Settings'],
          ] as [Tab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-amber-500 text-black'
                  : 'text-[#9A9A9A] hover:text-[#F5F0E8]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Today's pills */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {pills.length === 0 ? (
              <EmptyState
                icon="⏳"
                title="No pills yet today"
                desc="Drip is warming up. Your first pill will arrive soon within your active hours."
              />
            ) : (
              pills.map((pill, i) => (
                <div
                  key={pill.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <PillCard pill={pill} onSaveToggle={handleSaveToggle} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Saved pills */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {saved.length === 0 ? (
              <EmptyState
                icon="🔖"
                title="Nothing saved yet"
                desc="Tap the bookmark icon on any pill to save it for later."
              />
            ) : (
              saved.map((pill, i) => (
                <div
                  key={pill.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <PillCard pill={pill} onSaveToggle={handleSaveToggle} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Topics */}
        {activeTab === 'topics' && (
          <TopicManager initialTopics={topics} plan={profile.plan} />
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <NotificationSettings profile={profile} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="pill-card text-center py-12">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">{title}</h3>
      <p className="text-[#9A9A9A] text-sm max-w-xs mx-auto">{desc}</p>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
