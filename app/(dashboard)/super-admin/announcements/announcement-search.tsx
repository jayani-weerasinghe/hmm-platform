'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function AnnouncementSearch({ q }: { q?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((value: string) => {
    const params = new URLSearchParams()
    if (value) params.set('q', value)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname])

  return (
    <input
      type="search"
      placeholder="Search by title…"
      defaultValue={q}
      onChange={e => update(e.target.value)}
      className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
    />
  )
}
