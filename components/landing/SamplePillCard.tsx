'use client'

interface SamplePill {
  topic: string
  content: string
  source: string
  level: string
}

export default function SamplePillCard({ pill, index }: { pill: SamplePill; index: number }) {
  return (
    <div
      className="pill-card animate-fade-in-up"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="topic-badge">💧 {pill.topic}</span>
        <span className="text-xs text-[#6B6B6B] capitalize">{pill.level}</span>
      </div>
      <p className="pill-content text-[#F5F0E8] mb-4">{pill.content}</p>
      <div className="pt-4 border-t border-[#2A2A2A]">
        <p className="text-xs text-[#6B6B6B]">
          <span className="text-amber-500/70">Source:</span> {pill.source}
        </p>
      </div>
    </div>
  )
}
