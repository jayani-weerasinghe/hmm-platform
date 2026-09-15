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
  facilitator: string | null
  virtual_link: string | null
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.55px] text-[#64748B]">{label}</dt>
      <dd className="mt-1 text-[14px] text-[#0F172A]">{value}</dd>
    </div>
  )
}

export function EventDetailPanel({ event, closeHref }: { event: EventDetail; closeHref: string }) {
  const style = eventTypeStyle(event.type)
  const starts = new Date(event.starts_at)
  const dateLabel = starts.toLocaleDateString('en-AU', { dateStyle: 'full' })
  const timeLabel = event.ends_at
    ? `${starts.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })} – ${new Date(event.ends_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`
    : starts.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(86,86,86,0.41)] p-4 backdrop-blur-sm font-[family-name:var(--font-inter)]">
      <Link href={closeHref} scroll={false} className="absolute inset-0" aria-label="Close" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="mb-4 flex items-start justify-between">
          <span
            style={{ backgroundColor: style.pillBg, color: style.pillText }}
            className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.44px]"
          >
            {style.label}
          </span>
          <Link
            href={closeHref}
            scroll={false}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/x-close.svg" alt="" width={11.67} height={11.67} />
          </Link>
        </div>

        <h2 className="text-[20px] font-bold text-[#0F172A] font-[family-name:var(--font-jakarta)]">{event.title}</h2>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <Field label="Date & Time" value={`${dateLabel} · ${timeLabel}`} />
          <Field label="Venue" value={event.venue} />
          <Field label="Club" value={event.club_name} />
          <Field label="Facilitator" value={event.facilitator ?? 'Not specified'} />
          <Field label="Maximum Participants" value={event.max_participants ? String(event.max_participants) : 'Not specified'} />
          {event.virtual_link && <Field label="Link" value={event.virtual_link} />}
        </dl>

        {event.description && (
          <div className="mt-4">
            <dt className="text-[11px] font-bold uppercase tracking-[0.55px] text-[#64748B]">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-[14px] leading-5 text-[#0F172A]">{event.description}</dd>
          </div>
        )}
      </div>
    </div>
  )
}
