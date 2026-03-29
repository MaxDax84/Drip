'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-amber-400 text-2xl">💧</span>
            <span
              className="text-2xl font-bold text-[#F5F0E8]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Drip
            </span>
          </Link>
          <h1
            className="text-2xl font-bold text-[#F5F0E8] mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Welcome back
          </h1>
          <p className="text-[#9A9A9A]">Sign in with your email — no password needed.</p>
        </div>

        {sent ? (
          <div className="pill-card text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-semibold text-[#F5F0E8] mb-2">Check your inbox</h2>
            <p className="text-[#9A9A9A] text-sm">
              We sent a magic link to <strong className="text-amber-400">{email}</strong>.
              <br />
              Click it to sign in instantly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-[#9A9A9A] mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>

            <p className="text-center text-sm text-[#6B6B6B]">
              No account yet?{' '}
              <Link href="/onboarding" className="text-amber-400 hover:text-amber-300">
                Get started free
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
