// Phone numbers are stored in one standard (E.164) form — e.g. +94771234567 —
// so the same number typed as "077 123 4567", "0771234567" or
// "+94 77 123 4567" is recognised as the same number, and every user's
// number can be required to be unique (see lib/phone-uniqueness.server.ts).
//
// Local numbers default to Sri Lanka (+94). Numbers from anywhere else must
// be entered with their country code (+44…, 0044…).

export type ParsedPhone =
  | { ok: true; value: string | null } // null = left blank
  | { ok: false; error: string }

const INVALID = 'Enter a valid phone number, e.g. 077 123 4567 or +94 77 123 4567.'

export function parsePhone(raw: string | null | undefined): ParsedPhone {
  const input = (raw ?? '').trim()
  if (!input) return { ok: true, value: null }

  let digits = input.replace(/[^\d+]/g, '')
  if (digits.indexOf('+') > 0) return { ok: false, error: INVALID }
  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`

  if (!digits.startsWith('+')) {
    if (/^0\d{9}$/.test(digits)) digits = `+94${digits.slice(1)}`        // 0771234567
    else if (/^94\d{9}$/.test(digits)) digits = `+${digits}`             // 94771234567
    else if (/^[1-9]\d{8}$/.test(digits)) digits = `+94${digits}`        // 771234567
    else return { ok: false, error: `${INVALID} Numbers from outside Sri Lanka need their country code.` }
  }

  if (!/^\+[1-9]\d{7,14}$/.test(digits)) return { ok: false, error: INVALID }
  if (digits.startsWith('+94') && digits.length !== 12) return { ok: false, error: INVALID }

  return { ok: true, value: digits }
}
