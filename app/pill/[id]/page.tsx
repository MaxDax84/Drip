import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'

export default async function PillPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: pill } = await supabase
    .from('pills')
    .select('*, topic:topics(name, slug, level)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!pill) notFound()

  // Fetch related pills on the same topic
  const { data: related } = await supabase
    .from('pills')
    .select('id, content, sent_at')
    .eq('topic_id', pill.topic_id)
    .eq('user_id', user.id)
    .neq('id', pill.id)
    .order('sent_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2A2A2A] bg-[#0F0F0F]/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-[#9A9A9A] hover:text-[#F5F0E8] transition-colors"
          >
            ← Back
          </Link>
          <span className="text-[#2A2A2A]">|</span>
          <span className="topic-badge">💧 {pill.topic?.name}</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        {/* Main pill */}
        <div className="pill-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[#6B6B6B] capitalize">
              {pill.topic?.level} level
            </span>
            <span className="text-xs text-[#6B6B6B]">{timeAgo(pill.sent_at)}</span>
          </div>

          <p className="pill-content text-[#F5F0E8] text-lg mb-6">{pill.content}</p>

          {pill.source_summary && pill.source_summary !== 'No specific source' && (
            <div className="pt-4 border-t border-[#2A2A2A]">
              <p className="text-sm text-[#6B6B6B]">
                <span className="text-amber-500/70 font-medium">Source:</span>{' '}
                {pill.source_summary}
              </p>
            </div>
          )}
        </div>

        {/* Related pills */}
        {related && related.length > 0 && (
          <div>
            <h2
              className="text-lg font-bold text-[#F5F0E8] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              More on {pill.topic?.name}
            </h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link key={r.id} href={`/pill/${r.id}`}>
                  <div className="pill-card cursor-pointer">
                    <p className="pill-content text-[#9A9A9A] text-sm line-clamp-2">{r.content}</p>
                    <p className="text-xs text-[#6B6B6B] mt-2">{timeAgo(r.sent_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
