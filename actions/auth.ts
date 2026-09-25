'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validatePassword } from '@/lib/password-validation'
import { isPasswordReused, recordPasswordHash } from '@/lib/password-history.server'
import { writeAuditLog } from '@/lib/audit'

// ---------------------------------------------------------------------------
// Login — Story 1.1
// ---------------------------------------------------------------------------
export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const email    = (formData.get('email')    as string).trim()
  const password = formData.get('password') as string
  const portal   = formData.get('portal') as string | null // 'super_admin' | 'champion'

  if (!email || !password) return { error: 'Email and password are required.' }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    // Scenario 02: generic error — don't reveal which field is wrong
    return { error: 'Invalid email or password.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication failed. Please try again.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, deactivation_reason')
    .eq('id', user.id)
    .single()

  // Scenario 03: deactivated account
  if (!profile?.is_active) {
    await supabase.auth.signOut()
    if (profile?.deactivation_reason === 'club_deactivated') {
      return { error: 'Your club is currently inactive. Please contact your administrator.' }
    }
    return { error: 'Your account has been deactivated. Please contact an administrator.' }
  }

  // Two portals (this /login for Super Admin, /champion/login for Champions)
  // share this one action/form — the hidden "portal" field says which door
  // was used. A real account role mismatch (e.g. a Champion submitting the
  // Super Admin login) is blocked here with a clear redirect hint, rather
  // than silently letting them in and bouncing them to the right dashboard
  // — RLS/middleware already scope actual access by real role regardless,
  // this is purely about not letting people use the wrong door.
  if (profile.role === 'super_admin') {
    if (portal === 'champion') {
      await supabase.auth.signOut()
      return { error: 'This is a Super Admin account. Please sign in from the Super Admin login page.' }
    }
    redirect('/super-admin')
  }
  if (profile.role === 'champion') {
    if (portal === 'super_admin') {
      await supabase.auth.signOut()
      return { error: 'This is a Champion account. Please sign in from the Champion login page.' }
    }
    redirect('/champion')
  }

  // Gatekeepers are mobile-only
  await supabase.auth.signOut()
  return { error: 'This account is not authorised to access the web application.' }
}

// ---------------------------------------------------------------------------
// Forgot Password — Story 1.2
// ---------------------------------------------------------------------------
export async function forgotPasswordAction(
  _prev: { sent?: boolean } | null,
  formData: FormData
) {
  const email = (formData.get('email') as string).trim()
  if (!email) return { sent: false, error: 'Email is required.' }

  const supabase = await createClient()
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  // Scenario 02: always show generic message regardless of whether the email exists
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  return { sent: true }
}

// ---------------------------------------------------------------------------
// Reset Password (from email link) — Story 1.2
// ---------------------------------------------------------------------------
export async function resetPasswordAction(
  _prev: { error?: string } | null,
  formData: FormData
) {
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm')  as string

  // Scenario 06: passwords must match
  if (password !== confirm) return { error: 'Passwords do not match.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Session expired. Please request a new reset link.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Scenario 05: complexity rules
  const { valid, errors } = validatePassword(password, {
    name:  profile?.full_name,
    email: profile?.email ?? user.email,
  })
  if (!valid) return { error: errors.join('\n') }

  // Scenario 07: password reuse prevention (last 5)
  if (await isPasswordReused(user.id, password)) {
    return { error: 'You cannot reuse one of your last 5 passwords. Please choose a different one.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    return { error: 'Failed to reset password. The link may have expired — please request a new one.' }
  }

  // Scenario 08: record new hash, log the event; Supabase invalidates the reset link automatically
  await recordPasswordHash(user.id, password)
  await writeAuditLog({
    actorId: user.id,
    action: 'auth.password_reset',
    entityType: 'user',
    entityId: user.id,
  })

  // "Forgot Password" is a legitimate escape hatch for a Champion/Gatekeeper
  // who lost their temp-password email — it must clear the same flag
  // changePasswordAction does, or they'd still get forced to /set-password
  // after a real reset (and then fail there, since their "temporary" and
  // "new" password would be identical).
  await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)

  // Sign out the recovery session so the redirect below actually reaches the
  // login page instead of being bounced straight to the dashboard by
  // middleware's "authenticated user hitting /login" rule.
  await supabase.auth.signOut()

  redirect('/login?reset=success')
}

// ---------------------------------------------------------------------------
// Change Password (authenticated) — Story 1.3
// ---------------------------------------------------------------------------
export async function changePasswordAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword     = formData.get('newPassword')     as string
  const confirm         = formData.get('confirm')         as string

  // Scenario 03: passwords must match
  if (newPassword !== confirm) return { error: 'New passwords do not match.' }

  // Scenario 04: new password must differ from current
  if (newPassword === currentPassword) {
    return { error: 'New password must be different from your current password.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Session expired. Please log in again.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  // Scenario 02: complexity rules
  const { valid, errors } = validatePassword(newPassword, {
    name:  profile?.full_name,
    email: profile?.email ?? user.email,
  })
  if (!valid) return { error: errors.join('\n') }

  // Scenario 01: verify current password — generic error per story
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email:    user.email!,
    password: currentPassword,
  })
  if (verifyError) {
    // TEMP DIAGNOSTIC LOGGING — remove once the "Password change failed"
    // root cause is confirmed. The user-facing message is intentionally
    // generic (Scenario 01), but that means real auth failures (expired
    // session, unconfirmed email, rate limit) get masked as "wrong
    // password" with no way to tell them apart from server logs alone.
    console.error('[changePasswordAction] signInWithPassword verify failed:', {
      email: user.email,
      status: verifyError.status,
      code: (verifyError as { code?: string }).code,
      message: verifyError.message,
    })
    return { error: 'Password change failed. Please check your current password and try again.' }
  }

  // Scenario 05: reuse prevention (last 5)
  if (await isPasswordReused(user.id, newPassword)) {
    return { error: 'You cannot reuse one of your last 5 passwords. Please choose a different one.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return { error: 'Failed to update password. Please try again.' }

  // Scenario 06: record hash + audit log
  await recordPasswordHash(user.id, newPassword)
  await writeAuditLog({
    actorId: user.id,
    action: 'auth.password_changed',
    entityType: 'user',
    entityId: user.id,
  })

  // Clears the forced-first-login flag if it was set — a harmless no-op
  // for the normal elective "change my password" flow (already false),
  // but this is also the exact same action the forced /set-password screen
  // calls after a Champion/Gatekeeper's temp password verifies correctly,
  // so this one line is what actually lifts the block. Uses the regular
  // authenticated client — same as everything else in this action — since
  // must_change_password is deliberately not one of the columns the
  // self-update-privileged-fields trigger pins.
  await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)

  // Scenario 07: keep this session active, but require re-authentication on
  // every other active session/device.
  await supabase.auth.signOut({ scope: 'others' })

  return { success: true }
}

// ---------------------------------------------------------------------------
// Logout — Story 1.4 Scenario 01
// ---------------------------------------------------------------------------
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Story 1.4 Scenario 04: timeout logout must redirect with session_expired param
export async function sessionTimeoutLogoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login?error=session_expired')
}
