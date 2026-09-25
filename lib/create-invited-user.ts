import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateTempPassword } from '@/lib/generate-temp-password'
import { sendTemporaryPasswordEmail } from '@/lib/send-email'
import { seedPasswordHistoryAdmin } from '@/lib/password-history.server'
import { describeInviteError } from '@/lib/invite-errors'

// Shared by Champion and Gatekeeper creation (actions/champions.ts,
// actions/gatekeepers.ts) — previously each called admin.auth.admin.
// inviteUserByEmail() independently (same shape, not literally shared
// code). Both now go through this one function instead, so the
// temp-password + custom-email + rollback logic exists in exactly one
// place.
//
// Order matters for the "no orphaned auth.users row on failure" invariant
// already established for the old invite flow: create the auth user first,
// then send the email, then seed password history — if the email send
// fails, the just-created auth user is deleted so a caller never ends up
// with an account that has no way to log in AND no way to find out how.
export async function createInvitedUser(params: {
  email: string
  fullName: string
  roleLabel: 'Champion' | 'Gatekeeper'
}): Promise<{ userId: string } | { error: string }> {
  const admin = createAdminClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const tempPassword = generateTempPassword()

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: params.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: params.fullName },
  })

  if (createError) {
    const lower = createError.message?.toLowerCase() ?? ''
    if (lower.includes('already registered') || lower.includes('already exists')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: describeInviteError(createError) }
  }

  const userId = created.user.id

  // Champions have their own portal (/champion/login, added alongside
  // loginAction's portal-mismatch check) — this was previously hardcoded
  // to /login for every role, which sent Champion invites to the Super
  // Admin portal URL; they'd land on a page subtitled for both roles, then
  // get rejected at submit time by the portal check. Gatekeeper still has
  // no real web destination (mobile-only, no app-store link established
  // yet), so it's left on /login for now rather than inventing one.
  const loginUrl = params.roleLabel === 'Champion' ? `${siteUrl}/champion/login` : `${siteUrl}/login`

  const { error: emailError } = await sendTemporaryPasswordEmail({
    to: params.email,
    fullName: params.fullName,
    tempPassword,
    roleLabel: params.roleLabel,
    loginUrl,
  })

  if (emailError) {
    await admin.auth.admin.deleteUser(userId)
    return { error: `Failed to send the account email — the account was not created. (${emailError})` }
  }

  await seedPasswordHistoryAdmin(userId, tempPassword)

  return { userId }
}
