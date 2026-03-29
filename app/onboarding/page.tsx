'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import StepTopics from '@/components/onboarding/StepTopics'
import StepHours from '@/components/onboarding/StepHours'
import StepNotifications from '@/components/onboarding/StepNotifications'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [topics, setTopics] = useState<string[]>([])
  const [activeHoursStart, setActiveHoursStart] = useState(9)
  const [activeHoursEnd, setActiveHoursEnd] = useState(21)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<{ id: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setStep(1) // Already logged in, start from step 1
      }
    })
  }, [])

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/onboarding`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setEmailSent(true)
    }
    setLoading(false)
  }

  async function handleSaveTopicsAndHours() {
    setLoading(true)
    setError('')

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setError('Please sign in first')
      setLoading(false)
      return
    }

    // Upsert user settings
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userData.user.id,
        email: userData.user.email,
        active_hours_start: activeHoursStart,
        active_hours_end: activeHoursEnd,
        plan: 'free',
      })

    if (userError) {
      setError(userError.message)
      setLoading(false)
      return
    }

    // Insert topics
    const topicsToInsert = topics.map((name) => ({
      user_id: userData.user!.id,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      level: 'beginner' as const,
      pill_count: 0,
    }))

    const { error: topicsError } = await supabase.from('topics').insert(topicsToInsert)

    if (topicsError) {
      setError(topicsError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(3)
  }

  async function handleFinish() {
    router.push('/dashboard')
  }

  // If not yet authenticated, show email step
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <OnboardingHeader step={0} totalSteps={4} />

          <h2
            className="text-3xl font-bold text-[#F5F0E8] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create your account
          </h2>
          <p className="text-[#9A9A9A] mb-8">
            Enter your email to get started — no password needed.
          </p>

          {emailSent ? (
            <div className="pill-card text-center">
              <div className="text-4xl mb-4">📬</div>
              <h3 className="text-lg font-semibold text-[#F5F0E8] mb-2">Check your inbox</h3>
              <p className="text-[#9A9A9A] text-sm">
                Magic link sent to <strong className="text-amber-400">{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Continue with email'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <OnboardingHeader step={step} totalSteps={3} />

        {step === 1 && (
          <StepTopics
            topics={topics}
            onChange={setTopics}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepHours
            start={activeHoursStart}
            end={activeHoursEnd}
            onChangeStart={setActiveHoursStart}
            onChangeEnd={setActiveHoursEnd}
            onBack={() => setStep(1)}
            onNext={handleSaveTopicsAndHours}
            loading={loading}
            error={error}
          />
        )}

        {step === 3 && (
          <StepNotifications onFinish={handleFinish} />
        )}
      </div>
    </div>
  )
}

function OnboardingHeader({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-amber-400 text-xl">💧</span>
        <span
          className="text-xl font-bold text-[#F5F0E8]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Drip
        </span>
      </div>
      {totalSteps > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < step ? 'bg-amber-500' : 'bg-[#2A2A2A]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
