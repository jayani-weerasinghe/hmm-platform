'use client'

import { createContext, useContext, useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { getUpcomingEvents } from '@/actions/dashboard'
import type { EventsData, EventsFilter } from '@/actions/dashboard'

function DateBadge({ iso }: { iso: string }) {
  const d = new Date(iso)
  const day = d.toLocaleDateString('en-AU', { day: '2-digit' })
  const month = d.toLocaleDateString('en-AU', { month: 'short' }).toUpperCase()
  return (
    <div className="flex w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[#F0F2F5] py-2.5">
      <span className="text-lg font-bold leading-none text-[#1B2B4A]">{day}</span>
      <span className="mt-1 text-[10px] font-bold tracking-wide text-[#F5A623]">{month}</span>
    </div>
  )
}

const FILTER_LABELS: Record<EventsFilter, string> = {
  next_7_days:  '7d',
  next_30_days: '30d',
  all_upcoming: 'All',
}

// Longer-form label for the KPI tile's caption, e.g. "next 7 days" (Sc09/Sc10:
// the caption must reflect whichever filter is currently selected, not stay
// hardcoded to the default).
const FILTER_CAPTIONS: Record<EventsFilter, string> = {
  next_7_days:  'next 7 days',
  next_30_days: 'next 30 days',
  all_upcoming: 'all upcoming',
}

// Element #5 (Upcoming Events) is one spec'd widget — a KPI tile in the top
// row PLUS a mini-list lower on the page — that share a single filter and a
// single fetched count/list. Since the KPI tile and the mini-list render in
// two different places in the page layout, their shared state lives here in
// a context so changing the filter from either place keeps both in sync.
type EventsContextValue = {
  filter: EventsFilter
  data: EventsData
  isPending: boolean
  setFilter: (next: EventsFilter) => void
}

const EventsContext = createContext<EventsContextValue | null>(null)

function useEventsContext() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('Upcoming Events components must be used within UpcomingEventsProvider')
  return ctx
}

export function UpcomingEventsProvider({
  initialData,
  children,
}: {
  initialData: EventsData
  children: ReactNode
}) {
  const [filter, setFilterState] = useState<EventsFilter>('next_30_days')
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()

  const setFilter = (next: EventsFilter) => {
    if (next === filter) return
    setFilterState(next)
    startTransition(async () => {
      const fresh = await getUpcomingEvents(next)
      setData(fresh)
    })
  }

  return (
    <EventsContext.Provider value={{ filter, data, isPending, setFilter }}>
      {children}
    </EventsContext.Provider>
  )
}

// #5 KPI tile (top row) — count + caption both track the widget's own filter.
export function UpcomingEventsKpiTile() {
  const { data, filter } = useEventsContext()
  return (
    <Link href="/super-admin/events" className="flex flex-col rounded-2xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Upcoming Events</p>
      <p className="text-5xl font-bold tabular-nums text-[#1B2B4A]">{data.total}</p>
      <p className="mt-2 text-sm text-gray-400">{FILTER_CAPTIONS[filter]}</p>
    </Link>
  )
}

// #5 mini-list + filter controls (right column, lower on the page).
export function EventsWidget() {
  const { filter, data, isPending, setFilter } = useEventsContext()

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#1B2B4A]">Upcoming events</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {(Object.keys(FILTER_LABELS) as EventsFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                disabled={isPending}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors disabled:opacity-50 ${
                  filter === f
                    ? 'bg-[#1B2B4A] text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
          <a
            href="/super-admin/events"
            className="text-sm font-semibold text-blue-500 hover:text-blue-700"
          >
            Calendar
          </a>
        </div>
      </div>

      {data.events.length === 0 ? (
        <p className="py-4 text-sm text-gray-400">No upcoming events in this period</p>
      ) : (
        <ul className="space-y-4">
          {data.events.map(ev => {
            const d = new Date(ev.starts_at)
            const time = d.toLocaleTimeString('en-AU', {
              hour: '2-digit', minute: '2-digit', hour12: false,
            })
            return (
              <li key={ev.id} className="flex items-start gap-3">
                <DateBadge iso={ev.starts_at} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug text-[#1B2B4A]">
                    {ev.title} · {ev.club_name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{time}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
