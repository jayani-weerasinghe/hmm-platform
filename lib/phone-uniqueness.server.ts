import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { parsePhone } from '@/lib/phone'

// Every user — Super Admin, Champion or Gatekeeper, active or deactivated —
// must have their own phone number, and it stays theirs even if their role
// changes. Checked with the admin client because the caller (e.g. a
// Champion) can't see other clubs' users through RLS, but the number still
// has to be unique across all of them.
//
// Existing rows may still hold older, non-standard formats, so both sides
// are normalised before comparing rather than relying on an exact match.
//
// Returns a user-facing error, or null when the number is free.
export async function checkPhoneAvailable(
  phone: string,
  options: { excludeUserId?: string; creatingGatekeeper?: boolean } = {}
): Promise<string | null> {
  const admin = createAdminClient()
  const { data: rows, error } = await admin
    .from('profiles')
    .select('id, phone, role, is_active')
    .not('phone', 'is', null)

  if (error) return 'Could not check the phone number right now. Please try again.'

  const clash = (rows ?? []).find(row => {
    if (row.id === options.excludeUserId) return false
    const parsed = parsePhone(row.phone)
    return parsed.ok && parsed.value === phone
  })
  if (!clash) return null

  // Don't say who it belongs to or which club — a Champion must only ever
  // see their own club's people.
  if (options.creatingGatekeeper && clash.role === 'gatekeeper' && !clash.is_active) {
    return 'This phone number belongs to a deactivated Gatekeeper. Reactivate that Gatekeeper instead of creating a new one.'
  }
  return 'This phone number is already registered to another user. Each user needs their own phone number.'
}

// For an edit: only a number that's actually changing is checked, so a
// record that already shares a number (from before this rule existed) can
// still be edited as long as its number is left as it is.
export function phoneChanged(previous: string | null | undefined, next: string | null): boolean {
  const prev = parsePhone(previous)
  const prevValue = prev.ok ? prev.value : (previous ?? null)
  return prevValue !== next
}
