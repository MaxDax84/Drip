'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url, error } = await res.json()

    if (error) {
      alert(error)
      setLoading(false)
      return
    }

    if (url) {
      window.location.href = url
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="text-[#9A9A9A] hover:text-[#F5F0E8] text-sm">
            ← Back to dashboard
          </Link>
        </div>

        <div className="pill-card border-amber-500/30">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">⚡</div>
            <h1
              className="text-3xl font-bold text-[#F5F0E8] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Go Pro
            </h1>
            <div className="text-4xl font-bold text-amber-400 mb-1">€4.99</div>
            <div className="text-[#6B6B6B] text-sm">per month · cancel anytime</div>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              'Unlimited topics (vs 3 on free)',
              'Up to 12 pills per day (vs 3)',
              'Full pill history',
              'Source links & full attribution',
              'Priority knowledge engine refresh',
              'Support independent development',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-[#9A9A9A] text-sm">
                <span className="text-amber-500 mt-0.5">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50"
          >
            {loading ? 'Redirecting to checkout...' : 'Upgrade to Pro'}
          </button>

          <p className="text-center text-xs text-[#6B6B6B] mt-4">
            Secure payment via Stripe · 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  )
}
