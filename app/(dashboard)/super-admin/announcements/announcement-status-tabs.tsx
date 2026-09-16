import Link from 'next/link'

function buildHref(params: { q?: string; audience?: string; status?: string }) {
  const usp = new URLSearchParams()
  if (params.q) usp.set('q', params.q)
  if (params.audience) usp.set('audience', params.audience)
  if (params.status) usp.set('status', params.status)
  const qs = usp.toString()
  return qs ? `/super-admin/announcements?${qs}` : '/super-admin/announcements'
}

// Matches Figma's "All (48) / Active Broadcasts (2) / Scheduled Releases (1)
// / Drafts (2)" segmented row — counts are real, computed from the actual
// dataset (independent of the current filters), not the design's placeholders.
export function AnnouncementStatusTabs({
  active,
  counts,
  total,
  q,
  audience,
}: {
  active?: string
  counts: { active: number; scheduled: number; drafts: number }
  total: number
  q?: string
  audience?: string
}) {
  const tabs = [
    { value: undefined, label: `All (${total})` },
    { value: 'active', label: `Active Broadcasts (${counts.active})` },
    { value: 'scheduled', label: `Scheduled Releases (${counts.scheduled})` },
    { value: 'drafts', label: `Drafts (${counts.drafts})` },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#F1F5F9] p-1">
      {tabs.map(tab => {
        const isActive = active === tab.value
        return (
          <Link
            key={tab.label}
            href={buildHref({ q, audience, status: tab.value })}
            className={`flex items-center justify-center whitespace-nowrap rounded-[5px] px-4 py-1.5 text-[12px] font-semibold tracking-[0.24px] transition-colors ${
              isActive ? 'bg-[#022C51] text-white' : 'text-[#475569] hover:bg-white/60'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
