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

  const [{ count: clubCount }, { count: championCount }] = await Promise.all([
    supabase.from('clubs').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'champion'),
  ])

  return (
    <DashboardClientLayout
      profile={profile}
      pageCounts={{ clubs: clubCount ?? 0, champions: championCount ?? 0 }}
    >
      {children}
    </DashboardClientLayout>
  )
}
