'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Real elapsed time since this page's data was loaded — not a live server push,
// just an honest "how stale is what you're looking at" indicator.
function LoadedAgo() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const label = seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`

  return <span suppressHydrationWarning>Loaded {label}</span>
}

export function ExecutiveBanner({ activeClubCount }: { activeClubCount: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6FFE7] px-2.5 py-0.5 text-[11px] font-semibold text-[#0D8275]">
            <span className="h-2 w-2 rounded-full bg-[#0D8275]" />
            {activeClubCount} Active Club{activeClubCount !== 1 ? 's' : ''}
          </span>
          <span className="text-[11px] text-[#64748B]">
            {'• '}<LoadedAgo />
          </span>
        </div>
        <h1 className="mt-[10px] font-[family-name:var(--font-jakarta)] text-2xl font-extrabold tracking-[-0.6px] text-[#0F172A]">
          Executive Overview
        </h1>
        <p className="mt-2 font-[family-name:var(--font-inter)] text-[13px] text-[#475569]">
          Real-time gatekeeper certification, onboarding cohorts, and club health at a glance.
        </p>
      </div>
      <Link
        href="/super-admin/announcements/new"
        className="flex items-center gap-1.5 rounded-md bg-[#F4AC1E] px-4 py-2 text-xs font-bold text-white hover:brightness-95 transition"
      >
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
          <path d="M1 5.5 12 1v10L1 6.5" stroke="white" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
          <path d="M4 7v2.5a1 1 0 0 0 1 1h.5" stroke="white" strokeWidth="1.3" fill="none" />
        </svg>
        + New Announcement
      </Link>
    </div>
  )
}
