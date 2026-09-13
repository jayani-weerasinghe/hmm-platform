'use client'

import { useState, useTransition } from 'react'
import type { BarItem } from '@/actions/dashboard'
import { getOnboardingProgress } from '@/actions/dashboard'
import type { OnboardingFilter } from '@/actions/dashboard'

const MAX_VISIBLE = 10

const FILTER_LABELS: Record<OnboardingFilter, string> = {
  this_month:   'This Month',
  last_month:   'Last Month',
  this_quarter: 'This Quarter',
}

function ViewAllModal({
  open,
  onClose,
  data,
}: {
  open: boolean
  onClose: () => void
  data: BarItem[]
}) {
  if (!open) return null
  const sorted = [...data].sort((a, b) => b.count - a.count)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-[#0F172A]">Club Onboarding Progress — All Clubs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Club</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">New Gatekeepers</th>
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

function OnboardingRow({ item, maxCount }: { item: BarItem; maxCount: number }) {
  const pct = maxCount > 0 ? Math.max((item.count / maxCount) * 100, item.count > 0 ? 2 : 0) : 0

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#0F172A]">{item.club_name}</span>
        <span className="text-xs font-extrabold text-[#F4AC1E]">{item.count} new</span>
      </div>
      <div className="h-[12px] w-full overflow-hidden rounded-md bg-[#F1F5F9]">
        {item.count > 0 && (
          <div className="h-full rounded bg-[#F4AC1E] transition-all" style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  )
}

export function OnboardingWidget({ initialData }: { initialData: BarItem[] }) {
  const [filter, setFilter] = useState<OnboardingFilter>('this_month')
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()
  const [showAll, setShowAll] = useState(false)

  const handleFilter = (next: OnboardingFilter) => {
    if (next === filter) return
    setFilter(next)
    startTransition(async () => {
      const fresh = await getOnboardingProgress(next)
      setData(fresh)
    })
  }

  const visible = data.slice(0, MAX_VISIBLE)
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const hasMore = data.length > MAX_VISIBLE
  const totalOnboarded = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl bg-white p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0F172A]">Club Onboarding Progress</h2>
          <div className="flex items-center gap-0.5 rounded-lg bg-[#F1F5F9] p-0.5">
            {(Object.keys(FILTER_LABELS) as OnboardingFilter[]).map(f => (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                disabled={isPending}
                className={`rounded-md px-3 py-1 text-[11px] font-bold transition-colors disabled:opacity-60 ${
                  filter === f ? 'bg-white text-[#1E4BB8]' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        <p className="mb-3 text-[11px] text-[#64748B]">Newly certified gatekeepers joining active cohorts this period.</p>

        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No data yet</p>
        ) : (
          <div className="flex flex-col gap-3.5">
            {visible.map(item => (
              <OnboardingRow key={item.club_id} item={item} maxCount={maxCount} />
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-4 self-start text-xs font-bold text-[#1E4BB8] hover:underline"
          >
            View all {data.length} clubs →
          </button>
        )}

        {data.length > 0 && (
          <div className="mt-4 border-t border-[#E2E8F0] pt-3 text-[11px] text-[#64748B]">
            Total onboarded this period: <span className="font-bold text-[#0F172A]">{totalOnboarded} gatekeeper{totalOnboarded !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      <ViewAllModal open={showAll} onClose={() => setShowAll(false)} data={data} />
    </>
  )
}
