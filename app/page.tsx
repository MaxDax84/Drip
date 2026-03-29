import Link from 'next/link'
import { SAMPLE_PILLS } from '@/components/landing/sample-pills'
import SamplePillCard from '@/components/landing/SamplePillCard'
import Navbar from '@/components/landing/Navbar'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' }}
        />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Powered by Claude AI
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold text-[#F5F0E8] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Learn anything.
            <br />
            <span className="text-amber-400">Effortlessly.</span>
          </h1>

          <p className="text-xl text-[#9A9A9A] mb-10 max-w-xl mx-auto leading-relaxed">
            Pick topics you love. Get surprising, bite-sized knowledge pills
            delivered throughout your day — while you live your life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/onboarding" className="btn-primary text-lg px-8 py-4">
              Start for free
            </Link>
            <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
              How it works
            </a>
          </div>

          <p className="text-[#6B6B6B] text-sm mt-6">
            Free plan · No credit card required · 3 topics, 3 pills/day
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-[#2A2A2A]">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-4xl font-bold text-center text-[#F5F0E8] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Three steps to passive mastery
          </h2>
          <p className="text-center text-[#9A9A9A] mb-16">
            No schedules to keep. No lessons to complete. Just knowledge that finds you.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Pick your topics',
                desc: 'Choose anything — quantum physics, stoic philosophy, jazz history, Byzantine art. Up to 3 topics on the free plan.',
                icon: '🎯',
              },
              {
                step: '02',
                title: 'Set your hours',
                desc: 'Tell Drip when you\'re awake and available. It will send pills at random times within your window — never predictable.',
                icon: '⏰',
              },
              {
                step: '03',
                title: 'Receive knowledge pills',
                desc: 'Push notifications deliver surprising, non-obvious facts straight to your screen. Each pill ends with a question that makes you think.',
                icon: '💧',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="pill-card animate-fade-in-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-amber-500 text-xs font-mono font-bold mb-2 tracking-widest">
                  STEP {item.step}
                </div>
                <h3
                  className="text-xl font-bold text-[#F5F0E8] mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {item.title}
                </h3>
                <p className="text-[#9A9A9A] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample pills */}
      <section className="py-24 px-6 bg-[#0A0A0A] border-t border-[#2A2A2A]">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-4xl font-bold text-center text-[#F5F0E8] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            What a pill looks like
          </h2>
          <p className="text-center text-[#9A9A9A] mb-12">
            Real examples from the knowledge engine — surprising, specific, thought-provoking.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {SAMPLE_PILLS.map((pill, i) => (
              <SamplePillCard key={i} pill={pill} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-[#2A2A2A]">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-4xl font-bold text-center text-[#F5F0E8] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Simple pricing
          </h2>
          <p className="text-center text-[#9A9A9A] mb-16">Start free. Upgrade when you want more.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="pill-card">
              <div className="text-[#9A9A9A] text-sm font-medium mb-4">FREE</div>
              <div className="text-4xl font-bold text-[#F5F0E8] mb-1">€0</div>
              <div className="text-[#6B6B6B] text-sm mb-6">forever</div>
              <ul className="space-y-3 mb-8">
                {['3 topics', '~3 pills per day', 'Push notifications', '7-day history'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[#9A9A9A]">
                    <span className="text-amber-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/onboarding" className="btn-secondary w-full block text-center">
                Get started
              </Link>
            </div>

            {/* Pro */}
            <div className="pill-card border-amber-500/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-amber-400 text-sm font-medium mb-4">PRO</div>
              <div className="text-4xl font-bold text-[#F5F0E8] mb-1">€4.99</div>
              <div className="text-[#6B6B6B] text-sm mb-6">per month</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited topics',
                  'Up to 12 pills per day',
                  'Full history',
                  'Source links & attribution',
                  'Priority knowledge engine',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[#9A9A9A]">
                    <span className="text-amber-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/onboarding?plan=pro" className="btn-primary w-full block text-center">
                Start Pro trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 border-t border-[#2A2A2A] text-center">
        <div className="max-w-xl mx-auto">
          <h2
            className="text-4xl font-bold text-[#F5F0E8] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Start your drip today.
          </h2>
          <p className="text-[#9A9A9A] mb-8">
            Join curious people learning quietly, one pill at a time.
          </p>
          <Link href="/onboarding" className="btn-primary text-lg px-8 py-4">
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2A] py-8 px-6 text-center text-[#6B6B6B] text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-amber-400 text-lg">💧</span>
          <span className="font-semibold text-[#F5F0E8]">Drip</span>
        </div>
        <p>Built with Claude AI · © 2025 Drip</p>
      </footer>
    </div>
  )
}
