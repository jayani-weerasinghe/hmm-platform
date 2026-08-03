'use client'

import { useState, useTransition } from 'react'
import { getOnboardingProgress } from '@/actions/dashboard'
import type { StackedItem, BarItem, OnboardingFilter } from '@/actions/dashboard'

type MergedClub = {
  club_id: string
  club_name: string
  active: number
  inactive: number
  total: number
  pct: number
  newGks: number
}

type SortKey = keyof Omit<MergedClub, 'club_id'>
type SortDir = 'asc' | 'desc'

const PERIOD_LABELS: Record<OnboardingFilter, string> = {
  this_month:   'This month',
  last_month:   'Last month',
  this_quarter: 'This quarter',
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={`flex-shrink-0 ${active ? 'text-[#1B2B4A]' : 'text-gray-300'}`}>
      <path d="M6 2L9 6H3L6 2Z" fill={active && dir === 'asc' ? 'currentColor' : '#D1D5DB'} />
      <path d="M6 10L3 6H9L6 10Z" fill={active && dir === 'desc' ? 'currentColor' : '#D1D5DB'} />
    </svg>
  )
}

export function ClubOnboardingCard({
  gatekeeperStatus,
  initialOnboarding,
}: {
  gatekeeperStatus: StackedItem[]
  initialOnboarding: BarItem[]
}) {
  const [showModal, setShowModal]       = useState(false)
  const [period, setPeriod]             = useState<OnboardingFilter>('this_month')
  const [onboarding, setOnboarding]     = useState(initialOnboarding)
  const [sortKey, setSortKey]           = useState<SortKey>('pct')
  const [sortDir, setSortDir]           = useState<SortDir>('desc')
  const [isPending, startTransition]    = useTransition()

  const newByClub = Object.fromEntries(onboarding.map(o => [o.club_id, o.count]))

  const clubs: MergedClub[] = gatekeeperStatus.map(s => {
    const total = s.active + s.inactive
    const pct   = total > 0 ? (s.active / total) * 100 : 0
    return { club_id: s.club_id, club_name: s.club_name, active: s.active, inactive: s.inactive, total, pct, newGks: newByClub[s.club_id] ?? 0 }
  })

  // Progress list: sort by active % descending, show top 6
  const progressList = [...clubs].sort((a, b) => b.pct - a.pct).slice(0, 6)

  // Modal list: sortable
  const modalList = [...clubs].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey]
    if (typeof va === 'string' && typeof vb === 'string')
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })

  const handlePeriod = (next: OnboardingFilter) => {
    if (next === period) return
    setPeriod(next)
    startTransition(async () => {
      const fresh = await getOnboardingProgress(next)
      setOnboarding(fresh)
    })
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <>
      {/* ── Progress card ── */}
      <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1B2B4A]">Club onboarding progress</h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-semibold text-[#3B82F6] transition-colors hover:text-blue-700"
          >
            View all clubs
          </button>
        </div>

        {progressList.length === 0 ? (
          <p className="text-sm text-gray-400">No club data available.</p>
        ) : (
          <div className="space-y-4">
            {progressList.map(c => (
              <div key={c.club_id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1B2B4A]">{c.club_name}</span>
                  <span className="text-sm text-gray-400 tabular-nums">
                    {c.active} / {c.total} · {Math.round(c.pct)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#EDEEF2]">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(c.pct, 100)}%`,
                      backgroundColor: c.pct >= 65 ? '#F5A623' : '#1B2B4A',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-[#1B2B4A]">All clubs — Gatekeeper breakdown</h3>
              <div className="flex items-center gap-4">
                {/* Period filter for "New GKs" column */}
                <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
                  {(Object.keys(PERIOD_LABELS) as OnboardingFilter[]).map(f => (
                    <button
                      key={f}
                      onClick={() => handlePeriod(f)}
                      disabled={isPending}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
                        period === f
                          ? 'bg-white text-[#1B2B4A] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {PERIOD_LABELS[f]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal table */}
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    {([
                      { key: 'club_name',  label: 'Club' },
                      { key: 'active',     label: 'Active GKs' },
                      { key: 'inactive',   label: 'Inactive GKs' },
                      { key: 'total',      label: 'Total GKs' },
                      { key: 'pct',        label: 'Active %' },
                      { key: 'newGks',     label: `New GKs (${PERIOD_LABELS[period].toLowerCase()})` },
                    ] as { key: SortKey; label: string }[]).map(col => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className="cursor-pointer select-none px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          <SortIcon active={sortKey === col.key} dir={sortDir} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {modalList.map(c => (
                    <tr key={c.club_id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-[#1B2B4A]">{c.club_name}</td>
                      <td className="px-6 py-3 text-sm tabular-nums text-gray-700">{c.active}</td>
                      <td className="px-6 py-3 text-sm tabular-nums text-gray-700">{c.inactive}</td>
                      <td className="px-6 py-3 text-sm tabular-nums text-gray-700">{c.total}</td>
                      <td className="px-6 py-3 text-sm tabular-nums">
                        <span className={`font-semibold ${c.pct >= 65 ? 'text-[#F5A623]' : 'text-[#1B2B4A]'}`}>
                          {Math.round(c.pct)}%
                        </span>
                        <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-[#EDEEF2]">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(c.pct, 100)}%`,
                              backgroundColor: c.pct >= 65 ? '#F5A623' : '#1B2B4A',
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm tabular-nums text-gray-700">{c.newGks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
