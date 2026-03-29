'use client'

import { formatTime } from '@/lib/utils'

interface Props {
  start: number
  end: number
  onChangeStart: (h: number) => void
  onChangeEnd: (h: number) => void
  onBack: () => void
  onNext: () => void
  loading: boolean
  error: string
}

export default function StepHours({
  start, end, onChangeStart, onChangeEnd,
  onBack, onNext, loading, error
}: Props) {
  return (
    <div>
      <h2
        className="text-3xl font-bold text-[#F5F0E8] mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        When are you around?
      </h2>
      <p className="text-[#9A9A9A] mb-8">
        Drip will only send pills during these hours. Timing is random — never predictable.
      </p>

      <div className="space-y-8 mb-8">
        {/* Start hour */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm text-[#9A9A9A]">Start time</label>
            <span className="text-amber-400 font-medium">{formatTime(start)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={23}
            value={start}
            onChange={(e) => onChangeStart(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-[#6B6B6B] mt-1">
            <span>12 AM</span>
            <span>12 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* End hour */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm text-[#9A9A9A]">End time</label>
            <span className="text-amber-400 font-medium">{formatTime(end)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={23}
            value={end}
            onChange={(e) => onChangeEnd(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-[#6B6B6B] mt-1">
            <span>12 AM</span>
            <span>12 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="pill-card mb-8">
        <p className="text-sm text-[#9A9A9A]">
          Drip will send{' '}
          <strong className="text-[#F5F0E8]">3–5 pills per day</strong> between{' '}
          <strong className="text-amber-400">{formatTime(start)}</strong> and{' '}
          <strong className="text-amber-400">{formatTime(end)}</strong>.
        </p>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={loading || start >= end}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>

      {start >= end && (
        <p className="text-red-400 text-xs mt-2 text-center">
          End time must be after start time
        </p>
      )}
    </div>
  )
}
