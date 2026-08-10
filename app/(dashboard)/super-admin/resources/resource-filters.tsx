'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function ResourceFilters({ q, type }: { q?: string; type?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams()
    if (key !== 'q' && q)       params.set('q', q)
    if (key !== 'type' && type) params.set('type', type)
    if (value) params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, q, type])

  return (
    <div className="flex gap-3">
      <input
        type="search"
        placeholder="Search by title…"
        defaultValue={q}
        onChange={e => update('q', e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
      />
      <select
        defaultValue={type ?? ''}
        onChange={e => update('type', e.target.value)}
        className="rounded-lg border border-gray-200 bg-white pl-4 pr-9 py-2.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
      >
        <option value="">All types</option>
        <option value="video">Video</option>
        <option value="article">Article</option>
        <option value="document">Document</option>
        <option value="other">Other</option>
      </select>
    </div>
  )
}
