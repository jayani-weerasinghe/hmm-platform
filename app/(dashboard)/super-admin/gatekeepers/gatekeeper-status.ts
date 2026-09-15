// Same certified/expiring-soon convention used across the app (Club detail,
// Champion detail, Dashboard QPR widget): expiring soon = certified AND
// expiry within 90 days.
export type QprStatus = 'active' | 'expiring_soon' | 'expired' | 'inactive'

export function qprStatus(isActive: boolean, qprExpiryDate: string | null, today: string, in90Days: string): QprStatus {
  if (!isActive) return 'inactive'
  if (!qprExpiryDate || qprExpiryDate < today) return 'expired'
  if (qprExpiryDate <= in90Days) return 'expiring_soon'
  return 'active'
}

export const QPR_STATUS_LABEL: Record<QprStatus, string> = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  inactive: 'Inactive',
}

export const QPR_STATUS_BADGE: Record<QprStatus, string> = {
  active: 'bg-[#E6FFE7] text-[#0D8275]',
  expiring_soon: 'bg-[#D97706]/10 text-[#D97706]',
  expired: 'bg-[#FEF2F2] text-[#DC2626]',
  inactive: 'bg-[#F1F5F9] text-[#64748B]',
}

export const QPR_STATUS_DOT: Record<QprStatus, string> = {
  active: 'bg-[#10B981]',
  expiring_soon: 'bg-[#D97706]',
  expired: 'bg-[#DC2626]',
  inactive: 'bg-[#94A3B8]',
}

export function todayBounds() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  return { today, in90Days }
}
