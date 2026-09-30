import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasResetGrant } from '@/lib/password-reset-grant.server'
import { LOGIN_PATH, portalForRole } from '@/lib/portals'
import { ResetPasswordForm } from './reset-password-form'

export const metadata = { title: 'Reset Password — HMM Platform' }

// Only reachable from a real reset-email link (see
// lib/password-reset-grant.server.ts). Typing /reset-password into a
// signed-in browser no longer offers a way to set a new password without
// the current one.
export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await hasResetGrant())) {
    // A signed-in user is bounced on to their own dashboard by middleware.
    redirect('/forgot-password?error=link_expired')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const portal = portalForRole(profile?.role) ?? 'super_admin'

  return <ResetPasswordForm email={user.email ?? ''} loginPath={LOGIN_PATH[portal]} />
}
