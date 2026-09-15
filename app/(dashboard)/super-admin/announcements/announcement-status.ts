export type ComputedStatus = {
  label: string
  cls: string
  tab: 'active' | 'scheduled' | 'drafts' | 'expired'
}

// Folds the stored draft/published `status` column together with the
// date-derived Scheduled/Active/Expired states (publish_date/expiry_date) —
// a draft is always shown as Draft regardless of its dates.
export function computeStatus(status: 'draft' | 'published', publishDate: string, expiryDate: string | null): ComputedStatus {
  if (status === 'draft') return { label: 'Draft', cls: 'bg-gray-100 text-gray-600', tab: 'drafts' }
  const now = new Date()
  if (new Date(publishDate) > now) return { label: 'Scheduled', cls: 'bg-yellow-100 text-yellow-700', tab: 'scheduled' }
  if (expiryDate && new Date(expiryDate) <= now) return { label: 'Expired', cls: 'bg-gray-100 text-gray-600', tab: 'expired' }
  return { label: 'Active', cls: 'bg-green-100 text-green-700', tab: 'active' }
}

export const AUDIENCE_LABEL: Record<string, string> = {
  all: 'All Champions & Gatekeepers',
  champions: 'Champions Only',
  gatekeepers: 'Gatekeepers Only',
  specific_clubs: 'Specific Cohort',
}

export const PRIORITY_BADGE: Record<string, { label: string; cls: string; icon: string } | null> = {
  standard: null,
  mandatory: { label: 'Pinned · Mandatory Action', cls: 'bg-[rgba(255,222,172,0.7)] text-[#281900]', icon: '/icons/pin.svg' },
  urgent: { label: 'Urgent Broadcast', cls: 'bg-[rgba(255,218,214,0.5)] text-[#DC2626]', icon: '/icons/priority-urgent.svg' },
}
