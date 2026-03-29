import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { subscription, oneSignalPlayerId } = body

  // Store OneSignal player ID as a tag on the subscription
  if (oneSignalPlayerId) {
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      subscription_json: {
        oneSignalPlayerId,
        ...subscription,
      },
    })
  }

  return NextResponse.json({ success: true })
}
