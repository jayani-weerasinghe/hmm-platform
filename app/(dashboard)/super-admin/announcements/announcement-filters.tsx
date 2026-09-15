'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Users',
  champions: 'Champions',
  gatekeepers: 'Gatekeepers',
  specific_clubs: 'Specific Cohort',
}

export function AnnouncementFilters({
  q,
  audience,
  status,
}: {
  q?: string
  audience?: string
  status?: string
}) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams()
    if (key !== 'q' && q) params.set('q', q)
    if (key !== 'audience' && audience) params.set('audience', audience)
    if (status) params.set('status', status)
    if (value) params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, q, audience, status])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-[240px] flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/search-filter.svg"
          alt=""
          className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2"
        />
        <input
          type="search"
          placeholder="Filter announcements..."
          defaultValue={q}
          onChange={e => update('q', e.target.value)}
          className="w-full rounded-lg border border-transparent bg-[#F1F5F9] py-[11px] pl-10 pr-4 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F4AC1E]/40"
        />
      </div>

      <div className="relative flex-shrink-0">
        <select
          defaultValue={audience ?? ''}
          onChange={e => update('audience', e.target.value)}
          className="min-w-[170px] appearance-none rounded-lg border border-transparent bg-[#F1F5F9] py-2.5 pl-3 pr-8 text-[13px] text-[#0F172A] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F4AC1E]/40"
        >
          <option value="">All Audiences</option>
          {Object.entries(AUDIENCE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/chevron-down.svg" alt="" className="pointer-events-none absolute right-3 top-1/2 h-[6px] w-[9px] -translate-y-1/2" />
      </div>
    </div>
  )
}
