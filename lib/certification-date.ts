// A Gatekeeper's QPR certification date is when they were certified, so it
// can't be in the future. Shared by the forms (to cap the date picker) and
// the server actions (the real check — single create, CSV upload and edit).
//
// "Today" is Sri Lanka's date, not the server's: the live site runs on UTC,
// so between midnight and 05:30 in Sri Lanka a server-UTC "today" would
// still be yesterday and wrongly reject a certification dated today.

const ORG_TIME_ZONE = 'Asia/Colombo'

export const FUTURE_DATE_MESSAGE = 'Certification date cannot be in the future.'

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

  if (date > todayDateString()) return FUTURE_DATE_MESSAGE
  return null
}

// Props for a form's certification-date <input>: caps the picker at today,
// and replaces the browser's own "Value must be … or earlier" bubble with the
// same message the server returns, so the wording is identical everywhere.
// The message is cleared as soon as the date is changed.
export function certificationDateInputProps() {
  return {
    max: todayDateString(),
    onInvalid: (event: { currentTarget: HTMLInputElement }) => {
      const input = event.currentTarget
      if (input.validity.rangeOverflow) input.setCustomValidity(FUTURE_DATE_MESSAGE)
    },
    onInput: (event: { currentTarget: HTMLInputElement }) => {
      event.currentTarget.setCustomValidity('')
    },
  }
}
