'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { BarItem } from '@/actions/dashboard'

const MAX_VISIBLE = 10

type SortKey = 'name' | 'count'
type SortDir = 'asc' | 'desc'

function ViewAllModal({
  open,
  onClose,
  title,
  data,
}: {
  open: boolean
  onClose: () => void
  title: string
  data: BarItem[]
}) {
  const [sortKey, setSortKey] = useState<SortKey>('count')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  if (!open) return null

  const sorted = [...data].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    return sortKey === 'name'
      ? a.club_name.localeCompare(b.club_name) * mul
      : (a.count - b.count) * mul
  })

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const arrow = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1B2B4A]">{title} — All Clubs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="cursor-pointer select-none px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-800" onClick={() => toggle('name')}>
                  Club{arrow('name')}
                </th>
                <th className="cursor-pointer select-none px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-800" onClick={() => toggle('count')}>
                  Count{arrow('count')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sorted.map(row => (
                <tr key={row.club_id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">{row.club_name}</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-700">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Bar({ item, maxCount, color }: { item: BarItem; maxCount: number; color: string }) {
  const [hover, setHover] = useState(false)
  const pct = maxCount > 0 ? Math.max((item.count / maxCount) * 100, item.count > 0 ? 2 : 0) : 0
  const displayPct = maxCount > 0 && item.count > 0 ? Math.round((item.count / maxCount) * 100) : 0

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 flex-shrink-0 truncate text-sm text-gray-600" title={item.club_name}>
        {item.club_name}
      </div>
      <div
        className="relative flex-1"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="h-5 overflow-hidden rounded-full bg-gray-100">
          {item.count > 0 ? (
            <div
              className={`h-full rounded-full transition-all ${color}`}
              style={{ width: `${pct}%` }}
            />
          ) : null}
        </div>
        {hover && (
          <div className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white shadow">
            {item.club_name}: {item.count}
          </div>
        )}
      </div>
      <div className="w-20 flex-shrink-0 text-right text-xs text-gray-400">
        {item.count > 0 ? `${item.count} · ${displayPct}%` : '0'}
      </div>
    </div>
  )
}

export function BarChartWidget({
  title,
  data,
  color = 'bg-amber-500',
  filterSlot,
}: {
  title: string
  data: BarItem[]
  color?: string
  filterSlot?: React.ReactNode
}) {
  const [showAll, setShowAll] = useState(false)
  const visible = data.slice(0, MAX_VISIBLE)
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const hasMore = data.length > MAX_VISIBLE

  return (
    <>
      <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[#1B2B4A]">{title}</h2>
          {filterSlot ?? (
            <Link
              href="/super-admin/clubs"
              className="text-sm font-semibold text-[#F5A623] hover:underline"
            >
              View all clubs
            </Link>
          )}
        </div>

        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No data yet</p>
        ) : (
          <div className="space-y-3">
            {visible.map(item => (
              <Bar key={item.club_id} item={item} maxCount={maxCount} color={color} />
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-5 self-start text-sm font-semibold text-[#F5A623] hover:underline"
          >
            View all {data.length} clubs →
          </button>
        )}
      </div>
      <ViewAllModal open={showAll} onClose={() => setShowAll(false)} title={title} data={data} />
    </>
  )
}
