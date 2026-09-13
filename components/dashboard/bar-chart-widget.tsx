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
          <h2 className="text-base font-semibold text-[#0F172A]">{title} — All Clubs</h2>
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

function RankedRow({ item, rank, maxCount }: { item: BarItem; rank: number; maxCount: number }) {
  const pct = maxCount > 0 ? Math.max((item.count / maxCount) * 100, item.count > 0 ? 2 : 0) : 0

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-4 text-[11px] font-bold text-[#64748B]">#{rank}</span>
          <span className="text-xs font-bold text-[#0F172A]">{item.club_name}</span>
          {item.club_location && (
            <span className="rounded bg-[#F1F5F9] px-1.5 text-[10px] text-[#475569]">{item.club_location}</span>
          )}
        </div>
        <div className="flex items-end whitespace-nowrap">
          <span className="text-xs font-bold text-[#0F172A]">{item.count}</span>
          <span className="ml-1 text-[11px] text-[#64748B]">gatekeepers</span>
        </div>
      </div>
      <div className="h-[14px] w-full overflow-hidden rounded-md bg-[#F1F5F9]">
        {item.count > 0 && (
          <div className="h-full rounded bg-[#022C51] transition-all" style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  )
}

export function BarChartWidget({ data }: { data: BarItem[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = data.slice(0, MAX_VISIBLE)
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const hasMore = data.length > MAX_VISIBLE
  const average = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.count, 0) / data.length) : 0

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl bg-white p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0F172A]">Active Gatekeepers by Club</h2>
          {hasMore ? (
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-1 text-xs font-bold text-[#1E4BB8] hover:underline"
            >
              View all {data.length} clubs ↗
            </button>
          ) : (
            <Link
              href="/super-admin/clubs"
              className="flex items-center gap-1 text-xs font-bold text-[#1E4BB8] hover:underline"
            >
              View all clubs ↗
            </Link>
          )}
        </div>
        <p className="mb-3 text-[11px] text-[#64748B]">Descending order of active, certified gatekeepers.</p>

        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No data yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((item, i) => (
              <RankedRow key={item.club_id} item={item} rank={i + 1} maxCount={maxCount} />
            ))}
          </div>
        )}

        {data.length > 0 && (
          <div className="mt-4 border-t border-[#E2E8F0] pt-3 text-[11px] text-[#64748B]">
            Average: <span className="font-bold text-[#0F172A]">{average} gatekeeper{average !== 1 ? 's' : ''}</span> per club
          </div>
        )}
      </div>
      {hasMore && (
        <ViewAllModal open={showAll} onClose={() => setShowAll(false)} title="Active Gatekeepers by Club" data={data} />
      )}
    </>
  )
}
