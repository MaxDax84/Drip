import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2A2A2A] bg-[#0F0F0F]/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-amber-400 text-xl">💧</span>
          <span
            className="text-xl font-bold text-[#F5F0E8]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Drip
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-[#9A9A9A] hover:text-[#F5F0E8] transition-colors text-sm">
            Sign in
          </Link>
          <Link href="/onboarding" className="btn-primary py-2 px-4 text-sm">
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
