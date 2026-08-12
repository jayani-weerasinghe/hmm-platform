'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { monthGridRange, gridDays, dayKey, MONTH_NAMES } from './date-grid'
import { eventTypeStyle } from './event-type'
import { EventDetailPanel } from './event-detail-panel'

interface EventItem {
  id: string
  title: string
  type: string
  starts_at: string
  ends_at: string | null
  venue: string
  description: string | null
  max_participants: number | null
  club_id: string
  club_name: string
}

interface ClubOption {
  id: string
  name: string
}

interface Props {
  view: 'month' | 'list'
  year: number
  month: number
  club: string
  type: string
  events: EventItem[]
  clubs: ClubOption[]
  selectedEvent: EventItem | null
}

const EVENT_TYPES = [
  { value: 'qpr_session', label: 'QPR Certification Session' },
  { value: 'awareness_program', label: 'Awareness Program' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
]

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 }
}

export function EventsCalendar({ view, year, month, club, type, events, clubs, selectedEvent }: Props) {
  const router = useRouter()

  function hrefWith(overrides: Partial<{ view: string; year: string; month: string; club: string; type: string; event: string }>) {
    const merged = {
      view: overrides.view ?? view,
      year: overrides.year ?? String(year),
      month: overrides.month ?? String(month),
      club: overrides.club ?? club,
      type: overrides.type ?? type,
      event: overrides.event ?? '',
    }
    const params = new URLSearchParams()
    if (merged.view === 'list') params.set('view', 'list')
    params.set('year', merged.year)
    params.set('month', merged.month)
    if (merged.club) params.set('club', merged.club)
    if (merged.type) params.set('type', merged.type)
    if (merged.event) params.set('event', merged.event)
    return `/super-admin/events?${params.toString()}`
  }

  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)

  return (
    <div className="p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {view === 'month' ? (
            <>
              <Link
                href={hrefWith({ year: String(prev.year), month: String(prev.month) })}
                scroll={false}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                aria-label="Previous month"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <h1 className="min-w-[10rem] text-lg font-semibold text-gray-900">
                {MONTH_NAMES[month - 1]} {year}
              </h1>
              <Link
                href={hrefWith({ year: String(next.year), month: String(next.month) })}
                scroll={false}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                aria-label="Next month"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </>
          ) : (
            <h1 className="text-lg font-semibold text-gray-900">All Events</h1>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={club}
            onChange={e => router.push(hrefWith({ club: e.target.value }))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          >
            <option value="">All clubs</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={type}
            onChange={e => router.push(hrefWith({ type: e.target.value }))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          >
            <option value="">All types</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            <Link
              href={hrefWith({ view: 'month' })}
              scroll={false}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'month' ? 'bg-[#1B2B4A] text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Month
            </Link>
            <Link
              href={hrefWith({ view: 'list' })}
              scroll={false}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'list' ? 'bg-[#1B2B4A] text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              List
            </Link>
          </div>
        </div>
      </div>

      {view === 'month' ? (
        <MonthGrid year={year} month={month} events={events} hrefWith={hrefWith} />
      ) : (
        <ListView events={events} hrefWith={hrefWith} />
      )}

      {selectedEvent && <EventDetailPanel event={selectedEvent} closeHref={hrefWith({ event: '' })} />}
    </div>
  )
}

function EventTile({ event, href }: { event: EventItem; href: string }) {
  const style = eventTypeStyle(event.type)
  const time = new Date(event.starts_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  return (
    <Link
      href={href}
      scroll={false}
      className="flex items-center gap-1.5 truncate rounded-md bg-gray-50 px-1.5 py-1 text-left text-xs hover:bg-gray-100"
      title={event.title}
    >
      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${style.dot}`} />
      <span className="flex-shrink-0 text-gray-400">{time}</span>
      <span className="truncate text-gray-800">{event.title}</span>
    </Link>
  )
}

function MonthGrid({
  year, month, events, hrefWith,
}: {
  year: number
  month: number
  events: EventItem[]
  hrefWith: (o: Partial<{ event: string }>) => string
}) {
  const { gridStart, gridEnd, firstOfMonth, lastOfMonth } = monthGridRange(year, month)
  const days = gridDays(gridStart, gridEnd)

  const eventsByDay: Record<string, EventItem[]> = {}
  for (const ev of events) {
    const key = dayKey(new Date(ev.starts_at))
    eventsByDay[key] ??= []
    eventsByDay[key].push(ev)
  }

  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
        {weekdayLabels.map(w => <div key={w} className="px-3 py-2">{w}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map(day => {
          const key = dayKey(day)
          const inMonth = day >= firstOfMonth && day <= lastOfMonth
          const dayEvents = eventsByDay[key] ?? []
          return (
            <div key={key} className="min-h-[6.5rem] border-b border-r border-gray-100 p-1.5 last:border-r-0">
              <div className={`mb-1 text-xs font-medium ${inMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                {day.getUTCDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.map(ev => (
                  <EventTile key={ev.id} event={ev} href={hrefWith({ event: ev.id })} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ListView({
  events, hrefWith,
}: {
  events: EventItem[]
  hrefWith: (o: Partial<{ event: string }>) => string
}) {
  if (events.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl bg-white p-12 text-center text-sm text-gray-400 ring-1 ring-gray-200">
        No events match your filters.
      </div>
    )
  }

  let lastDateLabel = ''

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
      <ul className="divide-y divide-gray-100">
        {events.map(ev => {
          const d = new Date(ev.starts_at)
          const dateLabel = d.toLocaleDateString('en-AU', { dateStyle: 'full' })
          const showHeading = dateLabel !== lastDateLabel
          lastDateLabel = dateLabel
          const style = eventTypeStyle(ev.type)
          return (
            <li key={ev.id}>
              {showHeading && (
                <div className="bg-gray-50 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {dateLabel}
                </div>
              )}
              <Link href={hrefWith({ event: ev.id })} scroll={false} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${style.dot}`} />
                <span className="w-16 flex-shrink-0 text-sm text-gray-500">
                  {d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-gray-900">{ev.title}</span>
                <span className={`inline-flex flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                  {style.label}
                </span>
                <span className="flex-shrink-0 text-sm text-gray-500">{ev.club_name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
