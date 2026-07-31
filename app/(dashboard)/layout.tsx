import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClientLayout } from '@/components/dashboard-client-layout'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, is_active, deactivation_reason')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active) {
    await supabase.auth.signOut()
    const reason = profile?.deactivation_reason === 'club_deactivated'
      ? 'club_inactive'
      : 'account_inactive'
    redirect(`/login?error=${reason}`)
  }

  return (
    <DashboardClientLayout profile={profile}>
      {children}
    </DashboardClientLayout>
  )
}
