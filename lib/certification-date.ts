// A Gatekeeper's QPR certification date is when they were certified, so it
// can't be in the future. Shared by the forms (to cap the date picker) and
// the server actions (the real check — single create, CSV upload and edit).
//
// "Today" is Sri Lanka's date, not the server's: the live site runs on UTC,
// so between midnight and 05:30 in Sri Lanka a server-UTC "today" would
// still be yesterday and wrongly reject a certification dated today.

const ORG_TIME_ZONE = 'Asia/Colombo'

export function todayDateString(): string {
  // en-CA formats as YYYY-MM-DD, the same form a date input uses.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ORG_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

// Returns a user-facing error, or null when the date is acceptable.
export function validateCertificationDate(value: string | null | undefined): string | null {
  const date = (value ?? '').trim()
  if (!date) return 'Certification date is required.'

  // Also guards the expiry calculation, which can't handle e.g. "01/10/2026".
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const parsed = match ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])) : null
  if (!parsed || parsed.getUTCDate() !== +match![3] || parsed.getUTCMonth() !== +match![2] - 1) {
    return 'Certification date must be a valid date in YYYY-MM-DD format.'
  }

  if (date > todayDateString()) return 'Certification date cannot be in the future.'
  return null
}
