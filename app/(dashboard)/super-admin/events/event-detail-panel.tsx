import Link from 'next/link'
import { eventTypeStyle } from './event-type'

interface EventDetail {
  id: string
  title: string
  type: string
  starts_at: string
  ends_at: string | null
  venue: string
  description: string | null
  max_participants: number | null
  club_name: string
}

export function EventDetailPanel({ event, closeHref }: { event: EventDetail; closeHref: string }) {
  const style = eventTypeStyle(event.type)
  const starts = new Date(event.starts_at)
  const dateLabel = starts.toLocaleDateString('en-AU', { dateStyle: 'full' })
  const timeLabel = event.ends_at
    ? `${starts.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.ends_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`
    : starts.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Link href={closeHref} scroll={false} className="absolute inset-0" aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style.badge}`}>
            {style.label}
          </span>
          <Link
            href={closeHref}
            scroll={false}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>

        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Date &amp; Time</dt>
            <dd className="mt-0.5 text-gray-900">{dateLabel} · {timeLabel}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Venue</dt>
            <dd className="mt-0.5 text-gray-900">{event.venue}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Club</dt>
            <dd className="mt-0.5 text-gray-900">{event.club_name}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Maximum Participants</dt>
            <dd className="mt-0.5 text-gray-900">{event.max_participants ?? 'Not specified'}</dd>
          </div>
          {event.description && (
            <div>
              <dt className="font-medium text-gray-500">Description</dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-gray-900">{event.description}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
