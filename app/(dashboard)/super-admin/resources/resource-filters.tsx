'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { manrope } from './fonts'
import { colors } from './design-tokens'

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
    <div className="flex gap-2.5">
      <input
        type="search"
        placeholder="Search resources…"
        defaultValue={q}
        onChange={e => update('q', e.target.value)}
        className={`${manrope.className} rounded-full bg-white px-4 py-2 text-[13.5px] focus:outline-none`}
        style={{ border: `1px solid ${colors.border}`, color: colors.navy }}
      />
      <select
        defaultValue={type ?? ''}
        onChange={e => update('type', e.target.value)}
        className={`${manrope.className} rounded-full bg-white px-4 py-2 text-[13.5px] focus:outline-none`}
        style={{ border: `1px solid ${colors.border}`, color: colors.navy }}
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
