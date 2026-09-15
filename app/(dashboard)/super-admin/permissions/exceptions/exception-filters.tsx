'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function ExceptionFilters({ q }: { q?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((value: string) => {
    const params = new URLSearchParams()
    if (value) params.set('q', value)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname])

  return (
    <div className="relative max-w-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/search-filter.svg"
        alt=""
        className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2"
      />
      <input
        type="search"
        placeholder="Search by name or permission..."
        defaultValue={q}
        onChange={e => update(e.target.value)}
        className="w-full rounded-lg border border-transparent bg-[#F1F5F9] py-[11px] pl-10 pr-4 text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F4AC1E]/40"
      />
    </div>
  )
}
