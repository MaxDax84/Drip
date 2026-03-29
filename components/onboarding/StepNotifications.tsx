'use client'

import { useState } from 'react'

interface Props {
  onFinish: () => void
}

export default function StepNotifications({ onFinish }: Props) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')

  async function requestPermission() {
    setStatus('requesting')

    if (!('Notification' in window)) {
      setStatus('denied')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      setStatus('granted')
      // OneSignal would initialize here in production
      // OneSignal.init({ appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID })
    } else {
      setStatus('denied')
    }
  }

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">🔔</div>
      <h2
        className="text-3xl font-bold text-[#F5F0E8] mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Enable notifications
      </h2>
      <p className="text-[#9A9A9A] mb-8 max-w-sm mx-auto">
        Allow push notifications so Drip can deliver knowledge pills to you throughout the day.
      </p>

      {status === 'idle' && (
        <div className="space-y-3">
          <button onClick={requestPermission} className="btn-primary w-full">
            Enable notifications
          </button>
          <button onClick={onFinish} className="btn-secondary w-full">
            Skip for now
          </button>
          <p className="text-xs text-[#6B6B6B]">
            You can always enable this later in your dashboard settings.
          </p>
        </div>
      )}

      {status === 'requesting' && (
        <div className="pill-card">
          <p className="text-[#9A9A9A]">Waiting for permission...</p>
        </div>
      )}

      {status === 'granted' && (
        <div className="space-y-4">
          <div className="pill-card border-amber-500/30">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-[#F5F0E8] font-medium">Notifications enabled!</p>
            <p className="text-[#9A9A9A] text-sm mt-1">
              Your first pill is on its way. Start learning effortlessly.
            </p>
          </div>
          <button onClick={onFinish} className="btn-primary w-full">
            Go to my dashboard
          </button>
        </div>
      )}

      {status === 'denied' && (
        <div className="space-y-4">
          <div className="pill-card">
            <div className="text-2xl mb-2">😔</div>
            <p className="text-[#9A9A9A] text-sm">
              No worries — you can still see all your pills in the dashboard.
              You can enable notifications later in browser settings.
            </p>
          </div>
          <button onClick={onFinish} className="btn-primary w-full">
            Go to my dashboard
          </button>
        </div>
      )}
    </div>
  )
}
