'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function ClubFilters({ q, status }: { q?: string; status?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams()
    if (key !== 'q' && q)      params.set('q', q)
    if (key !== 'status' && status) params.set('status', status)
    if (value) params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, q, status])

  return (
    <div className="flex gap-3">
      <input
        type="search"
        placeholder="Search by name…"
        defaultValue={q}
        onChange={e => update('q', e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
      />
      <select
        defaultValue={status ?? ''}
        onChange={e => update('status', e.target.value)}
        className="rounded-lg border border-gray-200 bg-white pl-4 pr-9 py-2.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  )
}
