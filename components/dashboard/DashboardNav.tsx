import Link from 'next/link'
import { User } from '@/types'

interface Props {
  profile: User
}

export default function DashboardNav({ profile }: Props) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2A2A2A] bg-[#0F0F0F]/90 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-amber-400 text-xl">💧</span>
          <span
            className="text-xl font-bold text-[#F5F0E8]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Drip
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1 rounded-full text-[#9A9A9A] capitalize">
            {profile.plan}
          </span>
          {profile.plan === 'free' && (
            <Link
              href="/upgrade"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
