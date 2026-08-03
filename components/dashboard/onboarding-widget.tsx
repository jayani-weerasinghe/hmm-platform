'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { BarChartWidget } from './bar-chart-widget'
import { getOnboardingProgress } from '@/actions/dashboard'
import type { BarItem, OnboardingFilter } from '@/actions/dashboard'

const FILTER_LABELS: Record<OnboardingFilter, string> = {
  this_month:   'This Month',
  last_month:   'Last Month',
  this_quarter: 'This Quarter',
}

export function OnboardingWidget({ initialData }: { initialData: BarItem[] }) {
  const [filter, setFilter] = useState<OnboardingFilter>('this_month')
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()

  const handleFilter = (next: OnboardingFilter) => {
    if (next === filter) return
    setFilter(next)
    startTransition(async () => {
      const fresh = await getOnboardingProgress(next)
      setData(fresh)
    })
  }

  const filterSlot = (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {(Object.keys(FILTER_LABELS) as OnboardingFilter[]).map(f => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            disabled={isPending}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-[#1B2B4A] text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            } disabled:opacity-60`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>
      <Link
        href="/super-admin/clubs"
        className="text-sm font-semibold text-[#F5A623] hover:underline"
      >
        View all clubs
      </Link>
    </div>
  )

  return (
    <BarChartWidget
      title="Club onboarding progress"
      data={data}
      color="bg-amber-500"
      filterSlot={filterSlot}
    />
  )
}
