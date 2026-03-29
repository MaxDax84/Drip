import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  // Fetch today's pills
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: todayPills } = await supabase
    .from('pills')
    .select('*, topic:topics(name, slug, level)')
    .eq('user_id', user.id)
    .gte('sent_at', todayStart.toISOString())
    .order('sent_at', { ascending: false })

  // Fetch saved pills
  const { data: savedPills } = await supabase
    .from('pills')
    .select('*, topic:topics(name, slug, level)')
    .eq('user_id', user.id)
    .eq('saved', true)
    .order('sent_at', { ascending: false })
    .limit(20)

  // Fetch topics
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return (
    <DashboardClient
      profile={profile}
      todayPills={todayPills || []}
      savedPills={savedPills || []}
      topics={topics || []}
    />
  )
}
