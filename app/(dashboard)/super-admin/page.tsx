import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Dashboard — HMM Super Admin' }

export default async function SuperAdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  // Role guard — champions shouldn't reach this route
  if (profile?.role !== 'super_admin') redirect('/champion')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        Welcome, {profile.full_name}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Super Admin Dashboard — Epic 2 coming next.</p>
    </div>
  )
}
