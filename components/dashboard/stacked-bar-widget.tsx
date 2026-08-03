'use client'

import { useState } from 'react'
import type { StackedItem } from '@/actions/dashboard'

const MAX_VISIBLE = 10

type SortKey = 'name' | 'active' | 'inactive' | 'total'
type SortDir = 'asc' | 'desc'

function ViewAllModal({
  open,
  onClose,
  data,
}: {
  open: boolean
  onClose: () => void
  data: StackedItem[]
}) {
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  if (!open) return null

  const sorted = [...data].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'name') return a.club_name.localeCompare(b.club_name) * mul
    if (sortKey === 'active') return (a.active - b.active) * mul
    if (sortKey === 'inactive') return (a.inactive - b.inactive) * mul
    return ((a.active + a.inactive) - (b.active + b.inactive)) * mul
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
      <div className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Club-wise Gatekeeper Count — All Clubs</h2>
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
                <th className="cursor-pointer select-none px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-blue-600 hover:text-blue-800" onClick={() => toggle('active')}>
                  Active{arrow('active')}
                </th>
                <th className="cursor-pointer select-none px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-orange-500 hover:text-orange-700" onClick={() => toggle('inactive')}>
                  Inactive{arrow('inactive')}
                </th>
                <th className="cursor-pointer select-none px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-800" onClick={() => toggle('total')}>
                  Total{arrow('total')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sorted.map(row => (
                <tr key={row.club_id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">{row.club_name}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-blue-600">{row.active}</td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-orange-500">{row.inactive}</td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-700">{row.active + row.inactive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StackedBar({ item, maxTotal }: { item: StackedItem; maxTotal: number }) {
  const [tooltip, setTooltip] = useState<'active' | 'inactive' | null>(null)
  const total = item.active + item.inactive
  const barWidthPct = maxTotal > 0 ? Math.max((total / maxTotal) * 100, total > 0 ? 2 : 0) : 0
  const activePct = total > 0 ? (item.active / total) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <div className="w-32 flex-shrink-0 truncate text-right text-xs text-gray-500" title={item.club_name}>
        {item.club_name}
      </div>
      <div className="relative flex-1">
        <div className="h-6 overflow-hidden rounded bg-gray-100">
          {total === 0 ? (
            <div className="flex h-full items-center px-2">
              <span className="text-xs text-gray-400">0</span>
            </div>
          ) : (
            <div className="flex h-full" style={{ width: `${barWidthPct}%` }}>
              {item.active > 0 && (
                <div
                  className="relative flex h-full items-center bg-blue-500"
                  style={{ width: `${activePct}%` }}
                  onMouseEnter={() => setTooltip('active')}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {activePct > 15 && (
                    <span className="px-1 text-xs font-medium text-white">{item.active}</span>
                  )}
                </div>
              )}
              {item.inactive > 0 && (
                <div
                  className="relative flex h-full flex-1 items-center bg-orange-400"
                  onMouseEnter={() => setTooltip('inactive')}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {(100 - activePct) > 15 && (
                    <span className="px-1 text-xs font-medium text-white">{item.inactive}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {tooltip && (
          <div className="pointer-events-none absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow">
            {item.club_name} — Active: {item.active}, Inactive: {item.inactive}
          </div>
        )}
      </div>
    </div>
  )
}

export function StackedBarWidget({ data }: { data: StackedItem[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = data.slice(0, MAX_VISIBLE)
  const maxTotal = Math.max(...data.map(d => d.active + d.inactive), 1)
  const hasMore = data.length > MAX_VISIBLE

  return (
    <>
      <div className="flex flex-col rounded-xl bg-white p-5 ring-1 ring-gray-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Club-wise Gatekeeper Count</h2>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
              Active
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-400" />
              Inactive
            </span>
          </div>
        </div>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No data yet</p>
        ) : (
          <div className="space-y-2">
            {visible.map(item => (
              <StackedBar key={item.club_id} item={item} maxTotal={maxTotal} />
            ))}
          </div>
        )}
        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-4 self-start text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            View All ({data.length} clubs) →
          </button>
        )}
      </div>
      <ViewAllModal open={showAll} onClose={() => setShowAll(false)} data={data} />
    </>
  )
}
